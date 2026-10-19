#!/bin/sh
set -e

# Executed automatically by the official nginx image entrypoint through /docker-entrypoint.d/*.sh before nginx starts.
# Generate runtime config.js from environment variables. Each analytics provider has an independent variable;
# unset providers remain disabled, load no scripts, and send no external requests. Multiple providers may be enabled together.

# GA4 and Baidu IDs contain only letters, numbers, and hyphens. Remove other characters
# so quotes and similar values cannot break the JavaScript strings in config.js as a defense-in-depth measure.
sanitize_id() {
    printf '%s' "$1" | tr -cd 'A-Za-z0-9-'
}

# URLs may contain "://", keep them intact but strip quotes/backslashes so they cannot break out of the JS string.
sanitize_url() {
    printf '%s' "$1" | tr -d '"\\'
}

# Top-nav hidden list only accepts letters and commas.
sanitize_hidden() {
    printf '%s' "$1" | tr -cd 'A-Za-z,'
}

GA4_ID=$(sanitize_id "${ANALYTICS_GA4_ID:-}")
BAIDU_ID=$(sanitize_id "${ANALYTICS_BAIDU_ID:-}")
NEW_API_BASE_URL=$(sanitize_url "${NEW_API_BASE_URL:-}")
TOP_NAV_HIDDEN=$(sanitize_hidden "${TOP_NAV_HIDDEN:-}")
DEFAULT_CHANNEL_BASE_URL=$(sanitize_url "${DEFAULT_CHANNEL_BASE_URL:-}")
LOCK_CHANNEL_BASE_URL=$(printf '%s' "${LOCK_CHANNEL_BASE_URL:-}" | tr -cd 'truefals')

cat > /usr/share/nginx/html/config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  ANALYTICS_GA4_ID: "${GA4_ID}",
  ANALYTICS_BAIDU_ID: "${BAIDU_ID}",
  NEW_API_BASE_URL: "${NEW_API_BASE_URL}",
  TOP_NAV_HIDDEN: "${TOP_NAV_HIDDEN}",
  DEFAULT_CHANNEL_BASE_URL: "${DEFAULT_CHANNEL_BASE_URL}",
  LOCK_CHANNEL_BASE_URL: "${LOCK_CHANNEL_BASE_URL}"
};
EOF
