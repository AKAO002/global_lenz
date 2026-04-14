'use client';

import { useEffect, useId } from 'react';

type AboutModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AboutModal({ open, onClose }: AboutModalProps) {
  const titleId = useId();

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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="背景をクリックして閉じる"
        className="absolute inset-0 bg-black/25"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface shadow-soft"
      >
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-brand-text">
            Global Lenz について
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-brand-text transition-all duration-200 hover:scale-105 hover:bg-blue-100"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 p-4 text-sm leading-relaxed text-brand-text sm:px-5 sm:py-5">
          <p>
            Global Lenz は、同じニュースを複数の国・メディア視点で比較し、
            多角的に理解できるようにするツールです。
          </p>
          <p>
            主要メディアの記事を AI が比較要約し、国ごとの違いや論点を
            短時間で把握できるようにサポートします。
          </p>
          <p className="text-brand-muted">
            商談前の話題収集や、海外ニュースの背景理解に役立つことを目指しています。
          </p>
        </div>
      </div>
    </div>
  );
}
