export type FavoriteCardProps = {
  id: string;
  title: string;
  publishedAt: string;
  /** 比較メディア名など（任意・1行。API連携時に差し替え） */
  mediaLine?: string;
  /** 選択中の見た目（青枠） */
  selected?: boolean;
  /** 指定時、カードタップでトグル（複数選択用） */
  onToggleSelect?: () => void;
};

export default function FavoriteCard({
  id,
  title,
  publishedAt,
  mediaLine,
  selected = false,
  onToggleSelect,
}: FavoriteCardProps) {
  const card = (
    <article
      className={`h-full rounded-2xl backdrop-blur-[2px] transition-all duration-200 ${
        onToggleSelect ? 'cursor-pointer hover:border-brand-accent/30 hover:bg-white' : ''
      } ${
        selected
          ? 'border-2 border-blue-500 bg-white shadow-md ring-2 ring-blue-200/70 ring-offset-2 ring-offset-brand-canvas'
          : 'border border-brand-border/60 bg-white/85 shadow-sm'
      } px-4 py-3.5 sm:px-5 sm:py-4`}
    >
      <div className="flex flex-col gap-1.5">
        <time
          dateTime={publishedAt}
          className="text-xs font-medium tracking-wide text-brand-muted"
        >
          {publishedAt}
        </time>
        <h2 className="text-base font-semibold leading-snug text-brand-text">{title}</h2>
        {mediaLine ? (
          <p className="text-xs font-normal leading-relaxed text-brand-muted">{mediaLine}</p>
        ) : null}
      </div>
    </article>
  );

  if (onToggleSelect) {
    return (
      <button
        type="button"
        data-item-id={id}
        onClick={onToggleSelect}
        aria-pressed={selected}
        className="w-full rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        {card}
      </button>
    );
  }

  return card;
}
