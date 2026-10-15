const { execSync } = require('node:child_process');

function clearPort(port) {
  try {
    const result = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`, {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8'
    });
    if (result && result.trim()) {
      console.log(`Cleared port ${port}`);
    }
  } catch (error) {
    // Ignore environment-specific failures. The app should still continue if no process is bound.
  }
}

clearPort(3000);
clearPort(5000);
