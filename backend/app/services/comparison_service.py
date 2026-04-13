from app.db.supabase import supabase

def get_comparison_summaries():

    response = (
        supabase
        .table("comparison_summaries")
        .select("*")
        .limit(20)
        .execute()
    )

    return response.data