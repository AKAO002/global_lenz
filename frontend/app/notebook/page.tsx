// ネタ帳
'use client';

import { useMemo, useState, useEffect } from 'react';
import RequireAuth from '@/components/RequireAuth';
import EmptyState from '@/components/notebook/EmptyState';
import FavoriteCard from '@/components/notebook/FavoriteCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotebookPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // localStorage からデータを読み込む
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('global_lenz_notes') || '[]');
    setItems(saved);
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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-brand-text">
              ネタ帳リスト
            </h1>
          </div>

          {isEmpty ? (
            <EmptyState />
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={item.url || '#'}>
                    <FavoriteCard
                      {...item}
                      selected={selectedIds.has(item.id)}
                      onToggleSelect={(e: any) => toggleSelect(item.id, e)}
                    />
                  </Link>
                </li>
              ))}
            </ul>
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

        {!isEmpty && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            className="fixed bottom-20 right-4 z-40 rounded-full border border-violet-200/90 bg-violet-100 px-5 py-2.5 text-sm font-medium text-violet-900 shadow-lg"
          >
            削除 {selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
          </button>
        )}
      </div>
    </RequireAuth>
  );
}
