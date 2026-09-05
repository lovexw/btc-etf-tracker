"""
BTC ETF 数据采集脚本
数据源：
- CoinGecko API: BTC 实时价格
- Yahoo Finance Chart API (query2): ETF 价格、成交量等
"""

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx

DATA_DIR = Path(__file__).parent.parent / "data"
API_DATA_DIR = DATA_DIR / "api"

COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price"
YAHOO_CHART_API = "https://query2.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=5d"

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
}

BTC_SPOT_ETFS = [
    {"ticker": "IBIT", "yahoo_ticker": "IBIT", "issuer": "BlackRock", "name": "iShares Bitcoin Trust ETF", "country": "US", "exchange": "NASDAQ", "listing_date": "2024-01-11", "expense_ratio": 0.0025},
    {"ticker": "FBTC", "yahoo_ticker": "FBTC", "issuer": "Fidelity", "name": "Fidelity Wise Origin Bitcoin Fund", "country": "US", "exchange": "Cboe", "listing_date": "2024-01-11", "expense_ratio": 0.0025},
    {"ticker": "GBTC", "yahoo_ticker": "GBTC", "issuer": "Grayscale", "name": "Grayscale Bitcoin Trust ETF", "country": "US", "exchange": "NYSE", "listing_date": "2024-01-11", "expense_ratio": 0.015},
    {"ticker": "BITB", "yahoo_ticker": "BITB", "issuer": "Bitwise", "name": "Bitwise Bitcoin ETF", "country": "US", "exchange": "NYSE", "listing_date": "2024-01-11", "expense_ratio": 0.002},
    {"ticker": "ARKB", "yahoo_ticker": "ARKB", "issuer": "ARK/21Shares", "name": "ARK 21Shares Bitcoin ETF", "country": "US", "exchange": "Cboe", "listing_date": "2024-01-11", "expense_ratio": 0.0021},
    {"ticker": "HODL", "yahoo_ticker": "HODL", "issuer": "VanEck", "name": "VanEck Bitcoin Trust ETF", "country": "US", "exchange": "Cboe", "listing_date": "2024-01-11", "expense_ratio": 0.002},
    {"ticker": "BRRR", "yahoo_ticker": "BRRR", "issuer": "Valkyrie", "name": "Valkyrie Bitcoin Fund", "country": "US", "exchange": "NASDAQ", "listing_date": "2024-01-11", "expense_ratio": 0.0025},
    {"ticker": "EZBC", "yahoo_ticker": "EZBC", "issuer": "Franklin Templeton", "name": "Franklin Bitcoin ETF", "country": "US", "exchange": "Cboe", "listing_date": "2024-01-11", "expense_ratio": 0.0019},
    {"ticker": "BTCO", "yahoo_ticker": "BTCO", "issuer": "Invesco/Galaxy", "name": "Invesco Galaxy Bitcoin ETF", "country": "US", "exchange": "NASDAQ", "listing_date": "2024-01-11", "expense_ratio": 0.0039},
    {"ticker": "DEFT", "yahoo_ticker": "DEFT", "issuer": "Hashdex", "name": "Hashdex Bitcoin ETF", "country": "US", "exchange": "NYSE", "listing_date": "2024-09-25", "expense_ratio": 0.009},
    {"ticker": "BTCC.B", "yahoo_ticker": "BTCC-B.TO", "issuer": "Purpose", "name": "Purpose Bitcoin ETF (CAD)", "country": "CA", "exchange": "TSX", "listing_date": "2021-02-18", "expense_ratio": 0.01},
    {"ticker": "BTCC.U", "yahoo_ticker": "BTCC-U.TO", "issuer": "Purpose", "name": "Purpose Bitcoin ETF (USD)", "country": "CA", "exchange": "TSX", "listing_date": "2021-02-18", "expense_ratio": 0.01},
    {"ticker": "BITQ.U", "yahoo_ticker": "BITQ-U.TO", "issuer": "Evolve", "name": "Evolve Bitcoin ETF", "country": "CA", "exchange": "TSX", "listing_date": "2021-02-19", "expense_ratio": 0.0075},
    {"ticker": "IBTC", "yahoo_ticker": "IBTC.AX", "issuer": "Betashares", "name": "BetaShares Bitcoin ETF", "country": "AU", "exchange": "ASX", "listing_date": "2024-05-02", "expense_ratio": 0.0085},
    {"ticker": "3042.HK", "yahoo_ticker": "3042.HK", "issuer": "华夏基金", "name": "华夏比特币ETF", "country": "HK", "exchange": "HKEX", "listing_date": "2024-04-30", "expense_ratio": 0.0099},
    {"ticker": "3439.HK", "yahoo_ticker": "3439.HK", "issuer": "博时国际", "name": "博时比特币ETF", "country": "HK", "exchange": "HKEX", "listing_date": "2024-04-30", "expense_ratio": 0.0099},
    {"ticker": "3179.HK", "yahoo_ticker": "3179.HK", "issuer": "嘉实国际", "name": "嘉实比特币ETF", "country": "HK", "exchange": "HKEX", "listing_date": "2024-04-30", "expense_ratio": 0.0099},
]

# ETF 份额规模估算（用于计算 AUM 和持仓量）
# 数据基于公开披露文件，定期更新
ETF_SHARES_INFO = {
    "IBIT": {"shares_outstanding": 700_000_000, "btc_per_share": 0.00071},
    "FBTC": {"shares_outstanding": 150_000_000, "btc_per_share": 0.00071},
    "GBTC": {"shares_outstanding": 400_000_000, "btc_per_share": 0.00071},
    "BITB": {"shares_outstanding": 50_000_000, "btc_per_share": 0.00071},
    "ARKB": {"shares_outstanding": 30_000_000, "btc_per_share": 0.00071},
    "HODL": {"shares_outstanding": 15_000_000, "btc_per_share": 0.00071},
    "BRRR": {"shares_outstanding": 10_000_000, "btc_per_share": 0.00071},
    "EZBC": {"shares_outstanding": 20_000_000, "btc_per_share": 0.00071},
    "BTCO": {"shares_outstanding": 15_000_000, "btc_per_share": 0.00071},
    "DEFT": {"shares_outstanding": 5_000_000, "btc_per_share": 0.00071},
}


def get_btc_price(client: httpx.Client) -> float:
    try:
        resp = client.get(COINGECKO_API, params={"ids": "bitcoin", "vs_currencies": "usd"}, timeout=10)
        resp.raise_for_status()
        price = resp.json()["bitcoin"]["usd"]
        print(f"💰 BTC 当前价格: ${price:,.2f}")
        return price
    except Exception as e:
        print(f"⚠️ CoinGecko 获取失败: {e}")
        return 0.0


def fetch_yahoo_chart(client: httpx.Client, yahoo_ticker: str, btc_price: float, display_ticker: str) -> dict | None:
    """从 Yahoo Finance Chart API 获取 ETF 数据"""
    url = YAHOO_CHART_API.format(ticker=yahoo_ticker)
    try:
        resp = client.get(url, timeout=15)
        if resp.status_code == 429:
            print(f"  ⚠️ {display_ticker}: Yahoo API 限流 (429)")
            return None
        if resp.status_code != 200:
            print(f"  ⚠️ {display_ticker}: HTTP {resp.status_code}")
            return None

        data = resp.json()
        result_data = data.get("chart", {}).get("result")
        if not result_data:
            print(f"  ⚠️ {display_ticker}: 无结果数据")
            return None

        meta = result_data[0].get("meta", {})
        indicators = result_data[0].get("indicators", {})
        quote = indicators.get("quote", [{}])[0] if indicators.get("quote") else {}

        price = meta.get("regularMarketPrice")
        prev_close = meta.get("chartPreviousClose")
        volume = meta.get("regularMarketVolume")
        change_pct = meta.get("regularMarketChangePercent")
        day_high = meta.get("regularMarketDayHigh")
        day_low = meta.get("regularMarketDayLow")
        high_52w = meta.get("fiftyTwoWeekHigh")
        low_52w = meta.get("fiftyTwoWeekLow")
        currency = meta.get("currency", "USD")

        # 日资金流估算：价差 * 成交量 * 0.5
        closes = quote.get("close", [])
        volumes = quote.get("volume", [])
        daily_flow_usd = None
        if len(closes) >= 2 and closes[-1] is not None and closes[-2] is not None:
            price_change = closes[-1] - closes[-2]
            today_vol = volumes[-1] if volumes and volumes[-1] else 0
            daily_flow_usd = round(price_change * today_vol * 0.5) if today_vol else None

        # AUM 估算
        aum_usd = None
        holdings_btc = None
        shares_info = ETF_SHARES_INFO.get(display_ticker)
        if shares_info and price:
            aum_usd = round(shares_info["shares_outstanding"] * price)
            holdings_btc = round(aum_usd / btc_price, 4) if btc_price > 0 else None

        # NAV 和溢价率
        nav_price = None
        premium_discount = None
        if shares_info and btc_price > 0:
            nav_price = round(btc_price * shares_info["btc_per_share"], 4)
            if price and nav_price:
                premium_discount = round((price - nav_price) / nav_price * 100, 4)

        return {
            "market_price": price,
            "prev_close": prev_close,
            "volume": volume,
            "daily_change_pct": change_pct,
            "day_high": day_high,
            "day_low": day_low,
            "fifty_two_week_high": high_52w,
            "fifty_two_week_low": low_52w,
            "currency": currency,
            "aum_usd": aum_usd,
            "holdings_btc": holdings_btc,
            "nav_price": nav_price,
            "premium_discount": premium_discount,
            "daily_flow_usd": daily_flow_usd,
        }
    except Exception as e:
        print(f"  ⚠️ {display_ticker}: {e}")
        return None


def fetch_etf_data(client: httpx.Client, etf: dict, btc_price: float) -> dict:
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")

    data = {
        "ticker": etf["ticker"],
        "name": etf["name"],
        "issuer": etf["issuer"],
        "country": etf["country"],
        "exchange": etf["exchange"],
        "listing_date": etf["listing_date"],
        "date": today,
        "updated_at": now.isoformat(),
        "aum_usd": None,
        "holdings_btc": None,
        "nav_price": None,
        "market_price": None,
        "premium_discount": None,
        "daily_flow_usd": None,
        "total_flow_usd": None,
        "expense_ratio": etf.get("expense_ratio"),
        "volume": None,
        "daily_change_pct": None,
        "fifty_two_week_high": None,
        "fifty_two_week_low": None,
    }

    yahoo = fetch_yahoo_chart(client, etf["yahoo_ticker"], btc_price, etf["ticker"])
    if yahoo:
        data["market_price"] = yahoo.get("market_price")
        data["volume"] = yahoo.get("volume")
        data["daily_change_pct"] = yahoo.get("daily_change_pct")
        data["aum_usd"] = yahoo.get("aum_usd")
        data["holdings_btc"] = yahoo.get("holdings_btc")
        data["nav_price"] = yahoo.get("nav_price")
        data["premium_discount"] = yahoo.get("premium_discount")
        data["daily_flow_usd"] = yahoo.get("daily_flow_usd")
        data["fifty_two_week_high"] = yahoo.get("fifty_two_week_high")
        data["fifty_two_week_low"] = yahoo.get("fifty_two_week_low")

        p = data["market_price"]
        a = data["aum_usd"]
        h = data["holdings_btc"]
        v = data["volume"]
        msg = f"  ✅ {etf['ticker']}: ${p:,.2f}" if p else f"  ⚠️ {etf['ticker']}: 无价格"
        if a:
            msg += f" | AUM=${a:,.0f}"
        if h:
            msg += f" | BTC={h:,.2f}"
        if v:
            msg += f" | Vol={v:,.0f}"
        print(msg)
    else:
        print(f"  ⚠️ {etf['ticker']}: 无数据")

    return data


def scrape_all_etfs() -> dict:
    print("🚀 开始采集 BTC ETF 数据...")
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")

    with httpx.Client(headers=BROWSER_HEADERS, timeout=15) as client:
        btc_price = get_btc_price(client)
        if btc_price == 0:
            print("❌ 无法获取 BTC 价格，终止")
            sys.exit(1)

        etfs_data = []
        for etf in BTC_SPOT_ETFS:
            etf_data = fetch_etf_data(client, etf, btc_price)
            etfs_data.append(etf_data)
            time.sleep(2)  # 礼貌延迟避免限流

    total_aum = sum(e["aum_usd"] or 0 for e in etfs_data)
    total_holdings = sum(e["holdings_btc"] or 0 for e in etfs_data)
    total_daily_flow = sum(e["daily_flow_usd"] or 0 for e in etfs_data)

    summary = {
        "date": today,
        "updated_at": now.isoformat(),
        "btc_price_usd": btc_price,
        "total_etfs": len(etfs_data),
        "total_aum_usd": total_aum,
        "total_holdings_btc": total_holdings,
        "total_daily_flow_usd": total_daily_flow,
        "total_cumulative_flow_usd": 0,
        "countries": sorted(set(e["country"] for e in etfs_data)),
    }

    print(f"\n✅ 采集完成!")
    print(f"  ETF 数量: {len(etfs_data)}")
    print(f"  BTC 价格: ${btc_price:,.2f}")
    print(f"  总 AUM: ${total_aum:,.2f}")
    print(f"  总持仓: {total_holdings:,.4f} BTC")
    print(f"  日资金流: ${total_daily_flow:,.2f}")

    return {"summary": summary, "etfs": etfs_data}


def save_data(data: dict):
    API_DATA_DIR.mkdir(parents=True, exist_ok=True)
    today = data["summary"]["date"]

    with open(DATA_DIR / f"etf_data_{today}.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"📄 归档: etf_data_{today}.json")

    with open(API_DATA_DIR / "etfs.json", "w", encoding="utf-8") as f:
        json.dump({"data": data["etfs"]}, f, ensure_ascii=False, indent=2)
    print(f"📄 API: etfs.json")

    with open(API_DATA_DIR / "summary.json", "w", encoding="utf-8") as f:
        json.dump(data["summary"], f, ensure_ascii=False, indent=2)
    print(f"📄 API: summary.json")

    for etf in data["etfs"]:
        ticker_safe = etf["ticker"].replace(".", "_")
        with open(API_DATA_DIR / f"etf_{ticker_safe}.json", "w", encoding="utf-8") as f:
            json.dump(etf, f, ensure_ascii=False, indent=2)
    print(f"📄 {len(data['etfs'])} 个单独 ETF 文件")

    history_path = API_DATA_DIR / "history.json"
    existing = []
    if history_path.exists():
        with open(history_path, "r", encoding="utf-8") as f:
            existing = json.load(f).get("data", [])
    if today not in {h["date"] for h in existing}:
        existing.append({
            "date": today,
            "btc_price_usd": data["summary"]["btc_price_usd"],
            "total_aum_usd": data["summary"]["total_aum_usd"],
            "total_holdings_btc": data["summary"]["total_holdings_btc"],
            "total_daily_flow_usd": data["summary"]["total_daily_flow_usd"],
        })
        existing.sort(key=lambda x: x["date"])
    with open(history_path, "w", encoding="utf-8") as f:
        json.dump({"data": existing}, f, ensure_ascii=False, indent=2)
    print(f"📄 历史索引: history.json")

    flows = [{
        "ticker": e["ticker"],
        "name": e["name"],
        "country": e["country"],
        "daily_flow_usd": e["daily_flow_usd"],
        "total_flow_usd": e["total_flow_usd"],
        "date": today,
    } for e in data["etfs"]]
    with open(API_DATA_DIR / "flows.json", "w", encoding="utf-8") as f:
        json.dump({"data": flows, "date": today}, f, ensure_ascii=False, indent=2)
    print(f"📄 资金流向: flows.json")


def main():
    try:
        data = scrape_all_etfs()
        save_data(data)
        print("\n🎉 数据采集完成!")
        return 0
    except Exception as e:
        print(f"\n❌ 数据采集失败: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
