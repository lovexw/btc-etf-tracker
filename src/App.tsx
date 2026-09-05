import { useEtfData } from "./hooks/useEtfData";
import { SummaryCards } from "./components/SummaryCards";
import { EtfTable } from "./components/EtfTable";
import { HistoryChart } from "./components/HistoryChart";
import { FlowChart } from "./components/FlowChart";
import { ApiDocs } from "./components/ApiDocs";

export default function App() {
  const { summary, etfs, history, flows, loading, error, refresh } = useEtfData();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bitcoin-500 flex items-center justify-center text-white font-bold text-xl">
              ₿
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">
                BTC ETF <span className="gradient-text">Tracker</span>
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                全球比特币现货 ETF 数据聚合平台
              </p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 sm:px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>
            <span className="hidden sm:inline">{loading ? "加载中..." : "刷新"}</span>
          </button>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
            <div className="text-red-400 text-lg font-semibold mb-2">⚠️ 数据加载失败</div>
            <div className="text-gray-400 text-sm">{error}</div>
            <button
              onClick={refresh}
              className="mt-4 px-4 py-2 bg-red-800/50 hover:bg-red-800 rounded-lg text-sm transition-colors"
            >
              重试
            </button>
          </div>
        ) : (
          <>
            {/* 总览卡片 */}
            <SummaryCards summary={summary} />

            {/* ETF 表格 */}
            <EtfTable etfs={etfs} />

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FlowChart flows={flows} />
              <HistoryChart history={history} />
            </div>

            {/* API 文档 */}
            <ApiDocs />
          </>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <div>
            📊 BTC ETF Tracker · 数据每日自动更新 · Powered by GitHub Actions & Cloudflare
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
            <span>·</span>
            <span>API: /api/etfs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
