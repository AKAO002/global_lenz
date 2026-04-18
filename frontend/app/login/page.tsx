'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') || '/';
  console.log('redirect', redirect);

  const handleLogin = async () => {
    setErrorMessage(''); // エラーを初期化
    // 🌟 バリデーションチェック
    if (!email || !password) {
      setErrorMessage('メールアドレスとパスワードを入力してください');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('メールアドレスの形式が正しくありません');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage('メールアドレスまたはパスワードが正しくありません');
        return;
      }

      router.push(redirect);
    } catch (error) {
      console.error(error);
      setErrorMessage('予期せぬエラーが発生しました');
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-md rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-soft">
      <h2 className="mb-6 text-2xl font-bold text-brand-text">ログイン</h2>

      {/* エラーメッセージ表示 */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {errorMessage}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm text-brand-text">メールアドレス</label>
        <input
          type="email"
          className="w-full rounded border border-brand-border bg-brand-accent-softer p-2 text-brand-text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-brand-text">パスワード</label>
        <input
          type="password"
          className="w-full rounded border border-brand-border bg-brand-accent-softer p-2 text-brand-text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        onClick={handleLogin}
        className="w-full rounded bg-brand-accent p-2 font-medium text-white transition-opacity hover:opacity-90"
      >
        ログイン
      </button>

      <p className="mt-4 text-sm text-brand-muted">
        アカウントがない場合は
        <Link href="/register" className="ml-1 text-brand-accent underline">
          新規登録
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto mt-10 max-w-md text-brand-on-canvas">読み込み中...</div>}
    >
      <LoginContent />
    </Suspense>
  );
}
