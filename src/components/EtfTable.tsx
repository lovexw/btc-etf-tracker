import { useState, useMemo } from "react";
import type { ETF } from "../types";
import {
  formatUsdCompact,
  formatBtc,
  formatUsd,
  formatPercent,
  countryFlag,
  countryName,
  flowColor,
} from "../utils/format";

type SortKey = "aum_usd" | "holdings_btc" | "daily_flow_usd" | "total_flow_usd" | "ticker";
type SortDir = "asc" | "desc";

export function EtfTable({ etfs }: { etfs: ETF[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("aum_usd");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");

  const countries = useMemo(() => {
    const set = new Set(etfs.map((e) => e.country));
    return Array.from(set).sort();
  }, [etfs]);

  const filtered = useMemo(() => {
    let result = [...etfs];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.ticker.toLowerCase().includes(s) ||
          e.name.toLowerCase().includes(s) ||
          e.issuer.toLowerCase().includes(s)
      );
    }
    if (countryFilter !== "ALL") {
      result = result.filter((e) => e.country === countryFilter);
    }
    result.sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return result;
  }, [etfs, search, countryFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ active }: { active: boolean }) => (
    <span className={`inline-block ml-1 ${active ? "text-bitcoin-400" : "text-gray-600"}`}>
      {active && sortDir === "asc" ? "↑" : active ? "↓" : "↕"}
    </span>
  );

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
      {/* 工具栏 */}
      <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">ETF 列表</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="搜索 ETF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-bitcoin-500 placeholder-gray-500"
          />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-bitcoin-500"
          >
            <option value="ALL">所有国家</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {countryFlag(c)} {countryName(c)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th
                className="px-4 py-3 text-left cursor-pointer hover:text-bitcoin-400 whitespace-nowrap"
                onClick={() => handleSort("ticker")}
              >
                ETF <SortIcon active={sortKey === "ticker"} />
              </th>
              <th className="px-4 py-3 text-left hidden md:table-cell">发行方</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">地区</th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:text-bitcoin-400 whitespace-nowrap"
                onClick={() => handleSort("aum_usd")}
              >
                AUM <SortIcon active={sortKey === "aum_usd"} />
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:text-bitcoin-400 whitespace-nowrap hidden md:table-cell"
                onClick={() => handleSort("holdings_btc")}
              >
                持仓 <SortIcon active={sortKey === "holdings_btc"} />
              </th>
              <th className="px-4 py-3 text-right hidden lg:table-cell">净值</th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:text-bitcoin-400 whitespace-nowrap"
                onClick={() => handleSort("daily_flow_usd")}
              >
                日流入 <SortIcon active={sortKey === "daily_flow_usd"} />
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:text-bitcoin-400 whitespace-nowrap hidden lg:table-cell"
                onClick={() => handleSort("total_flow_usd")}
              >
                累计流入 <SortIcon active={sortKey === "total_flow_usd"} />
              </th>
              <th className="px-4 py-3 text-right hidden xl:table-cell">费率</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  没有匹配的 ETF 数据
                </td>
              </tr>
            ) : (
              filtered.map((etf) => (
                <tr
                  key={etf.ticker}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-bitcoin-400">{etf.ticker}</div>
                    <div className="text-xs text-gray-500 max-w-[160px] truncate">
                      {etf.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-300">
                    {etf.issuer}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span title={countryName(etf.country)}>
                      {countryFlag(etf.country)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-200">
                    {formatUsdCompact(etf.aum_usd)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-200 hidden md:table-cell">
                    {formatBtc(etf.holdings_btc)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300 hidden lg:table-cell">
                    {formatUsd(etf.nav_price)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums font-medium ${flowColor(
                      etf.daily_flow_usd
                    )}`}
                  >
                    {formatUsdCompact(etf.daily_flow_usd)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums hidden lg:table-cell ${flowColor(
                      etf.total_flow_usd
                    )}`}
                  >
                    {formatUsdCompact(etf.total_flow_usd)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-400 hidden xl:table-cell">
                    {etf.expense_ratio != null
                      ? formatPercent(etf.expense_ratio * 100)
                      : "--"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-800">
        共 {filtered.length} 只 ETF
      </div>
    </div>
  );
}
