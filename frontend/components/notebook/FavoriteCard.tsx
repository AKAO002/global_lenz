import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export type FavoriteCardProps = {
  id: string;
  title: string;
  publishedAt: string;
  hasComparisonSummary: boolean;
  hasCountrySummary: boolean;
  /** 選択中の見た目（青枠） */
  selected?: boolean;
  /** 指定時、カードタップでトグル（複数選択用） */
  onToggleSelect?: () => void;
};

function StatusBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs font-medium text-brand-text">{label}</span>
      <Badge
        variant={value ? 'positive' : 'negative'}
        display="symbol"
        aria-label={`${label}${value ? 'あり' : 'なし'}`}
      />
    </span>
  );
}

export default function FavoriteCard({
  id,
  title,
  publishedAt,
  hasComparisonSummary,
  hasCountrySummary,
  selected = false,
  onToggleSelect,
}: FavoriteCardProps) {
  const card = (
    <Card
      as="article"
      className={`h-full p-4 transition-all duration-200 sm:p-5 ${
        onToggleSelect ? 'cursor-pointer hover:scale-[1.01]' : 'hover:scale-[1.01]'
      } ${
        selected
          ? 'border-2 border-blue-400 shadow-md ring-2 ring-blue-200/80'
          : ''
      }`}
    >
      <p className="text-sm text-brand-muted">{publishedAt}</p>
      <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-relaxed text-brand-text">
        {title}
      </h2>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <StatusBadge label="比較要約" value={hasComparisonSummary} />
        <StatusBadge label="各国要約" value={hasCountrySummary} />
      </div>
    </Card>
  );

  if (onToggleSelect) {
    return (
      <button
        type="button"
        data-item-id={id}
        onClick={onToggleSelect}
        aria-pressed={selected}
        className="w-full rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      >
        {card}
      </button>
    );
  }

  return card;
}
