'use client';

import { useState } from 'react';
import Link from 'next/link';

// ダミーデータ
const topics = [
  {
    id: 1,
    title: '日本',
    country: '日本',
    stars: '★★★★',
    image: '/images/JP.png',
    text: 'ホルムズ海峡の緊迫による原油高（燃料費30%増の試算）と国内物価への...',
  },
  {
    id: 2,
    title: 'アメリカ',
    country: 'アメリカ',
    stars: '★★★★',
    image: '/images/US.png',
    text: '最新の経済指標と雇用統計の結果を受け、FRBの方針が注目されています...',
  },
  {
    id: 3,
    title: 'イギリス',
    country: 'イギリス',
    stars: '★★★',
    image: '/images/UK.png',
    text: 'ホルムズ海峡の緊迫による原油高（燃料費30%増の試算）と国内物価への...',
  },
  {
    id: 4,
    title: 'カタール',
    country: 'カタール',
    stars: '★★★★★',
    image: '/images/qatar.png',
    text: 'ホルムズ海峡の緊迫による原油高（燃料費30%増の試算）と国内物価への...',
  },
  {
    id: 5,
    title: 'インド',
    country: 'インド',
    stars: '★★★★',
    image: '/images/India.png',
    text: 'ホルムズ海峡の緊迫による原油高（燃料費30%増の試算）と国内物価への...',
  },
];

// 本日のセットID（実際はDBから取得したり、日付を入れたりします）
const todayIssueId = '20260413';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('イラン情勢');
  const tabs = ['イラン情勢', 'ドジャース', '宇宙ゴミ問題'];

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
            {topics.map((topic) => (
              <div key={topic.id} className="flex flex-col">
                {/* 国名と星評価 */}
                <div className="flex items-center gap-1 mb-1.5 ml-0.5">
                  <span className="text-[11px] font-bold text-gray-800">
                    {topic.country}：
                  </span>
                  <span className="text-[11px] text-yellow-500 tracking-tighter">
                    {topic.stars}
                  </span>
                </div>

                {/* ✨ カード部分: relative を設定し、高さを固定 ✨ */}
                <div className="relative rounded-sm overflow-hidden border border-gray-100 h-[170px] flex flex-col group bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* ✨ 背景画像: カード全体に広げ、透過と合成モードを設定 ✨ */}
                  <img
                    src={topic.image}
                    alt={topic.country}
                    // `mix-blend-multiply` で白背景を消し、`opacity-60` で透過させる
                    className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply opacity-60 z-0"
                  />

                  {/* ✨ テキストエリア: z-10 で画像の上に重ねる。 bg-white/40 で文字を読みやすく ✨ */}
                  <div className="relative z-10 p-3 h-full flex flex-col justify-between bg-white/40">
                    {/* テキスト: line-clamp で行数を制限し、フォントを少し小さく、太く */}
                    <p className="text-[10px] leading-relaxed text-gray-900 font-bold line-clamp-6">
                      {topic.text}
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
            <Link href={`/compare/${todayIssueId}`}>
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
