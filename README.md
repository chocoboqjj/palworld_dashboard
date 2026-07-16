# 幻兽帕鲁 监控面板 (Palworld Dashboard)

基于 **Palworld 官方 REST API v1.0.0** 构建的服务器监控与管理面板。
前端使用 **Nuxt 4 + Vue 3 + Tailwind CSS**，
后端代理通过 Nuxt Nitro Server Routes 实现（零额外后端依赖）。

## ✨ 功能

- **实时监控**：服务器 FPS、帧时间、在线玩家数、运行时长、基地数、游戏天数
- **趋势图表**：FPS 与在线玩家数随时间变化（纯 SVG 渐变面积图，零额外图表库依赖）
- **世界地图**：玩家位置标注，基于 Palworld 官方世界地图坐标系
- **玩家列表**：名称 / 平台账户 / 用户 ID / IP / 延迟 / 等级 / 坐标，支持搜索
- **玩家管理**：一键踢出、封禁（调用 `/kick` `/ban`）
- **服务器设置**：展开查看全部 `/settings` 配置项
- **服务器操作**：发送公告、保存世界、优雅关闭、强制停止、解封（危险操作带二次确认）
- **自动刷新**：可配置 1s / 3s / 5s / 10s / 30s 轮询，或手动刷新
- **美观 UI**：暗色玻璃拟态卡片、状态徽标、Toast 提示、响应式布局

## 📋 涉及的 Palworld REST API

| 方法 | 端点 | 用途 |
|------|------|------|
| GET | `/info` | 服务器信息（版本、名称、描述、world GUID） |
| GET | `/metrics` | 服务器指标（FPS、帧时间、玩家数、运行时长、基地数、天数） |
| GET | `/players` | 在线玩家列表 |
| GET | `/settings` | 服务器设置 |
| POST | `/announce` | 发送公告 `{message}` |
| POST | `/kick` | 踢出玩家 `{userid, message?}` |
| POST | `/ban` | 封禁玩家 `{userid, message?}` |
| POST | `/unban` | 解封玩家 `{userid}` |
| POST | `/save` | 保存世界 |
| POST | `/shutdown` | 关闭服务器 `{waittime, message?}` |
| POST | `/stop` | 强制停止服务器 |

> 认证方式：HTTP Basic Auth。**用户名固定为 `admin`，密码为服务器配置中的 `AdminPassword`**。
> 端口为服务器配置中的 `RESTAPIPort`（默认为`8212`）。需在 `PalWorldSettings.ini` 中将 `RESTAPIEnabled` 设为 `True`。

## 🚀 部署

### 开发模式

```bash
pnpm install
pnpm dev
# 访问 http://localhost:3000
```

### 生产部署 (Node.js)

```bash
pnpm install
pnpm build
# 构建产物在 .output/ 目录
# 启动服务（默认监听 3000 端口）
pnpm start
```

可通过环境变量 `PORT` 指定端口：
```bash
PORT=8080 node .output/server/index.mjs
```

可选环境变量：
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务监听端口 | `3000` |
| `PAL_PROXY_TIMEOUT` | 代理请求超时（毫秒） | `30000` |

### Docker 部署

```bash
# 拉取并运行
docker run -d -p 3000:3000 --name pal-dash chocoboqjj/palworld-dashboard:latest

# 自定义端口
docker run -d -p 8080:8080 -e PORT=8080 --name pal-dash chocoboqjj/palworld-dashboard:latest
```

也可以从源码构建：

```bash
docker build -t palworld-dashboard .
docker run -d -p 3000:3000 --name pal-dash palworld-dashboard
```

### 访问与连接

启动后浏览器访问 `http://<宿主机IP>:3000`，在**连接设置**中填写：

- **服务器地址**：如 `http://192.168.1.100:8212`（游戏服务器的 `RESTAPIPort`）
- **用户名**：`admin`（Palworld REST API 固定用户名）
- **密码**：游戏服务器 `AdminPassword`

> 建议将面板部署在与游戏服务器**同一局域网**内，凭据仅保存在服务端内存中，不会下发到浏览器。

## ⚠️ 安全提示

Palworld REST API **并非设计用于公网暴露**。官方强烈建议在**局域网内**使用。
本面板通过本地 Nitro 代理转发请求，凭据仅保存在运行本服务的机器上（服务端内存会话），不会下发到浏览器。
`/stop` 等危险操作需二次确认，请谨慎使用。

## 🗂 项目结构

```
Palworld_Dashboard/
├── app/                          ← Nuxt 4 应用层 (srcDir)
│   ├── app.vue                   ← 根组件 (Toast + NuxtPage)
│   ├── pages/
│   │   └── index.vue             ← 主仪表盘（轮询与状态编排）
│   ├── components/               ← Vue 3 组件
│   │   ├── OverviewCards.vue      ← 指标卡片网格
│   │   ├── TrendCharts.vue        ← 趋势图表面板
│   │   ├── Sparkline.vue          ← 纯 SVG 面积图（零依赖）
│   │   ├── MapView.vue            ← 世界地图 + 玩家标记
│   │   ├── PlayerTable.vue        ← 在线玩家表格
│   │   ├── ServerActions.vue      ← 服务器操作面板
│   │   ├── SettingsPanel.vue      ← 服务器设置面板
│   │   ├── SettingsModal.vue      ← 连接设置弹窗
│   │   └── ConfirmDialog.vue      ← 二次确认弹窗
│   ├── composables/
│   │   └── useToast.ts            ← Toast 状态管理
│   ├── utils/
│   │   ├── types.ts              ← 数据类型与基础 URL 解析
│   │   ├── format.ts             ← 格式化与历史采样
│   │   ├── map.ts                ← 世界坐标换算
│   │   ├── api.ts                ← 客户端 API 封装
│   │   └── clientConfig.ts       ← 浏览器 localStorage 会话
│   └── assets/
│       └── css/main.css          ← Tailwind 与暗色主题
├── server/                       ← Nitro 服务端 (Server Routes)
│   ├── api/
│   │   ├── test.post.ts          ← 连接探测端点
│   │   ├── auth/
│   │   │   ├── login.post.ts     ← 登录 + 会话创建
│   │   │   └── logout.post.ts    ← 登出 + 会话销毁
│   │   └── pal/
│   │       └── [...slug].ts      ← Palworld REST API 代理（catch-all）
│   └── utils/
│       └── session.ts            ← 服务端内存会话管理
├── public/
│   └── palworld-map/             ← 世界地图底图资源
├── nuxt.config.ts                ← Nuxt 4 配置
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🔧 技术栈

| 组件 | 技术 |
|------|------|
| 框架 | Nuxt 4 + Vue 3 (Composition API) |
| 样式 | Tailwind CSS 3 + 暗色主题 |
| 图标 | lucide-vue-next |
| 图表 | 纯 SVG (Sparkline.vue，零依赖) |
| 后端 | Nitro Server Routes (h3) |
| 类型 | TypeScript 5 |
| 包管理 | pnpm |
| 运行时 | Node.js >= 20 |

## 📄 许可

[MIT License](LICENSE)
