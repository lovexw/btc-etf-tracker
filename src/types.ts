// 类型定义

export interface ETF {
  ticker: string;
  name: string;
  issuer: string;
  country: string;
  exchange: string;
  listing_date: string;
  date: string;
  updated_at: string;
  aum_usd: number | null;
  holdings_btc: number | null;
  nav_price: number | null;
  market_price: number | null;
  premium_discount: number | null;
  daily_flow_usd: number | null;
  total_flow_usd: number | null;
  expense_ratio: number | null;
}

export interface Summary {
  date: string;
  updated_at: string;
  btc_price_usd: number;
  total_etfs: number;
  total_aum_usd: number;
  total_holdings_btc: number;
  total_daily_flow_usd: number;
  total_cumulative_flow_usd: number;
  countries: string[];
}

export interface HistoryEntry {
  date: string;
  btc_price_usd: number;
  total_aum_usd: number;
  total_holdings_btc: number;
  total_daily_flow_usd: number;
}

export interface FlowEntry {
  ticker: string;
  name: string;
  country: string;
  daily_flow_usd: number | null;
  total_flow_usd: number | null;
  date: string;
}

export interface ApiResponse<T> {
  data: T;
}
