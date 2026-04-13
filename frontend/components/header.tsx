'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // ログアウト表示するページ
  const showLogout =
    pathname.includes('/topic') || pathname.includes('/notebook');

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="flex justify-between">
        <Link href="/">
          <h1 className="text-xl font-bold">Global Lenz</h1>
        </Link>

        {user && showLogout && (
          <button onClick={handleLogout}>ログアウト</button>
        )}
      </div>
    </header>
  );
}
