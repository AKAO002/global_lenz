'use client';

import { useMemo, useState } from 'react';
import RequireAuth from '@/components/RequireAuth';
import EmptyState from '@/components/notebook/EmptyState';
import FavoriteCard, { type FavoriteCardProps } from '@/components/notebook/FavoriteCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const initialItems: FavoriteCardProps[] = [
  {
    id: '1',
    title: 'イラン情勢',
    publishedAt: '2026-04-13',
    mediaLine: 'NHK · CNN · BBC · Al Jazeera · DD News',
  },
  {
    id: '2',
    title: 'ドジャース',
    publishedAt: '2026-04-12',
    mediaLine: 'NHK · CNN · BBC',
  },
];

export default function NotebookPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<FavoriteCardProps[]>(initialItems);
  /** 複数選択: 選択中の項目 id を Set で保持 */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const isEmpty = useMemo(() => items.length === 0, [items.length]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <RequireAuth>
      <div className="relative min-h-screen bg-brand-canvas p-4 pb-28">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <h1 className="mb-5 text-xl font-bold tracking-tight text-brand-text">ネタ帳</h1>

          {isEmpty ? (
            <EmptyState />
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id}>
                  <FavoriteCard
                    {...item}
                    selected={selectedIds.has(item.id)}
                    onToggleSelect={() => toggleSelect(item.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mx-auto mt-8 w-full max-w-2xl">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-full border border-emerald-200/90 bg-emerald-50 py-2.5 text-sm font-medium text-emerald-900 transition-all duration-200 hover:scale-[1.01] hover:bg-emerald-100"
          >
            ログアウト
          </button>
        </div>

        {!isEmpty ? (
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            className="fixed bottom-20 right-4 z-40 rounded-full border border-violet-200/90 bg-violet-100 px-5 py-2.5 text-sm font-medium text-violet-900 shadow-soft transition-all duration-200 hover:scale-105 hover:bg-violet-200/80 disabled:pointer-events-none disabled:opacity-40"
          >
            削除
            {selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
          </button>
        ) : null}
      </div>
    </RequireAuth>
  );
}
