// Cloudflare Pages Functions - ETF 列表
// 文件路由: /api/etfs

import etfsData from "../../data/api/etfs.json";

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify(etfsData), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=300",
    },
  });
};
