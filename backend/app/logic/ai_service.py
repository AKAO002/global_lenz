import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# 環境変数の読み込みとクライアント初期化
load_dotenv()
token = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=token)

def discover_trending_topics(all_headlines):
    """全メディアの見出しから共通トピックを厳選して6つ抽出する"""
    prompt = f"""
あなたはニュース編集者です。以下の「見出しリスト」を分析し、トピックを【必ずちょうど6つ】選んでください。

見出しリスト:
{all_headlines}

### トピック選定ルール（優先順位順）
1. **実在確認（最重要）**: 見出しリストに実際に登場する固有名詞・事象のみを使うこと。
2. **国際的重要性**: 以下のテーマを優先する。
   - 戦争・紛争・停戦交渉
   - 外交・国際合意
   - 大規模自然災害・人道危機
   - 主要国の選挙・政権交代
   - 国際経済・貿易摩擦
   ※ 一国内の司法・建設等の国内ニュースは選ばない。
   ※ 「スキャンダル」は複数国に影響する国際的なものは可だが、一国内の政治スキャンダルは不可。
   ※ 州・地方レベルの選挙（例：カリフォルニア州知事選）は不可。国政選挙のみ対象。
3. **複数メディア優先**: 2カ国以上の見出しに登場するトピックを優先する。
4. **重複禁止（厳格に）**: 同じ紛争・地域の出来事を別の角度で表現しただけのトピックを複数選ばない。
   - NG例：「ロシア侵攻」と「ウクライナ停戦」→ 同じ紛争なので1つにまとめる
   - NG例：「米イラン交渉」と「イラン停戦」→ 同じ合意プロセスなので1つにまとめる
5. **多様性確保**: 6つのトピックが地域・テーマで偏らないよう選ぶ。

### トピック名・クエリの必須条件（最重要）
- トピック名は必ず「**具体的な事象語**（停戦・攻撃・合意・選挙・制裁など）」を含めること。
- 「トランプ政権」「ロシア」「中国」のように**主体だけのトピック名は禁止**。
  → NG: 「トランプ政権」  OK: 「トランプ関税政策」「トランプ移民規制」
  → NG: 「ロシア侵攻」   OK: 「ウクライナ停戦交渉」（停戦という事象で統合）
- query_en も同様に具体的な事象語を含めること。「Trump Administration」「Russia」のような広すぎるクエリは禁止。

### 検索語の生成ルール

**query_en**（英語メディア向け・GoogleニュースRSS検索用）
- 「主語となる国・組織名」＋「**具体的な事象語**」の英語2語のみ。
- 事象語は「Ceasefire / Attack / Election / Tariffs / Sanctions / Invasion / Strike / Talks」等の具体語を使うこと。
- 「Agreement / Policy / Issue / Situation / Crisis」等の**曖昧な語は禁止**。特に合意系トピックは必ず「Ceasefire」「Talks」「Deal」等の具体語にすること。
- 正しい例：
  ✅ 「Iran Ceasefire」（イランとの停戦）← "US Iran Agreement"ではなくこちら
  ✅ 「Ukraine Ceasefire」（ウクライナ停戦）
  ✅ 「Hungary Election」（ハンガリー選挙）
  ✅ 「Israel Attack」（イスラエル攻撃）
  ✅ 「Trump Tariffs」（トランプ関税）
  ✅ 「Hormuz Blockade」（ホルムズ海峡封鎖）← "Trump Blockade"ではなくこちら。封鎖の主体がトランプでも地名を優先する
  ✅ 「China Taiwan Talks」または「Taiwan Pressure」（中台関係）← "China Taiwan"の2語だけは禁止。必ず事象語を加える
- 誤った例：
  ❌ 「US Iran Agreement」← "Agreement"は広すぎる。"Iran Ceasefire"にする
  ❌ 「Trump Administration」← 主体のみ。"Trump Tariffs"等にする
  ❌ 「Trump Blockade」← 地名を優先。"Hormuz Blockade"にする
  ❌ 「China Taiwan」← 主体のみ・事象語なし。"Taiwan Pressure"や"China Taiwan Talks"にする
  ❌ 「China Taiwan Policy」← "Policy"は曖昧。"Taiwan Pressure"等にする
  ❌ 「Russia Invasion」← 上位概念すぎる。"Ukraine Ceasefire"等の具体事象にする

**query_nhk**（NHK専用・日本語RSS全文検索用）
- NHKの記事タイトルに実際に出てくる**具体的な日本語キーワードを2語**。
- 必ず「固有名詞（国名・地名・人名）＋具体的な事象語」の組み合わせにすること。
- 正しい例：
  ✅ 「イラン 停戦」（米イラン停戦合意）← "米国 イラン"ではなくこちら
  ✅ 「ウクライナ 停戦」（ウクライナ停戦）
  ✅ 「ハンガリー 選挙」（ハンガリー選挙）
  ✅ 「ホルムズ 海峡」（ホルムズ海峡）← 複合語は分割
  ✅ 「トランプ 関税」（トランプ関税）
- 誤った例：
  ❌ 「米国 イラン」← 主体のみ。"イラン 停戦"にする
  ❌ 「中国 台湾」← 主体のみ・事象語なし。"台湾 会談"や"中国 圧力"等にする
  ❌ 「海峡通過」← 複合語。"ホルムズ 海峡"に分割する
  ❌ 「トランプ 封鎖」← 地名を優先。"ホルムズ 封鎖"にする

出力は必ず以下のJSON形式のみとしてください。topicsの要素数は必ず6。

{{
    "topics": [
        {{
            "name": "トピック名(日本語・具体的な事象語を含む)",
            "query_en": "English 2words（具体的な事象語必須）",
            "query_nhk": "日本語キーワード1 日本語キーワード2"
        }}
    ]
}}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    topics = json.loads(response.choices[0].message.content)["topics"]

    if len(topics) != 6:
        print(f"  ⚠️  トピック数が{len(topics)}個です（期待値: 6）")

    topics = topics[:6]
    topics = deduplicate_topics(topics)

    # 重複除去で6件未満になった場合は補充
    if len(topics) < 6:
        print(f"  ⚠️  重複除去後{len(topics)}件 → {6 - len(topics)}件補充します")
        topics = supplement_topics(topics, all_headlines, len(topics), target=6)

    # トピック名とquery_enの国名乖離チェック
    _check_topic_name_consistency(topics)

    print("  📋 選定されたトピック（重複除去・補充後）:")
    for i, t in enumerate(topics, 1):
        print(f"     {i}. {t['name']} (en: {t['query_en']} / nhk: {t['query_nhk']})")

    return topics

def deduplicate_topics(topics):
    """
    AIが生成したトピックリストに実質的な重複がないかチェックし、
    重複があれば統合して整える。
    """
    if len(topics) <= 1:
        return topics

    topic_list_str = "\n".join(
        f"{i+1}. {t['name']} (query_en: {t['query_en']})"
        for i, t in enumerate(topics)
    )
    prompt = f"""以下のニューストピックリストに、実質的に同じ事象を指す重複がありますか？

{topic_list_str}

### 重複と判定するケース（積極的に重複と判定すること）
- 同じ国・地域の同じ紛争・交渉・合意を別の角度で表現しているだけ → 重複
- 上位概念と下位概念の関係（例：「ロシア侵攻」はウクライナ停戦の上位概念） → 重複
- 具体例：
  「ロシア侵攻」と「ウクライナ停戦」→ 重複（同じ紛争の異なる側面）
  「ロシア・ウクライナ戦争」と「ウクライナ停戦合意」→ 重複
  「米・イラン交渉」と「イラン停戦」→ 重複（同じ合意プロセス）
  「米・イラン合意」と「イラン停戦合意」→ 重複

### 重複でないケース
- 完全に異なる国・地域の出来事（例：「ハンガリー選挙」と「ウクライナ停戦」→ 重複でない）
- テーマが異なる（例：「ホルムズ海峡」と「イラン合意」→ 海峡問題と外交は別）

重複がある場合は全ての重複ペアを返してください。
重複がない場合は duplicates を空リストにしてください。

出力は必ず以下のJSON形式のみ:
{{
    "duplicates": [
        {{
            "keep": 残すトピックの番号(1始まり),
            "remove": 削除するトピックの番号(1始まり),
            "merged_name": "統合後のトピック名（より具体的な事象語を含む名称）",
            "merged_query_en": "統合後のquery_en（英語2語・具体的な事象語）",
            "merged_query_nhk": "統合後のquery_nhk（日本語2語・NHK検索用）"
        }}
    ]
}}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    result = json.loads(response.choices[0].message.content)
    duplicates = result.get("duplicates", [])

    if not duplicates:
        return topics

    remove_indices = set()
    for dup in duplicates:
        keep_idx   = dup["keep"] - 1
        remove_idx = dup["remove"] - 1
        if 0 <= keep_idx < len(topics) and 0 <= remove_idx < len(topics):
            topics[keep_idx]["name"]      = dup["merged_name"]
            topics[keep_idx]["query_en"]  = dup["merged_query_en"]
            topics[keep_idx]["query_nhk"] = dup["merged_query_nhk"]
            remove_indices.add(remove_idx)
            print(f"  🔀 重複統合: {dup['merged_name']} (#{dup['remove']}を削除)")

    return [t for i, t in enumerate(topics) if i not in remove_indices]


def supplement_topics(topics, all_headlines, current_count, target=6):
    """
    重複除去でトピックが target 件未満になった場合、不足分を補充する。
    すでに選ばれているトピックと重複しないよう除外リストを渡す。
    """
    shortage = target - current_count
    if shortage <= 0:
        return topics

    existing = "\n".join(f"- {t['name']} (query_en: {t['query_en']})" for t in topics)
    prompt = f"""以下の「見出しリスト」から、すでに選ばれているトピックと重複しない国際的に重要なトピックを
【ちょうど{shortage}つ】追加してください。

見出しリスト:
{all_headlines}

### すでに選ばれているトピック（これらと重複するものは選ばないこと）:
{existing}

### 選定ルール（抽出時と同じ基準を厳守）
- 見出しリストに実際に登場する事象のみを使うこと
- 戦争・外交・選挙・経済摩擦など国際的に重要なテーマを優先する
- 禁止: 一国内の司法・建設・政治スキャンダル等の国内ニュース
- 禁止: 州・地方レベルの選挙（例：カリフォルニア州知事選）。国政選挙のみ対象。
- 禁止: 「トランプ政権」「ロシア」等の主体だけのトピック
- 禁止クエリ語: Scandal / Administration / Policy / Issue / Situation / Crisis
- 必ず具体的な事象語（Ceasefire / Attack / Election / Tariffs / Sanctions / Strike / Talks 等）を含めること

### 検索語ルール
- query_en: 英語2語（国・組織名＋具体的事象語）
- query_nhk: 日本語2語（NHKの記事タイトルに出てくる具体的な語、固有名詞＋事象語）

出力は必ず以下のJSON形式のみ:
{{
    "topics": [
        {{
            "name": "トピック名（具体的な事象語必須）",
            "query_en": "English 2words",
            "query_nhk": "日本語1 日本語2"
        }}
    ]
}}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    new_topics = json.loads(response.choices[0].message.content).get("topics", [])
    added = new_topics[:shortage]
    for t in added:
        print(f"  ➕ 補充トピック: {t['name']} (en: {t['query_en']} / nhk: {t['query_nhk']})")
    return topics + added

def is_article_relevant(media_key, topic_name, article_title, query):
    """
    取得記事がトピックに関連しているかAIで簡易チェック。
    「いいえ」と明示された場合のみ除外（デフォルトは採用）。
    """
    prompt = f"""以下の記事タイトルは、指定されたトピック・検索語と関連していますか？
最初の1語を必ず「はい」または「いいえ」にして答えてください。

トピック名: {topic_name}
検索語: {query}
記事タイトル: {article_title}

判断基準：
- 同じ地域・国・組織が関係していれば「はい」
- 全く異なるテーマ・地域の記事であれば「いいえ」
- 判断が難しい場合は「はい」
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=10,
    )
    answer = response.choices[0].message.content.strip()
    # 「いいえ」で始まる場合のみ除外。それ以外（「はい」・判断不能）は採用
    is_relevant = not answer.startswith("いいえ")
    if not is_relevant:
        print(f"  [{media_key}] 関連性チェック結果: {answer!r} → スキップ")
    return is_relevant

def generate_combined_report(topic_name, all_news_content):
    """
    各国要約・横断分析・スコア・重要用語をまとめた構造化JSONを返す。
    DB保存に直接使える形式。
    """
    user_prompt = f"""
# 設定
あなたは国際情勢の事実を冷徹に記述するシニアエディターです。
提供された「ニュース素材」から、以下の構造化JSONを生成してください。

# ニュース素材（2026年4月時点）
{all_news_content}

---
# 出力JSON仕様

## country_summaries（各国別要約）
各メディアについて以下を出力:
- country: 国名（イギリス／カタール／アメリカ／日本／インド）
- media_name: メディア名（素材に記載のメディア名をそのまま使用）
- summary: 各国の報道内容を2〜4文で要約。主語は「CNNは」ではなく「アメリカは」等の国名に統一。「〜と報じた」等の伝聞語尾禁止・断定的に記述。「※関連ニュースなし」の場合は「本トピックに関する報道は確認されませんでした。」のみ。
- url: 記事URL（なしの場合は空文字）
- article_title: 記事タイトル（なしの場合は空文字）
- recommend_score: 1〜10の整数。以下2軸の平均:
    軸1 TPO適応力: 相手が誰でも刺さるか・知的で建設的な対話のきっかけになるか（10=誰にでも使えるアイスブレイク）
    軸2 ビジネス波及効果: 原油・為替・サプライチェーン・現地市場など意思決定に繋がる示唆があるか（10=直接的なビジネス示唆あり）
- difficult_words: 【追加】その国の報道内容に関連する重要用語・固有名詞を3つ。
    {{"term": "用語名", "description": "解説"}}

## comparison_summary（横断比較分析）
- summary: 全メディアの報道を横断的に比較分析した文章。「〇〇やXXは〜を強調する一方で、△△は…」の形式で国家間の視点の違いを浮き彫りに。
- variance_score: 1〜10の整数。以下4軸の平均（10=最も多様）:
    軸1 主役の不一致度: 各メディアが「誰の動き」を中心に据えているかの食い違い
    軸2 善悪・原因の所在: 「誰のせいか」という主張の食い違い
    軸3 事態の呼び方: 同じ出来事を異なる言葉で定義しているか
    軸4 主張の方向性: ポジ・ネガ比率の違い
- difficult_word: トピック全体の重要用語3語各用語は以下の形式:
    {{"term": "用語名", "description": "解説"}}

---
# 厳守事項
- 「※関連ニュースなし」と記載されているメディアの内容を推測で補完してはいけない
- JSONのみを返すこと。説明文・マークダウン記法・コードブロックは一切不要

出力JSON形式:
{{
  "country_summaries": [
    {{
      "country": "国名",
      "media_name": "メディア名",
      "summary": "要約文",
      "url": "記事URL",
      "article_title": "記事タイトル",
      "recommend_score": 数値,
      "difficult_word": [
      {{"term": "用語名", "description": "解説文"}},
      {{"term": "用語名", "description": "解説文"}},
      {{"term": "用語名", "description": "解説文"}}
    ]
    }}
  ],
  "comparison_summary": {{
    "summary": "横断分析文",
    "variance_score": 数値,
    "difficult_word": [
      {{"term": "用語名", "description": "解説文"}},
      {{"term": "用語名", "description": "解説文"}},
      {{"term": "用語名", "description": "解説文"}}
    ]
  }}
}}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "あなたは複数のソースを統合し、最適な情報を提供するシニアエディターです。必ずJSONのみを返してください。"},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)

def _check_topic_name_consistency(topics):
    """
    トピック名の品質チェックを2種類実施し警告を出す。
    チェック1: query_enの国名とトピック名が乖離していないか
    チェック2: トピック名に事象語が含まれているか（主体のみトピックの検出）
    """
    # --- チェック1: 国名乖離 ---
    name_map = {
        "nigeria": ["ナイジェリア", "ニジェリア"],
        "niger":   ["ニジェール"],
        "ukraine": ["ウクライナ"],
        "russia":  ["ロシア"],
        "iran":    ["イラン"],
        "israel":  ["イスラエル"],
        "hungary": ["ハンガリー"],
        "china":   ["中国"],
        "taiwan":  ["台湾"],
        "trump":   ["トランプ"],
        "hormuz":  ["ホルムズ", "封鎖", "海峡"],  # Hormuz系は封鎖・海峡も可
        "us":      ["アメリカ", "米"],
    }
    for t in topics:
        query_first = t["query_en"].split()[0].lower()
        expected_ja = name_map.get(query_first, [])
        if expected_ja and not any(ja in t["name"] for ja in expected_ja):
            print(f"  ⚠️  [国名乖離] 「{t['name']}」← query_en: {t['query_en']}")
            print(f"       トピック名に含まれるべき語の候補: {expected_ja}")

    # --- チェック2: 主体のみトピック（事象語なし）の検出 ---
    # 事象語リスト（これらのいずれかがトピック名に含まれていれば合格）
    event_words = [
        "停戦", "攻撃", "選挙", "合意", "交渉", "制裁", "関税", "封鎖", "空爆",
        "侵攻", "紛争", "政権交代", "会談", "和解", "優遇", "圧力", "規制",
        "戦争", "危機", "崩壊", "支援", "撤退", "核", "ミサイル", "爆撃",
    ]
    for t in topics:
        if not any(w in t["name"] for w in event_words):
            print(f"  ⚠️  [事象語なし] 「{t['name']}」は主体のみのトピック名の可能性があります")
            print(f"       query_en: {t['query_en']} / query_nhk: {t['query_nhk']}")


    # --- チェック3: 州・地方レベルの選挙の検出 ---
    # 州名リスト（日本語・英語）
    state_names = [
        "カリフォルニア", "テキサス", "ニューヨーク", "フロリダ", "イリノイ",
        "california", "texas", "new york", "florida", "illinois",
        "州知事", "governor", "州議会", "市長", "mayor",
    ]
    for t in topics:
        name_lower = t["name"].lower()
        query_lower = t["query_en"].lower()
        if any(s.lower() in name_lower or s.lower() in query_lower for s in state_names):
            print(f"  ⚠️  [州レベル選挙] 「{t['name']}」は州・地方レベルの可能性があります")
            print(f"       国際的重要性の観点から選定を再検討してください")