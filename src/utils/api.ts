// API 客户端

import type { ETF, Summary, HistoryEntry, FlowEntry } from "../types";

// API 基础路径
// 开发环境使用 public 目录静态 JSON，生产环境使用 Cloudflare Pages Functions
const API_BASE = import.meta.env.DEV ? "/public/api" : "/api";

async function fetchJson<T>(url: string): Promise<T> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`API error: ${resp.status} ${resp.statusText}`);
  }
  return resp.json();
}

export async function fetchSummary(): Promise<Summary> {
  return fetchJson<Summary>(`${API_BASE}/summary.json`);
}

export async function fetchEtfs(): Promise<ETF[]> {
  const resp = await fetchJson<{ data: ETF[] }>(`${API_BASE}/etfs.json`);
  return resp.data;
}

export async function fetchEtf(ticker: string): Promise<ETF> {
  const tickerSafe = ticker.replace(".", "_");
  return fetchJson<ETF>(`${API_BASE}/etf_${tickerSafe}.json`);
}

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const resp = await fetchJson<{ data: HistoryEntry[] }>(`${API_BASE}/history.json`);
  return resp.data;
}

export async function fetchFlows(): Promise<FlowEntry[]> {
  const resp = await fetchJson<{ data: FlowEntry[] }>(`${API_BASE}/flows.json`);
  return resp.data;
}
