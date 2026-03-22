from typing import Tuple, List, Any
from app.models.product_model import Product
from app.schemas.product_schema import ProductFilterQuery
from app.services.search.base_provider import SearchProvider

class PlaceholderElasticSearchProvider(SearchProvider):
    def search_catalog(self, db: Any, filters: ProductFilterQuery, page: int, limit: int) -> Tuple[List[Product], int]:
        """
        Future-ready ElasticSearch implementation placeholder.
        Currently raises NotImplementedError.
        """
        raise NotImplementedError("ElasticSearch provider is not yet implemented.")
