#!/usr/bin/env bash

echo "🔍 TASK Prerequisites Verification"
echo "===================================="
echo ""

ERRORS=0

# Check Docker
echo -n "Checking Docker... "
if command -v docker >/dev/null 2>&1; then
  VERSION=$(docker --version | cut -d' ' -f3 | sed 's/,//')
  echo "✅ $VERSION"
else
  echo "❌ NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if docker compose version >/dev/null 2>&1; then
  VERSION=$(docker compose version | cut -d' ' -f4)
  echo "✅ $VERSION"
else
  echo "❌ NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi

# Check pnpm
echo -n "Checking pnpm... "
if command -v pnpm >/dev/null 2>&1; then
  VERSION=$(pnpm --version)
  echo "✅ $VERSION"
else
  echo "❌ NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi

# Check Node.js
echo -n "Checking Node.js... "
if command -v node >/dev/null 2>&1; then
  VERSION=$(node --version)
  echo "✅ $VERSION"
else
  echo "❌ NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi

# Check Chromium
echo -n "Checking Chromium... "
if [ -f "/usr/bin/chromium" ]; then
  VERSION=$(/usr/bin/chromium --version 2>/dev/null | cut -d' ' -f2 || echo "unknown")
  echo "✅ $VERSION"
else
  echo "❌ NOT FOUND at /usr/bin/chromium"
  ERRORS=$((ERRORS + 1))
fi

# Check curl
echo -n "Checking curl... "
if command -v curl >/dev/null 2>&1; then
  VERSION=$(curl --version | head -1 | cut -d' ' -f2)
  echo "✅ $VERSION"
else
  echo "❌ NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi

# Check flock
echo -n "Checking flock... "
if command -v flock >/dev/null 2>&1; then
  echo "✅ installed"
else
  echo "❌ NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "Docker Permissions Check:"
echo -n "Checking if user is in docker group... "
if groups | grep -q docker; then
  echo "✅ YES"
else
  echo "⚠️  NO - Run: sudo usermod -aG docker \$USER"
  echo "   Then log out and log back in"
  ERRORS=$((ERRORS + 1))
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "🎉 All prerequisites are satisfied!"
  exit 0
else
  echo "❌ $ERRORS prerequisite(s) missing or misconfigured"
  echo ""
  echo "Please install missing tools and re-run this script."
  exit 1
fi
