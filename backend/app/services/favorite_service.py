from app.db.supabase import supabase


def get_favorites(user_id: str):

    response = supabase.table(
        "favorites"
    ).select("*").eq(
        "user_id", user_id
    ).execute()

    return response.data