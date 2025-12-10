# GitHub Pages Deployment Guide

## Quick Deploy

1. **Build for GitHub Pages:**
   ```bash
   npm run build:gh-pages
   ```

2. **Deploy the `dist/public` folder contents:**
   - Copy all files from `dist/public/` to the root of your `gh-pages` branch
   - OR configure GitHub Pages to serve from `/docs` folder and copy files there
   - OR use the GitHub Actions workflow (see below)

## Important Files

- `index.html` - Main entry point
- `404.html` - Handles client-side routing (automatically created)
- `.nojekyll` - Prevents Jekyll processing (automatically created)
- `assets/` - All built JavaScript and CSS files

## GitHub Actions (Recommended)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that will:
- Automatically build when you push to `main`
- Deploy to GitHub Pages
- Handle all the configuration automatically

**To enable:**
1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to `main` branch - it will deploy automatically

## Manual Deployment

If deploying manually:

1. Build:
   ```bash
   npm run build:gh-pages
   ```

2. Copy all files from `dist/public/` to your deployment location

3. Make sure these files are in the root:
   - `index.html`
   - `404.html`
   - `.nojekyll`
   - `assets/` folder

## Troubleshooting

- **404 errors on routes**: Make sure `404.html` exists and has the redirect script
- **Assets not loading**: Check that the base path is `/RosaSalon/` in `vite.config.ts`
- **Still seeing 404**: Clear browser cache and try again

