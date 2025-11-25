# VeriHealth Public Website

This is the public-facing marketing website for VeriHealth, separate from the clinician dashboard.

## Project Structure

```
public-site/
├── src/
│   ├── pages/
│   │   ├── Home.tsx          # Landing page with hero, features, CTA
│   │   ├── About.tsx         # Company info, mission, team
│   │   ├── Shop.tsx          # Product catalog (proxied to CS Cart)
│   │   └── Contact.tsx       # Contact form with success message
│   ├── components/
│   │   ├── Navbar.tsx        # Responsive navigation with portal link
│   │   └── Footer.tsx        # Footer with links and contact info
│   ├── App.tsx               # Routing and portal redirect logic
│   ├── main.tsx              # React entry point
│   └── index.css             # Tailwind CSS imports
├── index.html                # HTML template with SEO meta tags
├── vite.config.ts            # Vite configuration (port 5001)
├── tailwind.config.js        # Tailwind with medical theme
└── package.json              # Dependencies
```

## Features

- ✅ **5 Routes**: Home, About, Shop, Contact, Portal redirect
- ✅ **Responsive Design**: Mobile-first, works on all devices
- ✅ **Medical Theme**: White + blue, clean and professional
- ✅ **SEO Optimized**: Meta tags, semantic HTML
- ✅ **Portal Redirect**: Auth-aware routing to clinician dashboard
- ✅ **Contact Form**: Client-side validation with success message
- ✅ **Product Catalog**: Ready for CS Cart proxy integration

## Development

### Install Dependencies

```bash
cd public-site
npm install
```

### Configure Dashboard URL (REQUIRED)

**⚠️ IMPORTANT:** The public site requires the dashboard URL to be configured. Without it, the portal redirect will not work.

The `.env` file is already included with a default development configuration. For production, update it:

Edit `.env`:
```bash
# For local development (dashboard running on port 5000) - DEFAULT
VITE_DASHBOARD_URL=http://localhost:5000

# For production with separate subdomain
# VITE_DASHBOARD_URL=https://app.verihealth.com
```

**What happens if not configured:**
- Portal redirect will show a configuration error page
- Console will display helpful error message
- Users cannot access the clinician dashboard

### Run Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:5001`

### Build for Production

```bash
npm run build
```

Output will be in `public-site/dist/`

## Portal Redirect Logic

The `/portal` route implements auth-aware redirection:

| User State | Redirect Behavior |
|------------|-------------------|
| Logged in clinician/admin | Redirect to dashboard root (configured via `VITE_DASHBOARD_URL`) |
| Logged in patient/wrong role | Redirect to `/` (public home) |
| Not logged in | Redirect to dashboard root (dashboard's Supabase Auth prompts login) |

This uses the same localStorage keys as the main dashboard:
- `verihealth_auth_token`: JWT token
- `verihealth_user`: User object with role

## Deployment

### Option 1: Separate Subdomain (Recommended)

Deploy the public site to `www.verihealth.com` and the dashboard to `app.verihealth.com`:

**Vercel / Netlify:**
1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Configure DNS:
   - `www` → Public site
   - `app` → Dashboard (deployed separately)

**Environment Variables:**
- Not required for public site (static)
- Dashboard needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### Option 2: Same Domain, Different Paths

Serve public site at root (`/`) and dashboard at `/dashboard`:

**Nginx Configuration:**
```nginx
server {
  listen 80;
  server_name verihealth.com;

  # Public site
  location / {
    root /var/www/public-site/dist;
    try_files $uri $uri/ /index.html;
  }

  # Dashboard
  location /dashboard {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
  }
}
```

### Option 3: Replit Deployment

1. **Public Site**: Deploy from `public-site/` folder
   - Run: `npm run build`
   - Serve: Static files from `dist/`

2. **Dashboard**: Deploy from project root
   - Already configured in main project

## Shop Integration (CS Cart)

The Shop page includes placeholder product cards. To integrate with CS Cart:

1. **Update `handleAddToCart` function in `Shop.tsx`:**

```typescript
const handleAddToCart = async (productId: number) => {
  const response = await fetch('/api/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity: 1 }),
  });
  
  if (response.ok) {
    window.location.href = 'https://your-cs-cart-domain.com/checkout';
  }
};
```

2. **Set up API proxy in Vite config:**

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api/cart': {
        target: 'https://your-cs-cart-domain.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cart/, '/api'),
      },
    },
  },
});
```

## Customization

### Update Colors

Edit `tailwind.config.js` to change the medical blue theme:

```javascript
colors: {
  medical: {
    blue: {
      500: '#your-color',
      600: '#your-color',
      // ...
    },
  },
}
```

### Update Content

- **Company Info**: Edit `src/pages/About.tsx`
- **Products**: Edit `products` array in `src/pages/Shop.tsx`
- **Contact Details**: Edit `src/components/Footer.tsx`

### Update Meta Tags

Edit `index.html` to change SEO meta tags:

```html
<title>Your Title</title>
<meta name="description" content="Your description" />
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Routing**: Wouter (lightweight React router)
- **Icons**: Lucide React

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - VeriHealth Inc.
