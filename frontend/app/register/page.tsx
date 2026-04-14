'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function RegisterContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleRegister = async () => {
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
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">新規登録</h2>

      <div className="mb-4">
        <label className="block mb-1">メールアドレス</label>
        <input
          type="email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">パスワード</label>
        <input
          type="password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        onClick={handleRegister}
        className="bg-green-600 text-white w-full p-2 rounded"
      >
        登録
      </button>

      <p className="mt-4 text-sm">
        すでにアカウントがある場合は
        <Link href="/login" className="text-blue-600 ml-1">
          ログイン
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-10 max-w-md">読み込み中...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
