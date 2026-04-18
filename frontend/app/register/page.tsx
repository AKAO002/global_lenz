'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function RegisterContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleRegister = async () => {
    // バリデーションチェック
    setErrorMessage(''); // 一旦クリア

    // 1. メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('正しいメールアドレスを入力してください');
      return;
    }

    // 2. パスワードの長さチェック（例: 8文字以上）
    if (password.length < 8) {
      setErrorMessage('パスワードは8文字以上で入力してください');
      return;
    }

    // 3. パスワードの一致チェック
    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません');
      return;
    }

    // 新規登録
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }
    // 自動ログイン
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      alert(loginError.message);
      return;
    }

    alert('登録完了しました');

    router.push(redirect);
  };

  return (
    <div className="mx-auto mt-6 max-w-md rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-soft">
      <h2 className="mb-6 text-2xl font-bold text-brand-text">新規登録</h2>

      {/* エラーメッセージ表示エリア */}
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
        <label className="mb-1 block text-sm text-brand-text">パスワード（8文字以上）</label>
        <input
          type="password"
          className="w-full rounded border border-brand-border bg-brand-accent-softer p-2 text-brand-text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* パスワード確認入力欄 */}
      <div className="mb-4">
        <label className="mb-1 block text-sm text-brand-text">パスワード（確認用）</label>
        <input
          type="password"
          className="w-full rounded border border-brand-border bg-brand-accent-softer p-2 text-brand-text"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button
        onClick={handleRegister}
        className="w-full rounded bg-brand-accent p-2 font-medium text-white transition-opacity hover:opacity-90"
      >
        登録
      </button>

      <p className="mt-4 text-sm text-brand-muted">
        すでにアカウントがある場合は
        <Link href="/login" className="ml-1 text-brand-accent underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto mt-10 max-w-md text-brand-on-canvas">読み込み中...</div>}
    >
      <RegisterContent />
    </Suspense>
  );
}
