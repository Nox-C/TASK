#!/usr/bin/env node
import { runReplayFromFile } from '../src/runner';

const file = process.argv[2];
const ms = Number(process.argv[3]) || 1000;
if (!file) { console.error('usage: run <ticks.json> [intervalMs]'); process.exit(1); }

runReplayFromFile(file, { intervalMs: ms }).then(()=> console.log('replay finished')).catch(err=>{ console.error(err); process.exit(1); });
