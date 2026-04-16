'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const flagImages: { [key: string]: string } = {
  日本: '/images/JP.png',
  イギリス: '/images/UK.png',
  アメリカ: '/images/US.png',
  インド: '/images/India.png',
  カタール: '/images/qatar.png',
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const router = useRouter();
  
  const [morningSummaries, setMorningSummaries] = useState<any>([]); // 朝のニュース用
  const [searchSummaries, setSearchSummaries] = useState<any>([]);   // 検索結果用
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState(query || '');
  const [tabs, setTabs] = useState<string[]>([]);
  const [isSearchResult, setIsSearchResult] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // 画面がブラウザで読み込まれたら true にする
  }, []);

  // A. 初期表示：朝のニュースを取得（タブを出すため）
  useEffect(() => {
    const fetchMorningData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/topics/today');
        const result = await res.json();
        // topics/today は { topics: [...] } という形式で返ってくるので、
        // country-summaries/home と形式を合わせる必要があります
        const data = result.topics;
        setMorningSummaries(data);
        const dynamicTabs = Array.from(new Set(data.map((item: any) => item.topic_name?.trim()))).filter(Boolean) as string[];
        setTabs(dynamicTabs);

        // 最初のタブをアクティブにする
        if (dynamicTabs.length > 0 && !activeTab) {
          setActiveTab(dynamicTabs[0]);
        }
      } catch (err) {
        console.error("朝のニュース取得失敗:", err);
      }
    };
    fetchMorningData();
  }, []);

  // B. 検索クエリがある場合の処理
  useEffect(() => {
    if (!query) return;
    setSearchKeyword(query);

    const fetchSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: query })
        });
        const data = await res.json();
        
        const formattedData = [{
          topic_id: data.topic_id,
          topic_name: data.topic_name,
          summaries: data.report.country_summaries.map((s: any, idx: number) => ({
             id: idx,
             country_name: s.country,
             summary: s.summary,
             recommend_score: s.recommend_score
          }))
        }];
        
        setSearchSummaries(formattedData);
        setActiveTab(data.topic_name);
        setIsSearchResult(true);
      } catch (err) {
        console.error("検索エラー:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    setIsSearchResult(false); // タブを押したら朝のニュースモードへ
  };

  // 表示するデータの切り替え
  const displayData = isSearchResult ? searchSummaries : morningSummaries;

  if (loading && isSearchResult) return (
    <div className="max-w-md mx-auto h-screen flex flex-col items-center justify-center bg-white">
      <div className="animate-spin h-8 w-8 border-4 border-orange-400 border-t-transparent rounded-full mb-4"></div>
      <p className="text-sm text-gray-500">AIが世界中のメディアを分析中...</p>
    </div>
  );

  return (
    <div className="bg-[#FDFBF6] min-h-screen pb-24">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg relative">
        <header className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
             {mounted ? (
                new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })
             ) : (
               "" // サーバー側では一旦何も表示しない（または "Loading..." など）
             )}
            </h1>
          <form onSubmit={handleSearch} className="mt-4 w-full flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input 
              type="text"
              placeholder="ニュースを検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="bg-transparent text-sm flex-grow outline-none"
            />
            <button type="submit"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
          </form>
        </header>

        <nav className="flex justify-start overflow-x-auto no-scrollbar border-b border-gray-100 mb-4 px-2 gap-2">
          {tabs.map((tab, index) => (
            <button
              key={`${tab}-${index}`}
              onClick={() => handleTabClick(tab)}
              className={`pb-2 text-sm font-bold whitespace-nowrap transition-colors ${!isSearchResult && activeTab === tab ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="px-4">
          {isSearchResult && (
            <div className="mb-4 py-2 px-3 bg-blue-50 rounded-lg flex justify-between items-center shadow-sm">
              <p className="text-xs text-blue-700 font-bold italic">「{query}」の検索結果</p>
              <button onClick={() => setIsSearchResult(false)} className="text-[10px] underline text-blue-500 font-bold">× 朝のニュースに戻る</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 px-1">
            {displayData.filter((topic: any) => topic.topic_name?.trim() === activeTab?.trim()).map((topic: any) =>
              topic.summaries?.map((summary: any) => (
                <div key={`${topic.topic_id}-${summary.id}`} className="flex flex-col">
                   {/* カード表示ロジックは以前と同様 */}
                   <div className="flex items-center gap-1 mb-1.5 ml-0.5">
                    <span className="text-[11px] font-bold">{summary.country_name}：</span>
                    <span className="text-[11px] text-yellow-500">{'★'.repeat(summary.recommend_score || 0)}</span>
                  </div>
                  <div className="relative rounded-sm overflow-hidden border h-[170px] bg-white shadow-sm">
                    {flagImages[summary.country_name] && (
                      <Image src={flagImages[summary.country_name]} alt={summary.country_name} fill className="object-cover opacity-30" />
                    )}
                    <div className="relative z-10 p-3 h-full flex flex-col justify-between bg-white/40">
                      <p className="text-sm font-bold text-gray-900">{summary.country_summary?.substring(0, 30)}...</p>
                      <Link href={`/topic/${summary.id}`} className="text-[10px] text-gray-500 underline self-end bg-white/70 px-1 rounded-sm">...もっと見る</Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8">
            {displayData.filter((t: any) => t.topic_name?.trim() === activeTab?.trim()).slice(0, 1).map((t: any) => (
              <Link key={t.topic_id} href={`/comparison/${t.topic_id}`}>
                <button className="w-full bg-orange-300 text-black font-bold py-3 rounded-md shadow hover:bg-orange-400">
                  5カ国比較要約を表示
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}