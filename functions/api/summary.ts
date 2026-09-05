// Cloudflare Pages Functions - API 入口
// 文件路由: /api/summary

import summaryData from "../../data/api/summary.json";

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify(summaryData), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=300", // 5 分钟缓存
    },
  });
};
