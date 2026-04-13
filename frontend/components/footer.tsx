'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t fixed bottom-0 w-full">
      <div className="flex justify-around p-3">
        <Link href="/">
          <div className="flex flex-col items-center text-sm">
            🏠
            <span>ホーム</span>
          </div>
        </Link>

        <Link href="/compare">
          <div className="flex flex-col items-center text-sm">
            ✍️
            <span>アプリについて</span>
          </div>
        </Link>

        <Link href="/links">
          <div className="flex flex-col items-center text-sm">
            🔗
            <span>便利リンク集</span>
          </div>
        </Link>

        <Link href="/notebook">
          <div className="flex flex-col items-center text-sm">
            📒
            <span>ネタ帳</span>
          </div>
        </Link>
      </div>
    </footer>
  );
}
