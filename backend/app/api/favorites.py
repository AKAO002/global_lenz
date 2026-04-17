from fastapi import APIRouter, Query, Depends
from app.core.auth import get_current_user
from app.services.user_service import get_public_user_id

from app.services.favorite_service import (
    get_favorites,
    create_favorite,
    delete_favorite,
    get_favorites_with_summaries
)

from app.schemas.favorite import FavoriteCreate

router = APIRouter()

# ネタ帳一覧取得
@router.get("/")
def read_favorites(user=Depends(get_current_user)):
    auth_id = user["id"]

    public_user_id = get_public_user_id(auth_id)

    return get_favorites(public_user_id)

#　ネタ帳に登録
@router.post("/")
def add_favorite(
    favorite: FavoriteCreate,
    user=Depends(get_current_user)
):
    # 1. ユーザーIDの取得
    auth_id = user["id"]
    public_user_id = get_public_user_id(auth_id)

    # 2. 受信データの確認（ここで中身が空じゃないかログに出す！）
    print(f"DEBUG: フロントから届いたデータ: {favorite.model_dump()}")

    # 3. データの準備
    favorite_data = favorite.model_dump()
    favorite_data["user_id"] = public_user_id

    # 4. 最終的にDBへ送るデータの確認
    print(f"DEBUG: DBに送る直前のデータ: {favorite_data}")

    return create_favorite(favorite_data)

#  ネタ帳から削除
@router.delete("/{favorite_id}")
def remove_favorite(
    favorite_id: int,
    user=Depends(get_current_user)
):

    auth_id = user["id"]

    public_user_id = get_public_user_id(auth_id)

    return delete_favorite(favorite_id,public_user_id)

# フロント表示用ネタ帳リスト
@router.get("/with-summaries")
def read_favorites_with_summaries(
    user=Depends(get_current_user)
):
    auth_id = user["id"]

    public_user_id = get_public_user_id(auth_id)

    return get_favorites_with_summaries(
        public_user_id
    )