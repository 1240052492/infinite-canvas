# infinite-canvas SSO 集成 - 部署指南

**最后更新:** 2026-10-13  
**版本:** 1.0 Release Candidate

---

## 📑 目录

1. [前置条件](#前置条件)
2. [new-api 配置](#new-api-配置)
3. [infinite-canvas 配置](#infinite-canvas-配置)
4. [本地测试](#本地测试)
5. [生产部署](#生产部署)
6. [故障排除](#故障排除)

---

## 前置条件

### 硬件要求
- 2GB+ 内存
- 100MB+ 可用磁盘空间

### 软件要求
- Node.js 18+
- npm 9+
- Git 2.30+
- Docker & Docker Compose（可选，用于 new-api）

### 账户和权限
- new-api 管理员账户
- infinite-canvas GitHub 访问权限
- 服务器 SSH 访问权限

---

## new-api 配置

### Step 1: 创建 OAuth 应用

登录 new-api 管理后台（`https://www.aiplantform.site/admin`）：

1. 导航到 **Settings** → **OAuth Applications**
2. 点击 **Create New Application**
3. 填写以下信息：

| 字段 | 值 |
|------|-----|
| Application Name | `infinite-canvas` |
| Application Type | `Web Application` |
| Redirect URI | `https://canvas.aiplantform.site/oauth/callback` |
| Scope | `user:read` |
| Auto Authorize | ✅ (可选，跳过用户授权确认) |

4. 点击 **Create**

### Step 2: 获取凭证

创建成功后，记录以下信息：

```
Client ID:     xxxxxxxxxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **重要:** Client Secret 仅显示一次，请妥善保存！

### Step 3: 测试 OAuth 端点（可选）

验证 OAuth 端点可访问：

```bash
# 测试授权端点
curl -s "https://www.aiplantform.site/oauth/authorize?client_id=xxx&redirect_uri=xxx&response_type=code&scope=user:read"

# 测试 token 端点
curl -X POST "https://www.aiplantform.site/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=xxx&client_secret=xxx&code=xxx&redirect_uri=xxx&grant_type=authorization_code"
```

---

## infinite-canvas 配置

### Step 1: 获取代码

```bash
# 如果还未克隆
git clone https://github.com/your-org/infinite-canvas.git
cd infinite-canvas

# 如果已克隆，更新代码
git pull origin main
```

### Step 2: 安装依赖

```bash
cd web
npm install
```

### Step 2: 配置环境变量

#### 本地开发环境

创建 `.env.local` 文件：

```bash
cat > .env.local << 'EOF'
# OAuth 2.0 Configuration
VITE_OAUTH_CLIENT_ID=your_client_id_here
VITE_OAUTH_CLIENT_SECRET=your_client_secret_here
VITE_OAUTH_AUTHORIZATION_URL=http://localhost:3000/oauth/authorize
VITE_OAUTH_TOKEN_URL=http://localhost:3000/oauth/token
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback

# New-API Links
VITE_NEW_API_HOME=http://localhost:3000
VITE_NEW_API_WALLET=http://localhost:3000/wallet
VITE_NEW_API_KEYS=http://localhost:3000/keys
EOF
```

#### 生产环境

创建 `.env.production` 文件：

```bash
cat > .env.production << 'EOF'
# OAuth 2.0 Configuration
VITE_OAUTH_CLIENT_ID=your_production_client_id
VITE_OAUTH_CLIENT_SECRET=your_production_client_secret
VITE_OAUTH_AUTHORIZATION_URL=https://www.aiplantform.site/oauth/authorize
VITE_OAUTH_TOKEN_URL=https://www.aiplantform.site/oauth/token
VITE_OAUTH_REDIRECT_URI=https://canvas.aiplantform.site/oauth/callback

# New-API Links
VITE_NEW_API_HOME=https://www.aiplantform.site
VITE_NEW_API_WALLET=https://www.aiplantform.site/wallet
VITE_NEW_API_KEYS=https://www.aiplantform.site/keys
EOF
```

⚠️ **安全提示:**
- 不要将 `.env.local` 和 `.env.production` 提交到 Git
- 确保这两个文件在 `.gitignore` 中
- 在 CI/CD 中通过 secret 管理工具注入环境变量

### Step 3: 验证配置

```bash
# 检查所需的环境变量
grep -E "VITE_OAUTH|VITE_NEW_API" .env.local

# 应该看到类似输出：
# VITE_OAUTH_CLIENT_ID=xxx
# VITE_OAUTH_CLIENT_SECRET=xxx
# ...等
```

### Step 4: 构建验证

```bash
npm run build
```

✅ 构建成功后，继续下一步。如果失败，查看 [故障排除](#故障排除)。

---

## 本地测试

### 启动 new-api

如果本地运行 new-api：

```bash
# 使用 Docker Compose
cd ../new-api
docker-compose up -d

# 等待启动完成
sleep 10
curl http://localhost:3000
```

### 启动 infinite-canvas

```bash
cd infinite-canvas/web

# 开发模式
npm run dev

# 应看到类似输出：
# Local:   http://localhost:5173/
```

### 测试 OAuth 流程

1. **浏览器访问:** `http://localhost:5173`

2. **验证重定向:**
   - 如果未登录，应自动重定向到 `http://localhost:3000/oauth/authorize`
   - 查看 URL 参数：`client_id`, `redirect_uri`, `response_type=code`, `scope`, `state`

3. **登录 new-api:**
   - 使用测试账户登录
   - 点击 **Authorize** 授权

4. **验证回调:**
   - 应重定向回 `http://localhost:5173/oauth/callback?code=xxx&state=xxx`
   - 自动处理后重定向到首页

5. **验证 Token 存储:**
   - 打开浏览器开发者工具 (F12)
   - 应用 → Local Storage
   - 查找 `auth-storage` 条目
   - 应包含 `token` 和 `expiresAt`

6. **测试功能按钮:**
   - 点击顶部导航栏中的按钮：
     - 🏠 **Home** → 应跳转到 `http://localhost:3000`
     - 💳 **Wallet** → 应跳转到 `http://localhost:3000/wallet`
     - 🔑 **Keys** → 应跳转到 `http://localhost:3000/keys`

### 故障排除（本地）

| 问题 | 解决方案 |
|------|---------|
| 重定向到 OAuth 失败 | 检查 `.env.local` 中的 VITE_OAUTH_AUTHORIZATION_URL |
| Token 交换失败 | 验证 new-api 中 OAuth 应用配置，检查 Client Secret |
| localStorage 为空 | 检查浏览器是否允许 localStorage，检查 Zustand persist 配置 |
| CORS 错误 | 验证 new-api 是否允许来自 `http://localhost:5173` 的跨域请求 |

---

## 生产部署

### 前置条件

- 已在 new-api 配置生产 OAuth 应用
- 已获取生产 Client ID 和 Client Secret
- 已准备 `.env.production` 文件
- 已购买 SSL 证书（用于 `canvas.aiplantform.site`）

### 部署步骤

#### Option 1: 使用 Docker

```bash
# 1. 构建 Docker 镜像
docker build -t infinite-canvas:latest .

# 2. 运行容器
docker run -d \
  -p 80:3000 \
  -e VITE_OAUTH_CLIENT_ID=your_production_client_id \
  -e VITE_OAUTH_CLIENT_SECRET=your_production_client_secret \
  -e VITE_OAUTH_AUTHORIZATION_URL=https://www.aiplantform.site/oauth/authorize \
  -e VITE_OAUTH_TOKEN_URL=https://www.aiplantform.site/oauth/token \
  -e VITE_OAUTH_REDIRECT_URI=https://canvas.aiplantform.site/oauth/callback \
  -e VITE_NEW_API_HOME=https://www.aiplantform.site \
  -e VITE_NEW_API_WALLET=https://www.aiplantform.site/wallet \
  -e VITE_NEW_API_KEYS=https://www.aiplantform.site/keys \
  infinite-canvas:latest

# 3. 验证容器运行
docker logs <container_id>
```

#### Option 2: 使用 Nginx

```bash
# 1. 构建产物
cd web
npm run build

# 2. 复制 dist 文件到服务器
scp -r dist/ user@canvas.aiplantform.site:/var/www/infinite-canvas/

# 3. 配置 Nginx
sudo nano /etc/nginx/sites-available/canvas.aiplantform.site
```

Nginx 配置示例：

```nginx
server {
    listen 443 ssl http2;
    server_name canvas.aiplantform.site;

    ssl_certificate /etc/letsencrypt/live/canvas.aiplantform.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/canvas.aiplantform.site/privkey.pem;

    root /var/www/infinite-canvas/dist;
    index index.html;

    # SPA 路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name canvas.aiplantform.site;
    return 301 https://$server_name$request_uri;
}
```

4. **重启 Nginx:**

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### Option 3: 使用 Vercel

```bash
# 1. 连接 GitHub 仓库到 Vercel
# 在 Vercel 控制面板中导入项目

# 2. 配置环境变量
# 在 Vercel 项目设置中添加：
VITE_OAUTH_CLIENT_ID=xxx
VITE_OAUTH_CLIENT_SECRET=xxx
...

# 3. 配置自定义域名
# 设置域名为 canvas.aiplantform.site

# 4. 部署
git push origin main
```

### 验证部署

```bash
# 1. 检查 HTTPS
curl -I https://canvas.aiplantform.site

# 应返回 200 OK

# 2. 检查 OAuth 重定向
curl -s "https://canvas.aiplantform.site" | grep -E "oauth|redirect"

# 3. 监控日志
tail -f /var/log/nginx/error.log
```

---

## 故障排除

### 常见问题

#### 1. OAuth 授权失败: "Invalid Client"

**原因:** Client ID 或 Client Secret 不匹配

**解决:**
```bash
# 验证环境变量
echo $VITE_OAUTH_CLIENT_ID
echo $VITE_OAUTH_CLIENT_SECRET

# 在 new-api 中重新生成凭证
# 在管理后台 → OAuth Applications → regenerate
```

#### 2. 回调 URL 错误: "Redirect URI Mismatch"

**原因:** 配置的回调 URI 与 new-api 中的不匹配

**解决:**
```bash
# 验证配置
grep "VITE_OAUTH_REDIRECT_URI" .env.local

# 确保与 new-api 中配置的完全一致
# 包括协议、域名、路径
```

#### 3. CORS 错误: "Access-Control-Allow-Origin"

**原因:** token 端点不允许来自 infinite-canvas 的跨域请求

**解决:**
```bash
# 在 new-api 中配置 CORS
# 确保允许 canvas.aiplantform.site 来源

# 验证
curl -i -X OPTIONS https://www.aiplantform.site/oauth/token \
  -H "Origin: https://canvas.aiplantform.site"
```

#### 4. Token 过期后无法访问

**原因:** Token 过期但应用未自动刷新

**解决:**
- 清空 localStorage: `localStorage.clear()`
- 刷新页面，重新授权
- 查看浏览器控制台是否有错误

#### 5. localStorage 中没有 token

**原因:** Zustand persist 未正确配置或浏览器限制

**解决:**
```javascript
// 在浏览器控制台验证
localStorage.getItem('auth-storage')

// 如果为 null，检查是否启用了无痕浏览
// 或浏览器设置是否禁止 localStorage
```

### 日志记录

启用调试日志来诊断问题：

```typescript
// 在 src/services/oauth.ts 中添加
console.debug('OAuth flow initiated:', {
  clientId: OAUTH_CONFIG.clientId,
  redirectUri: OAUTH_CONFIG.redirectUri,
  state: state,
});
```

### 获取支持

如遇问题，请收集以下信息：

1. 完整的错误消息
2. 浏览器控制台截图
3. Network 标签中 OAuth 请求的详细信息
4. 服务器日志（如适用）
5. 环境信息（OS, 浏览器版本等）

---

## 安全建议

✅ **已实现:**
- CSRF state 参数验证
- Token 过期检查（60秒提前）
- HTTPS 强制（生产环境）

🔒 **建议进一步改进:**
- [ ] 使用 PKCE (Proof Key for Code Exchange)
- [ ] 实现 refresh token 自动刷新
- [ ] 使用 HttpOnly cookie 存储 token（而非 localStorage）
- [ ] 添加 Content Security Policy (CSP) 头
- [ ] 定期更新依赖包
- [ ] 实现 rate limiting

---

## 性能优化

当前配置已包含：
- ✅ 代码分割（async import）
- ✅ 懒加载路由组件
- ✅ 静态资源缓存头配置
- ✅ Zustand 状态管理（轻量级）

建议：
- 考虑使用 CDN 分发静态资源
- 启用 Gzip 压缩
- 使用 Service Worker 离线支持（可选）

---

## 维护和更新

### 定期检查

- [ ] 每月检查依赖包更新
- [ ] 每季度审计安全日志
- [ ] 每半年更新 SSL 证书（自动化）

### 更新 OAuth 应用

如需更改 OAuth 应用设置：

1. new-api 管理后台 → OAuth Applications
2. 编辑 infinite-canvas 应用
3. 修改所需设置（如 Scopes、Auto Authorize）
4. 点击 Save
5. 如更改 Client Secret，需更新所有部署环境

---

## 回滚计划

如遇到问题需要回滚：

```bash
# 查看 Git 历史
git log --oneline | grep -i oauth

# 切换到上一个稳定版本
git checkout <stable_commit>

# 重新构建和部署
npm run build
```

---

## 联系和支持

- 技术文档: `docs/sso-testing-plan.md`
- 问题追踪: GitHub Issues
- 紧急支持: 联系 DevOps 团队

---

**更新历史:**
- 2026-10-13: 初始版本 v1.0 RC
