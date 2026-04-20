'use client';

type HomeStylePageLoadingProps = {
  detailLine: string;
  /** 外側ラッパーに追加するクラス（例: min-h-screen） */
  className?: string;
};

export default function HomeStylePageLoading({
  detailLine,
  className = '',
}: HomeStylePageLoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-20 ${className}`.trim()}
    >
      <div className="relative mb-6 h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100"></div>
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-orange-400"></div>
        <div className="absolute inset-2 animate-[spin_1.5s_linear_infinite_reverse] rounded-full border-4 border-b-blue-300"></div>
      </div>

      <div className="space-y-2 text-center">
        <h2 className="animate-pulse text-xl font-bold text-gray-800">
          AIが世界中を分析中...
        </h2>
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-gray-500">{detailLine}</p>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-gray-400">
            Fetching from Global Media
          </p>
        </div>
      </div>

      <div className="mt-8 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-gray-100">
        <div className="h-full animate-[loading-bar_3s_infinite] bg-gradient-to-r from-orange-300 to-orange-500"></div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
                @keyframes loading-bar {
                  0% { transform: translateX(-100%); }
                  50% { transform: translateX(0); }
                  100% { transform: translateX(100%); }
                }
              `,
        }}
      />
    </div>
  );
}
