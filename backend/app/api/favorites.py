from fastapi import APIRouter, Query

from app.services.favorite_service import (
    get_favorites,
    create_favorite
)

from app.schemas.favorite import FavoriteCreate

router = APIRouter()


@router.get("")
def read_favorites(
    user_id: str = Query(...)
):

    return get_favorites(user_id)

@router.post("")
def add_favorite(
    favorite: FavoriteCreate
):

    data = create_favorite(
        favorite.dict()
    )

    return data