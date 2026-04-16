// 5カ国比較要約（非認証）
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ComparePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [comparison, setComparison] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // モーダルの開閉
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  useEffect(() => {
    if (!id) return;

    const fetchComparisonData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:8000/api/comparison-summaries/${id}/detail`
        );
        const data = await res.json();

        if (res.ok) {
          setComparison(data);
          if (data.is_already_saved) {
            setIsSaved(true);
          }
        }
      } catch (err) {
        console.error('比較データの取得に失敗しました:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [id, user]);

  // ネタ帳保存処理
  const handleSaveToNotebook = async () => {
    // 非認証→ログイン
    if (!user) {
      setIsModalOpen(true);
      return;
    }

    // ログイン済み→保存処理
    try {
      if (isSaved) {
        // 削除処理
        console.log('ネタ帳から削除中...');

        // バックエンドの削除APIを叩く
        // const res = await fetch(`http://localhost:8000/api/favorites/${id}`, { method: 'DELETE' });

        setIsSaved(false); // 色をグレーに戻す
        // 余裕があればここで「保存を解除しました」と小さく出すと親切！
        showToast('ネタ帳から削除しました');
      } else {
        // 【追加処理】まだ保存されていない場合
        console.log('ネタ帳に追加中...');

        // バックエンドの追加APIを叩く
        // const res = await fetch(`http://localhost:8000/api/favorites`, { method: 'POST', ... });

        setIsSaved(true); // 色を真鍮色（アンバー）にする
        showToast('ネタ帳に追加しました！');
      }
    } catch (error) {
      console.error('操作に失敗しました:', error);
    }
  };

  // トースト表示関数
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 1500); // 1.5秒後に消える
  };

  if (loading) {
    return <div className="p-10 text-center">読み込み中...</div>;
  }

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-10">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg p-6">
        {/* ヘッダーエリア*/}
        <header className="flex items-center justify-between mb-8 pb-3 border-b border-gray-200">
          <div className="flex items-baseline gap-2">
            {/* 日付*/}
            <h1 className="text-xl font-bold">
              {new Date()
                .toLocaleDateString('ja-JP', {
                  month: 'numeric',
                  day: 'numeric',
                  weekday: 'short',
                })
                .replace(/\//g, '月')}
            </h1>
          </div>

          {/* ネタ帳保存ボタン（アイコン）*/}
          <button
            onClick={handleSaveToNotebook}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              isSaved
                ? 'text-amber-700 bg-amber-50' // 保存済み
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' // 未保存
            }`}
            title={isSaved ? '保存済み' : 'ネタ帳に追加'}
          >
            {/* ネタ帳アイコン */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill={isSaved ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </button>
        </header>

        <div className="space-y-6">
          <p className="text-center font-bold mb-6">5カ国比較要約</p>

          {comparison ? (
            <div className="space-y-6">
              {/* 比較要約 */}
              <div className="border-l-4 border-orange-300 pl-4 py-2">
                <h2 className="font-bold text-gray-800 mb-2">
                  {comparison.topic_name}
                </h2>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {comparison.comparison_summary}
                </p>
              </div>

              <div className="space-y-4">
                {comparison.country_summaries
                  ?.filter((country: any) => country.url !== null)
                  .map((country: any, index: number) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      {/* URL表示 */}
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold">引用元:</span>

                        <span className="ml-1">{country.media_name}</span>

                        <div className="mt-1">
                          <a
                            href={country.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline break-all"
                          >
                            {country.url}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              比較データが見つかりませんでした。
            </div>
          )}
        </div>
      </div>

      {/* ログイン案内モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FDFBF6] w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-orange-100 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-4">
              {/* アイコン */}
              <div className="flex justify-center">
                <div className="bg-amber-50 p-4 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                ネタ帳を使ってみませんか？
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                ログインすると、気になったニュースを自分だけの「ネタ帳」に保存して、いつでも読み返せるようになります。
              </p>

              <div className="pt-4 space-y-3">
                <button
                  onClick={() =>
                    router.push(`/login?redirect=${window.location.pathname}`)
                  }
                  className="w-full bg-amber-700 text-white py-3 rounded-full font-bold shadow-md hover:bg-amber-800 transition-colors"
                >
                  ログインして保存する
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  今はしない
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* トースト通知 */}
      {toast.visible && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-800/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
            {/* チェックアイコン */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
