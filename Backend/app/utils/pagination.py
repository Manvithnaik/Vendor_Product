from typing import Optional


def paginate(query, page: int, limit: int):
    """
    Apply SQLAlchemy offset/limit pagination to a query.
    Returns (items, total_count).
    """
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return items, total
