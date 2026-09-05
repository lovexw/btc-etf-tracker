// 工具函数

/**
 * 格式化美元数字（紧凑模式）
 */
export function formatUsdCompact(value: number | null | undefined): string {
  if (value == null) return "--";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

/**
 * 格式化美元数字（完整模式）
 */
export function formatUsd(value: number | null | undefined): string {
  if (value == null) return "--";
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * 格式化 BTC 数量
 */
export function formatBtc(value: number | null | undefined): string {
  if (value == null) return "--";
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 4 })} BTC`;
}

/**
 * 格式化日期
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 格式化时间
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 国家代码转旗帜 emoji
 */
export function countryFlag(code: string): string {
  const flags: Record<string, string> = {
    US: "🇺🇸",
    CA: "🇨🇦",
    AU: "🇦🇺",
    HK: "🇭🇰",
    DE: "🇩🇪",
    CH: "🇨🇭",
    GB: "🇬🇧",
  };
  return flags[code] || "🌍";
}

/**
 * 国家代码转名称
 */
export function countryName(code: string): string {
  const names: Record<string, string> = {
    US: "美国",
    CA: "加拿大",
    AU: "澳大利亚",
    HK: "香港",
    DE: "德国",
    CH: "瑞士",
    GB: "英国",
  };
  return names[code] || code;
}

/**
 * 流入流出颜色
 */
export function flowColor(value: number | null | undefined): string {
  if (value == null) return "text-gray-400";
  if (value > 0) return "text-green-400";
  if (value < 0) return "text-red-400";
  return "text-gray-400";
}
