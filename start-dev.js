const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Omni Folio Guard Development Environment...\n');

// Start backend server
console.log('📡 Starting Backend Server...');
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend-example'),
  stdio: 'inherit',
  shell: true
});

// Start frontend dev server
console.log('🎨 Starting Frontend Development Server...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});

// Handle errors
backend.on('error', (err) => {
  console.error('Backend error:', err);
});

frontend.on('error', (err) => {
  console.error('Frontend error:', err);
});

console.log('✅ Both servers are starting up...');
console.log('🌐 Frontend: http://localhost:5173');
console.log('🔗 Backend API: http://localhost:3001');
console.log('📊 Health Check: http://localhost:3001/api/health');
console.log('\nPress Ctrl+C to stop both servers');
