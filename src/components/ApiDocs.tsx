import { useState } from "react";

export function ApiDocs() {
  const [open, setOpen] = useState(false);

  const endpoints = [
    {
      method: "GET",
      path: "/api/summary",
      desc: "获取市场总览数据（BTC 价格、总 AUM、总持仓等）",
    },
    {
      method: "GET",
      path: "/api/etfs",
      desc: "获取所有 ETF 列表及详细数据",
    },
    {
      method: "GET",
      path: "/api/etfs/:ticker",
      desc: "获取指定 ETF 的详细数据，如 /api/etfs/IBIT",
    },
    {
      method: "GET",
      path: "/api/history",
      desc: "获取历史数据趋势（每日快照）",
    },
    {
      method: "GET",
      path: "/api/flows",
      desc: "获取资金流向数据（日流入/流出、累计流入）",
    },
  ];

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">🔌</span> API 接口文档
        </h2>
        <span className="text-gray-400">{open ? "▼" : "▶"}</span>
      </button>

      {open && (
        <div className="p-4 sm:p-6 border-t border-gray-800 animate-fade-in">
          <p className="text-sm text-gray-400 mb-4">
            本平台提供 RESTful API 接口，所有响应均为 JSON 格式，无需认证即可使用。
          </p>

          <div className="space-y-3">
            {endpoints.map((ep) => (
              <div
                key={ep.path}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-800/30 rounded-lg"
              >
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-green-500/20 text-green-400 w-fit">
                  {ep.method}
                </span>
                <code className="text-sm text-bitcoin-400 font-mono">{ep.path}</code>
                <span className="text-sm text-gray-400 sm:ml-auto">{ep.desc}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">示例请求：</div>
            <pre className="text-xs bg-gray-950 p-3 rounded-lg overflow-x-auto">
{`# 获取市场总览
curl https://your-domain.com/api/summary

# 获取所有 ETF
curl https://your-domain.com/api/etfs

# 获取 IBIT 详情
curl https://your-domain.com/api/etfs/IBIT

# 获取历史趋势
curl https://your-domain.com/api/history

# 获取资金流向
curl https://your-domain.com/api/flows`}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">示例响应（/api/summary）：</div>
            <pre className="text-xs bg-gray-950 p-3 rounded-lg overflow-x-auto">
{`{
  "date": "2024-12-01",
  "updated_at": "2024-12-01T08:00:00Z",
  "btc_price_usd": 97000.00,
  "total_etfs": 17,
  "total_aum_usd": 120000000000,
  "total_holdings_btc": 1200000.5,
  "total_daily_flow_usd": 500000000,
  "total_cumulative_flow_usd": 35000000000,
  "countries": ["US", "CA", "AU", "HK"]
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
