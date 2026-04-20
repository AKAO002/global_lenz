'use client';

import { useEffect, useMemo } from 'react';
import type { DifficultWordItem } from '@/lib/normalizeDifficultWords';

type ListProps = {
  terms: DifficultWordItem[];
  onSelectTerm: (term: string) => void;
  /** 上マージン（各国詳細は mt-8、比較ページ本文内は mt-6 が元コミット） */
  sectionClassName?: string;
};

/** 用語一覧（? ボタン）— e4dda755 の UI をそのまま */
export function DifficultWordsListSection({
  terms,
  onSelectTerm,
  sectionClassName = 'mt-8',
}: ListProps) {
  if (terms.length === 0) return null;

  return (
    <section
      className={`${sectionClassName} rounded-3xl border border-brand-border/80 bg-brand-surface p-4 shadow-soft sm:p-5`}
    >
      <h3 className="mb-3 text-base font-bold text-brand-text">用語一覧</h3>
      <ul className="space-y-2">
        {terms.map((item) => (
          <li
            key={item.term}
            className="flex items-center justify-between gap-3 rounded-2xl border border-brand-accent-secondary/25 bg-brand-accent-softer/80 px-4 py-3.5"
          >
            <span className="text-sm font-semibold text-brand-text">{item.term}</span>
            <button
              type="button"
              onClick={() => onSelectTerm(item.term)}
              aria-label={`「${item.term}」の用語解説を開く`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-base font-bold leading-none text-brand-text shadow-sm transition-colors hover:bg-brand-canvas"
            >
              ?
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  terms: DifficultWordItem[];
  focusedTerm: string | null;
  /** 用語データが空のときモーダル内に出す文言（記事用 / 比較用で切り替え） */
  emptyMessage: string;
};

/** 用語解説モーダル — e4dda755 のマークアップ・クラスをそのまま */
export function DifficultWordsGlossaryModal({
  open,
  onClose,
  titleId,
  terms,
  focusedTerm,
  emptyMessage,
}: ModalProps) {
  const focusedEntry = useMemo(() => {
    if (!focusedTerm) return null;
    return terms.find((t) => t.term === focusedTerm) ?? null;
  }, [focusedTerm, terms]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-4">
      <button
        type="button"
        aria-label="背景をクリックして閉じる"
        className="animate-backdrop-fade-in absolute inset-0 z-0 bg-brand-text/25 backdrop-blur-[8px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-glossary-modal-in relative z-10 flex max-h-[min(85vh,560px)] w-full max-w-lg flex-col rounded-3xl border border-brand-border bg-brand-surface shadow-soft"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-6 py-4">
          <h2 id={titleId} className="text-base font-semibold text-brand-text">
            {focusedEntry ? `用語解説: ${focusedEntry.term}` : '用語解説'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg text-brand-text transition-all duration-200 hover:bg-brand-accent-soft"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-6 sm:p-8">
          {terms.length === 0 ? (
            <p className="text-sm leading-relaxed text-brand-muted">{emptyMessage}</p>
          ) : focusedEntry ? (
            <div className="rounded-3xl border border-brand-border/90 bg-brand-accent-softer px-5 py-4">
              <p className="text-sm font-semibold text-brand-text">{focusedEntry.term}</p>
              <p className="mt-2 text-sm font-normal leading-relaxed text-brand-text">
                {focusedEntry.description || '解説文がありません。'}
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {terms.map((item) => (
                <li
                  key={item.term}
                  className="rounded-3xl border border-brand-border/90 bg-brand-accent-softer px-5 py-4"
                >
                  <p className="text-sm font-semibold text-brand-text">{item.term}</p>
                  <p className="mt-1.5 text-sm font-normal leading-relaxed text-brand-muted">
                    {item.description || '—'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
