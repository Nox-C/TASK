gr#cs TASK Control Panel - Production Setup Guide

This guide walks you through setting up TASK as a production desktop application on Kali Linux.

## 🎯 Goal

Click Wall-E icon → Postgres starts → TASK builds → TASK starts → Chromium opens

Close Chromium → Everything stops cleanly → Next launch starts fresh

---

## ✅ Prerequisites (One-Time Setup)

### 1. Verify Required Tools

Run these commands to verify all tools are installed:

```bash
docker --version
docker compose version
pnpm --version
node --version
/usr/bin/chromium --version
curl --version
flock --version
```

If any are missing, install them first.

### 2. Docker Permissions

Ensure your user can run Docker without sudo:

```bash
groups | grep docker
```

If `docker` isn't listed, add yourself to the docker group:

```bash
sudo usermod -aG docker nox
# Log out and log back in for changes to take effect
```

---

## 🚀 Repository Setup (One-Time)

### 1. Install Dependencies

From the TASK directory:

```bash
cd /home/nox/TASK
pnpm install
```

### 2. Environment Files

The following environment files are already created in this repository:

- ✅ `apps/api/.env` - API configuration
- ✅ `apps/web/.env.local` - Web app configuration
- ✅ `docker-compose.yml` - Database service

### 3. Database Migrations

Run Prisma migrations to set up the database schema:

```bash
cd /home/nox/TASK/apps/api
pnpm prisma migrate dev
```

---

## 🖥️ Desktop Launcher Setup (One-Time)

### 1. Copy the Launcher Script

Copy the launcher script to your bin directory:

```bash
mkdir -p /home/nox/bin
cp /home/nox/TASK/task-control-panel.sh /home/nox/bin/task-control-panel
chmod +x /home/nox/bin/task-control-panel
```

### 2. Configure Wall-E Desktop Icon

Update your Wall-E desktop icon with these settings:

**Exec/Command:**
```bash
/bin/bash -lc "/home/nox/bin/task-control-panel"
```

**Important:** Make sure "Run in terminal" is **OFF**

---

## 📝 How It Works

### Startup Sequence:
1. 🔒 Lock file prevents duplicate instances
2. 🐘 Docker Compose starts Postgres database
3. 🔨 `pnpm build` builds both web and API
4. 🚀 `pnpm start` starts both applications
5. ⏳ Script waits for http://localhost:3000 to be ready
6. 🌐 Chromium opens in app mode

### Shutdown Sequence:
1. 🪟 You close the Chromium window
2. 🛑 Script detects window close
3. 🔪 Kills the entire app process group
4. 🐘 Stops Docker Compose
5. 🧹 Removes lock file

---

## 🎮 Daily Usage

### Starting TASK:
1. Click Wall-E icon on desktop
2. Wait for the app to build and start (first time is slower)
3. Control Panel opens automatically

### Stopping TASK:
1. Close the Chromium window
2. Everything stops automatically

### Next Launch:
- Starts cleanly without conflicts
- No manual cleanup needed

---

## 🔧 Troubleshooting

### Port Already in Use

Check what's using the ports:
```bash
ss -ltnp | grep -E '3000|3001|5432'
```

Kill leftover processes:
```bash
pkill -f 'pnpm start' || true
pkill -f 'node .*next' || true
pkill -f 'nest' || true
```

Reset Docker containers:
```bash
cd /home/nox/TASK
docker compose down
```

### Build or Start Failed

Check the log file:
```bash
cat $HOME/.local/state/task-control-panel.log
```

Or watch it in real-time:
```bash
tail -f $HOME/.local/state/task-control-panel.log
```

### Chromium Closes but Backend Still Running

Verify the launcher script has these critical lines:
- `setsid /usr/bin/env bash -lc 'pnpm start' >>"$LOG_FILE" 2>&1 &`
- `kill -- -"$APP_PID"`

If issues persist, manually kill processes:
```bash
pkill -f 'pnpm start'
docker compose down
```

### Database Issues

Reset the database:
```bash
cd /home/nox/TASK
docker compose down -v  # ⚠️ This deletes all data!
docker compose up -d db
cd apps/api
pnpm prisma migrate dev
```

---

## 📊 Database Management

### Running Migrations

When you update the database schema:

```bash
cd /home/nox/TASK/apps/api
pnpm prisma migrate dev --name describe_your_changes
```

### Viewing Database

```bash
cd /home/nox/TASK/apps/api
pnpm prisma studio
```

### Reset Database (⚠️ Deletes All Data)

```bash
cd /home/nox/TASK
docker compose down -v
docker compose up -d db
cd apps/api
pnpm prisma migrate dev
```

---

## 🔐 Security Notes

### For Production Use:

1. **Change JWT Secret:**
   - Edit `apps/api/.env`
   - Replace `JWT_SECRET` with a strong random value

2. **Change Database Password:**
   - Edit `docker-compose.yml` POSTGRES_PASSWORD
   - Update `DATABASE_URL` in `apps/api/.env`

3. **Restrict Network Access:**
   - Database only accessible from localhost
   - API only accessible from localhost
   - Web UI only accessible from localhost

---

## 📍 File Locations

- **Repo:** `/home/nox/TASK`
- **Launcher Script:** `/home/nox/bin/task-control-panel`
- **Log File:** `~/.local/state/task-control-panel.log`
- **Lock File:** `/tmp/task-control-panel.lock`
- **Database Volume:** Docker volume `task_pgdata`

---

## 🎯 Architecture

```
┌─────────────────┐
│  Wall-E Icon    │  Click to start
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Launcher Script │  task-control-panel
├─────────────────┤
│ 1. Lock File    │  Prevent duplicates
│ 2. Docker DB    │  Start Postgres
│ 3. Build        │  pnpm build
│ 4. Start        │  pnpm start
│ 5. Wait Ready   │  Poll localhost:3000
│ 6. Open Browser │  Chromium --app
│ 7. Wait Close   │  Wait on browser PID
│ 8. Cleanup      │  Kill app + stop docker
└─────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Running Application       │
├─────────────────────────────┤
│  Postgres (port 5432)       │
│  API (port 3001)            │
│  Web (port 3000)            │
│  Chromium App Window        │
└─────────────────────────────┘
         │
         ▼ (close window)
┌─────────────────┐
│    Cleanup      │
├─────────────────┤
│ Kill Process    │
│ Stop Docker     │
│ Remove Lock     │
└─────────────────┘
```

---

## ✅ Checklist

Before first launch:

- [ ] All prerequisites installed and verified
- [ ] User added to docker group (and re-logged in)
- [ ] Dependencies installed (`pnpm install`)
- [ ] Database migrations run (`prisma migrate dev`)
- [ ] Launcher script copied to `/home/nox/bin/task-control-panel`
- [ ] Launcher script is executable (`chmod +x`)
- [ ] Wall-E icon configured with correct Exec command
- [ ] "Run in terminal" is OFF for the desktop icon

---

## 🎉 You're Ready!

Click your Wall-E icon and enjoy your TASK Control Panel! 🤖

