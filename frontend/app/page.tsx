'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

// 国画像
const flagImages: { [key: string]: string } = {
  日本: '/images/JP.png',
  イギリス: '/images/UK.png',
  アメリカ: '/images/US.png',
  インド: '/images/India.png',
  カタール: '/images/qatar.png',
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const router = useRouter();

  const [summaries, setSummaries] = useState<any[]>([]);
  const [searchResult, setSearchResult] = useState<any | null>(null); // 検索結果専用
  const [tabs, setTabs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState(query || '');
  const [loading, setLoading] = useState(false);

// useEffect 内のロジックを整理
useEffect(() => {
  const fetchSummaries = async () => {
    setLoading(true);
    try {
      // 1. まず「今日のトピック（朝のニュース）」を取得
      const resToday = await fetch('http://localhost:8000/api/topics/today', { cache: 'no-store' });
      const jsonToday = await resToday.json();
      const rawTodayData = jsonToday.topics || [];

      // ★ここで「翻訳（マッピング）」を行う
      // バックエンドの s.country をフロントエンド用の s.country_name に変換します
      const formattedTodayData = rawTodayData.map((topic: any) => ({
        ...topic,
        summaries: topic.summaries?.map((s: any) => ({
          id: s.id,
          country_name: s.medias?.country_name || "不明",
          summary: s.country_summary || "要約がありません",
          recommend_score: s.recommend_score
        })) || []
      }));

      console.log('取得したデータ:', formattedTodayData);

      // 通常時のデータとしてセット
      setSummaries(formattedTodayData);

      // タブは常に「今日のトピック」から生成
      const uniqueTopics = formattedTodayData.map((item: any) => ({
        topic_id: item.topic_id,
        topic_name: item.topic_name,
        comparison_id: item.topic_id,
      }));
      setTabs(uniqueTopics);

      // 2. 検索クエリがある場合は、検索結果を別途取得
      if (query) {
        const resSearch = await fetch('http://localhost:8000/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: query }),
          cache: 'no-store'
        });
        const result = await resSearch.json();
        
        const searchData = {
          topic_id: result.topic_id,
          topic_name: result.topic_name,
          comparison_id: result.topic_id,
          summaries: result.report.country_summaries.map((s: any) => ({
            id: s.id,
            country_name: s.country_name || s.country || "不明", 
            summary: s.country_summary || s.summary || "要約がありません",
            recommend_score: s.recommend_score
          }))
        };
        setSearchResult(searchData);
        setActiveTab(null); // 検索中はタブの選択を外す
      } else {
        // 通常時は検索結果をクリアし、最初のタブを選択
        setSearchResult(null);
        if (uniqueTopics && uniqueTopics.length > 0) {
          setActiveTab(uniqueTopics[0].topic_id);
        }
      }
    } catch (err) {
      console.error('通信に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchSummaries();
}, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    // router.push('/search...') ではなく '/' を指定
    router.push(`/?q=${encodeURIComponent(searchKeyword.trim())}`);
  };

  // 1. 表示するトピックを決定するロジック
  const displayData = query && searchResult 
    ? [searchResult]                      // 検索中なら検索結果（1つ）を配列にする
    : summaries.filter((t: any) => t.topic_id === activeTab); // 通常時は選ばれたタブでフィルタリング
  // --------------------


  const activeTopic = summaries.find((t: any) => t.topic_id === activeTab);

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-24">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg relative">
        
{/* 日付 + 検索窓 を横並びに修正 */}
{/* ヘッダー全体：px-6 に広げて日付を少し内側へ */}
        <header className="p-4 px-6 flex items-center justify-between gap-4">
          {/* 日付：text-lg に少しサイズダウンして馴染ませる */}
          <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap tracking-tight">
            {new Date().toLocaleDateString('ja-JP', {
              month: 'numeric',
              day: 'numeric',
              weekday: 'short',
            })}
          </h1>

          {/* 検索フォーム：max-w-[200px] で大きさを制限し、ml-auto で右側に寄せる */}
          <form 
            onSubmit={handleSearch} 
            className="flex-grow max-w-[180px] ml-auto flex bg-gray-100 rounded-full px-3 py-1.5 items-center border border-transparent focus-within:border-gray-200 transition-all"
          >
            <input 
              type="text" 
              value={searchKeyword} 
              onChange={(e) => setSearchKeyword(e.target.value)} 
              className="bg-transparent flex-grow outline-none text-xs text-gray-700 w-full" 
              placeholder="検索..." 
            />
            <button type="submit" className="text-gray-400 ml-1 text-xs">🔍</button>
          </form>
        </header>

        {/* タブ */}
        {!query && (
          <div className="px-4 mb-6 flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.topic_id}
                onClick={() => setActiveTab(tab.topic_id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.topic_id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                {tab.topic_name}
              </button>
            ))}
          </div>
        )}

        <div className="px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              {/* 1. アニメーションアイコン（知的な回転体） */}
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-orange-400 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-b-blue-300 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
              </div>
              
              {/* 2. テキスト演出 */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-gray-800 animate-pulse">
                  AIが世界中を分析中...
                </h2>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 font-medium">
                    「{searchKeyword}」に関する視点を抽出しています
                  </p>
                  <p className="text-[10px] text-gray-400 mt-4 tracking-widest uppercase">
                    Fetching from Global Media
                  </p>
                </div>
              </div>

              {/* 3. プログレスバー（視覚的な進捗感） */}
              <div className="mt-8 w-full max-w-[200px] h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-300 to-orange-500 animate-[loading-bar_3s_infinite]"></div>
              </div>

              {/* Tailwind CSSのカスタムアニメーションをインラインで追加 */}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes loading-bar {
                  0% { transform: translateX(-100%); }
                  50% { transform: translateX(0); }
                  100% { transform: translateX(100%); }
                }
              `}} />
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-sm font-bold text-gray-700">
                  {query ? `「${query}」の分析結果` : "各国要約"}
                </p>
              </div>

              {displayData.map((topic: any) => (
                <div key={topic.topic_id}>
                  {/* 修正点：recommend_score順に並べ替え */}
                  <div className="grid grid-cols-2 gap-4 px-1">
                    {[...topic.summaries]
                      .sort((a, b) => (b.recommend_score || 0) - (a.recommend_score || 0))
                      .map((summary: any) => {
                        const isNoData = !summary.summary || summary.summary.includes("確認されませんでした") || summary.recommend_score <= 1;

                        return (
                          <div key={`${topic.topic_id}-${summary.id}`} className={`flex flex-col transition-opacity ${isNoData ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                            <div className="flex items-center gap-1 mb-1.5 ml-0.5">
                              <span className="text-[11px] font-bold">{summary.country_name}：</span>
                              {!isNoData && <span className="text-[11px] text-yellow-500">{'★'.repeat(summary.recommend_score || 0)}</span>}
                            </div>

                            <div className="relative rounded-sm overflow-hidden border border-gray-100 h-[170px] bg-gray-50">
                              {flagImages[summary.country_name] && (
                                <Image src={flagImages[summary.country_name]} alt={summary.country_name} fill className="object-cover mix-blend-multiply opacity-20" />
                              )}
                              <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                                <p className="text-sm font-bold leading-snug">
                                  {isNoData ? "このトピックに関する報道は確認されませんでした。" : (summary.summary.length > 35 ? summary.summary.substring(0, 35) + '...' : summary.summary)}
                                </p>
                                {!isNoData && (
                                  <Link href={`/topic/${summary.id}`} className="text-[10px] underline self-end font-bold">...もっと見る</Link>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="mt-8">
                    <Link href={`/comparison/${topic.topic_id}`}>
                      <button className="w-full bg-orange-400 font-bold py-4 rounded-xl shadow-md text-white">5カ国比較レポートを見る</button>
                    </Link>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}