'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null && pathname) {
      const redirectPath = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirectPath}`);
    }
  }, [user, router, pathname]);

  if (!user) return null;

  return <>{children}</>;
}
