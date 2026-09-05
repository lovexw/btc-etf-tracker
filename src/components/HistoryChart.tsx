import type { HistoryEntry } from "../types";
import { formatUsdCompact, formatBtc, formatDate } from "../utils/format";

export function HistoryChart({ history }: { history: HistoryEntry[] }) {
  if (!history.length) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">历史趋势</h2>
        <div className="text-gray-500 text-center py-8">暂无历史数据</div>
      </div>
    );
  }

  // 取最近 30 天数据
  const data = history.slice(-30);

  // 计算 AUM 趋势
  const aumValues = data.map((d) => d.total_aum_usd || 0);
  const maxAum = Math.max(...aumValues, 1);
  const minAum = Math.min(...aumValues, 0);

  // 生成 SVG 路径
  const width = 100;
  const height = 40;
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const normalizedMax = maxAum - minAum || 1;
      const y = height - ((d.total_aum_usd || 0 - minAum) / normalizedMax) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `M0,${height} L${points} L${width},${height} Z`;
  const linePath = `M${points}`;

  // BTC 价格趋势
  const btcPrices = data.map((d) => d.btc_price_usd || 0);
  const maxBtc = Math.max(...btcPrices, 1);
  const minBtc = Math.min(...btcPrices, 0);
  const btcPoints = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const normalizedMax = maxBtc - minBtc || 1;
      const y = height - ((d.btc_price_usd || 0 - minBtc) / normalizedMax) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">历史趋势（最近 {data.length} 天）</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AUM 趋势 */}
        <div>
          <div className="text-sm text-gray-400 mb-2">总 AUM 趋势</div>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-32 sm:h-40"
          >
            <defs>
              <linearGradient id="aumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7931a" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f7931a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#aumGradient)" />
            <path
              d={linePath}
              fill="none"
              stroke="#f7931a"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatUsdCompact(minAum)}</span>
            <span>{formatUsdCompact(maxAum)}</span>
          </div>
        </div>

        {/* BTC 价格趋势 */}
        <div>
          <div className="text-sm text-gray-400 mb-2">BTC 价格趋势</div>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-32 sm:h-40"
          >
            <defs>
              <linearGradient id="btcGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M0,${height} L${btcPoints} L${width},${height} Z`}
              fill="url(#btcGradient)"
            />
            <path
              d={`M${btcPoints}`}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${minBtc.toLocaleString()}</span>
            <span>${maxBtc.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 数据表 */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="px-3 py-2 text-left">日期</th>
              <th className="px-3 py-2 text-right">BTC 价格</th>
              <th className="px-3 py-2 text-right">总 AUM</th>
              <th className="px-3 py-2 text-right">总持仓</th>
              <th className="px-3 py-2 text-right">日流入</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((entry) => (
              <tr
                key={entry.date}
                className="border-b border-gray-800/30 hover:bg-gray-800/20"
              >
                <td className="px-3 py-2 text-gray-300">{formatDate(entry.date)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-200">
                  ${entry.btc_price_usd?.toLocaleString() || "--"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-200">
                  {formatUsdCompact(entry.total_aum_usd)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-gray-300">
                  {formatBtc(entry.total_holdings_btc)}
                </td>
                <td
                  className={`px-3 py-2 text-right tabular-nums ${
                    (entry.total_daily_flow_usd || 0) > 0
                      ? "text-green-400"
                      : (entry.total_daily_flow_usd || 0) < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {formatUsdCompact(entry.total_daily_flow_usd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
