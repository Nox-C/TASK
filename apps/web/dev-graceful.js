#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

// Graceful shutdown handler
const cleanup = () => {
  console.log("🛑 Shutting down development server...");
  process.exit(0);
};

// Handle termination signals
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Start the dev server
const devServer = spawn("next", ["dev", "--port", process.argv[2] || "3000"], {
  stdio: "inherit",
  shell: true,
  cwd: __dirname,
});

devServer.on("close", (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

devServer.on("error", (err) => {
  console.error("Failed to start development server:", err);
  process.exit(1);
});
