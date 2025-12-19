# Backtesting and Replay

This document describes the simple backtest replay runner and replay adapter.

- packages/adapters/src/replay/market.adapter.ts — a deterministic replay adapter that loads an array of ticks and emits price events to subscribers.
- packages/backtester/bin/run.ts — simple CLI to replay a JSON file of ticks. Usage: `node packages/backtester/bin/run.js <ticks.json> [intervalMs]` (currently requires running via ts-node or building).
- apps/api POST `/market/replay/ingest` — ingest ticks JSON into the `priceTick` table.
- apps/api POST `/market/replay/play` — play ticks from the DB and emit `market.price` websocket events.
- apps/worker processor `backtest.replay` — reads ticks from DB and logs them (placeholder for future streaming to services).

Next steps: integrate replay with the execution simulation pipeline so backtests reuse the live accounting services (LedgerService/RealizedService) for parity.
