// Cloudflare Pages Functions - API 入口
// 文件路由: /api/summary

export const onRequestGet: PagesFunction = async (context) => {
  const resp = await context.env.ASSETS.fetch(new Request("https://placeholder/api/summary.json"));
  const data = await resp.text();
  return new Response(data, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=300",
    },
  });
};
