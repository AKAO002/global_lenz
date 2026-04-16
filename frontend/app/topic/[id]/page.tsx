'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import RequireAuth from '@/components/RequireAuth';
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

export default function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const [cs, setCs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false); // ネタ帳に保存済みかどうかの状態

  useEffect(() => {
    async function fetchTopic() {
      setLoading(true);
      try {
        const apiUrl = `http://localhost:8000/api/country-summaries/${id}/detail`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('データの取得に失敗しました');
        const data = await res.json();
        console.log('詳細データ受信:', data);

        // バックエンドの返り値 data は { topic: {...}, country_summaries: [...] } という形
        setCs(data); // 1件の要約データをセット

      } catch (error) {
        console.error('取得失敗:', error);
      } finally {
        setLoading(false);
      }
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
      country_summary_id: parseInt(id), // IDを数値に変換
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

  if (!cs) {
    return (
      <div className="p-10 text-center bg-[#FDFBF6] min-h-screen">
        データが見つかりませんでした。
      </div>
    );
  }

  return (
    <RequireAuth>
      {' '}
      {/* これで未ログインは弾く */}
      <div className="p-6 max-w-md mx-auto bg-[#FDFBF6] min-h-screen text-gray-800">
        {/* ヘッダーエリア（日付、タイトル、ネタ帳ボタン） */}
        <div className="flex justify-between items-center mb-10 mt-4">
          <div className="flex gap-6 items-center">
            <h1 className="text-xl font-bold">
              {cs.created_at ? new Date(cs.created_at).toLocaleDateString() : ''}
            </h1>
            <h2 className="text-xl font-bold">{cs.topic_name}</h2>
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

        <div className="border-b border-gray-100 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded">
               {cs.country_name}
            </span>
            <span className="text-yellow-500 text-xs">{'★'.repeat(cs.recommend_score)}</span>
          </div>

          {/* 画像 */}
          <div className="w-full h-40 flex items-center justify-center p-4 relative">
            {/* 国旗 */}
            {flagImages[cs.country_name] && (
              <Image
                src={flagImages[cs.country_name]}
                alt={cs.country_name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain mix-blend-multiply opacity-70"
              />
            )}
          </div>

          {/* 要約本文 */}
          <p className="text-sm leading-relaxed tracking-wider">
            {cs.summary}
          </p>

          {/* 引用元 */}
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 mb-2">出典: {cs.media_name}</p>
            <div className="space-y-2">
              {cs.summary_articles?.map((item: any, idx: number) => (
                <a
                  key={idx}
                  href={item.articles?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                    🔗 {item.articles?.title || "ソース記事を確認する"}
                </a>
               ))}
            </div>
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
      </div>
    </RequireAuth>
  );
}
