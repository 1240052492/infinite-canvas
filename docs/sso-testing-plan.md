# infinite-canvas SSO 集成测试计划

**目标:** 验证 OAuth 2.0 SSO 集成的完整功能

**实施状态:** 核心代码已完成，本次测试验证其正确性

## 测试环境准备

### 前置条件
1. new-api 本地实例运行在 `http://localhost:3000`
2. new-api 已配置 OAuth 应用（infinite-canvas）：
   - Client ID: test_client_id
   - Client Secret: test_client_secret  
   - Redirect URI: `http://localhost:5173/oauth/callback`
3. infinite-canvas 运行在 `http://localhost:5173`
4. 本地 `.env.local` 已配置环境变量

### 环境变量配置
```bash
VITE_OAUTH_CLIENT_ID=test_client_id
VITE_OAUTH_CLIENT_SECRET=test_client_secret
VITE_OAUTH_AUTHORIZATION_URL=http://localhost:3000/oauth/authorize
VITE_OAUTH_TOKEN_URL=http://localhost:3000/oauth/token
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_NEW_API_HOME=http://localhost:3000
VITE_NEW_API_WALLET=http://localhost:3000/wallet
VITE_NEW_API_KEYS=http://localhost:3000/keys
```

## 测试案例

### Test 1: 未登录用户重定向
**描述:** 访问受保护路由时自动重定向到 OAuth 授权

**步骤:**
1. 清空 localStorage
2. 访问 `http://localhost:5173/canvas`
3. 观察是否重定向到 `http://localhost:3000/oauth/authorize`

**期望结果:** ✅ 自动重定向到 new-api OAuth 授权页面

**验证点:**
- AuthGuard 检查生效
- redirectToAuthorize() 调用成功
- URL 参数包含 client_id, redirect_uri, response_type=code, scope, state

---

### Test 2: OAuth 授权码流程
**描述:** 完整 OAuth 授权码交换流程

**步骤:**
1. 在 OAuth 授权页面登录 new-api
2. 同意授权
3. 观察是否回调到 `http://localhost:5173/oauth/callback?code=xxx&state=xxx`
4. 观察是否自动重定向到首页

**期望结果:** ✅ 完整授权流程成功，token 获取成功

**验证点:**
- OAuthCallback 正确解析 code 和 state
- state 参数验证通过（CSRF 防护）
- exchangeCodeForToken() 成功
- token 存储到 localStorage

---

### Test 3: State 参数篡改防护
**描述:** CSRF 攻击防护验证

**步骤:**
1. 手动构造回调 URL，state 参数不匹配
2. 访问 `http://localhost:5173/oauth/callback?code=xxx&state=wrong_state`

**期望结果:** ✅ 显示错误提示"无效的 state 参数"

**验证点:**
- getAndClearState() 返回不同的 state
- 错误处理正确
- 显示友好的错误消息

---

### Test 4: Token 过期处理
**描述:** Token 过期时自动重新授权

**步骤:**
1. 成功登录后查看 localStorage
2. 手动修改 `auth-storage.expiresAt` 为过去的时间戳
3. 刷新页面
4. 访问受保护路由

**期望结果:** ✅ 检测到 token 过期，自动重新授权

**验证点:**
- checkAuth() 检测过期
- isTokenExpired() 正确判断（60秒提前）
- 自动重定向到授权

---

### Test 5: 功能按钮跳转
**描述:** UI 中的功能按钮正常跳转到 new-api

**步骤:**
1. 成功登录后访问 infinite-canvas
2. 点击顶部导航栏中的按钮：
   - 🏠 首页按钮
   - 💳 钱包按钮
   - 🔑 Keys 按钮

**期望结果:** ✅ 三个按钮分别跳转到对应的 new-api 页面

**验证点:**
- 按钮 href 指向正确的 NEW_API_LINKS
- 在新标签页打开（target="_blank"）
- rel="noopener noreferrer" 设置正确

---

### Test 6: Token 本地存储验证
**描述:** Token 正确持久化到 localStorage

**步骤:**
1. 成功登录
2. 打开浏览器开发者工具 → Application → Local Storage
3. 查看 auth-storage 条目

**期望结果:** ✅ localStorage 中存储 token 和 expiresAt

**验证点:**
- Key: `auth-storage`（Zustand persist middleware）
- Value 包含：`token` 和 `expiresAt`
- 关闭浏览器重新打开，token 仍存在

---

### Test 7: 授权失败处理
**描述:** 授权失败时显示友好错误

**步骤:**
1. 修改 `.env.local` 中 token URL 为无效地址
2. 尝试通过 OAuth 流程
3. 观察错误处理

**期望结果:** ✅ 显示错误"登录失败，请重试"和重试按钮

**验证点:**
- try-catch 捕获异常
- 显示友好错误消息
- 提供"返回首页"按钮

---

### Test 8: 类型安全和构建
**描述:** 验证 TypeScript 类型和构建通过

**步骤:**
1. 运行 `npm run build`
2. 检查是否有类型错误
3. 检查最终产物

**期望结果:** ✅ 构建成功，无 TypeScript 错误

**验证点:**
- 所有接口定义完整
- 类型导入正确
- build 输出无错误

---

## 测试覆盖率总结

| 功能 | 覆盖 | 验证 |
|------|------|------|
| 未授权重定向 | Test 1 | ✅ |
| OAuth 流程 | Test 2 | ✅ |
| CSRF 防护 | Test 3 | ✅ |
| Token 过期 | Test 4 | ✅ |
| UI 按钮 | Test 5 | ✅ |
| 存储持久化 | Test 6 | ✅ |
| 错误处理 | Test 7 | ✅ |
| 类型安全 | Test 8 | ✅ |

## 测试执行命令

```bash
# 本地开发启动
npm run dev

# 构建验证
npm run build

# 运行单元测试（如有）
npm test
```

## 预期测试结果

所有 8 个测试用例通过，无功能缺陷，OAuth SSO 集成完整可用。

---

**测试日期:** 2026-10-13  
**测试员:** Codex Subagent  
**完成状态:** [待执行]
