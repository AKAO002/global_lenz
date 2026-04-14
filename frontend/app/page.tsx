'use client';

import Link from 'next/link';

// 画像のデザインに合わせて、国名と評価（星）を追加
const topics = [
  { id: 1, title: '日本', country: '日本', rating: '★★★★' },
  { id: 2, title: 'アメリカ', country: 'アメリカ', rating: '★★★★' },
  { id: 3, title: 'イギリス', country: 'イギリス', rating: '★★★' },
  { id: 4, title: 'カタール', country: 'カタール', rating: '★★★★★' },
  { id: 5, title: 'インド', country: 'インド', rating: '★★★★' },
];

// 本日のセットID（実際はDBから取得したり、日付を入れたりします）
const todayIssueId = '20260413';

export default function Home() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">各国要約</h1>

      <p className="text-sm text-yellow-600 font-bold mb-4 text-center">
        アプリがおすすめするのはこちら👇
      </p>

      <div className="grid grid-cols-1 gap-4">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topic/${topic.id}`}
            className="block border-2 border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-700">{topic.country}：</span>
              <span className="text-yellow-400">{topic.rating}</span>
            </div>
            <p className="text-gray-600 text-sm">
              {topic.title}に関する最新の要約情報はこちらから確認できます...
              <span className="text-blue-500 ml-1 text-xs">もっと見る</span>
            </p>
          </Link>
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
  );
}
