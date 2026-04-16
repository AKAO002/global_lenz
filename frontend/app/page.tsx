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

useEffect(() => {
    const fetchSummaries = async () => {
      setLoading(true);
      try {
        if (query) {
          // --- 1. 検索実行時 ---
          const res = await fetch('http://localhost:8000/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: query })
          });
          const result = await res.json();
          
          const searchData = [{
            topic_id: result.topic_id,
            topic_name: result.topic_name,
            comparison_id: result.topic_id,
            summaries: result.report.country_summaries.map((s: any) => ({
              id: s.id, // バックエンドで注入した本物のIDを使用
              country_name: s.country,
              summary: s.summary,
              recommend_score: s.recommend_score
            }))
          }];

          setSearchResult(searchData[0]);

        } else {
          // --- 2. 通常時（朝のニュース表示） ---
          // エンドポイントを正しいもの（is_search=falseを返すもの）に変更
          const res = await fetch('http://localhost:8000/api/topics/today');
          const json = await res.json();
          const data = json.topics; // バックエンドの戻り値に合わせて修正

          if (!data) return;

          setSummaries(data);

          // タブの生成：通常時のデータからのみ作成する
          const uniqueTopics = data.map((item: any) => ({
            topic_id: item.topic_id,
            topic_name: item.topic_name,
            comparison_id: item.topic_id,
          }));

          setTabs(uniqueTopics);

          if (uniqueTopics.length > 0) {
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
    // URLを更新して、useEffect内のquery検知を発火させる
    router.push(`/?q=${encodeURIComponent(searchKeyword.trim())}`);
  };

  const activeTopic = query
  ? searchResult  // 検索中は検索結果を参照
  : summaries.find((t: any) => t.topic_id === activeTab);

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-24">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg relative">
        {/* 日付 + 検索窓 */}
        <header className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {new Date().toLocaleDateString('ja-JP', {
              month: 'numeric',
              day: 'numeric',
              weekday: 'short',
            })}
          </h1>
          {/* 追加：検索フォーム */}
          <form onSubmit={handleSearch} className="mt-4 flex bg-gray-100 rounded-full px-4 py-2">
            <input 
              type="text" 
              value={searchKeyword} 
              onChange={(e) => setSearchKeyword(e.target.value)} 
              className="bg-transparent flex-grow outline-none text-sm text-gray-700" 
              placeholder="ニュースを検索..." 
            />
            <button type="submit" className="text-gray-500">🔍</button>
          </form>
        </header>

        {/* タブ */}
        <nav className="flex justify-around border-b border-gray-100 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.topic_id}
              onClick={() => setActiveTab(tab.topic_id)}
              className={`pb-2 px-2 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.topic_id ? 'text-black border-b-2 border-black' : 'text-gray-400'
              }`}
            >
              {tab.topic_name}
            </button>
          ))}
        </nav>

        <div className="px-4">
          {loading ? (
            <div className="text-center py-10 text-sm text-gray-400">読み込み中...</div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-sm font-bold text-gray-700">
                  {query ? `「${query}」の分析結果` : "各国要約"}
                </p>
              </div>

              {(query && searchResult ? [searchResult] : summaries.filter((t: any) => t.topic_id === activeTab))
                .map((topic: any) => (
                  <div key={topic.topic_id}>
                    <div className="grid grid-cols-2 gap-4 px-1">
                      {topic.summaries?.map((summary: any) => (
                        <div key={`${topic.topic_id}-${summary.id}`} className="flex flex-col">
                          <div className="flex items-center gap-1 mb-1.5 ml-0.5">
                            <span className="text-[11px] font-bold text-gray-800">
                              {summary.country_name}：
                            </span>
                            <span className="text-[11px] text-yellow-500 tracking-tighter">
                              {'★'.repeat(summary.recommend_score || 0)}
                            </span>
                          </div>

                          <div className="relative rounded-sm overflow-hidden border border-gray-100 h-[170px]">
                            {flagImages[summary.country_name] && (
                              <Image
                                src={flagImages[summary.country_name]}
                                alt={summary.country_name}
                                fill
                                sizes="(max-width: 768px) 100vw"
                                className="object-cover mix-blend-multiply opacity-30"
                              />
                            )}
                            <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                              <p className="text-sm font-bold text-gray-900 leading-snug">
                                {summary.summary?.length > 30
                                  ? summary.summary.substring(0, 30) + '...'
                                  : summary.summary || 'サマリーなし'}
                              </p>
                              <Link href={`/topic/${summary.id}`} className="text-[10px] underline self-end">
                                ...もっと見る
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      {activeTopic && (
                        <Link href={`/comparison/${activeTopic.comparison_id}`}>
                          <button className="w-full bg-orange-300 font-bold py-3 rounded-md shadow text-gray-900">
                            5カ国比較要約
                          </button>
                        </Link>
                      )}
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