# 🚀 快速启动指南 - 5 分钟内启动验收

## 📍 部署地址

```
http://localhost:5173
```

---

## 🚀 启动步骤 (3 步, 2 分钟)

### Step 1: 打开终端并进入项目目录

```bash
cd /e/ZSXQ/new-api/infinite-canvas/web
```

### Step 2: 配置环境变量 (如果还没有的话)

```bash
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
```

### Step 3: 启动开发服务器

```bash
npm run dev
```

✅ 完成！访问 **http://localhost:5173**

---

## 🌐 访问应用

打开浏览器访问:

```
http://localhost:5173
```

---

## ✅ 验收清单 (8 项功能)

### 1. 📱 首页加载
- [ ] 打开 http://localhost:5173
- [ ] 应该看到 infinite-canvas 首页

### 2. 🔐 未登录重定向
- [ ] 访问 http://localhost:5173/canvas
- [ ] 应自动尝试重定向到 OAuth（可能会失败因为 new-api 未运行）

### 3. 💾 localStorage 检查
- [ ] 打开 F12 (开发者工具)
- [ ] Application → Local Storage → http://localhost:5173
- [ ] 应该能看到 "auth-storage" 条目

### 4. 🔗 顶部按钮
- [ ] 查看页面顶部导航栏
- [ ] 应该看到 3 个按钮（可能在下拉菜单中）:
  - [ ] 🏠 首页按钮
  - [ ] 💳 钱包按钮
  - [ ] 🔑 Keys 按钮

### 5. 🎨 UI 完整性
- [ ] 所有页面元素正常显示
- [ ] 没有 JavaScript 错误（F12 → Console）

### 6. ⚡ 性能检查
- [ ] 打开 F12 → Network
- [ ] 刷新页面
- [ ] 页面加载时间应该 < 2 秒

### 7. 📊 构建验证
- [ ] 打开 F12 → Console
- [ ] 应该没有红色错误提示

### 8. 🔍 代码审查
- [ ] 查看 `web/src/` 目录
- [ ] 所有 OAuth 文件都存在：
  - [ ] `services/oauth.ts`
  - [ ] `stores/use-auth-store.ts`
  - [ ] `components/auth-guard.tsx`
  - [ ] `pages/oauth-callback.tsx`

---

## 📋 快速测试流程

```bash
# 1. 进入项目
cd /e/ZSXQ/new-api/infinite-canvas/web

# 2. 启动服务
npm run dev

# 3. 在浏览器打开
# http://localhost:5173

# 4. 按 F12 打开开发者工具
# 检查 Console 和 Network 标签

# 5. 检查 localStorage
# Application → Local Storage → http://localhost:5173
```

---

## 🎯 功能验证 (可选，需要 new-api 运行)

如果 new-api 正在运行在 http://localhost:3000:

1. **点击任何路由**
2. **应该重定向到 new-api OAuth**
3. **登录后应回到应用**
4. **点击功能按钮应打开 new-api 页面**

---

## 🔧 常见问题

### Q: 端口 5173 已被占用
```bash
npm run dev -- --port 5174
```

### Q: npm 命令找不到
```bash
npm install  # 重新安装依赖
npm run dev
```

### Q: .env.local 不生效
```bash
# 删除缓存并重启
rm -rf node_modules/.vite
npm run dev
```

---

## 📂 重要文件位置

```
infinite-canvas/
├── ACCEPTANCE-CHECKLIST.md     ← 完整验收清单（点这里做验收！）
├── LOCAL-DEPLOYMENT.md         ← 详细部署指南
├── web/
│   ├── .env.local              ← 环境变量
│   ├── dist/                   ← 生产构建产物
│   ├── src/
│   │   ├── services/oauth.ts   ← OAuth 服务
│   │   └── ...
│   └── package.json
├── docs/
│   ├── deployment-guide.md     ← 完整部署文档
│   ├── oauth-architecture.md   ← 架构设计
│   └── sso-testing-plan.md     ← 测试计划
└── ...
```

---

## 🎓 了解更多

- **想了解部署？** → 查看 `LOCAL-DEPLOYMENT.md`
- **想了解架构？** → 查看 `docs/oauth-architecture.md`
- **想了解测试？** → 查看 `docs/sso-testing-plan.md`
- **想了解代码？** → 查看 `web/src/` 目录

---

## ✨ 项目结构

```
OAuth 流程:
用户访问 → 检查 token → 无 token → 重定向到 new-api
    ↓
new-api OAuth → 授权 → 回调到 /oauth/callback
    ↓
获取 token → 存储到 localStorage → 重定向首页
    ↓
用户可访问应用 → 查看功能按钮 → 可跳转到 new-api
```

---

## 🎉 准备好了！

```
🌐 访问: http://localhost:5173
📋 验收: 查看 ACCEPTANCE-CHECKLIST.md
📖 文档: 查看各个 .md 文件
🆘 问题: 查看 LOCAL-DEPLOYMENT.md 的故障排除
```

**现在就打开浏览器，开始验收吧！** 🚀

---

**部署状态:** ✅ 就绪  
**访问地址:** http://localhost:5173  
**验收清单:** ACCEPTANCE-CHECKLIST.md
