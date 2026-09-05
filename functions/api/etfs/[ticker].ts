// Cloudflare Pages Functions - 单个 ETF 详情
// 文件路由: /api/etfs/:ticker

export const onRequestGet: PagesFunction = async (context) => {
  const ticker = (context.params.ticker as string).toUpperCase();

  const resp = await context.env.ASSETS.fetch(new Request("https://placeholder/api/etfs.json"));
  const etfsJson = await resp.json();
  const etf = (etfsJson.data as any[]).find(
    (e) => e.ticker.toUpperCase() === ticker
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
