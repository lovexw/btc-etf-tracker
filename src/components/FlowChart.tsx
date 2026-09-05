import type { FlowEntry } from "../types";
import { formatUsdCompact, flowColor } from "../utils/format";

export function FlowChart({ flows }: { flows: FlowEntry[] }) {
  if (!flows.length) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">资金流向</h2>
        <div className="text-gray-500 text-center py-8">暂无资金流向数据</div>
      </div>
    );
  }

  // 按日流入排序，取前 10
  const sorted = [...flows]
    .sort((a, b) => (b.daily_flow_usd || 0) - (a.daily_flow_usd || 0));

  const maxAbsFlow = Math.max(
    ...sorted.map((f) => Math.abs(f.daily_flow_usd || 0)),
    1
  );

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">日资金流向</h2>

      {/* 柱状图 */}
      <div className="space-y-2">
        {sorted.slice(0, 10).map((flow) => {
          const value = flow.daily_flow_usd || 0;
          const isPositive = value > 0;
          const widthPercent = (Math.abs(value) / maxAbsFlow) * 100;
          return (
            <div key={flow.ticker} className="flex items-center gap-3">
              <div className="w-20 sm:w-24 text-sm font-medium text-gray-300 truncate">
                {flow.ticker}
              </div>
              <div className="flex-1 relative h-7 bg-gray-800/50 rounded-lg overflow-hidden">
                {/* 中线 */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600" />
                {/* 柱子 */}
                <div
                  className={`absolute top-1 bottom-1 rounded transition-all duration-500 ${
                    isPositive
                      ? "left-1/2 bg-gradient-to-r from-green-500/50 to-green-400"
                      : "right-1/2 bg-gradient-to-l from-red-500/50 to-red-400"
                  }`}
                  style={{ width: `${widthPercent / 2}%` }}
                />
                <div
                  className={`absolute inset-0 flex items-center ${
                    isPositive ? "justify-end pr-2" : "justify-start pl-2"
                  } text-xs font-medium tabular-nums ${flowColor(value)}`}
                >
                  {formatUsdCompact(value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 累计流入 */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <h3 className="text-sm text-gray-400 mb-3">累计资金流入 Top 10</h3>
        <div className="space-y-2">
          {[...flows]
            .sort((a, b) => (b.total_flow_usd || 0) - (a.total_flow_usd || 0))
            .slice(0, 10)
            .map((flow) => (
              <div key={flow.ticker} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{flow.ticker}</span>
                <span className={`tabular-nums font-medium ${flowColor(flow.total_flow_usd)}`}>
                  {formatUsdCompact(flow.total_flow_usd)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
