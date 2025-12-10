# GitHub Pages Deployment Guide

## Quick Deploy with gh-pages

Simply run:
```bash
npm run deploy
```

This will:
1. Build the project for GitHub Pages (with correct base path `/RosaSalon/`)
2. Create the necessary `404.html` file for SPA routing
3. Deploy the `dist/public` folder to the `gh-pages` branch automatically

## First Time Setup

1. **Make sure you have a GitHub repository:**
   - Your repo should be named `RosaSalon` (or update the base path in `vite.config.ts`)

2. **Configure GitHub Pages:**
   - Go to your repository Settings → Pages
   - Set Source to "Deploy from a branch"
   - Select branch: `gh-pages`
   - Select folder: `/ (root)`
   - Click Save

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Your site will be available at:**
   - `https://ruben-jim.github.io/RosaSalon/`

## Manual Build (if needed)

If you want to build without deploying:

```bash
npm run build:gh-pages
```

This creates the build in `dist/public/` which you can manually copy to your deployment location.

## Important Files

The deployment includes:
- `index.html` - Main entry point
- `404.html` - Handles client-side routing for SPAs
- `.nojekyll` - Prevents Jekyll processing
- `assets/` - All built JavaScript and CSS files

## Troubleshooting

- **404 errors on routes**: The `404.html` file should handle this automatically
- **Assets not loading**: Make sure the base path is `/RosaSalon/` in `vite.config.ts`
- **Still seeing 404**: Clear browser cache and wait a few minutes for GitHub Pages to update
- **Deployment fails**: Make sure you have push access to the repository and the `gh-pages` branch exists
