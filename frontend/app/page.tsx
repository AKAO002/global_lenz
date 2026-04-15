'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 国画像
const flagImages: { [key: string]: string } = {
  日本: '/images/JP.png',
  イギリス: '/images/UK.png',
  アメリカ: '/images/US.png',
  インド: '/images/India.png',
  カタール: '/images/qatar.png',
};

export default function HomePage() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [tabs, setTabs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch(
          'http://localhost:8000/api/country-summaries/home'
        );

        const data = await res.json();

        console.log('取得したデータ:', data);

        if (!res.ok) throw new Error('サーバーエラー');

        setSummaries(data);

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
      } catch (err) {
        console.error('通信に失敗:', err);
      }
    };

    fetchSummaries();
  }, []);

  const activeTopic = summaries.find((t: any) => t.topic_id === activeTab);

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-24">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg relative">
        {/* 日付 */}
        <header className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {new Date().toLocaleDateString('ja-JP', {
              month: 'numeric',
              day: 'numeric',
              weekday: 'short',
            })}
          </h1>
        </header>

        {/* タブ */}

        <nav className="flex justify-around border-b border-gray-100 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.topic_id}
              onClick={() => setActiveTab(tab.topic_id)}
              className={`pb-2 px-2 text-sm font-medium ${
                activeTab === tab.topic_id
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400'
              }`}
            >
              {tab.topic_name}
            </button>
          ))}
        </nav>

        <div className="px-4">
          {/* タイトル */}
          <div className="text-center mb-6">
            <p className="text-sm font-bold text-gray-700">各国要約</p>
          </div>

          {/* ▼ topic ごと表示 */}
          {summaries
            .filter((topic: any) => {
              return topic.topic_id === activeTab;
            })
            .map((topic: any) => {
              return (
                <div key={topic.topic_id}>
                  {/* 国カード */}
                  <div className="grid grid-cols-2 gap-4 px-1">
                    {topic.summaries.map((summary: any) => (
                      <div
                        key={`${topic.topic_id}-${summary.id}`}
                        className="flex flex-col"
                      >
                        {/* 国名 */}
                        <div className="flex items-center gap-1 mb-1.5 ml-0.5">
                          <span className="text-[11px] font-bold text-gray-800">
                            {summary.country_name}：
                          </span>

                          <span className="text-[11px] text-yellow-500 tracking-tighter">
                            {'★'.repeat(summary.recommend_score || 0)}
                          </span>
                        </div>

                        {/* カード */}
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

                          <div className="relative z-10 p-3">
                            <p className="text-sm font-bold">
                              {summary.summary?.length > 30
                                ? summary.summary.substring(0, 30) + '...'
                                : summary.summary || 'サマリーなし'}
                            </p>

                            <Link
                              href={`/topic/${summary.id}`}
                              className="absolute bottom-1 right-2 text-[10px] underline"
                            >
                              ...もっと見る
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ▼ 比較ボタン（ここが重要） */}
                  <div className="mt-6">
                    {activeTopic && (
                      <Link href={`/comparison/${activeTopic.comparison_id}`}>
                        <button className="w-full bg-orange-300 font-bold py-3 rounded-md shadow">
                          5カ国比較要約
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
