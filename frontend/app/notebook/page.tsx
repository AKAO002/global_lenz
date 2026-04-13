'use client';

import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function NotebookPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <RequireAuth>
      <div className="p-4 min-h-screen flex flex-col">
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-4">ネタ帳</h1>

          {/* ネタ一覧 */}
          <div>ネタ一覧表示</div>
        </div>

        {/* 下部ログアウト */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-green-400 text-white py-2 rounded"
          >
            ログアウト
          </button>
        </div>
      </div>
    </RequireAuth>
  );
}
