'use client';

import { useEffect, useId } from 'react';

type UsefulLinksModalProps = {
  open: boolean;
  onClose: () => void;
};

const LINKS = [
  { emoji: '🌍', label: '外務省 安全情報', href: 'https://www.anzen.mofa.go.jp/' },
  { emoji: '☀️', label: '各国の天気', href: 'https://www.accuweather.com/' },
] as const;

export default function UsefulLinksModal({ open, onClose }: UsefulLinksModalProps) {
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
        aria-label="モーダルを閉じる"
        className="absolute inset-0 bg-brand-canvas/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-[1.5rem] border border-brand-border bg-brand-surface shadow-soft"
      >
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-brand-text">
            便利リンク集
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-brand-text transition-all duration-200 hover:scale-105 hover:bg-brand-accent-soft"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 p-4">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-brand-border/80 bg-brand-accent-softer px-4 py-3.5 text-sm font-medium leading-relaxed text-brand-text shadow-sm transition-all duration-200 hover:scale-[1.01] hover:bg-brand-accent-soft"
            >
              <span className="mr-2" aria-hidden>
                {link.emoji}
              </span>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
