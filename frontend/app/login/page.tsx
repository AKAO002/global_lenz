'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') || '/';
  console.log('redirect', redirect);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      //   console.log('data', data);
      //   console.log('error', error);

      if (error) {
        alert(error.message);
        return;
      }

      router.push(redirect);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">ログイン</h2>

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
        onClick={handleLogin}
        className="bg-blue-600 text-white w-full p-2 rounded"
      >
        ログイン
      </button>

      <p className="mt-4 text-sm">
        アカウントがない場合は
        <Link href="/register" className="ml-1 text-blue-600">
          新規登録
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-10 max-w-md">読み込み中...</div>}>
      <LoginContent />
    </Suspense>
  );
}
