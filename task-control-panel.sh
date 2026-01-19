#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/tmp/Nox-C/TASK"
URL="http://localhost:3000"
LOCK="/tmp/task-control-panel.lock"
CHROMIUM_BIN="/usr/bin/chromium"
LOG_DIR="$HOME/.local/state"
LOG_FILE="$LOG_DIR/task-control-panel.log"

mkdir -p "$LOG_DIR"

# Prevent duplicates
exec 9>"$LOCK"
if ! flock -n 9; then
  "$CHROMIUM_BIN" --new-window --app="$URL" >/dev/null 2>&1 &
  exit 0
fi

cleanup() {
  echo "[task-control-panel] cleanup" >>"$LOG_FILE" 2>&1 || true

  # Stop the app process group
  if [[ -n "${APP_PID:-}" ]]; then
    kill -- -"$APP_PID" >>"$LOG_FILE" 2>&1 || true
  fi

  # Stop containers
  (cd "$REPO_DIR" && /usr/bin/docker compose down) >>"$LOG_FILE" 2>&1 || true
}
trap cleanup EXIT INT TERM

echo "[task-control-panel] starting" >>"$LOG_FILE" 2>&1

cd "$REPO_DIR"

echo "[task-control-panel] docker compose up" >>"$LOG_FILE" 2>&1
/usr/bin/docker compose up -d db >>"$LOG_FILE" 2>&1

echo "[task-control-panel] pnpm build" >>"$LOG_FILE" 2>&1
pnpm build >>"$LOG_FILE" 2>&1

echo "[task-control-panel] pnpm start" >>"$LOG_FILE" 2>&1
setsid /usr/bin/env bash -lc 'pnpm start' >>"$LOG_FILE" 2>&1 &
APP_PID=$!

# Wait for web UI
echo "[task-control-panel] waiting for $URL" >>"$LOG_FILE" 2>&1
for i in $(seq 1 120); do
  if curl -fsS "$URL" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[task-control-panel] opening chromium app window" >>"$LOG_FILE" 2>&1
"$CHROMIUM_BIN" --new-window --app="$URL" --no-first-run --disable-session-crashed-bubble >/dev/null 2>&1 &
BROWSER_PID=$!

# When you close the window, the script exits and cleanup() runs.
wait "$BROWSER_PID" || true

