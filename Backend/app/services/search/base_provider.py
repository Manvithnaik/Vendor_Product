from abc import ABC, abstractmethod
from typing import Tuple, List, Any
from app.models.product_model import Product
from app.schemas.product_schema import ProductFilterQuery

class SearchProvider(ABC):
    @abstractmethod
    def search_catalog(self, db: Any, filters: ProductFilterQuery, page: int, limit: int) -> Tuple[List[Product], int]:
        """
        Abstract method to search the product catalog.
        Must enforce that only products with ProductStatus.PUBLISHED are returned.
        """
        pass
