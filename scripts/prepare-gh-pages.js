import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist/public');

console.log('Preparing files for GitHub Pages deployment...');
console.log(`Source: ${distPath}`);
console.log('\nFiles to deploy:');

// List all files that should be deployed
function listFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...listFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
      console.log(`  - ${relativePath}`);
    }
  }
  
  return files;
}

const files = listFiles(distPath);

// Check for required files
const requiredFiles = ['index.html', '404.html', '.nojekyll'];
const missingFiles = requiredFiles.filter(file => !files.includes(file));

if (missingFiles.length > 0) {
  console.error('\n❌ Missing required files:', missingFiles.join(', '));
  console.error('Please run: npm run build:gh-pages');
  process.exit(1);
}

console.log('\n✓ All required files present');
console.log('\n📦 To deploy:');
console.log('  1. Copy all files from dist/public/ to your GitHub Pages branch');
console.log('  2. Or use GitHub Actions workflow (recommended)');
console.log('  3. Make sure GitHub Pages is configured to serve from the root or /docs folder');

