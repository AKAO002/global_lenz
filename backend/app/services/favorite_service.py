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

# フロント表示用ネタ帳リスト（JOIN）
def get_favorites_with_summaries(user_id: str):

    response = supabase.table(
        "favorites"
    ).select(
        """
        id,
        created_at,
        country_summary_id,
        comparison_summary_id,

        country_summaries(
            id,

            medias(
                country_name
            ),

            topics(
                topic_name
            )
        ),

        comparison_summaries(
            id,

            topics(
                topic_name
            )
        )
        """
    ).eq(
        "user_id",
        user_id
    ).order(
        "created_at",
        desc=True
    ).execute()

    result = []

    for row in response.data:

        # 各国要約の場合
        if row["country_summary_id"] and row["country_summaries"]:

            country_summary = row["country_summaries"]

            result.append({

                "favorite_id":
                    row["id"],

                "created_at":
                    row["created_at"][:10],

                "type":
                    "country",

                "topic_name":
                    country_summary
                    ["topics"]
                    ["topic_name"],

                "label":
                    country_summary
                    ["medias"]
                    ["country_name"]
                    + "要約",

                "target_id":
                    row["country_summary_id"]

            })

        # 比較要約の場合
        elif row["comparison_summary_id"] and row["comparison_summaries"]:

            comparison_summary = row["comparison_summaries"]

            result.append({

                "favorite_id":
                    row["id"],

                "created_at":
                    row["created_at"][:10],

                "type":
                    "comparison",

                "topic_name":
                    comparison_summary
                    ["topics"]
                    ["topic_name"],

                "label":
                    "比較要約",

                "target_id":
                    row["comparison_summary_id"]

            })


    return result