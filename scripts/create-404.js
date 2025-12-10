import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist/public');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found. Please build the project first.');
  process.exit(1);
}

// Read the built index.html
let indexContent = fs.readFileSync(indexPath, 'utf-8');

// For GitHub Pages, we'll use the redirect script approach
// This converts /RosaSalon/dashboard to /RosaSalon/?/dashboard
const redirectScript = `
    <script>
      // GitHub Pages 404.html redirect for SPA routing
      // https://github.com/rafgraph/spa-github-pages
      (function() {
        var pathSegmentsToKeep = 1;
        var l = window.location;
        var redirect = l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
          l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
          l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
          (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
          l.hash;
        l.replace(redirect);
      })();
    </script>
`;

// Insert the redirect script before the closing </head> tag
// Make sure we don't duplicate it if it already exists
if (!indexContent.includes('pathSegmentsToKeep')) {
  indexContent = indexContent.replace('</head>', redirectScript + '</head>');
}
const notFoundContent = indexContent;

// Write 404.html
fs.writeFileSync(notFoundPath, notFoundContent, 'utf-8');

// Also create .nojekyll file to prevent Jekyll processing
const nojekyllPath = path.join(distPath, '.nojekyll');
fs.writeFileSync(nojekyllPath, '', 'utf-8');

console.log('✓ Created 404.html for GitHub Pages SPA routing');
console.log('✓ Created .nojekyll file');

