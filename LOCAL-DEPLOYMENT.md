# 🚀 infinite-canvas SSO 集成 - 本地部署指南

## 快速部署 (5 分钟内)

### 方案 1: 使用 npm 开发服务器 (最简单)

```bash
# 1. 进入项目目录
cd /e/ZSXQ/new-api/infinite-canvas/web

# 2. 配置环境变量
cat > .env.local << 'EOF'
VITE_OAUTH_CLIENT_ID=test_client_id_local
VITE_OAUTH_CLIENT_SECRET=test_client_secret_local
VITE_OAUTH_AUTHORIZATION_URL=http://localhost:3000/oauth/authorize
VITE_OAUTH_TOKEN_URL=http://localhost:3000/oauth/token
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_NEW_API_HOME=http://localhost:3000
VITE_NEW_API_WALLET=http://localhost:3000/wallet
VITE_NEW_API_KEYS=http://localhost:3000/keys
EOF

# 3. 启动开发服务器
npm install  # 如果还未安装
npm run dev
```

**访问地址:** `http://localhost:5173`

---

### 方案 2: 使用生产构建 + 本地服务器 (推荐测试)

```bash
# 1. 构建
cd /e/ZSXQ/new-api/infinite-canvas/web
npm run build

# 2. 启动静态服务器
npx serve -s dist -l 5173
```

**访问地址:** `http://localhost:5173`

---

### 方案 3: 使用 Python 简单 HTTP 服务器

```bash
cd /e/ZSXQ/new-api/infinite-canvas/web/dist
python -m http.server 5173
```

**访问地址:** `http://localhost:5173`

---

## 📋 部署检查清单

- [ ] Node.js 版本 18+ 已安装
- [ ] npm 依赖已安装 (`npm install`)
- [ ] `.env.local` 已配置
- [ ] 构建成功 (`npm run build`)
- [ ] 开发服务器已启动 (`npm run dev`)
- [ ] 浏览器可访问 http://localhost:5173

---

## 🧪 功能验证

### 测试 1: 访问首页

```
1. 打开浏览器访问 http://localhost:5173
2. 应该看到 infinite-canvas 首页
3. 如果未登录，应自动尝试重定向到 OAuth
4. （由于 new-api 可能未运行，可能会看到错误，这是正常的）
```

### 测试 2: 检查 localStorage

```
1. 打开开发者工具 (F12)
2. 进入 Application → Local Storage
3. 查看 "http://localhost:5173" 的存储
4. 应该看到 "auth-storage" 条目（如果已登录）
```

### 测试 3: 查看网络请求

```
1. 打开开发者工具 (F12)
2. 进入 Network 标签
3. 访问受保护的路由 (如 /canvas)
4. 应该看到到 http://localhost:3000/oauth/authorize 的重定向
```

---

## 📂 构建产物

**位置:** `web/dist/`

```
dist/
├── index.html              # SPA 入口
├── assets/
│   ├── index-xxxxx.js      # 应用 JavaScript (3.7MB)
│   ├── index-xxxxx.css     # 应用样式 (109KB)
│   └── ...其他资源
└── plugins/
    └── index.json
```

**大小:** 3.7MB (raw) / 1.17MB (gzipped)

---

## 🔐 环境变量说明

| 变量 | 说明 | 本地值 |
|------|------|--------|
| `VITE_OAUTH_CLIENT_ID` | OAuth 客户端 ID | test_client_id_local |
| `VITE_OAUTH_CLIENT_SECRET` | OAuth 客户端密钥 | test_client_secret_local |
| `VITE_OAUTH_AUTHORIZATION_URL` | OAuth 授权端点 | http://localhost:3000/oauth/authorize |
| `VITE_OAUTH_TOKEN_URL` | OAuth token 端点 | http://localhost:3000/oauth/token |
| `VITE_OAUTH_REDIRECT_URI` | OAuth 回调地址 | http://localhost:5173/oauth/callback |
| `VITE_NEW_API_HOME` | new-api 首页链接 | http://localhost:3000 |
| `VITE_NEW_API_WALLET` | new-api 钱包链接 | http://localhost:3000/wallet |
| `VITE_NEW_API_KEYS` | new-api Keys 链接 | http://localhost:3000/keys |

---

## 🐛 故障排除

### 问题 1: "Cannot find module 'vite'"

**解决:**
```bash
npm install
npm run dev
```

### 问题 2: "VITE_OAUTH_CLIENT_ID is not set"

**解决:** 创建 `.env.local` 文件并配置所有环境变量

### 问题 3: 页面空白或错误

**检查:**
1. 打开开发者工具查看控制台错误
2. 检查 Network 标签中的网络请求
3. 验证 `.env.local` 配置正确
4. 确保 new-api OAuth 端点可访问 (http://localhost:3000)

### 问题 4: 端口 5173 已被占用

**解决:**
```bash
# 使用不同端口
npm run dev -- --port 5174
```

---

## 📊 验证清单

| 项目 | 状态 | 说明 |
|------|------|------|
| 代码构建 | ✅ | npm run build 成功 |
| TypeScript | ✅ | 0 errors |
| 文件大小 | ✅ | 3.7MB (合理) |
| 环境配置 | ✅ | .env.local 已创建 |
| 开发服务器 | ✅ | npm run dev 就绪 |

---

## 🚀 启动命令总结

```bash
# 完整启动流程
cd /e/ZSXQ/new-api/infinite-canvas/web

# 第一次部署
npm install
npm run build

# 创建环境变量
cat > .env.local << 'EOF'
VITE_OAUTH_CLIENT_ID=test_client_id_local
VITE_OAUTH_CLIENT_SECRET=test_client_secret_local
VITE_OAUTH_AUTHORIZATION_URL=http://localhost:3000/oauth/authorize
VITE_OAUTH_TOKEN_URL=http://localhost:3000/oauth/token
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_NEW_API_HOME=http://localhost:3000
VITE_NEW_API_WALLET=http://localhost:3000/wallet
VITE_NEW_API_KEYS=http://localhost:3000/keys
EOF

# 启动开发服务器
npm run dev
```

**访问地址:** http://localhost:5173

---

## 📝 注意事项

1. **new-api 必须运行** - OAuth 端点需要 http://localhost:3000 可访问
2. **HTTPS 不强制** - 本地开发使用 HTTP
3. **开发模式默认启用** - 包含 source maps 和热重载
4. **端口 5173** - Vite 默认端口，可通过 `--port` 修改

---

## 🔗 相关文档

- 完整部署指南: `docs/deployment-guide.md`
- 架构设计: `docs/oauth-architecture.md`
- 测试计划: `docs/sso-testing-plan.md`

---

**部署状态:** ✅ 就绪  
**访问地址:** http://localhost:5173  
**下一步:** 配置 new-api OAuth 应用 → 启动开发服务器 → 浏览器访问
