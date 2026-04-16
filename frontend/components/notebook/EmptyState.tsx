export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface p-8 text-center shadow-soft">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-canvas text-xl text-brand-accent">
        ☆
      </div>
      <p className="text-sm text-brand-muted">まだお気に入りがありません</p>
    </div>
  );
}
