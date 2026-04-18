// 5カ国比較要約（非認証）
'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';
import { useParams } from 'next/navigation';
import HomeStylePageLoading from '@/components/ui/HomeStylePageLoading';

type DifficultWordItem = { term: string; description: string };

/** `origin/feature/UI` の `GlossaryModal.normalizeDifficultWords` と同じ */
function normalizeDifficultWords(raw: unknown): DifficultWordItem[] {
  if (raw == null) return [];

  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  const out: DifficultWordItem[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const term = typeof record.term === 'string' ? record.term.trim() : '';
    const description =
      typeof record.description === 'string'
        ? record.description
        : typeof record.body === 'string'
          ? record.body
          : '';

    if (term) {
      out.push({ term, description });
    }
  }

  return out;
}

export default function ComparePage() {
  const params = useParams();
  const id = params?.id as string;
  const [comparison, setComparison] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryFocusedTerm, setGlossaryFocusedTerm] = useState<string | null>(null);
  const glossaryTitleId = useId();

  const terms = useMemo(
    () => normalizeDifficultWords(comparison?.difficult_word),
    [comparison?.difficult_word]
  );

  const closeGlossary = React.useCallback(() => {
    setGlossaryOpen(false);
    setGlossaryFocusedTerm(null);
  }, []);

  const focusedEntry = useMemo(() => {
    if (!glossaryFocusedTerm) return null;
    return terms.find((t) => t.term === glossaryFocusedTerm) ?? null;
  }, [glossaryFocusedTerm, terms]);

  useEffect(() => {
    if (!id) return;

    const fetchComparisonData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:8000/api/comparison-summaries/${id}/detail`
        );
        const data = await res.json();

        if (res.ok) {
          setComparison(data);
        }
      } catch (err) {
        console.error('比較データの取得に失敗しました:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [id]);

  useEffect(() => {
    if (!glossaryOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGlossary();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [glossaryOpen, closeGlossary]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF6]">
        <HomeStylePageLoading
          className="min-h-[60vh]"
          detailLine="5カ国比較の内容を読み込んでいます"
        />
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-10">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg p-6">
        <header className="mb-8 text-center">
          <h1 className="text-xl font-bold text-gray-800">5カ国比較要約</h1>
        </header>

        {comparison ? (
          <div className="space-y-6">
            {/* 比較要約 */}
            <div className="border-l-4 border-orange-300 pl-4 py-2">
              <h2 className="mb-2 font-bold text-gray-800">{comparison.topic_name}</h2>

              <p className="text-sm text-gray-700 leading-relaxed">
                {comparison.comparison_summary}
              </p>

              {terms.length > 0 ? (
                <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-5">
                  <h3 className="mb-3 text-base font-bold text-gray-900">用語一覧</h3>
                  <ul className="space-y-2">
                    {terms.map((item) => (
                      <li
                        key={item.term}
                        className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100/90 bg-emerald-50/70 px-4 py-3.5"
                      >
                        <span className="text-sm font-semibold text-gray-900">{item.term}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setGlossaryFocusedTerm(item.term);
                            setGlossaryOpen(true);
                          }}
                          aria-label={`「${item.term}」の用語解説を開く`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-base font-bold leading-none text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
                        >
                          ?
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <div className="space-y-4">
              {comparison.country_summaries
                ?.filter((country: any) => country.url !== null)
                .map((country: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-2 text-sm font-bold text-gray-800">{country.country_name}</div>
                    {/* URL表示 */}
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">引用元:</span>

                      <span className="ml-1">{country.media_name}</span>

                      <div className="mt-1">
                        <a
                          href={country.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline break-all"
                        >
                          {country.url}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            比較データが見つかりませんでした。
          </div>
        )}

        {glossaryOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-4">
            <button
              type="button"
              aria-label="背景をクリックして閉じる"
              className="animate-backdrop-fade-in absolute inset-0 z-0 bg-brand-canvas/60 backdrop-blur-[8px]"
              onClick={closeGlossary}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={glossaryTitleId}
              className="animate-glossary-modal-in relative z-10 flex max-h-[min(85vh,560px)] w-full max-w-lg flex-col rounded-[2rem] border border-brand-border bg-brand-surface shadow-soft"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-brand-border px-6 py-4">
                <h2 id={glossaryTitleId} className="text-base font-semibold text-brand-text">
                  {focusedEntry ? `用語解説: ${focusedEntry.term}` : '用語解説'}
                </h2>
                <button
                  type="button"
                  onClick={closeGlossary}
                  aria-label="閉じる"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg text-brand-text transition-all duration-200 hover:bg-brand-accent-soft"
                >
                  ×
                </button>
              </div>

              <div className="min-h-0 overflow-y-auto p-6 sm:p-8">
                {terms.length === 0 ? (
                  <p className="text-sm leading-relaxed text-brand-muted">
                    この比較に紐づく用語解説データ（difficult_word）はまだありません。
                  </p>
                ) : focusedEntry ? (
                  <div className="rounded-2xl border border-brand-border/90 bg-brand-accent-softer px-5 py-4">
                    <p className="text-sm font-semibold text-brand-text">{focusedEntry.term}</p>
                    <p className="mt-2 text-sm font-normal leading-relaxed text-brand-text">
                      {focusedEntry.description || '解説文がありません。'}
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-5">
                    {terms.map((item) => (
                      <li
                        key={item.term}
                        className="rounded-2xl border border-brand-border/90 bg-brand-accent-softer px-5 py-4"
                      >
                        <p className="text-sm font-semibold text-brand-text">{item.term}</p>
                        <p className="mt-1.5 text-sm font-normal leading-relaxed text-brand-muted">
                          {item.description || '—'}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
