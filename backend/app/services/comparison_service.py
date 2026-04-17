from app.db.supabase import supabase

#　比較要約一覧を取得
def get_comparison_summaries():

    response = (
        supabase
        .table("comparison_summaries")
        .select("*")
        .limit(20)
        .execute()
    )

    return response.data

# 比較要約を1件だけ取得する
def get_comparison_summary_by_id(summary_id: int):

    response = (
        supabase
        .table("comparison_summaries")
        .select("*")
        .eq("id", summary_id)
        .single()
        .execute()
    )
    return response.data

# 比較要約詳細画面の表示
def get_comparison_detail(comparison_id: int):

    response = (
        supabase
        .table("comparison_summaries")
        .select(
                """
            id,
            topic_id,
            created_at,
            variance_score,
            comparison_summary,
            difficult_word,

            topics (
                topic_name,

                country_summaries (
                    topic_id,
                    media_id,
                    country_summary,

                    medias (
                        country_name,
                        media_name
                    )
                )
            )
            """
        )
        .eq("topic_id", comparison_id)
        .single()
        .execute()
    )

    data = response.data

    if not data:
        return None

    topic_id = data["topic_id"]

    result_countries = []

   # topics 内に country が入っている
    country_list = data["topics"]["country_summaries"]

    for c in country_list:

        media_id = c["media_id"]

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

        result_countries.append({
            "country_name":
                c["medias"]["country_name"],

            "media_name":
                c["medias"]["media_name"],

            "summary":
                c["country_summary"],

            "url":
                url
        })

    return {

        "comparison_id":
            data["id"],

        "created_at":
            data["created_at"],

        "topic_name":
            data["topics"]["topic_name"],

        "variance_score":
            data["variance_score"],

        "comparison_summary":
            data["comparison_summary"],
        
        "difficult_word":
        data["difficult_word"],

        "country_summaries":
            result_countries
    }
