'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 国画像（developと共通）
const flagImages: { [key: string]: string } = {
  日本: '/images/JP.png',
  イギリス: '/images/UK.png',
  アメリカ: '/images/US.png',
  インド: '/images/India.png',
  カタール: '/images/qatar.png',
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const router = useRouter();

  const [summaries, setSummaries] = useState<any[]>([]);
  const [tabs, setTabs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState(query || '');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        if (query) {
          // 検索APIを叩く
          const res = await fetch('http://localhost:8000/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: query })
          });
          const result = await res.json();
          
          // developのデータ構造に変換
          data = [{
            topic_id: result.topic_id,
            topic_name: result.topic_name,
            comparison_id: result.topic_id, 
            summaries: result.report?.country_summaries.map((s: any, idx: number) => ({
              id: s.country_id || idx,
              country_name: s.country,
              summary: s.summary, // developに合わせてsummaryに統一
              recommend_score: s.recommend_score
            })) || []
          }];
        } else {
          // クエリがない場合はdevelopと同じホーム用APIを叩く
          const res = await fetch('http://localhost:8000/api/country-summaries/home');
          data = await res.json();
        }

        if (data) {
          setSummaries(data);
          
          // タブ生成ロジック（developと統一：IDで管理）
          const uniqueTopics = Array.from(
            new Map(
              data.map((item: any) => [
                item.topic_id,
                {
                  topic_id: item.topic_id,
                  topic_name: item.topic_name,
                  comparison_id: item.comparison_id,
                },
              ])
            ).values()
          );

          setTabs(uniqueTopics);
          if (uniqueTopics.length > 0) {
            setActiveTab(uniqueTopics[0].topic_id);
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const activeTopic = summaries.find((t: any) => t.topic_id === activeTab);

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-24 text-gray-800">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg relative">
        {/* ヘッダー */}
        <header className="p-6 text-center">
          <h1 className="text-2xl font-bold">
            {new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
          </h1>
          <form onSubmit={handleSearch} className="mt-4 flex bg-gray-100 rounded-full px-4 py-2">
            <input 
              type="text" 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
              className="bg-transparent flex-grow outline-none text-sm" 
              placeholder="ニュースを検索..." 
            />
            <button type="submit">🔍</button>
          </form>
        </header>

        {/* タブ（developのデザインを反映） */}
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
          {query && !loading && (
            <div className="mb-4 text-xs text-blue-600 font-bold italic text-center">
              「{query}」の検索結果
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {summaries
              .filter(topic => topic.topic_id === activeTab)
              .map((topic) => (
                topic.summaries?.map((s: any, i: number) => (
                  <div key={`${topic.topic_id}-${i}`} className="flex flex-col">
                    {/* 国名と★（developと統一） */}
                    <div className="flex items-center gap-1 mb-1.5 ml-0.5">
                      <span className="text-[11px] font-bold">{s.country_name}：</span>
                      <span className="text-[11px] text-yellow-500 tracking-tighter">
                        {'★'.repeat(s.recommend_score || 0)}
                      </span>
                    </div>

                    {/* カード（画像背景あり） */}
                    <div className="relative rounded-sm overflow-hidden border border-gray-100 h-[170px] bg-white shadow-sm">
                      {flagImages[s.country_name] && (
                        <Image 
                          src={flagImages[s.country_name]} 
                          alt={s.country_name} 
                          fill 
                          className="object-cover mix-blend-multiply opacity-30" 
                        />
                      )}
                      <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                        <p className="text-sm font-bold text-gray-900 leading-snug">
                          {s.summary?.length > 30 ? s.summary.substring(0, 30) + '...' : s.summary || "要約がありません"}
                        </p>
                        <Link href={`/topic/${s.id || i}`} className="text-[10px] underline self-end text-gray-500">
                          ...もっと見る
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ))}
          </div>

          {/* 比較ボタン（developと統一） */}
          <div className="mt-8">
            {activeTopic && (
              <Link href={`/comparison/${activeTopic.comparison_id}`}>
                <button className="w-full bg-orange-300 font-bold py-3 rounded-md shadow text-gray-900">
                  5カ国比較要約
                </button>
              </Link>
            )}
          </div>

          {summaries.length === 0 && !loading && (
            <p className="text-center text-gray-400 text-sm mt-10">ニュースが見つかりません</p>
          )}
        </div>
      </div>
    </div>
  );
}