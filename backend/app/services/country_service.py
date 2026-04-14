from app.db.supabase import supabase

def get_country_summaries():

    response = (
        supabase
        .table("country_summaries")
        .select("*")
        .limit(20)
        .execute()
    )

    return response.data

def get_country_summary_by_id(summary_id: int):

    response = supabase.table(
        "country_summaries"
    ).select("*").eq(
        "id", summary_id
    ).execute()

    return response.data

def get_country_detail(country_id: int):

    response = (
        supabase
        .table("country_summaries")
        .select(
            """
            id,
            topic_id,
            media_id,
            created_at,
            country_summary,

            topics (
                topic_name
            ),

            medias (
                country_name,
                media_name
            )
            """
        )
        .eq("id", country_id)
        .single()
        .execute()
    )

    data = response.data

    if not data:
        return None

    topic_id = data["topic_id"]
    media_id = data["media_id"]

    # article URL取得

    article_res = (
        supabase
        .table("articles")
        .select("url")
        .eq("topic_id", topic_id)
        .eq("media_id", media_id)
        .limit(1)
        .execute()
    )

    url = None

    if article_res.data:
        url = article_res.data[0]["url"]

    return {

        "country_id":
            data["id"],

        "created_at":
            data["created_at"],

        "topic_name":
            data["topics"]["topic_name"],

        "country_name":
            data["medias"]["country_name"],

        "media_name":
            data["medias"]["media_name"],

        "summary":
            data["country_summary"],

        "url":
            url
    }

def get_home_country_summaries():

    response = (
        supabase
        .table("country_summaries")
        .select(
            """
            id,
            created_at,
            country_summary,
            recommend_score,

            topics (
                topic_name
            ),

            medias (
                country_name
            )
            """
        )
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )

    data = response.data

    results = []

    for row in data:

        results.append({

            "id":
                row["id"],

            "topic_name":
                row["topics"]["topic_name"],

            "country_name":
                row["medias"]["country_name"],

            "summary":
                row["country_summary"],

            "created_at":
                row["created_at"],

            "recommend_score":
                row["recommend_score"]

        })

    return results



