'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import RequireAuth from '@/components/RequireAuth';
import Image from 'next/image';
import HomeStylePageLoading from '@/components/ui/HomeStylePageLoading';

// 国画像
const flagImages: { [key: string]: string } = {
  日本: '/images/JP.png',
  イギリス: '/images/UK.png',
  アメリカ: '/images/US.png',
  インド: '/images/India.png',
  カタール: '/images/qatar.png',
};

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

export default function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false); // ネタ帳に保存済みかどうかの状態
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryFocusedTerm, setGlossaryFocusedTerm] = useState<string | null>(null);
  const glossaryTitleId = useId();

  const terms = useMemo(
    () => normalizeDifficultWords(topic?.difficult_word),
    [topic?.difficult_word]
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
    async function fetchTopic() {
      setLoading(true);
      try {
        const apiUrl = `http://localhost:8000/api/country-summaries/${id}/detail`;
        const token = localStorage.getItem('access_token');
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        // 未ログインはログイン画面へ遷移
        if (res.status === 401) {
          router.push('/login'); // ← 未ログインは即遷移
          return;
        }

        if (!res.ok) throw new Error('データの取得に失敗しました');

        const data = await res.json();
        if (data && typeof data === 'object') {
          setTopic(data);
        } else {
          setTopic(null);
        }
      } catch (error) {
        console.error('取得失敗:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopic();
  }, [id]);

  useEffect(() => {
    if (!glossaryOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGlossary();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [glossaryOpen, closeGlossary]);

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert('ログアウトしました');
    router.push('/');
  };

  // ネタ帳への保存処理
  const handleSaveToNotebook = async () => {
    if (isSaved) {
      alert('すでにネタ帳に保存されています');
      return;
    }

    // 現在のログインユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // RequireAuthがあるので基本ありえない

    // 保存データをSupabaseにインサート (テーブル名は仮に'favorites')
    const { error } = await supabase.from('favorites').insert({
      user_id: user.id,
      country_summary_id: parseInt(id), // IDを数値に変換
    });

    if (error) {
      alert('保存に失敗しました：' + error.message);
    } else {
      setIsSaved(true); // 保存成功
      alert('ネタ帳に保存しました！');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF6]">
        <HomeStylePageLoading
          className="min-h-[60vh]"
          detailLine="各国要約の詳細を読み込んでいます"
        />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-10 text-center bg-[#FDFBF6] min-h-screen">
        データが見つかりませんでした。
      </div>
    );
  }

  return (
    <RequireAuth>
      {' '}
      {/* これで未ログインは弾く */}
      <div className="p-6 max-w-md mx-auto bg-[#FDFBF6] min-h-screen text-gray-800">
        {/* ヘッダーエリア（日付、タイトル、ネタ帳ボタン） */}
        <div className="flex justify-between items-center mb-10 mt-4">
          <div className="flex gap-6 items-center">
            <h1 className="text-xl font-bold">{topic.summary_date}</h1>
            <h2 className="text-xl font-bold">{topic.topic_name}</h2>
          </div>
          {/* ネタ帳保存ボタン（アイコン） */}
          <button
            onClick={handleSaveToNotebook}
            className={`transition-colors ${isSaved ? 'text-gray-400' : 'hover:text-gray-500'}`}
          >
            {/* 画像のようなカレンダー/手帳アイコン (SVGなどを使う) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </button>
        </div>
        {/* 要約テキスト */}
        <div className="space-y-6">
          <p className="text-center font-bold mb-6">
            {topic.country_name}の記事要約は以下になります。
          </p>

          {/* 画像 */}
          <div className="w-full h-40 flex items-center justify-center p-4 relative">
            {/* 国旗 */}
            {flagImages[topic.country_name] && (
              <Image
                src={flagImages[topic.country_name]}
                alt={topic.country_name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain mix-blend-multiply opacity-70"
              />
            )}{' '}
          </div>

          {/* 要約本文 */}
          <p className="text-sm leading-relaxed tracking-wider">
            {topic.summary}
          </p>

          {terms.length > 0 ? (
            <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-5">
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

          {/* 引用元 */}
          <div className="text-xs text-gray-500 border rounded-lg p-4 bg-gray-50">
            <span className="font-semibold">引用元</span>

            <span className="ml-1">{topic?.media_name}</span>

            <div className="mt-1">
              <a
                href={topic?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all"
              >
                {topic?.url}
              </a>
            </div>
          </div>
        </div>
        {/* ログアウトボタン（最下部に配置） */}
        <div className="mt-16 text-center">
          <button
            onClick={handleLogout}
            className="bg-[#AEE9A1] px-4 py-1 rounded text-xs text-gray-700 font-bold hover:bg-[#97D48D] transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

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
                  この記事に紐づく用語解説データ（difficult_word）はまだありません。
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
    </RequireAuth>
  );
}
