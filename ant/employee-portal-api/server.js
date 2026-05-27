'use strict';

require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config');

const PORT = config.port || 3000;

const server = app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║       Employee Portal API - Enterprise Backend           ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Status   : ✅ Running                                   ║`);
  console.log(`║  Port     : ${PORT}                                             ║`);
  console.log(`║  Env      : ${config.nodeEnv}                              ║`);
  console.log(`║  SAP Host : ${config.sapBaseUrl}  ║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

module.exports = server;
