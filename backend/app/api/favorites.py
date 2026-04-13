from fastapi import APIRouter, Query

from app.services.favorite_service import (
    get_favorites,
    create_favorite,
    delete_favorite,
    get_favorites_with_summaries
)

from app.schemas.favorite import FavoriteCreate

router = APIRouter()

#　ネタ帳を取得
@router.get("")
def read_favorites(
    user_id: str = Query(...)
):

    return get_favorites(user_id)

#　ネタ帳に登録
@router.post("")
def add_favorite(
    favorite: FavoriteCreate
):

    data = create_favorite(
        favorite.dict()
    )

    return data

#  ネタ帳から削除
@router.delete("/{favorite_id}")
def remove_favorite(
    favorite_id: int
):

    data = delete_favorite(favorite_id)

    return data

# フロント用表示用ネタ帳リスト
@router.get("/with-summaries")
def read_favorites_with_summaries(
    user_id: str = Query(...)
):

    return get_favorites_with_summaries(
        user_id
    )