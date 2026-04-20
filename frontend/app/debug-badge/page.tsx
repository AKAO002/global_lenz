// import { Badge } from "@/components/ui/Badge";

// export default function DebugBadgePage() {
//   return (
//     <div className="min-h-[100dvh] bg-brand-background px-4 py-10 text-brand-text">
//       <main className="mx-auto max-w-lg space-y-10">
//         <div>
//           <h1 className="text-lg font-semibold">Badge 表示テスト</h1>
//           <p className="mt-1 text-sm text-brand-muted">
//             アイボリー背景上でのパステル調バッジの確認用ページです。
//           </p>
//         </div>

//         <section className="space-y-3" aria-labelledby="sec-symbol">
//           <h2 id="sec-symbol" className="text-sm font-semibold text-brand-muted">
//             symbol（○ / ×）
//           </h2>
//           <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-soft">
//             <Badge variant="positive" display="symbol" />
//             <Badge variant="negative" display="symbol" />
//           </div>
//         </section>

//         <section className="space-y-3" aria-labelledby="sec-word">
//           <h2 id="sec-word" className="text-sm font-semibold text-brand-muted">
//             word（あり / なし）
//           </h2>
//           <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-soft">
//             <Badge variant="positive" display="word" />
//             <Badge variant="negative" display="word" />
//           </div>
//         </section>

//         <section className="space-y-3" aria-labelledby="sec-combo">
//           <h2 id="sec-combo" className="text-sm font-semibold text-brand-muted">
//             ラベル＋バッジ（ネタ帳想定）
//           </h2>
//           <div className="flex flex-wrap gap-4 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-soft">
//             <span className="inline-flex items-center gap-1.5">
//               <span className="text-xs font-medium">比較要約</span>
//               <Badge variant="positive" display="symbol" />
//             </span>
//             <span className="inline-flex items-center gap-1.5">
//               <span className="text-xs font-medium">各国要約</span>
//               <Badge variant="negative" display="symbol" />
//             </span>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }
