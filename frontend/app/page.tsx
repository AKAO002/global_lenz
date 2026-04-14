'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 国画像
const flagImages: { [key: string]: string } = {
  '1': '/images/JP.png',
  '9': '/images/JP.png',
  '2': '/images/UK.png',
  '6': '/images/UK.png',
  '3': '/images/US.png',
  '4': '/images/India.png',
  '5': '/images/qatar.png',
  '7': '/images/qatar.png',
};
// 本日のセットID（実際はDBから取得したり、日付を入れたりします）
const todayIssueId = '20260413';

export default function HomePage() {
  const [summaries, setSummaries] = useState([]);
  const [activeTab, setActiveTab] = useState('イラン情勢');
  const tabs = ['イラン情勢', 'ドジャース', '宇宙ゴミ問題'];

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch(
          'http://localhost:8000/api/country-summaries/home'
        );
        console.log('Response status:', res.status); // ここで404が出るか確認
        if (!res.ok) throw new Error('サーバーエラー');
        const data = await res.json();
        setSummaries(data);
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
          <h1 className="text-2xl font-bold text-gray-800">4月3日（金）</h1>
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
              summaries.map((topic: any) => (
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
                    <Image
                      src={
                        flagImages[topic.media_id] || '/images/flag-default.png'
                      }
                      alt="国旗"
                      fill
                      className="object-cover mix-blend-multiply opacity-30"
                    />

                    {/* テキストエリア: z-10 で画像の上に重ねる。 bg-white/40 で文字を読みやすく */}
                    <div className="relative z-10 p-3 h-full flex flex-col justify-between bg-white/40">
                      {/* テキスト: line-clamp で行数を制限 */}
                      <p className="text-sm leading-relaxed text-gray-900 font-bold">
                        {topic.country_summary?.length > 30
                          ? topic.country_summary.substring(0, 30) + '...'
                          : topic.country_summary || 'サマリーがありません'}
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
            <Link href={`/comparison/${todayIssueId}`}>
              <button className="w-full bg-orange-300 text-black font-bold py-3 rounded-md shadow">
                5カ国比較要約
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
