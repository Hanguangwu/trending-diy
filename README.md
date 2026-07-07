# GitHub Trending DIY

> 每天自动抓取 GitHub Trending 仓库，展示在 GitHub Pages 上，并通过邮件推送。

## 效果

| | |
|---|---|
| 🌐 前端页面 | `https://你的用户名.github.io/trending-diy/` |
| 📧 每日邮件 | 每天 UTC 09:00 推送全部 Trending 列表 |
| ⏰ 自动更新 | GitHub Actions 定时抓取 + 自动部署 |

## 功能

- **定时抓取** — 每天 UTC 09:00 自动抓取 GitHub Trending (Daily) 数据
- **前端展示** — 仓库名称 / 描述 / 编程语言 / Star 数 / Fork 数 / 贡献者头像
- **邮件通知** — 通过 SMTP 推送完整 Trending 列表到邮箱
- **暗色主题** — 跟随系统偏好自动切换亮色 / 暗色
- **响应式** — 桌面 / 平板 / 手机自适应

## 架构

```
                      GitHub Actions (cron: 0 9 * * *)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   fetch-trending.js  ──▶  trending.json  ──▶  vite build   │
│   (Node.js + cheerio)      (提交到仓库)        (构建前端)    │
│                                                             │
│   generate-email.js  ──▶  email-body.html ──▶  SMTP 发送   │
│                                                             │
│                            │                                │
│                            ▼                                │
│                    peaceiris/gh-pages                        │
│                    (部署到 gh-pages 分支)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   GitHub Pages 站点
                   (Vue 3 + 静态 JSON)
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 + TypeScript |
| 构建工具 | Vite 8 |
| 数据抓取 | Node.js + cheerio |
| 定时任务 | GitHub Actions (cron) |
| 页面部署 | peaceiris/actions-gh-pages |
| 邮件通知 | dawidd6/action-send-mail (SMTP) |

## 快速部署

### 前置条件

- GitHub 账号
- 支持 SMTP 的邮箱（Gmail 推荐，需开启两步验证 + 生成 [App Password](https://myaccount.google.com/apppasswords)）

### 1. 推送代码到 GitHub

```bash
# 在项目目录执行
git remote add origin https://github.com/你的用户名/trending-diy.git
git push -u origin main
```

### 2. 启用 GitHub Pages

仓库 **Settings → Pages** → 按以下配置：

| 选项 | 值 |
|---|---|
| Source | **Deploy from a branch** |
| Branch | `gh-pages` |
| Directory | `/ (root)` |

### 3. 配置环境变量（Secrets）

仓库 **Settings → Secrets and variables → Actions** → **New repository secret**，添加 6 个变量：

| Secret | 说明 | 示例值 | 备注 |
|---|---|---|---|
| `SMTP_HOST` | SMTP 服务器地址 | `smtp.gmail.com` | Gmail / QQ 邮箱各有不同 |
| `SMTP_PORT` | SMTP 端口 | `587` | 通常 465(SSL) 或 587(TLS) |
| `SMTP_USER` | 邮箱登录账号 | `your-email@gmail.com` | 完整邮箱地址 |
| `SMTP_PASS` | SMTP 密码 | `xxxx xxxx xxxx xxxx` | Gmail 用 App Password，QQ 用授权码 |
| `EMAIL_FROM` | 发件人地址 | `your-email@gmail.com` | 与 SMTP_USER 一致 |
| `EMAIL_TO` | 收件人地址 | `you@example.com` | 可以跟 FROM 相同 |

> **Gmail 用户**：开启两步验证 → [App Password](https://myaccount.google.com/apppasswords) 生成 16 位专用密码。
>
> **QQ 邮箱用户**：设置 → 账户 → 开启 SMTP → 生成授权码。

### 4. 手动触发

**Actions** → **Daily Trending** → **Run workflow** → **Run workflow**。

首次运行会完成：抓取数据 → 提交 json → 构建前端 → 部署到 gh-pages → 发送邮件。

### 5. 验证

- 访问 `https://你的用户名.github.io/trending-diy/` 查看页面
- 检查邮箱是否收到今日 Trending 推送
- 之后每天 UTC 09:00 自动执行

---

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（热更新）
pnpm dev

# 手动测试数据抓取
node scripts/fetch-trending.js

# 查看抓取结果
cat public/trending.json

# 生成邮件 HTML
node scripts/generate-email.js

# 生产构建
pnpm build
```

## 项目结构

```
trending-diy/
├── .github/workflows/
│   └── daily-trending.yml       # 定时任务 + 部署 + 邮件
├── scripts/
│   ├── fetch-trending.js        # GitHub Trending 抓取器
│   └── generate-email.js        # 邮件 HTML 生成器
├── public/
│   ├── trending.json            # 抓取数据（自动更新）
│   └── favicon.svg
├── src/
│   ├── App.vue                  # 根组件
│   ├── main.ts                  # 入口
│   ├── style.css                # 全局样式
│   └── components/
│       ├── TrendingPage.vue     # 主页面
│       └── TrendingCard.vue     # 仓库卡片
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 自定义配置

### 修改抓取时间

编辑 `.github/workflows/daily-trending.yml`：

```yaml
schedule:
  # UTC 01:00 = 北京时间 09:00
  - cron: '0 1 * * *'
```

### 修改仓库名

如果仓库名称不是 `trending-diy`，需同步修改：

- `vite.config.ts` 中的 `base` 字段
- `src/components/TrendingPage.vue` 中的 fetch URL（使用 `import.meta.env.BASE_URL` 则不需要）
- 本 README 中的相关链接

### 新增邮箱

只需修改 Secret `EMAIL_TO` 的值即可更换收件人。

---

> Built with Vue 3 + TypeScript + Vite. Powered by GitHub Actions & GitHub Pages.
