# VeriHealth Public Website - Deployment Guide

## Quick Start

### 1. Install Dependencies

```bash
cd public-site
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:5001`

### 3. Build for Production

```bash
npm run build
```

## Deployment Strategies

### Strategy 1: Separate Subdomains (Recommended)

Best for clean separation and independent scaling.

**Setup:**
- Public site → `www.verihealth.com`
- Dashboard → `app.verihealth.com` or `portal.verihealth.com`

**Advantages:**
- Clean separation
- Independent deployments
- Easy to scale separately
- Clear user experience

**Deployment Steps:**

**For Vercel:**

1. Public Site:
```bash
cd public-site
vercel --prod
```

2. Configure domain:
   - Go to Vercel dashboard
   - Add custom domain: `www.verihealth.com`
   - Vercel will provide DNS records

3. Dashboard (separate deployment):
```bash
cd ../
vercel --prod
```

4. Configure domain: `app.verihealth.com`

**For Netlify:**

1. Build public site:
```bash
cd public-site
npm run build
```

2. Deploy:
```bash
netlify deploy --prod --dir=dist
```

3. Configure custom domain in Netlify dashboard

### Strategy 2: Reverse Proxy (Single Server)

Use Nginx to route traffic based on path/subdomain.

**Nginx Configuration:**

```nginx
# Public site (www)
server {
    listen 80;
    server_name www.verihealth.com verihealth.com;

    root /var/www/public-site/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}

# Dashboard (app subdomain)
server {
    listen 80;
    server_name app.verihealth.com portal.verihealth.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Strategy 3: Cloudflare Pages

**Steps:**

1. Push code to GitHub/GitLab

2. Connect repository to Cloudflare Pages

3. Build settings:
   - Build command: `cd public-site && npm run build`
   - Build output directory: `public-site/dist`
   - Root directory: `/`

4. Configure custom domain

5. Deploy dashboard separately on Cloudflare Workers or another service

### Strategy 4: AWS S3 + CloudFront

**For Public Site (Static):**

```bash
# Build
cd public-site
npm run build

# Deploy to S3
aws s3 sync dist/ s3://www.verihealth.com --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

**CloudFront Configuration:**
- Origin: S3 bucket
- Custom domain: `www.verihealth.com`
- SSL certificate: ACM
- Default root object: `index.html`
- Error pages: 404 → `/index.html` (for SPA routing)

**For Dashboard (Dynamic):**
- Deploy to EC2, ECS, or Lambda
- Subdomain: `app.verihealth.com`

## Environment Configuration

### Public Site (No Environment Variables Needed)

The public site is completely static and doesn't require environment variables.

### Dashboard (Requires Environment Variables)

Set these in your deployment platform:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
PORT=5000
```

## Portal Redirect Setup

The `/portal` route automatically redirects based on user authentication:

**Redirect Flow:**
1. User clicks "Clinician Portal" or visits `/portal`
2. JavaScript checks localStorage for auth token and user role
3. Redirects based on user state:
   - **Logged in clinician/admin** → Dashboard root (Supabase Auth auto-redirects to dashboard)
   - **Not logged in** → Dashboard root (Supabase Auth prompts login)
   - **Logged in patient/wrong role** → Public site home

**Environment Configuration:**

Set the dashboard URL in your environment variables:

**Development (.env):**
```bash
VITE_DASHBOARD_URL=http://localhost:5000
```

**Production (Vercel/Netlify):**
```bash
VITE_DASHBOARD_URL=https://app.verihealth.com
```

**Deployment Platforms:**

**Vercel:**
```bash
vercel env add VITE_DASHBOARD_URL production
# Enter: https://app.verihealth.com
```

**Netlify:**
In Netlify dashboard:
- Site Settings → Environment Variables
- Add: `VITE_DASHBOARD_URL` = `https://app.verihealth.com`

**CloudFlare Pages:**
In Pages dashboard:
- Settings → Environment Variables
- Production: `VITE_DASHBOARD_URL` = `https://app.verihealth.com`

**How It Works:**

The portal redirect uses a configurable `DASHBOARD_URL`:

```typescript
// Reads from environment variable, falls back to current origin
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || window.location.origin;

// Redirects
if (authToken && user?.role === 'clinician') {
  window.location.href = DASHBOARD_URL + '/';  // → https://app.verihealth.com/
}
```

**Important:** The dashboard's existing Supabase Auth middleware will:
- Check if user is authenticated
- Redirect unauthenticated users to `/login`
- Load dashboard for authenticated clinicians/admins

## CS Cart Integration

### Shop Page Setup

1. **API Proxy Configuration:**

Update `public-site/vite.config.ts`:

```typescript
export default defineConfig({
  // ... existing config ...
  server: {
    port: 5001,
    host: '0.0.0.0',
    proxy: {
      '/api/cart': {
        target: 'https://your-cs-cart-domain.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/cart/, '/api/4.0'),
      },
    },
  },
});
```

2. **Update Shop Component:**

```typescript
// In public-site/src/pages/Shop.tsx

const handleAddToCart = async (productId: number) => {
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CS_CART_API_KEY}`,
      },
      body: JSON.stringify({
        product_id: productId,
        amount: 1,
      }),
    });

    if (response.ok) {
      // Redirect to CS Cart checkout
      window.location.href = 'https://your-cs-cart-domain.com/checkout';
    } else {
      alert('Failed to add item to cart');
    }
  } catch (error) {
    console.error('Cart error:', error);
    alert('Failed to add item to cart');
  }
};
```

## Performance Optimization

### 1. Enable Gzip Compression

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

**Cloudflare:**
- Enabled by default

### 2. Cache Static Assets

**Nginx:**
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**CloudFront:**
- Set TTL to 1 year for static assets
- Use versioned filenames (Vite does this automatically)

### 3. Lazy Load Images

Images in the pages already use Unsplash's auto-optimization (`?auto=format&fit=crop&q=80`).

### 4. Preload Critical Assets

Update `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
```

## SSL/TLS Configuration

### Let's Encrypt (Free)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d www.verihealth.com -d verihealth.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

### Cloudflare SSL

1. Go to SSL/TLS settings
2. Select "Full (strict)" mode
3. Enable "Always Use HTTPS"

## Monitoring & Analytics

### Google Analytics

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Uptime Monitoring

Use:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor these URLs:
- `https://www.verihealth.com/`
- `https://app.verihealth.com/api/health` (if you add health check endpoint)

## SEO Checklist

✅ Meta tags configured in `index.html`  
✅ Semantic HTML structure  
✅ Mobile responsive  
✅ Fast loading (Vite optimizations)  
☐ Submit sitemap to Google Search Console  
☐ Add robots.txt  
☐ Set up Google Business Profile  
☐ Build backlinks  

### Create Sitemap

Create `public-site/public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.verihealth.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.verihealth.com/about</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.verihealth.com/shop</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.verihealth.com/contact</loc>
    <priority>0.7</priority>
  </url>
</urlset>
```

### Create robots.txt

Create `public-site/public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://www.verihealth.com/sitemap.xml
```

## Troubleshooting

### Issue: 404 on page refresh

**Cause:** SPA routing not configured on server

**Fix (Nginx):**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Fix (Netlify):**
Create `public-site/public/_redirects`:
```
/*  /index.html  200
```

### Issue: CSS not loading

**Cause:** Incorrect base URL

**Fix:** Check `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/', // Use '/' for root deployment
});
```

### Issue: Fonts not loading

**Cause:** CORS or font URL incorrect

**Fix:** Use Google Fonts CDN (already configured in `index.html`)

## Maintenance

### Update Dependencies

```bash
cd public-site
npm update
npm audit fix
```

### Monitor Bundle Size

```bash
npm run build -- --mode production
```

Check `dist/` folder size. Should be < 500KB for optimal performance.

## Rollback Strategy

### Vercel
```bash
vercel rollback
```

### Netlify
- Go to Deploys tab
- Click "Publish deploy" on previous version

### S3 + CloudFront
```bash
# Sync from backup
aws s3 sync s3://backup-bucket/ s3://www.verihealth.com/ --delete
aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/*"
```

## Support

For deployment issues:
- Check logs in deployment platform
- Test locally: `npm run build && npm run preview`
- Contact: devops@verihealth.com
