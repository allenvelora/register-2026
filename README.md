# Register 2026

A React + TypeScript + Vite app for transaction entry with split distribution and tagging.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Share with your team

**Not sure which option?** Deploy first (Option 1). One link for everyone, no installs, and it stays up to date when you push. Use the repo (Option 2) if people need to run or edit the code locally.

### Option 1: Deploy (recommended)

Deploy so the team can use the app in the browser without installing anything.

- **Vercel** (recommended): From this folder, run:
  ```bash
  npx vercel
  ```
  The first time, you’ll be prompted to log in (browser). Then follow the prompts; Vercel will build and give you a URL to share. For a production URL, run `npx vercel --prod` after the first deploy.
  Alternatively, push the repo to GitHub and [import the project in Vercel](https://vercel.com/new); Vercel will use the included `vercel.json` and deploy on every push.
- **Netlify**: Push to GitHub, then in Netlify: **Add new site → Import from Git**. Build command: `npm run build`, publish directory: `dist`.
- **GitHub Pages**: After pushing to GitHub, use **Settings → Pages → Source: GitHub Actions** and add a workflow that runs `npm run build` and uploads the `dist` folder. Or use the [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) action.

### Option 2: Share the repo

1. Create a new repository on GitHub (or your org’s Git host).
2. In this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_ORG/register-2026.git
   git push -u origin main
   ```
3. Share the repo link. Teammates can clone and run:
   ```bash
   git clone https://github.com/YOUR_ORG/register-2026.git
   cd register-2026
   npm install && npm run dev
   ```

## Build for production

```bash
npm run build
```

Output is in `dist/`. Serve that folder with any static host (e.g. `npx serve dist` to test locally).

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start dev server         |
| `npm run build` | Production build      |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint            |
