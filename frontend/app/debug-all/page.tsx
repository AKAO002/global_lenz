'use client';

import { useState } from 'react';
import AboutModal from '@/components/ui/AboutModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DebugAllPage() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenAbout = () => {
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setIsAboutOpen(true);
    }, 450);
  };

  return (
    <div className="min-h-[100dvh] bg-brand-canvas px-4 py-6 text-brand-text sm:px-8 sm:py-10">
      <main className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-soft sm:p-8">
        <h1 className="text-lg font-semibold">デバッグ: モーダル確認</h1>
        <p className="text-center text-sm leading-relaxed text-brand-muted">
          下のボタンから「Global Lens について」モーダルの開閉を確認できます。
        </p>

        <button
          type="button"
          onClick={handleOpenAbout}
          className="rounded-full border border-brand-border bg-brand-canvas px-5 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-blue-100"
        >
          このアプリについて
        </button>

        {isLoading ? <LoadingSpinner label="モーダルを準備中..." /> : null}
      </main>

      <AboutModal open={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
