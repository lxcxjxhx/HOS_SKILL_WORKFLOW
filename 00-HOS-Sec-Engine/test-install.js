// Test install using local script
const { execSync } = require('child_process');
const path = require('path');

try {
  const scriptPath = path.join(__dirname, 'scripts', 'install-lite.js');
  console.log('Running install-lite.js with --help first...');
  const help = execSync(`node "${scriptPath}" --help`, { encoding: 'utf8' });
  console.log(help);
  
  console.log('\n--- Testing with --target trae --all (non-interactive) ---');
  const result = execSync(`node "${scriptPath}" --target trae --all --global`, { 
    encoding: 'utf8',
    timeout: 120000,
    stdio: 'inherit'
  });
} catch (err) {
  console.error('Error:', err.message);
  console.error('stdout:', err.stdout);
  console.error('stderr:', err.stderr);
}
