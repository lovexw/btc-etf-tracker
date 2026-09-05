# 部署指南

## 1. GitHub 仓库设置

```bash
# 初始化 Git 仓库
cd btc-etf-tracker
git init
git add .
git commit -m "🎉 Initial commit: BTC ETF Tracker"

# 创建 GitHub 仓库并推送
git remote add origin https://github.com/你的用户名/btc-etf-tracker.git
git branch -M main
git push -u origin main
```

## 2. Cloudflare Pages 配置

### 方式一：通过 GitHub 集成（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 连接你的 GitHub 仓库
4. 设置构建配置：
   - **Framework preset**: None
   - **Build command**: `npm run build && cp -r data/api dist/api`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. 点击 **Save and Deploy**

### 方式二：通过 GitHub Actions 自动部署

1. 在 Cloudflare Dashboard 获取 API Token：
   - 进入 **My Profile** → **API Tokens**
   - 创建 Token，选择 "Edit Cloudflare Workers" 模板
   - 记录 `Account ID`（在 Workers & Pages 页面右侧）

2. 在 GitHub 仓库设置 Secrets：
   - 进入 **Settings** → **Secrets and variables** → **Actions**
   - 添加 `CLOUDFLARE_API_TOKEN`
   - 添加 `CLOUDFLARE_ACCOUNT_ID`

3. 推送代码到 main 分支即可自动部署

## 3. 数据采集自动化

GitHub Actions 工作流已配置：
- **定时执行**：每天 UTC 00:00 和 12:00（北京时间 08:00 和 20:00）
- **手动触发**：在 GitHub Actions 页面手动运行
- **自动提交**：采集完成后自动 commit 并 push 到仓库

## 4. 本地开发

```bash
# 安装依赖
npm install

# Python 采集脚本依赖
pip install -r scraper/requirements.txt

# 开发模式（前端）
npm run dev

# 手动运行采集
python scraper/scraper.py

# 构建生产版本
npm run build
```

## 5. 环境变量（可选）

如果需要接入付费数据源，在 GitHub Secrets 中设置：

```
SOSOVALUE_API_KEY=your_api_key
```

然后在 `scraper/scraper.py` 中使用。

## 6. 自定义域名

在 Cloudflare Pages 设置中：
1. 进入 **Custom domains**
2. 添加你的域名
3. 配置 DNS 记录（Cloudflare 会自动配置）

## 7. 项目结构

```
btc-etf-tracker/
├── .github/workflows/
│   ├── scraper.yml       # 定时数据采集
│   └── deploy.yml        # 自动部署
├── scraper/
│   ├── scraper.py        # Python 采集脚本
│   └── requirements.txt
├── data/
│   ├── api/              # API 端点数据（JSON）
│   └── etf_data_*.json   # 按日期归档
├── functions/api/         # Cloudflare Pages Functions
├── src/                   # React 前端源码
│   ├── components/
│   ├── hooks/
│   └── utils/
├── public/               # 静态资源
└── dist/                 # 构建产物（git忽略）
```
