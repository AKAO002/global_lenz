'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // loading が終わっていて、かつ user がいない時だけ飛ばす
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // loading 中は何も表示しない、またはローディング画面を出す
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
