const fs = require('fs');
const cp = require('child_process');

console.log('Current directory:', process.cwd());

if (fs.existsSync('client')) {
  console.log('Detected root directory. Ensuring client dependencies are installed...');
  if (!fs.existsSync('client/node_modules')) {
    cp.execSync('cd client && npm install --no-audit --no-fund', { stdio: 'inherit' });
  }
  console.log('Building DEVNEXUS TECH client...');
  cp.execSync('cd client && npm run build', { stdio: 'inherit' });
  if (fs.existsSync('client/dist')) {
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    fs.cpSync('client/dist', 'dist', { recursive: true });
    console.log('Copied client/dist to root dist.');
  }
} else {
  console.log('Detected client directory. Building Vite...');
  cp.execSync('npx vite build', { stdio: 'inherit' });
}

console.log('Build complete successfully.');
