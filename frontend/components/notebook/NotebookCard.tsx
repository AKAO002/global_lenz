// import { Badge } from '@/components/ui/Badge';
// import { Card } from '@/components/ui/Card';

// export type NotebookCardProps = {
//   topicTitle: string;
//   deliveryDate: string;
//   hasComparisonSummary: boolean;
//   hasCountrySummaries: boolean;
// };

// function StatusRow({ label, value }: { label: string; value: boolean }) {
//   return (
//     <span className="inline-flex items-center gap-1.5">
//       <span className="text-xs font-medium text-brand-text">{label}</span>
//       <Badge
//         variant={value ? 'positive' : 'negative'}
//         display="symbol"
//         aria-label={`${label}${value ? 'あり' : 'なし'}`}
//       />
//     </span>
//   );
// }

// export default function NotebookCard({
//   topicTitle,
//   deliveryDate,
//   hasComparisonSummary,
//   hasCountrySummaries,
// }: NotebookCardProps) {
//   return (
//     <Card as="article" className="p-4 sm:p-5">
//       <h2 className="text-base font-semibold text-brand-text">{topicTitle}</h2>
//       <p className="mt-1 text-sm text-brand-muted">配信日: {deliveryDate}</p>

//       <div className="mt-4 flex flex-wrap justify-end gap-2">
//         <StatusRow label="比較要約" value={hasComparisonSummary} />
//         <StatusRow label="各国要約" value={hasCountrySummaries} />
//       </div>
//     </Card>
//   );
// }
