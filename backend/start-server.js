const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting backend server...\n');

const serverProcess = spawn('npx', ['ts-node', 'src/server.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});