from datetime import date
from fastapi import APIRouter, HTTPException

from app.db.repository import get_supabase_client
from app.cache.redis_client import (
    make_cache_key, cache_get, cache_set, TTL_API_RESPONSE,
)

router = APIRouter()


@router.get("/today")
def get_today_topics():
    """
    今日のバッチで生成されたトピック一覧を返す。
    Redisにキャッシュがあればそちらを返す（TTL: 20時間）。
    """
    today = date.today().isoformat()
    cache_key = make_cache_key("topics_today", today)

# --- 一時的にここをコメントアウト ---
    # cached = cache_get(cache_key)
    # if cached:
    #     return {"source": "cache", "date": today, "topics": cached}
    # ----------------------------------

    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="DB接続エラー")

    res = (
        supabase.table("topics")
        .select("id, topic_name, created_at, country_summaries(*)")
        .gte("created_at", f"{today}T00:00:00") 
        .eq("is_search", False)
        .order("created_at")
        .execute()
    )

# フロントエンドの期待する形式に少し整形
    raw_topics = res.data or []
    formatted_topics = []

    for t in raw_topics:
        # フロントエンド(page.tsx)が map((summary: any) => ...) できる形式に整える
        formatted_topics.append({
            "topic_id": t["id"],
            "topic_name": t["topic_name"],
            "summaries": t.get("country_summaries", []) 
        })
        
    # Redisに保存（整形後のデータを保存するのが効率的です）
    cache_set(cache_key, formatted_topics, TTL_API_RESPONSE)

    return {"source": "db", "date": today, "topics": formatted_topics}


@router.get("/{topic_id}")
def get_topic_detail(topic_id: int):
    """
    指定トピックIDの各国要約・横断比較分析を返す。
    Redisにキャッシュがあればそちらを返す（TTL: 20時間）。
    """
    cache_key = make_cache_key("topic_detail", topic_id)
    cached = cache_get(cache_key)
    if cached:
        return {"source": "cache", **cached}

    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="DB接続エラー")

    # トピック情報
    topic_res = supabase.table("topics").select("*").eq("id", topic_id).execute()
    if not topic_res.data:
        raise HTTPException(status_code=404, detail="トピックが見つかりません")
    topic = topic_res.data[0]

    # 各国サマリー（記事情報をJOIN）
    cs_res = (
        supabase.table("country_summaries")
        .select(
            "*, "
            "medias(media_name, country_name), "
            "country_summary_articles(articles(title, url, description))"
        )
        .eq("topic_id", topic_id)
        .execute()
    )

    # 横断比較サマリー
    comp_res = (
        supabase.table("comparison_summaries")
        .select("*")
        .eq("topic_id", topic_id)
        .execute()
    )

    data = {
        "topic":              topic,
        "country_summaries":  cs_res.data or [],
        "comparison_summary": comp_res.data[0] if comp_res.data else None,
    }

    cache_set(cache_key, data, TTL_API_RESPONSE)
    return {"source": "db", **data}
