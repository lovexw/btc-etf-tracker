// Cloudflare Pages Functions - 历史数据
// 文件路由: /api/history

import historyData from "../../data/api/history.json";

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify(historyData), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=600", // 10 分钟缓存
    },
  });
};
