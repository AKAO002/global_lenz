// 5カ国比較要約（非認証）
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ComparePage() {
  const params = useParams();
  const id = params?.id as string;
  const [comparison, setComparison] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchComparisonData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `http://localhost:8000/api/comparison-summaries/${id}/detail`
        );
        const data = await res.json();

        if (res.ok) {
          setComparison(data);
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
        </header>

        {comparison ? (
          <div className="space-y-6">
            {/* 比較要約 */}
            <div className="border-l-4 border-orange-300 pl-4 py-2">
              <h2 className="font-bold text-gray-800 mb-2">
                {comparison.topic_name}
              </h2>

              <p className="text-sm text-gray-700 leading-relaxed">
                {comparison.comparison_summary}
              </p>
            </div>

            <div className="space-y-4">
              {comparison.country_summaries
                ?.filter((country: any) => country.url !== null)
                .map((country: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    {/* URL表示 */}
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">引用元:</span>

                      <span className="ml-1">{country.media_name}</span>

                      <div className="mt-1">
                        <a
                          href={country.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline break-all"
                        >
                          {country.url}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
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
