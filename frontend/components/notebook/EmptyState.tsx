import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface p-8 text-center shadow-soft">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-canvas text-xl text-brand-accent">
        ☆
      </div>
      <p className="text-sm text-brand-muted">まだお気に入りがありません</p>
      <Link
        href="/"
        className="mt-5 inline-flex rounded-full border border-brand-border bg-brand-canvas px-5 py-2 text-sm font-medium text-brand-text transition-all duration-200 hover:scale-105 hover:bg-blue-100"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}
