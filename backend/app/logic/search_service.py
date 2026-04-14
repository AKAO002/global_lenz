import json
from openai import OpenAI
from dotenv import load_dotenv
import os
import time

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_search_queries(keyword: str) -> dict:
    """
    ユーザー入力キーワードから query_en と query_nhk を生成する。
    例: 「イラン核合意」→ {"query_en": "Iran Nuclear", "query_nhk": "イラン 核"}
    """
    prompt = f"""ユーザーが以下のキーワードでニュースを検索しています。
このキーワードに対して、各メディアのRSSを検索するための適切なクエリを生成してください。

キーワード: {keyword}

### query_en（英語メディア向け・GoogleニュースRSS用）
- 「主語となる国・組織名」＋「具体的な事象語」の英語2語のみ
- 例: "Iran Nuclear", "Ukraine Ceasefire", "Hungary Election"

### query_nhk（NHK専用・日本語RSS用）
- NHKの記事タイトルに出てくる自然な日本語2語
- 例: "イラン 核", "ウクライナ 停戦", "ハンガリー 選挙"

### トピック名（日本語・簡潔に）
- ユーザーのキーワードを整形した表示用トピック名

出力は必ず以下のJSON形式のみ:
{{
    "topic_name": "トピック名",
    "query_en": "English 2words",
    "query_nhk": "日本語1 日本語2"
}}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=100,
    )
    return json.loads(response.choices[0].message.content)


def run_search(keyword: str) -> dict:
    """
    ユーザーキーワードから記事取得→要約生成までを実行し結果を返す。
    Redisキャッシュを活用して同じキーワードの再実行を高速化する。
    """
    from cache.redis_client import make_cache_key, cache_get, cache_set, TTL_SEARCH_RESULT
    from logic.news_service import fetch_media_articles
    from logic.ai_service import generate_combined_report
    from config import SOURCES

    # --- キャッシュ確認 ---
    cache_key = make_cache_key("search", keyword)
    cached = cache_get(cache_key)
    if cached:
        print(f"  ✅ 検索キャッシュヒット: {keyword!r}")
        return cached

    print(f"  🔍 検索実行: {keyword!r}")

    # --- クエリ生成 ---
    queries = generate_search_queries(keyword)
    topic_name = queries.get("topic_name", keyword)
    query_en   = queries.get("query_en", keyword)
    query_nhk  = queries.get("query_nhk", keyword)

    print(f"  生成クエリ: en={query_en!r} / nhk={query_nhk!r}")

    # --- 記事取得 ---
    combined_content = ""
    media_results    = {}

    for media_key, info in SOURCES.items():
        query  = query_nhk if media_key == "NHK" else query_en
        result = fetch_media_articles(media_key, topic_name, query)
        media_results[media_key] = result

        combined_content += f"【国名: {info['country']}】\n"
        if isinstance(result, dict):
            combined_content += f"メディア名: {result['media']}\n"
            combined_content += f"報道内容（タイトル）: {result['title']}\n"
            desc = result.get("description", "").strip()
            if desc:
                combined_content += f"報道内容（詳細）: {desc}\n"
            combined_content += f"URL: {result['url']}\n\n"
        else:
            combined_content += f"メディア名: {info['name']}\n"
            combined_content += f"報道内容: {result}\n\n"

        time.sleep(1)

    # --- 要約生成 ---
    report = generate_combined_report(topic_name, combined_content)

    result_data = {
        "topic_name":   topic_name,
        "query_en":     query_en,
        "query_nhk":    query_nhk,
        "report":       report,
        "media_results": {
            k: v if isinstance(v, dict) else None
            for k, v in media_results.items()
        },
    }

    # --- キャッシュ保存 ---
    cache_set(cache_key, result_data, TTL_SEARCH_RESULT)

    return result_data
