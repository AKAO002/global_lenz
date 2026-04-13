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

    response = supabase.table(
        "comparison_summaries"
    ).select("*").eq(
        "id", summary_id
    ).execute()

    return response.data