'use client';

import { useMemo, useState } from 'react';
import EmptyState from '@/components/notebook/EmptyState';
import FavoriteCard, { type FavoriteCardProps } from '@/components/notebook/FavoriteCard';

const mockItems: FavoriteCardProps[] = [
  {
    id: 'd1',
    title: 'イラン情勢の比較要約',
    publishedAt: '2026-04-13',
    hasComparisonSummary: true,
    hasCountrySummary: false,
  },
  {
    id: 'd2',
    title: 'ドジャース報道の国別まとめ',
    publishedAt: '2026-04-12',
    hasComparisonSummary: true,
    hasCountrySummary: true,
  },
  {
    id: 'd3',
    title: '宇宙ゴミ問題と各国の主張',
    publishedAt: '2026-04-11',
    hasComparisonSummary: false,
    hasCountrySummary: true,
  },
];

export default function DebugNotebookPage() {
  const [items, setItems] = useState<FavoriteCardProps[]>(mockItems);
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

  return (
    <div className="relative min-h-[100dvh] bg-brand-canvas p-4 pb-28 text-brand-text">
      <main className="mx-auto max-w-4xl">
        <header className="mb-5">
          <h1 className="text-lg font-semibold">ネタ帳（表示確認ページ）</h1>
          <p className="mt-1 text-sm text-brand-muted">
            カードをタップで複数選択 → 右下の削除で取り除けます。
          </p>
        </header>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setItems(mockItems);
              setSelectedIds(new Set());
            }}
            className="rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-xs font-medium hover:bg-white"
          >
            データあり
          </button>
          <button
            type="button"
            onClick={() => {
              setItems([]);
              setSelectedIds(new Set());
            }}
            className="rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-xs font-medium hover:bg-white"
          >
            空にする
          </button>
        </div>

        {isEmpty ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </main>

      {!isEmpty ? (
        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={selectedIds.size === 0}
          className="fixed bottom-6 right-4 z-40 rounded-full border border-violet-200/90 bg-violet-100 px-5 py-2.5 text-sm font-medium text-violet-900 shadow-soft transition-all duration-200 hover:scale-105 hover:bg-violet-200/80 disabled:pointer-events-none disabled:opacity-40 sm:bottom-8"
        >
          削除
          {selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
        </button>
      ) : null}
    </div>
  );
}
