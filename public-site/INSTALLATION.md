# Installation Instructions

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Step 1: Navigate to public-site folder

```bash
cd public-site
```

## Step 2: Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your dashboard URL:

```bash
# For local development (if dashboard runs on port 5000)
VITE_DASHBOARD_URL=http://localhost:5000

# For production
# VITE_DASHBOARD_URL=https://app.verihealth.com
```

## Step 3: Install Dependencies

```bash
npm install
```

This will install:
- React 18
- Vite 6
- Tailwind CSS 4
- Wouter (routing)
- Lucide React (icons)
- TypeScript

## Step 4: Start Development Server

```bash
npm run dev
```

The site will be running at: **http://localhost:5001**

## Step 5: Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

## Step 6: Preview Production Build

```bash
npm run preview
```

## File Structure After Installation

```
public-site/
├── node_modules/          # Installed dependencies (git ignored)
├── dist/                  # Production build (git ignored)
├── src/
│   ├── pages/
│   ├── components/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5001 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm install` | Install dependencies |
| `npm update` | Update dependencies |

## Troubleshooting

### Port 5001 already in use

Change port in `vite.config.ts`:

```typescript
server: {
  port: 5002, // or any available port
}
```

### Module not found errors

Make sure you ran `npm install` in the `public-site/` directory, not the root.

### Build errors

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Try `npm run build`

## Next Steps

After installation:
1. Customize content in `src/pages/`
2. Update colors in `tailwind.config.js`
3. Configure CS Cart integration (see DEPLOYMENT.md)
4. Deploy to production (see DEPLOYMENT.md)
