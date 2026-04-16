// ネタ帳
'use client';

import { useMemo, useState, useEffect } from 'react';
import RequireAuth from '@/components/RequireAuth';
import EmptyState from '@/components/notebook/EmptyState';
import FavoriteCard from '@/components/notebook/FavoriteCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ダミーデーた
const mockFavoritesByTopic = [
  {
    id: 'topic_001',
    date: '4/16 (水)',
    topic_name: 'イラン情勢',
    links: [
      { label: '比較要約', url: '/compare/1' },
      { label: '日本詳細', url: '/detail/jp' },
      { label: 'アメリカ詳細', url: '/detail/us' },
      { label: 'インド詳細', url: '/detail/in' },
      { label: 'カタール詳細', url: '/detail/qa' },
      { label: 'イギリス詳細', url: '/detail/uk' },
    ],
  },
  {
    id: 'topic_002',
    date: '4/17 (木)',
    topic_name: '宇宙ゴミ問題',
    links: [
      { label: '日本詳細', url: '/detail/jp2' },
      { label: 'アメリカ詳細', url: '/detail/us2' },
      { label: 'インド詳細', url: '/detail/in2' },
    ],
  },
];

export default function NotebookPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<any[]>(mockFavoritesByTopic);
  // const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // localStorage からデータを読み込む
  useEffect(() => {
    // const saved = JSON.parse(localStorage.getItem('global_lenz_notes') || '[]');
    // setItems(saved);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('ログアウト失敗:', error);
    }
  };

  const isEmpty = useMemo(() => items.length === 0, [items.length]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const nextItems = items.filter((item) => !selectedIds.has(item.id));
    setItems(nextItems);
    localStorage.setItem('global_lenz_notes', JSON.stringify(nextItems));
    setSelectedIds(new Set());
  };

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
              {items.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-[#D1EBD8] text-[#2D4A36] px-8 py-7 rounded-[45px] shadow-sm relative overflow-hidden"
                >
                  {/* 日付とトピック名 */}
                  <div className="flex gap-4 font-bold text-[15px] mb-3">
                    <span className="tabular-nums">{topic.date}</span>
                    <span>{topic.topic_name}</span>
                  </div>

                  {/* リンク一覧 */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {topic.links.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.url}
                        className="text-[14px] font-medium border-b border-black/40 hover:border-black transition-all"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
