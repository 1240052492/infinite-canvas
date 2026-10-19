// Runtime configuration. This file is regenerated from environment variables by
// docker-entrypoint.sh at container startup; the values below are local development
// defaults and can be edited freely without touching any application code.
//
// NEW_API_BASE_URL         顶栏 主页/钱包/Key 图标的跳转基地址，支持相对路径（如 "/"）
// TOP_NAV_HIDDEN           需要隐藏的顶栏图标，逗号分隔：home,wallet,keys,docs,github
// DEFAULT_CHANNEL_BASE_URL 渠道默认接口地址（新增渠道与默认渠道均使用它）
// LOCK_CHANNEL_BASE_URL    "true" 时所有渠道接口地址强制锁定为上面的地址，不可编辑
window.__RUNTIME_CONFIG__ = window.__RUNTIME_CONFIG__ || {
    NEW_API_BASE_URL: "http://localhost:3002",
    TOP_NAV_HIDDEN: "",
    DEFAULT_CHANNEL_BASE_URL: "http://localhost:3002",
    LOCK_CHANNEL_BASE_URL: "true",
};
