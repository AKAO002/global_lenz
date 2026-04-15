from fastapi import FastAPI
import time
from app.config import SOURCES
from app.logic.news_service import collect_headlines, fetch_media_articles
from app.logic.ai_service import discover_trending_topics, generate_combined_report
from app.db.repository import get_supabase_client, save_to_db

from app.app_api import router as api_router

app = FastAPI()

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "Backendが動きました!!"}

# -------------------------------------------------------
# メイン実行
# -------------------------------------------------------
def main():
    print("🌐 世界の最新トレンドを確認中...")
    all_headlines = collect_headlines()

    print("🤖 トレンドトピックを分析中...")
    trending_topics = discover_trending_topics(all_headlines)

# Supabaseクライアント初期化（DB保存が不要な場合はNoneのまま進む）
    supabase = get_supabase_client()

    for topic in trending_topics:
        print(f"\n🚀 トピック「{topic['name']}」の統合解析を開始...")
        combined_content = ""
        media_results    = {}   # DB保存用に生データを保持

        for media_key, info in SOURCES.items():
        # NHKはquery_nhk（具体的な日本語キーワード）を使用
            query  = topic["query_nhk"] if media_key == "NHK" else topic["query_en"]
            result = fetch_media_articles(media_key, topic["name"], query)

            media_results[media_key] = result  # 生データを保持

            combined_content += f"【国名: {info['country']}】\n"
            if isinstance(result, dict):
                combined_content += f"メディア名: {result['media']}\n"
                combined_content += f"報道内容（タイトル）: {result['title']}\n"
            # descriptionがある場合は要約生成の参考情報として追加
                desc = result.get("description", "").strip()
                if desc:
                    combined_content += f"報道内容（詳細）: {desc}\n"
                combined_content += f"URL: {result['url']}\n\n"
            else:
                combined_content += f"メディア名: {info['name']}\n"
                combined_content += f"報道内容: {result}\n\n"

            time.sleep(1)

    # 2. AIでレポートを生成
        report = generate_combined_report(topic["name"], combined_content)

    # 3. 報道がなかった国のデータを補完（★ここが重要）
        
        country_summaries_map = {
            cs["country"]: cs for cs in report.get("country_summaries", [])
        }
        full_country_summaries = []

        for media_key, info in SOURCES.items():
            cs = country_summaries_map.get(info["country"])
            if not cs:
            # AIが返さなかった国を補完
                cs = {
                    "country": info["country"],
                    "media_name": info["name"],
                    "summary": "本トピックに関する報道は確認されませんでした。",
                    "recommend_score": 1,
                    "url": "",
                    "article_title": "",
                    "difficult_word": []
                }
            full_country_summaries.append(cs)
        
        # ★ 補完した5カ国分のリストを report 本体に書き戻す
        report["country_summaries"] = full_country_summaries

        # 4. コンソール出力（全文表示）
        print(f"\n{'='*60}")
        print(f"### TOPIC: {topic['name']} ###")
        print(f"{'='*60}\n")
        print("【① 各メディア別の報道内容】\n")

        # 5カ国分を順番に表示
        for cs in report["country_summaries"]:
            print(f"--- {cs['country']} ({cs['media_name']}) ---")
            print(f"  要約: {cs['summary']}")
            print(f"  recommend_score: {cs.get('recommend_score', '-')}")

            # --- ここを追加：各国の重要用語を表示 ---
            country_words = cs.get("difficult_word", [])
            if country_words:
                print("  重要用語:")
                for cw in country_words:
                    print(f"    ・{cw['term']}：{cw['description']}")
            # ---------------------------------------
            
            if cs.get("url"):
                print(f"  URL: {cs['url']}")
            print()

        comp = report.get("comparison_summary", {})
        print("【② メディア横断的な比較分析】\n")
        print(f"  variance_score: {comp.get('variance_score', '-')}")
        print(f"  {comp.get('summary', '')}")
        words = comp.get("difficult_word", [])
        if words:
            print("\n  重要用語（横断）:")
            for w in words:
                print(f"    ・{w['term']}：{w['description']}")
        print(f"\n{'='*60}\n")

    # DB保存
        if supabase:
            try:
                save_to_db(supabase, topic["name"], media_results, report)
            except Exception as e:
                print(f"  ❌ DB保存エラー: {e}")

if __name__ == "__main__":
    main()
