# BTC ETF Tracker

> 全球比特币现货 ETF 数据聚合平台 | Live Bitcoin Spot ETF Data Aggregation

## 功能特性

- 📊 **实时数据**：每日自动抓取全球比特币 ETF 数据（AUM、持仓量、资金流向等）
- 🌐 **RESTful API**：提供完整的 JSON API 接口，方便第三方集成
- ⚡ **极速访问**：部署在 Cloudflare Pages，全球 CDN 加速
- 📱 **响应式设计**：完美适配桌面和移动端
- 🤖 **自动化**：GitHub Actions 每日定时采集，零服务器维护

## 技术栈

| 模块 | 技术 |
|------|------|
| 数据采集 | Python 3.11 + httpx |
| 数据存储 | JSON (Git 版本控制) |
| API 服务 | Cloudflare Pages Functions |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式方案 | Tailwind CSS 3 |
| 部署平台 | Cloudflare Pages |
| 自动化 | GitHub Actions (cron) |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

## API 接口

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/etfs` | GET | 获取所有 ETF 列表 |
| `/api/etfs/:ticker` | GET | 获取单个 ETF 详情 |
| `/api/summary` | GET | 获取市场总览数据 |
| `/api/history` | GET | 获取历史数据趋势 |
| `/api/flows` | GET | 获取资金流向数据 |

## 数据来源

- SoSoValue ETF API
- 各 ETF 发行方公开数据
- CoinGecko 行情数据

## 部署

1. Fork 本仓库
2. 在 Cloudflare Pages 中连接 GitHub 仓库
3. 设置构建命令 `npm run build`，输出目录 `dist`
4. 配置 GitHub Secrets（如需 API Key）
5. GitHub Actions 将每日自动抓取数据

## License

MIT
