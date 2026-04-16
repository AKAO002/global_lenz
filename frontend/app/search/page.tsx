'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const router = useRouter();
  
  const [data, setData] = useState<any[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState(query || '');

  // 1. データの取得（ホームと検索を一括管理）
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = query 
          ? 'http://localhost:8000/api/search' 
          : 'http://localhost:8000/api/topics/today';
        
        const options = query 
          ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword: query }) }
          : { method: 'GET' };

        const res = await fetch(url, options);
        const result = await res.json();
        
        // --- ここでデータを「ホームの形」に統一して保存する ---
        let topicsArray = [];
        if (query) {
          // 検索結果の場合
          topicsArray = [{
            topic_name: result.topic_name,
            topic_id: result.topic_id,
            summaries: result.report?.country_summaries || []
          }];
        } else {
          // ホーム（朝のニュース）の場合
          topicsArray = result.topics || [];
        }

        setData(topicsArray);

        // タブの設定
        const newTabs = topicsArray.map((t: any) => t.topic_name).filter(Boolean);
        setTabs(newTabs);
        if (newTabs.length > 0) {
          setActiveTab(newTabs[0]);
        }
        
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  // 検索実行
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg text-gray-800">
      {/* ヘッダー：ここは出ている */}
      <header className="p-6 text-center border-b">
        <h1 className="text-2xl font-bold">
          {new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
        </h1>
        <form onSubmit={handleSearch} className="mt-4 flex bg-gray-100 rounded-full px-4 py-2">
          <input 
            type="text" 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            className="bg-transparent flex-grow outline-none text-sm" 
            placeholder="検索..." 
          />
          <button type="submit">🔍</button>
        </form>
      </header>

      {/* タブ：ここで止まらないようにガード */}
      <nav className="flex overflow-x-auto p-2 gap-4 border-b no-scrollbar">
        {tabs.length > 0 ? tabs.map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`pb-1 whitespace-nowrap text-sm font-bold ${activeTab === tab ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
          >
            {tab}
          </button>
        )) : <p className="text-xs text-gray-300">読み込み中...</p>}
      </nav>

      {/* メイン：ここが空欄にならないようにする */}
      <main className="p-4 grid grid-cols-2 gap-4">
        {data.length > 0 ? (
          data
            .filter(t => t.topic_name === activeTab)
            .map((topic) => (
              (topic.summaries || []).map((s: any, i: number) => (
                <div key={i} className="border p-3 rounded shadow-sm h-40 flex flex-col justify-between bg-white">
                  <p className="text-[10px] font-bold text-gray-500">{s.country || s.country_name}</p>
                  <p className="text-xs line-clamp-4 font-semibold text-gray-900 leading-snug">
                    {/* country_summary でも summary でもどちらでも表示 */}
                    {s.country_summary || s.summary || "要約がありません"}
                  </p>
                  <Link href={`/topic/${s.id || s.country_id || i}`} className="text-[10px] text-blue-500 underline self-end">
                    詳細
                  </Link>
                </div>
              ))
            ))
        ) : (
          !loading && <p className="col-span-2 text-center text-gray-400 text-sm mt-10">ニュースが見つかりません</p>
        )}
      </main>
    </div>
  );
}