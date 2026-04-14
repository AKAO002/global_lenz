'use client';

import Link from 'next/link';

type BottomNavProps = {
  onOpenLinks: () => void;
  onOpenAbout: () => void;
};

export default function BottomNav({ onOpenLinks, onOpenAbout }: BottomNavProps) {
  return (
    <footer className="fixed bottom-0 w-full border-t border-brand-border bg-brand-surface">
      <nav className="mx-auto flex max-w-3xl items-center justify-around px-3 py-2">
        <Link
          href="/"
          className="flex flex-col items-center rounded-xl px-2 py-1 text-xs text-brand-text transition-all duration-200 hover:scale-105 hover:bg-blue-100"
        >
          <span aria-hidden>🏠</span>
          <span>ホーム</span>
        </Link>

        <button
          type="button"
          onClick={onOpenAbout}
          className="flex flex-col items-center rounded-xl px-2 py-1 text-xs text-brand-text transition-all duration-200 hover:scale-105 hover:bg-blue-100"
        >
          <span aria-hidden>✍️</span>
          <span>アプリについて</span>
        </button>

        <button
          type="button"
          onClick={onOpenLinks}
          className="flex flex-col items-center rounded-xl px-2 py-1 text-xs text-brand-text transition-all duration-200 hover:scale-105 hover:bg-blue-100"
        >
          <span aria-hidden>🔗</span>
          <span>便利リンク集</span>
        </button>

        <Link
          href="/notebook"
          className="flex flex-col items-center rounded-xl px-2 py-1 text-xs text-brand-text transition-all duration-200 hover:scale-105 hover:bg-blue-100"
        >
          <span aria-hidden>📒</span>
          <span>ネタ帳</span>
        </Link>
      </nav>
    </footer>
  );
}
