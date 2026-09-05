import type { Summary } from "../types";
import { formatUsdCompact, formatBtc, formatUsd, formatDateTime, flowColor } from "../utils/format";

export function SummaryCards({ summary }: { summary: Summary | null }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6 animate-pulse"
          >
            <div className="h-4 w-20 bg-gray-700 rounded mb-3" />
            <div className="h-8 w-28 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "BTC 价格",
      value: formatUsd(summary.btc_price_usd),
      icon: "₿",
      color: "text-bitcoin-400",
      bg: "bg-bitcoin-500/10",
    },
    {
      label: "总 AUM",
      value: formatUsdCompact(summary.total_aum_usd),
      sub: `${summary.total_etfs} 只 ETF`,
      icon: "💰",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "总持仓",
      value: formatBtc(summary.total_holdings_btc),
      icon: "📊",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "日资金流向",
      value: formatUsdCompact(summary.total_daily_flow_usd),
      sub: `累计 ${formatUsdCompact(summary.total_cumulative_flow_usd)}`,
      icon: "📈",
      color: flowColor(summary.total_daily_flow_usd),
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 sm:p-6 card-hover"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${card.bg} text-lg`}>
                {card.icon}
              </span>
              <span className="text-xs sm:text-sm text-gray-400">{card.label}</span>
            </div>
            <div className={`text-xl sm:text-2xl font-bold tabular-nums ${card.color}`}>
              {card.value}
            </div>
            {card.sub && (
              <div className="text-xs text-gray-500 mt-1">{card.sub}</div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500 text-right">
        最后更新: {formatDateTime(summary.updated_at)}
      </div>
    </div>
  );
}
