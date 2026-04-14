// 5カ国比較要約（非認証）
'use client';

import React from 'react'; // Reactをインポート
import Link from 'next/link';

// paramsの型定義をPromiseに変更
export default function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // React.use() を使って params の中身を取り出す
  const { id } = React.use(params);

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* 直接 params.id と書かずに、取り出した id を使う */}
      <h1 className="text-xl font-bold mb-6">5カ国比較要約 ({id})</h1>

      <div className="border rounded-lg p-4 bg-orange-50 mb-6 text-center">
        <p className="text-sm text-gray-600">
          ID: {id} のニュース比較を表示中
          <br />
          （制作中！）
        </p>
      </div>
    </div>
  );
}
