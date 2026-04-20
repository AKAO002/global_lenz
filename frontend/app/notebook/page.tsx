// ネタ帳
'use client';

import { useMemo, useState, useEffect } from 'react';
import RequireAuth from '@/components/RequireAuth';
import EmptyState from '@/components/notebook/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotebookPage() {
  const { logout, session } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toastVisible, setToastVisible] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  // --- DBからデータを取得する処理 ---
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.access_token) return;

      try {
        setLoading(true);
        // バックエンドの「要約付きお気に入り一覧」エンドポイントを叩く
        const res = await fetch(
          `http://localhost:8000/api/favorites/with-summaries`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (error) {
        console.error('ネタ帳の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [session]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('ログアウト失敗:', error);
    }
  };

  const isEmpty = useMemo(() => items.length === 0, [items.length]);

  // チェックボックスのON/OFF
  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // トースト表示関数（３秒間表示）
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3000);
  };

  // 一括削除実行
  const handleDeleteSelected = async () => {
    // 選択されている件数を記憶
    const deleteCount = selectedIds.size;
    if (deleteCount === 0) {
      setIsEditMode(false); // 何も選んでなければモード終了
      return;
    }

    try {
      const token = session?.access_token;
      // 各削除リクエストを並列で実行
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`http://localhost:8000/api/favorites/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(deletePromises);

      // 画面上のリストを更新
      setItems((prev) =>
        prev.filter((item) => !selectedIds.has(item.favorite_id))
      );

      // 後片付け
      setSelectedIds(new Set());
      setIsEditMode(false);

      showToast(`${deleteCount}件のネタを削除しました！`);
    } catch (error) {
      console.error('削除失敗:', error);
      showToast('削除に失敗しました');
    }
  };

  console.log('ネタ帳の生データ:', items);
  // 届いたデータをトピック名でグループ化する
  const groupedTopics = items.reduce((acc: any[], current: any) => {
    const topicName =
      current.comparison_summary?.topic_name ||
      current.country_summaries?.topic_name ||
      current.topic_name;
    // すでに同じトピック名の箱があるか探す
    const existingGroup = acc.find((g) => g.topic_name === topicName);

    const linkInfo = {
      favorite_id: current.favorite_id,
      label:
        current.label ||
        (current.type === current.country_summary_id
          ? '各国詳細'
          : '5カ国比較要約'),
      target_id: current.target_id,
      type: current.type,
    };

    if (existingGroup) {
      // すでにカードがあれば、そこにリンク（ボタン）を追加
      existingGroup.links.push(linkInfo);
    } else {
      // なければ、新しいトピックの箱を作る
      acc.push({
        topic_name: topicName,
        created_at: current.created_at,
        links: [current],
      });
    }
    return acc;
  }, []);

  return (
    <RequireAuth>
      <div className="relative min-h-screen bg-brand-canvas p-4 pb-28">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          {/* --- ヘッダー部分 --- */}
          <div className="relative mb-8 flex items-center justify-center py-2">
            {/* タイトル */}
            <h1 className="text-xl font-bold tracking-tight text-brand-text">
              ネタ帳リスト
            </h1>
            {/* 編集ボタン */}
            <button
              onClick={() => {
                if (isEditMode) {
                  handleDeleteSelected(); // モード中なら削除実行
                } else {
                  setIsEditMode(true); // モード中でなければ編集開始
                }
              }}
              className={`absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm outline-none focus:ring-0 ${
                isEditMode
                  ? 'bg-orange-400 text-white hover:bg-orange-400' // 実行ボタン
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200' // 編集開始ボタン
              }`}
            >
              {isEditMode
                ? selectedIds.size > 0
                  ? `${selectedIds.size}件を削除`
                  : 'キャンセル'
                : '編集'}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center pt-20 text-gray-400">
              読み込み中...
            </div>
          ) : isEmpty ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-5">
              {/* まとめた groupedTopics を使う */}
              {groupedTopics.map((group: any, index: number) => (
                <div
                  key={`group-${index}`}
                  className="bg-[#D1EBD8] text-[#2D4A36] px-8 py-7 rounded-3xl shadow-sm relative overflow-hidden"
                >
                  {/* 日付とトピック名*/}
                  <div className="flex gap-4 font-bold text-[15px] mb-3">
                    <span className="tabular-nums">
                      {group.created_at
                        ? new Date(group.created_at).toLocaleDateString(
                            'ja-JP',
                            { month: 'numeric', day: 'numeric' }
                          )
                        : '--/--'}
                    </span>
                    <span>
                      {group.country_summaries?.topic_name ||
                        group.comparison_summary?.topic_name ||
                        group.topic_name ||
                        '読み込み中...'}
                    </span>
                  </div>

                  {/* リンク/選択ボタンをまとまって表示 */}
                  <div className="flex flex-wrap gap-2">
                    {group.links.map((link: any) => (
                      <div key={link.favorite_id} className="relative">
                        {isEditMode ? (
                          <button
                            onClick={() => toggleSelect(link.favorite_id)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[14px] border transition-all ${
                              selectedIds.has(link.favorite_id)
                                ? 'bg-orange-400 text-white border-orange-400'
                                : 'bg-white/40 text-[#2D4A36] border-[#2D4A36]/10'
                            }`}
                          >
                            <input
                              type="checkbox"
                              readOnly
                              checked={selectedIds.has(link.favorite_id)}
                              className="pointer-events-none h-3 w-3 accent-orange-600"
                            />
                            {link.label}
                          </button>
                        ) : (
                          <Link
                            href={
                              link.type === 'country'
                                ? `/topic/${link.target_id}`
                                : `/comparison/${link.target_id}`
                            }
                            className="px-4 py-1.5 bg-white/60 text-[#2D4A36] rounded-lg text-[14px] border border-[#2D4A36]/10 hover:bg-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ログアウトボタン */}
        <div className="mx-auto mt-8 w-full flex justify-center">
          <button
            type="button"
            onClick={handleLogout}
            className="w-auto px-10 py-2 rounded-full border border-emerald-200/90 bg-emerald-50 py-2.5 text-sm font-medium text-emerald-900"
          >
            ログアウト
          </button>
        </div>

        {/* トースト表示 */}
        {toast.visible && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gray-800/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
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
    </RequireAuth>
  );
}
