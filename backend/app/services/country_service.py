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
            difficult_word,

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
        
        "difficult_word":
        data["difficult_word"],

        "summary":
            data["country_summary"],

        "url":
            url
    }

def get_home_country_summaries():

    response = (
        supabase
        .table("topics")
        .select(
            """
            id,
            topic_name,
            created_at,

            country_summaries (
                id,
                country_summary,
                recommend_score,

                medias (
                    country_name
                )
            )
            """
        )
        .order("created_at", desc=True)
        .limit(6)
        .execute()
    )

    data = response.data

    results = []

    for topic in data:

        summaries = []

        for cs in topic["country_summaries"]:

            summaries.append({
                "id": cs["id"],
                "country_name": cs["medias"]["country_name"],
                "summary": cs["country_summary"],
                "recommend_score": cs["recommend_score"]
            })

        results.append({

            "topic_id": topic["id"],

            "topic_name": topic["topic_name"],

            "created_at": topic["created_at"],

            "summaries": summaries

        })

    return results