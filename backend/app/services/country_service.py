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