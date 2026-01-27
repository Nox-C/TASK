# 🤖 WALL-E TASK Trading Bot Control Panel

A production-ready, WALL-E themed trading bot automation platform for CEX and DEX.

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Docker & Docker Compose

### Installation

#### Linux/Mac:
\`\`\`bash
chmod +x setup.sh run.sh
./setup.sh
./run.sh
\`\`\`

#### Windows:
\`\`\`batch
setup.bat
run.bat
\`\`\`

### Manual Setup:
\`\`\`bash
# 1. Install dependencies
pnpm install

# 2. Start Docker services
docker-compose up -d

# 3. Setup database
cd packages/database
pnpm db:push
cd ../..

# 4. Seed initial data
node scripts/seed.js

# 5. Start API (Terminal 1)
pnpm dev:api

# 6. Start Web (Terminal 2)
pnpm dev:web

# 7. Open http://localhost:3001/automation
\`\`\`

## 🎯 Features

✅ **Bot Management** - Create, start, stop, delete trading bots  
✅ **Real-time KPIs** - Total bots, active bots, P&L, win rate  
✅ **Performance Charts** - Visualize bot performance over time  
✅ **Strategy Selection** - Multiple pre-built strategies  
✅ **Exchange Support** - Binance, Coinbase, and more  
✅ **WALL-E Theme** - Beautiful dark theme with yellow accents  

## 🏗️ Architecture

\`\`\`
TASK/
├── apps/
│ ├── api/ # NestJS Backend (Port 3000)
│ ├── web/ # Next.js Frontend (Port 3001)
│ └── worker/ # Background Processing
├── packages/
│ ├── database/ # Prisma Schema
│ └── shared/ # Shared Utilities
└── docker-compose.yml
\`\`\`

## 🔧 API Endpoints

### Bots
- \`GET /bots\` - List all bots
- \`GET /bots/metrics\` - Get KPI metrics
- \`POST /bots\` - Create new bot
- \`PATCH /bots/:id\` - Update bot
- \`DELETE /bots/:id\` - Delete bot
- \`POST /bots/:id/start\` - Start bot
- \`POST /bots/:id/stop\` - Stop bot

### Strategies
- \`GET /strategies\` - List available strategies

## 🎨 WALL-E Theme

**Colors:**
- Primary: \`#FFB800\` (WALL-E Yellow)
- Background: \`#0D1B2A\` (Dark Blue)
- Surface: \`#1B2838\` (Card Background)
- Success: \`#00C853\` (Green)
- Danger: \`#F44336\` (Red)

## 📝 Environment Variables

### API (\`apps/api/.env\`):
\`\`\`env
DATABASE_URL="postgresql://task:task123@localhost:5432/task_trading"
PORT=3000
\`\`\`

### Web (\`apps/web/.env.local\`):
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

## 🚀 Deployment

### Docker Production:
\`\`\`bash
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### Build for Production:
\`\`\`bash
pnpm build
pnpm start
\`\`\`

## 🐛 Troubleshooting

**Database connection failed:**
\`\`\`bash
docker-compose down
docker-compose up -d
sleep 5
cd packages/database && pnpm db:push
\`\`\`

**Port already in use:**
- Change ports in \`docker-compose.yml\` 
- Update \`apps/api/.env\` PORT
- Update \`apps/web/.env.local\` NEXT_PUBLIC_API_URL

## 📚 Documentation

- [Architecture](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Contributing](./CONTRIBUTING.md)

## 📄 License

MIT License - See [LICENSE](./LICENSE)

---

**Built with ❤️ by WALL-E 🤖**
