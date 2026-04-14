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