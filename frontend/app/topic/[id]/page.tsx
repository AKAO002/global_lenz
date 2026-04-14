'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import RequireAuth from '@/components/RequireAuth';
import Link from 'next/link';

// 仮の国旗データ（画像に合わせて）
const flagImages: { [key: string]: string } = {
  '1': '/images/flag-japan.png', // 日本
  '2': '/images/flag-usa.png', // アメリカ
  // ...必要に応じて追加
};

export default function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const [topic, setTopic] = useState<any>(null); // 本来は型を定義する
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false); // ネタ帳に保存済みかどうかの状態

  useEffect(() => {
    // IDに基づいてニュースデータを取得する（本来はDBから）
    async function fetchTopic() {
      setLoading(true);
      // ここでIDを使ったAPIコールを行う想定。今はダミーデータをセット。
      const dummyData = {
        date: '4月3日（金）',
        title: 'イラン情勢',
        country: '{選択国}',
        description: `ホルムズ海峡の緊迫による原油高（燃料費30％増の試算）と国内物価への影響を注視。高市総理らによる事態沈静化への積極的なトップ外交や、中東派遣中の海自護衛艦による船舶の安全確保、さらに現地の邦人保護に全力を挙げる政府の動向を連日トップニュースで伝えています。`,
        source: 'NHK',
        sourceUrl: 'https://www3.nhk.or.jp/',
      };
      setTopic(dummyData);
      setLoading(false);
    }
    fetchTopic();
  }, [id]);

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert('ログアウトしました');
    router.push('/');
  };

  // ネタ帳への保存処理
  const handleSaveToNotebook = async () => {
    if (isSaved) {
      alert('すでにネタ帳に保存されています');
      return;
    }

    // 現在のログインユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // RequireAuthがあるので基本ありえない

    // 保存データをSupabaseにインサート (テーブル名は仮に'favorites')
    const { error } = await supabase.from('favorites').insert({
      user_id: user.id,
      topic_id: id,
      topic_title: topic?.title,
      description_snapshot: topic?.description,
      // ...他の必要な情報
    });

    if (error) {
      alert('保存に失敗しました：' + error.message);
    } else {
      setIsSaved(true); // 保存成功
      alert('ネタ帳に保存しました！');
    }
  };

  if (loading) {
    return <div className="p-10 text-center">読み込み中...</div>;
  }

  return (
    <RequireAuth>
      {' '}
      {/* これで未ログインは弾く */}
      <div className="p-6 max-w-md mx-auto bg-[#FDFBF6] min-h-screen text-gray-800">
        {/* ヘッダーエリア（日付、タイトル、ネタ帳ボタン） */}
        <div className="flex justify-between items-center mb-10 mt-4">
          <div className="flex gap-6 items-center">
            <h1 className="text-xl font-bold">{topic?.date}</h1>
            <h2 className="text-xl font-bold">{topic?.title}</h2>
          </div>
          {/* ネタ帳保存ボタン（アイコン） */}
          <button
            onClick={handleSaveToNotebook}
            className={`transition-colors ${isSaved ? 'text-gray-400' : 'hover:text-gray-500'}`}
          >
            {/* 画像のようなカレンダー/手帳アイコン (SVGなどを使う) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </button>
        </div>
        {/* 要約テキスト */}
        <div className="space-y-6">
          <p className="text-center font-bold mb-6">
            {topic?.country}の記事要約は以下になります。
          </p>

          {/* 画像（国旗などを想定） */}
          <div className="w-full h-40 flex items-center justify-center p-4">
            {/* 仮の国旗（画像ファイルがあればそれを表示） */}
            <img
              src={flagImages[id] || '/images/flag-default.png'}
              alt="選択国のイメージ"
              className="h-full object-contain mix-blend-multiply opacity-70"
            />
          </div>

          {/* 要約本文 */}
          <p className="text-sm leading-relaxed tracking-wider">
            {topic?.description}
          </p>

          {/* 引用元 */}
          <div className="text-xs text-center mt-12 flex gap-3 justify-center">
            <span>引用元：{topic?.source}</span>
            <a
              href={topic?.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              URL
            </a>
          </div>
        </div>
        {/* ログアウトボタン（最下部に配置） */}
        <div className="mt-16 text-center">
          <button
            onClick={handleLogout}
            className="bg-[#AEE9A1] px-4 py-1 rounded text-xs text-gray-700 font-bold hover:bg-[#97D48D] transition-colors"
          >
            ログアウト
          </button>
        </div>
        {/* タブバー（app/layout.tsxに共通で置くのが理想ですが、仮で配置） */}
        <div className="h-20"></div> {/* コンテンツとかぶらないように余白 */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-200 p-2 flex justify-around border-t">
          {/* ホーム、アプリについて、などのアイコンボタン群 */}
          <div className="text-center">
            <Link href="/" className="text-sm">
              🏠
              <br />
              ホーム
            </Link>
          </div>
          {/* ...他3つ */}
          <div className="text-center">
            <Link href="/notebook" className="text-sm">
              📝
              <br />
              ネタ帳
            </Link>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
