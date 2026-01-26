# TASK Production Scripts

Helper scripts for setting up and managing the TASK Control Panel in production.

## Available Scripts

### verify-prerequisites.sh

Verifies that all required tools and permissions are correctly configured.

```bash
./scripts/verify-prerequisites.sh
```

**Checks:**

- Docker
- Docker Compose
- pnpm
- Node.js
- Chromium
- curl
- flock
- Docker group membership

### setup-database.sh

Sets up the PostgreSQL database and runs migrations.

```bash
./scripts/setup-database.sh
```

**Steps:**

1. Starts PostgreSQL container
2. Waits for database to be ready
3. Runs Prisma migrations
4. Generates Prisma Client

## Quick Start

For first-time setup:

```bash
# 1. Verify prerequisites
./scripts/verify-prerequisites.sh

# 2. Install dependencies
pnpm install

# 3. Setup database
./scripts/setup-database.sh

# 4. Copy launcher script
cp task-control-panel.sh /home/nox/bin/task-control-panel
chmod +x /home/nox/bin/task-control-panel
```

For detailed instructions, see [PRODUCTION_SETUP.md](../PRODUCTION_SETUP.md).
