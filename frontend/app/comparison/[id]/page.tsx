// 5カ国比較要約（非認証）
'use client';

import React, { useState, useEffect } from 'react';

export default function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  // React.use は必ず関数の中の一番上で実行します
  const { id } = React.use(params);
  const { topic: urlTopic } = React.use(searchParams);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisonData = async () => {
      console.log(
        '叩いているURL:',
        `http://localhost:8000/api/comparison/${id}/detail`
      );
      try {
        setLoading(true);
        // ID（日付など）に基づいたデータを取得
        const res = await fetch(
          `http://localhost:8000/api/comparison/${id}/detail`
        );
        const data = await res.json();

        if (res.ok && data.length > 0) {
          // フィルタリングのロジック
          let filteredData = data;

          if (urlTopic) {
            // 1. URLにトピック名があれば、その名前で絞り込む
            filteredData = data.filter(
              (item: any) => item.topic_name === urlTopic
            );
          } else {
            // 2. なければ、データの最初のトピック名を使う（保険）
            const fallbackTopic = data[0].topic_name;
            filteredData = data.filter(
              (item: any) => item.topic_name === fallbackTopic
            );
          }

          // 重複排除（同じ国が複数出ないように、最新の5件に絞る）
          const latestFive: any[] = [];
          const seenCountries = new Set();
          for (const item of filteredData) {
            if (!seenCountries.has(item.country_name)) {
              latestFive.push(item);
              seenCountries.add(item.country_name);
            }
            if (latestFive.length === 5) break;
          }
          setSummaries(latestFive);
        }
      } catch (err) {
        console.error('比較データの取得に失敗しました:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [id, urlTopic]);

  if (loading) {
    return <div className="p-10 text-center">読み込み中...</div>;
  }

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-10">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg p-6">
        <header className="mb-8 text-center">
          <h1 className="text-xl font-bold text-gray-800">5カ国比較要約</h1>
          <p className="text-lg font-bold text-orange-600 mt-2">
            {/* トピック名を表示 */}
            {data.topic_name}
          </p>
        </header>
        {/* AIによる比較文を表示 */}
        {data.comparison_summary && (
          <div className="mb-10 p-5 bg-orange-50 rounded-xl border border-orange-100 shadow-sm">
            <h2 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
              <span className="text-lg">🌏</span> 視点の違いをAIが分析
            </h2>
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              {data.comparison_summary}
            </p>
          </div>
        )}
        : (
        <div className="text-center py-20 text-gray-500">
          比較データが見つかりませんでした。
        </div>
        )
      </div>
    </div>
  );
}
