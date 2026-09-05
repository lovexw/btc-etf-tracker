// Cloudflare Pages Functions - 单个 ETF 详情
// 文件路由: /api/etfs/:ticker

import etfsData from "../../../data/api/etfs.json";
import type { ETF } from "../../../src/types";

export const onRequestGet: PagesFunction = async (context) => {
  const ticker = context.params.ticker as string;
  const tickerUpper = ticker.toUpperCase();

  const etf = (etfsData.data as ETF[]).find(
    (e) => e.ticker.toUpperCase() === tickerUpper
  );

  if (!etf) {
    return new Response(
      JSON.stringify({ error: `ETF "${ticker}" not found` }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  return new Response(JSON.stringify(etf), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=300",
    },
  });
};
