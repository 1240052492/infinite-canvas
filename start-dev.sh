#!/bin/bash
# 🚀 infinite-canvas SSO 集成 - 本地部署启动脚本

echo "================================================"
echo "🚀 infinite-canvas SSO 集成 - 本地部署"
echo "================================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# 检查依赖
cd /e/ZSXQ/new-api/infinite-canvas/web

if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo "✅ 依赖已安装"
    echo ""
fi

# 检查 .env.local
if [ ! -f ".env.local" ]; then
    echo "⚙️  创建 .env.local..."
    cat > .env.local << 'EOF'
# OAuth 2.0 Configuration - Local Development
VITE_OAUTH_CLIENT_ID=test_client_id_local
VITE_OAUTH_CLIENT_SECRET=test_client_secret_local
VITE_OAUTH_AUTHORIZATION_URL=http://localhost:3000/oauth/authorize
VITE_OAUTH_TOKEN_URL=http://localhost:3000/oauth/token
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback

# New-API Links
VITE_NEW_API_HOME=http://localhost:3000
VITE_NEW_API_WALLET=http://localhost:3000/wallet
VITE_NEW_API_KEYS=http://localhost:3000/keys
EOF
    echo "✅ .env.local 已创建"
    echo ""
fi

# 检查构建
if [ ! -d "dist" ]; then
    echo "🔨 构建项目..."
    npm run build
    echo "✅ 构建完成"
    echo ""
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo ""
echo "================================================"
echo "📍 访问地址: http://localhost:5173"
echo "🔐 OAuth 配置:"
echo "   - 授权地址: http://localhost:3000/oauth/authorize"
echo "   - Token 地址: http://localhost:3000/oauth/token"
echo "   - 回调地址: http://localhost:5173/oauth/callback"
echo ""
echo "⏱️  按 Ctrl+C 停止服务"
echo "================================================"
echo ""

npm run dev
