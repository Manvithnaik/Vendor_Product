from typing import Any, Optional


def success_response(message: str, data: Any = None) -> dict:
    payload = {"status": "success", "message": message}
    if data is not None:
        payload["data"] = data
    return payload


def error_response(message: str, detail: Any = None) -> dict:
    payload = {"status": "error", "message": message}
    if detail is not None:
        payload["detail"] = detail
    return payload
