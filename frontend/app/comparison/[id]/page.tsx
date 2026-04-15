// 5カ国比較要約（非認証）
'use client';

import React, { useState, useEffect } from 'react';

export default function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        // ID（日付など）に基づいたデータを取得
        const res = await fetch(
          `http://localhost:8000/api/country-summaries/home`
        );
        const data = await res.json();

        if (res.ok && data.length > 0) {
          const targetTopic = data[0].topic_name;
          const filteredData = data.filter(
            (item: any) => item.topic_name === targetTopic
          );

          setSummaries(filteredData);
        }
      } catch (err) {
        console.error('比較データの取得に失敗しました:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center">読み込み中...</div>;
  }

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-10">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg p-6">
        <header className="mb-8 text-center">
          <h1 className="text-xl font-bold text-gray-800">5カ国比較要約</h1>
          <p className="text-xs text-gray-500 mt-1">Issue ID: {id}</p>
        </header>

        {summaries.length > 0 ? (
          <div className="space-y-6">
            {summaries.map((topic) => (
              <div
                key={topic.id}
                className="border-l-4 border-orange-300 pl-4 py-1"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-gray-800">
                    {topic.country_name}
                  </h2>
                  <span className="text-yellow-500 text-xs">
                    {'★'.repeat(topic.recommend_score || 0)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {topic.summary || '要約データがありません。'}
                </p>
                <div className="text-[10px] text-gray-400 mt-2">
                  トピック: {topic.topic_name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            比較データが見つかりませんでした。
          </div>
        )}
      </div>
    </div>
  );
}
