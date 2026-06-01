import { execSync } from 'child_process';

console.log('\x1b[94m\x1b[1m--- Universal Debug Purity Check ---\x1b[0m');
try {
  const output = execSync('node scripts/unbox_protocol.cjs --dry-run', { encoding: 'utf8' });
  const sanitizingLines = output.split('\n').filter(line => line.includes('[*] Sanitizing'));
  
  if (sanitizingLines.length > 0) {
    console.error('\x1b[91m[!] Purity check failed! The following files contain forbidden debug or simulation patterns:\x1b[0m');
    sanitizingLines.forEach(line => console.error(line.trim()));
    console.error('\x1b[93m[i] Please run "npm run unbox" to sanitize the codebase.\x1b[0m');
    process.exit(1);
  } else {
    console.log('\x1b[92m[+] Purity check passed! Codebase is clean.\x1b[0m');
    process.exit(0);
  }
} catch (error) {
  console.error('\x1b[91m[!] Failed to execute unbox protocol check:\x1b[0m', error.message || error);
  process.exit(1);
}
