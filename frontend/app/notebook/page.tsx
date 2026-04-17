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
  // const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

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

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!session?.access_token) return;

    if (!confirm(`${selectedIds.size}件のネタを削除してもよろしいですか？`))
      return;

    try {
      // 選択された各IDに対して削除リクエストを送る
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`http://localhost:8000/api/favorites/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
      );

      await Promise.all(deletePromises);

      // 画面上のリストからも消す
      setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      alert('削除しました');
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('一部の削除に失敗しました');
    }
  };

  // 届いたデータをトピック名でグループ化する
  const groupedTopics = items.reduce((acc: any[], current: any) => {
    // すでに同じトピック名の箱があるか探す
    const existingTopic = acc.find(
      (item) => item.topic_name === current.topic_name
    );

    if (existingTopic) {
      // あれば、その箱の links 配列に今のデータを追加
      existingTopic.links.push(current);
    } else {
      // なければ、新しいトピックの箱を作る
      acc.push({
        topic_name: current.topic_name,
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
          <div className="mb-6 flex items-center justify-center">
            {' '}
            {/* justify-between から center へ変更 */}
            <h1 className="text-xl font-bold tracking-tight text-brand-text">
              ネタ帳リスト
            </h1>
          </div>
          {isEmpty ? (
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

                  {/* リンクをまとまって表示 */}
                  <div className="flex flex-wrap gap-2">
                    {group.links.map((link: any) => (
                      <Link
                        key={link.favorite_id}
                        href={
                          link.type === 'country'
                            ? `/topic/${link.target_id}`
                            : `/comparison/${link.target_id}`
                        }
                        className="px-4 py-1.5 bg-white/60 text-[#2D4A36] rounded-lg text-[14px] border border-[#2D4A36]/10 hover:bg-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}{' '}
        </div>

        <div className="mx-auto mt-8 w-full max-w-2xl">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-full border border-emerald-200/90 bg-emerald-50 py-2.5 text-sm font-medium text-emerald-900"
          >
            ログアウト
          </button>
        </div>

        {/* {!isEmpty && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            className="fixed bottom-20 right-4 z-40 rounded-full border border-violet-200/90 bg-violet-100 px-5 py-2.5 text-sm font-medium text-violet-900 shadow-lg"
          >
            削除 {selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
          </button>
        )} */}
      </div>
    </RequireAuth>
  );
}
