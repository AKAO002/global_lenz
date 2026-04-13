from fastapi import APIRouter, Query

from app.services.favorite_service import (
    get_favorites
)

router = APIRouter()


@router.get("")
def read_favorites(
    user_id: str = Query(...)
):

    return get_favorites(user_id)