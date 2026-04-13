from app.db.supabase import supabase

# ネタ帳取得関数
def get_favorites(user_id: str):

    response = supabase.table(
        "favorites"
    ).select("*").eq(
        "user_id", user_id
    ).execute()

    return response.data

# ネタ帳登録関数
def create_favorite(data: dict):

    response = supabase.table(
        "favorites"
    ).insert(
        data
    ).execute()

    return response.data

# ネタ帳削除
def delete_favorite(favorite_id: int):

    response = supabase.table(
        "favorites"
    ).delete().eq(
        "id", favorite_id
    ).execute()

    return response.data