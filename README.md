# TASK Control Panel MVP

A comprehensive trading bot management platform with automated task execution capabilities.

## 🏗️ Architecture

This is a monorepo containing:

- **API** (`apps/api`) - NestJS backend with PostgreSQL
- **Web** (`apps/web`) - Next.js frontend with Tailwind CSS
- **Worker** (`apps/worker`) - Background job processor
- **Packages** (`packages/`) - Shared libraries

## 🚀 Quick Start

1. **Prerequisites**
   - Node.js 18+
   - pnpm
   - Docker & Docker Compose

2. **Setup**
   ```bash
   ./setup.sh
   ```

3. **Development**
   ```bash
   ./dev.sh
   ```

4. **Access**
   - Web App: http://localhost:3000
   - API: http://localhost:3001

## 📁 Project Structure

```
TASK/
├── apps/
│   ├── api/          # NestJS API server
│   ├── web/          # Next.js frontend
│   └── worker/       # Background job processor
├── packages/
│   ├── shared/       # Shared types & utilities
│   ├── ui/           # UI components
│   ├── adapters/     # Trading adapters
│   └── backtester/   # Backtesting engine
├── infra/
│   └── docker/       # Database setup
└── docs/             # Documentation
```

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Start all services
./dev.sh

# Individual services
pnpm dev:api     # API server
pnpm dev:web     # Web frontend
pnpm dev:worker  # Background worker

# Build
pnpm build

# Database
cd apps/api
pnpm prisma migrate dev
pnpm prisma studio
```

## 🎯 Features

### Core Platform

- ✅ User authentication & sessions
- ✅ Trading bot management
- ✅ Real-time WebSocket connections
- ✅ Background job processing
- ✅ Audit logging

### Trading Features
- ✅ Order management
- ✅ Portfolio tracking
- ✅ P&L calculations
- ✅ Backtesting engine
- ✅ Market data replay

### Automation (TASK)
- ✅ Trigger-based automation
- ✅ Cron scheduling
- ✅ Webhook support
- ✅ Bot lifecycle management

### UI/UX
- ✅ Modern dark theme
- ✅ Responsive design
- ✅ Real-time updates
- ✅ Component library

## 🗄️ Database Schema

The platform uses PostgreSQL with Prisma ORM. Key entities:

- **Users** - Authentication & ownership
- **Bots** - Trading bot instances
- **Strategies** - Trading algorithms
- **Orders** - Trade execution
- **Tasks** - Automation workflows
- **Accounts** - Portfolio management

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Bots
- `GET /bots` - List bots
- `POST /bots` - Create bot
- `PUT /bots/:id` - Update bot
- `POST /bots/:id/start` - Start bot
- `POST /bots/:id/stop` - Stop bot

### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `DELETE /orders/:id` - Cancel order

### Tasks
- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task

## 🧪 Testing

```bash
# API tests
cd apps/api
pnpm test

# Integration tests
pnpm test:integration
```

## 🚢 Deployment

The platform is containerized and ready for deployment:

```bash
# Build production images
docker build -t task-api apps/api
docker build -t task-web apps/web

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Audit logging

## 📊 Monitoring

- Real-time system health checks
- Performance metrics
- Error tracking
- Audit trails

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.