// Cloudflare Pages Functions - 资金流向
// 文件路由: /api/flows

import flowsData from "../../data/api/flows.json";

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify(flowsData), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=300",
    },
  });
};
