from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models.product_model import Product
from app.models.rfq_model import RFQRequest, RFQResponse, RFQRequestStatus, RFQResponseStatus
from app.exceptions.domain_exceptions import (
    StockReservationOverflowException,
    RFQAlreadyClosedException
)

class RFQService:
    @staticmethod
    def create_rfq(db: Session, product_id: int, manufacturer_id: int, quantity: int, message: str) -> RFQRequest:
        rfq = RFQRequest(
            product_id=product_id,
            manufacturer_id=manufacturer_id,
            requested_quantity=quantity,
            message=message,
            status=RFQRequestStatus.PENDING
        )
        db.add(rfq)
        db.commit()
        db.refresh(rfq)
        return rfq
    @staticmethod
    def get_vendor_rfqs(db: Session, vendor_id: int) -> list[RFQRequest]:
        return (
            db.query(RFQRequest)
            .join(Product)
            .filter(Product.vendor_id == vendor_id)
            .order_by(RFQRequest.created_at.desc())
            .all()
        )

    @staticmethod
    def get_manufacturer_rfqs(db: Session, manufacturer_id: int) -> list[RFQRequest]:
        return (
            db.query(RFQRequest)
            .filter(RFQRequest.manufacturer_id == manufacturer_id)
            .order_by(RFQRequest.created_at.desc())
            .all()
        )

    @staticmethod
    def process_order(db: Session, rfq_id: int):
        rfq = db.query(RFQRequest).filter(RFQRequest.rfq_id == rfq_id).first()
        if not rfq:
            return
        rfq.status = RFQRequestStatus.CLOSED
        db.commit()
    @staticmethod
    def respond_to_rfq(db: Session, rfq_id: int, vendor_id: int, price: float, available_qty: int) -> RFQResponse:
        rfq = db.query(RFQRequest).filter(RFQRequest.rfq_id == rfq_id).first()
        if not rfq:
            raise ValueError("RFQ not found")
        if rfq.status in [RFQRequestStatus.CLOSED, RFQRequestStatus.EXPIRED]:
            raise RFQAlreadyClosedException()
            
        response = RFQResponse(
            rfq_id=rfq_id,
            vendor_id=vendor_id,
            quoted_price=price,
            available_quantity=available_qty,
            status=RFQResponseStatus.ACCEPTED
        )
        
        # When a vendor responds and ACCEPTS to fulfill it, we reserve the stock
        rfq.status = RFQRequestStatus.RESPONDED
        db.add(response)
        
        # Transactional Stock Reservation
        product = rfq.product
        try:
            with db.begin_nested():
                if product.available_stock_quantity < available_qty:
                    raise StockReservationOverflowException()
                
                # Logic: We logically reduce available stock and increase reserved.
                product.available_stock_quantity -= available_qty
                product.reserved_stock_quantity += available_qty
        except SQLAlchemyError as e:
            db.rollback()
            raise e
            
        db.commit()
        db.refresh(response)
        db.refresh(product)
        
        return response

    @staticmethod
    def expire_rfq(db: Session, rfq_id: int):
        rfq = db.query(RFQRequest).filter(RFQRequest.rfq_id == rfq_id).first()
        if not rfq:
            return
            
        rfq.status = RFQRequestStatus.EXPIRED
        
        # Release any reservations tied to responses
        for response in rfq.responses:
            if response.status == RFQResponseStatus.ACCEPTED:
                # Release stock
                product = rfq.product
                product.available_stock_quantity += response.available_quantity
                product.reserved_stock_quantity -= response.available_quantity
                response.status = RFQResponseStatus.REJECTED # Reverted logic
                
        db.commit()
