class BaseDomainException(Exception):
    """Base exception for all domain-specific errors. Handled globally."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ProductNotPublishedException(BaseDomainException):
    def __init__(self, message: str = "Product is not published and cannot be accessed."):
        super().__init__(message, status_code=403)


class InvalidProductStatusTransitionException(BaseDomainException):
    def __init__(self, message: str = "Invalid status transition for product."):
        super().__init__(message, status_code=400)


class RFQAlreadyClosedException(BaseDomainException):
    def __init__(self, message: str = "This RFQ is already closed or expired."):
        super().__init__(message, status_code=400)


class StockReservationOverflowException(BaseDomainException):
    def __init__(self, message: str = "Insufficient available stock for reservation."):
        super().__init__(message, status_code=409)


class VendorOwnershipViolationException(BaseDomainException):
    def __init__(self, message: str = "Vendor does not have permission to modify this resource."):
        super().__init__(message, status_code=403)


class ComparisonTemplateNotFoundException(BaseDomainException):
    def __init__(self, message: str = "Comparison template not found."):
        super().__init__(message, status_code=404)
