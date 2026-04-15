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
  const [summaries, setSummaries] = useState([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [todayIssueId, setTodayIssueId] = useState('');

  useEffect(() => {
    // マウント時（ブラウザで動いた時）にだけ日付を計算する// 本日のセットID
    const today = new Date();
    const formattedDate =
      today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');
    setTodayIssueId(formattedDate);

    const fetchSummaries = async () => {
      try {
        const res = await fetch(
          'http://localhost:8000/api/country-summaries/home'
        );
        const data = await res.json();
        console.log('取得したデータの中身:', data);
        if (!res.ok) throw new Error('サーバーエラー');
        setSummaries(data);

        // タブの動的生成
        const dynamicTabs = Array.from(
          new Set(data.map((item: any) => item.topic_name))
        ) as string[];
        setTabs(dynamicTabs);

        // 最初のタブをセット
        if (dynamicTabs.length > 0 && !activeTab) {
          setActiveTab(dynamicTabs[0]);
        }
      } catch (err) {
        console.error('通信に失敗しました:', err);
      }
    };
    fetchSummaries();
  }, []);

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-24">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg relative">
        {/* 1. 日付ヘッダー */}
        <header className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {new Date().toLocaleDateString('ja-JP', {
              month: 'numeric',
              day: 'numeric',
              weekday: 'short',
            })}
          </h1>
        </header>

        {/* 2. 上部タブ */}
        <nav className="flex justify-around border-b border-gray-100 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="px-4">
          <div className="text-center mb-6">
            <p className="text-sm font-bold text-gray-700">各国要約</p>
            <p className="text-xs text-gray-500">
              アプリがおすすめするのはこちら
            </p>
          </div>

          {/* 3. 2カラムのカードレイアウト */}
          <div className="grid grid-cols-2 gap-4 px-1">
            {summaries &&
              summaries
                .filter((topic: any) => topic.topic_name === activeTab)
                .map((topic: any) => (
                  <div key={topic.id} className="flex flex-col">
                    {/* 国名と星評価 */}
                    <div className="flex items-center gap-1 mb-1.5 ml-0.5">
                      <span className="text-[11px] font-bold text-gray-800">
                        {topic.country_name}：
                      </span>
                      <span className="text-[11px] text-yellow-500 tracking-tighter">
                        {'★'.repeat(topic.recommend_score || 0)}
                      </span>
                    </div>

                    {/*  カード部分: relative を設定し、高さを固定  */}
                    <div className="relative rounded-sm overflow-hidden border border-gray-100 h-[170px] flex flex-col group bg-white shadow-sm hover:shadow-md transition-shadow">
                      {/*  背景画像: カード全体に広げ、透過と合成モードを設定  */}
                      {flagImages[topic.country_name] && (
                        <Image
                          src={flagImages[topic.country_name]}
                          alt={topic.country_name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover mix-blend-multiply opacity-30"
                        />
                      )}

                      {/* テキストエリア: z-10 で画像の上に重ねる。 bg-white/40 で文字を読みやすく */}
                      <div className="relative z-10 p-3 h-full flex flex-col justify-between bg-white/40">
                        {/* テキスト: line-clamp で行数を制限 */}
                        <p className="text-sm leading-relaxed text-gray-900 font-bold">
                          {topic.summary?.length > 30
                            ? topic.summary.substring(0, 30) + '...'
                            : topic.summary || 'サマリーがありません'}
                        </p>

                        {/* ...もっと見る: 絶対配置 (absolute) で右下に固定。背景を敷いて文字と被っても読めるように */}
                        <Link
                          href={`/topic/${topic.id}`}
                          className="absolute bottom-1 right-2 text-[10px] text-gray-500 underline font-semibold bg-white/70 px-1.5 py-0.5 rounded-sm"
                        >
                          ...もっと見る
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          <div className="mt-8">
            {/* 渡すのは topic.id (国のID) ではなく、セットのID */}
            {todayIssueId && (
              <Link
                href={`/comparison/${todayIssueId}?topic=${encodeURIComponent(activeTab)}`}
              >
                <button className="w-full bg-orange-300 text-black font-bold py-3 rounded-md shadow">
                  5カ国比較要約
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
