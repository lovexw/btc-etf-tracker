import { useState, useEffect, useCallback } from "react";
import type { ETF, Summary, HistoryEntry, FlowEntry } from "../types";
import { fetchSummary, fetchEtfs, fetchHistory, fetchFlows } from "../utils/api";

export function useEtfData() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [flows, setFlows] = useState<FlowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, etfsData, historyData, flowsData] = await Promise.all([
        fetchSummary(),
        fetchEtfs(),
        fetchHistory(),
        fetchFlows(),
      ]);
      setSummary(summaryData);
      setEtfs(etfsData);
      setHistory(historyData);
      setFlows(flowsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { summary, etfs, history, flows, loading, error, refresh: loadData };
}
