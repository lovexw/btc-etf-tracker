"""
BTC ETF 数据采集脚本
从多个数据源抓取全球比特币现货 ETF 的最新数据
"""

import json
import os
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

import httpx

# 数据存储路径
DATA_DIR = Path(__file__).parent.parent / "data"
API_DATA_DIR = DATA_DIR / "api"

# 数据源配置
SOSOVALUE_API = "https://api.sosovalue.com/api/v/info/etf/etfList"
COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price"

# 已知的全球比特币现货 ETF 列表
BTC_SPOT_ETFS = [
    # 美国
    {"ticker": "IBIT", "issuer": "BlackRock", "name": "iShares Bitcoin Trust ETF", "country": "US", "exchange": "NASDAQ", "listing_date": "2024-01-11"},
    {"ticker": "FBTC", "issuer": "Fidelity", "name": "Fidelity Wise Origin Bitcoin Fund", "country": "US", "exchange": "Cboe", "listing_date": "2024-01-11"},
    {"ticker": "GBTC", "issuer": "Grayscale", "name": "Grayscale Bitcoin Trust ETF", "country": "US", "exchange": "NYSE", "listing_date": "2024-01-11"},
    {"ticker": "BITB", "issuer": "Bitwise", "name": "Bitwise Bitcoin ETF", "country": "US", "exchange": "NYSE", "listing_date": "2024-01-11"},
    {"ticker": "ARKB", "issuer": "ARK/21Shares", "name": "ARK 21Shares Bitcoin ETF", "country": "US", "exchange": "Cboe", "listing_date": "2024-01-11"},
    {"ticker": "HODL", "issuer": "VanEck", "name": "VanEck Bitcoin Trust ETF", "country": "US", "exchange": "Cboe", "listing_date": "2024-01-11"},
    {"ticker": "BRRR", "issuer": "Valkyrie", "name": "Valkyrie Bitcoin Fund", "country": "US", "exchange": "NASDAQ", "listing_date": "2024-01-11"},
    {"ticker": "EZBC", "issuer": "Franklin Templeton", "name": "Franklin Bitcoin ETF", "country": "US", "exchange": "Cboe", "listing_date": "2024-01-11"},
    {"ticker": "BTCO", "issuer": "Invesco/Galaxy", "name": "Invesco Galaxy Bitcoin ETF", "country": "US", "exchange": "NASDAQ", "listing_date": "2024-01-11"},
    {"ticker": "DEFT", "issuer": "Hashdex", "name": "Hashdex Bitcoin ETF", "country": "US", "exchange": "NYSE", "listing_date": "2024-01-11"},
    # 加拿大
    {"ticker": "BTCC.B", "issuer": "Purpose", "name": "Purpose Bitcoin ETF", "country": "CA", "exchange": "TSX", "listing_date": "2021-02-18"},
    {"ticker": "BTCC.U", "issuer": "Purpose", "name": "Purpose Bitcoin ETF (USD)", "country": "CA", "exchange": "TSX", "listing_date": "2021-02-18"},
    {"ticker": "BITQ.U", "issuer": "Evolve", "name": "Evolve Bitcoin ETF", "country": "CA", "exchange": "TSX", "listing_date": "2021-02-19"},
    # 澳大利亚
    {"ticker": "IBTC", "issuer": "Betashares", "name": "BetaShares Bitcoin ETF", "country": "AU", "exchange": "ASX", "listing_date": "2024-05-02"},
    # 香港
    {"ticker": "3042.HK", "issuer": "华夏基金", "name": "华夏比特币ETF", "country": "HK", "exchange": "HKEX", "listing_date": "2024-04-30"},
    {"ticker": "3439.HK", "issuer": "博时国际", "name": "博时比特币ETF", "country": "HK", "exchange": "HKEX", "listing_date": "2024-04-30"},
    {"ticker": "3179.HK", "issuer": "嘉实国际", "name": "嘉实比特币ETF", "country": "HK", "exchange": "HKEX", "listing_date": "2024-04-30"},
]


def get_btc_price(client: httpx.Client) -> float:
    """获取比特币当前价格"""
    try:
        resp = client.get(COINGECKO_API, params={
            "ids": "bitcoin",
            "vs_currencies": "usd",
        }, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data["bitcoin"]["usd"]
    except Exception as e:
        print(f"⚠️ 获取BTC价格失败: {e}")
        return 0.0


def fetch_etf_data(client: httpx.Client, etf: dict) -> dict:
    """
    抓取单个 ETF 数据
    由于公开免费 API 限制，这里使用模拟数据框架
    实际部署时可以接入 SoSoValue 或其他数据源
    """
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")

    # 基础数据结构
    data = {
        "ticker": etf["ticker"],
        "name": etf["name"],
        "issuer": etf["issuer"],
        "country": etf["country"],
        "exchange": etf["exchange"],
        "listing_date": etf["listing_date"],
        "date": today,
        "updated_at": now.isoformat(),
        # 以下字段在实际部署时从 API 获取
        "aum_usd": None,          # 资产管理规模 (美元)
        "holdings_btc": None,     # BTC 持仓量
        "nav_price": None,        # 净值价格
        "market_price": None,     # 市场价格
        "premium_discount": None, # 溢价/折价率
        "daily_flow_usd": None,   # 日资金流入/流出
        "total_flow_usd": None,   # 累计资金流入
        "expense_ratio": None,    # 费率
    }

    return data


def try_fetch_sosovalue(client: httpx.Client) -> list[dict] | None:
    """尝试从 SoSoValue 获取真实数据"""
    try:
        resp = client.post(
            SOSOVALUE_API,
            json={"lang": "en", "type": "btc", "tab": "etf"},
            timeout=15,
        )
        resp.raise_for_status()
        result = resp.json()
        if result.get("code") == 200 and result.get("data"):
            return result["data"]
    except Exception as e:
        print(f"⚠️ SoSoValue API 不可用: {e}")
    return None


def scrape_all_etfs() -> dict:
    """抓取所有 ETF 数据"""
    print("🚀 开始采集 BTC ETF 数据...")
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")

    with httpx.Client(headers={
        "User-Agent": "BTC-ETF-Tracker/1.0 (GitHub Actions Bot)",
        "Accept": "application/json",
    }) as client:
        # 获取 BTC 当前价格
        btc_price = get_btc_price(client)
        print(f"💰 BTC 当前价格: ${btc_price:,.2f}")

        # 尝试从 SoSoValue 获取真实数据
        real_data = try_fetch_sosovalue(client)

        etfs_data = []
        for etf in BTC_SPOT_ETFS:
            print(f"  📊 处理 {etf['ticker']}...")
            etf_data = fetch_etf_data(client, etf)

            # 如果有真实数据，尝试匹配
            if real_data:
                for item in real_data:
                    if item.get("ticker") == etf["ticker"] or item.get("symbol") == etf["ticker"]:
                        etf_data["aum_usd"] = item.get("aum")
                        etf_data["holdings_btc"] = item.get("holdings")
                        etf_data["nav_price"] = item.get("navPrice")
                        etf_data["market_price"] = item.get("marketPrice")
                        etf_data["daily_flow_usd"] = item.get("dailyFlow")
                        etf_data["total_flow_usd"] = item.get("totalFlow")
                        etf_data["expense_ratio"] = item.get("feeRate")
                        break

            etfs_data.append(etf_data)
            time.sleep(0.3)  # 请求间隔

    # 计算总览数据
    total_aum = sum(e["aum_usd"] or 0 for e in etfs_data)
    total_holdings = sum(e["holdings_btc"] or 0 for e in etfs_data)
    total_daily_flow = sum(e["daily_flow_usd"] or 0 for e in etfs_data)
    total_cumulative_flow = sum(e["total_flow_usd"] or 0 for e in etfs_data)

    summary = {
        "date": today,
        "updated_at": now.isoformat(),
        "btc_price_usd": btc_price,
        "total_etfs": len(etfs_data),
        "total_aum_usd": total_aum,
        "total_holdings_btc": total_holdings,
        "total_daily_flow_usd": total_daily_flow,
        "total_cumulative_flow_usd": total_cumulative_flow,
        "countries": list(set(e["country"] for e in etfs_data)),
    }

    result = {
        "summary": summary,
        "etfs": etfs_data,
    }

    print(f"\n✅ 采集完成!")
    print(f"  - ETF 数量: {len(etfs_data)}")
    print(f"  - BTC 价格: ${btc_price:,.2f}")
    print(f"  - 总 AUM: ${total_aum:,.2f}")
    print(f"  - 总持仓: {total_holdings:,.4f} BTC")

    return result


def save_data(data: dict):
    """保存数据到文件"""
    API_DATA_DIR.mkdir(parents=True, exist_ok=True)
    today = data["summary"]["date"]

    # 1. 完整数据（按日期归档）
    archive_path = DATA_DIR / f"etf_data_{today}.json"
    with open(archive_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"📄 已保存归档数据: {archive_path}")

    # 2. API 端点数据
    # /api/etfs - 所有 ETF 列表
    etfs_path = API_DATA_DIR / "etfs.json"
    with open(etfs_path, "w", encoding="utf-8") as f:
        json.dump({"data": data["etfs"]}, f, ensure_ascii=False, indent=2)
    print(f"📄 已保存 API: {etfs_path}")

    # /api/summary - 总览数据
    summary_path = API_DATA_DIR / "summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(data["summary"], f, ensure_ascii=False, indent=2)
    print(f"📄 已保存 API: {summary_path}")

    # /api/etfs/:ticker - 单个 ETF 数据
    for etf in data["etfs"]:
        ticker_safe = etf["ticker"].replace(".", "_")
        etf_path = API_DATA_DIR / f"etf_{ticker_safe}.json"
        with open(etf_path, "w", encoding="utf-8") as f:
            json.dump(etf, f, ensure_ascii=False, indent=2)
    print(f"📄 已保存 {len(data['etfs'])} 个单独 ETF 数据文件")

    # 3. 历史数据索引
    history_path = API_DATA_DIR / "history.json"
    existing_history = []
    if history_path.exists():
        with open(history_path, "r", encoding="utf-8") as f:
            existing_history = json.load(f).get("data", [])

    # 避免重复
    existing_dates = {h["date"] for h in existing_history}
    if today not in existing_dates:
        existing_history.append({
            "date": today,
            "btc_price_usd": data["summary"]["btc_price_usd"],
            "total_aum_usd": data["summary"]["total_aum_usd"],
            "total_holdings_btc": data["summary"]["total_holdings_btc"],
            "total_daily_flow_usd": data["summary"]["total_daily_flow_usd"],
        })
        existing_history.sort(key=lambda x: x["date"])

    with open(history_path, "w", encoding="utf-8") as f:
        json.dump({"data": existing_history}, f, ensure_ascii=False, indent=2)
    print(f"📄 已保存历史数据索引: {history_path}")

    # 4. 资金流向数据
    flows_data = []
    for etf in data["etfs"]:
        flows_data.append({
            "ticker": etf["ticker"],
            "name": etf["name"],
            "country": etf["country"],
            "daily_flow_usd": etf["daily_flow_usd"],
            "total_flow_usd": etf["total_flow_usd"],
            "date": today,
        })
    flows_path = API_DATA_DIR / "flows.json"
    with open(flows_path, "w", encoding="utf-8") as f:
        json.dump({"data": flows_data, "date": today}, f, ensure_ascii=False, indent=2)
    print(f"📄 已保存资金流向: {flows_path}")


def main():
    """主函数"""
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
