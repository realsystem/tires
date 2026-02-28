# Deploy to overlandn.com/tires

## Quick Setup

Your tire calculator will be live at: **https://overlandn.com/tires/**

---

## Option 1: Manual Upload (5 minutes)

### Step 1: Build Production Bundle

```bash
cd /Users/segorov/Projects/tires
npm run build
```

This creates a `dist/` folder with optimized files (~500KB total).

### Step 2: Upload to Your Server

Upload the `dist/` folder contents to your server:

```bash
# Using SCP
scp -r dist/* your-server:/var/www/overlandn.com/tires/

# Or using SFTP
sftp your-server
> cd /var/www/overlandn.com/
> mkdir tires
> cd tires
> put -r dist/*
```

### Step 3: Configure Nginx (if using nginx)

Add to your nginx config for overlandn.com:

```nginx
# /etc/nginx/sites-available/overlandn.com

server {
    listen 80;
    server_name overlandn.com;

    # Your existing root location
    location / {
        root /var/www/overlandn.com;
        index index.html;
    }

    # Add tire calculator location
    location /tires/ {
        alias /var/www/overlandn.com/tires/;
        index index.html;
        try_files $uri $uri/ /tires/index.html;

        # Enable gzip compression
        gzip on;
        gzip_types text/css application/javascript application/json;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

Reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Configure Apache (if using Apache)

Add to your Apache config or `.htaccess`:

```apache
# /var/www/overlandn.com/tires/.htaccess

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /tires/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /tires/index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/css application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

---

## Option 2: Automated Deployment with GitHub Actions

Deploy automatically on every push to `main`.

### Step 1: Add SSH Key to GitHub Secrets

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/overlandn_deploy

# Add public key to your server's authorized_keys
cat ~/.ssh/overlandn_deploy.pub
# Copy and add to: /home/your-user/.ssh/authorized_keys on server

# Add private key to GitHub Secrets
# Go to: https://github.com/realsystem/tires/settings/secrets/actions
# Create new secret:
#   Name: SSH_PRIVATE_KEY
#   Value: (paste content of ~/.ssh/overlandn_deploy)

# Also add these secrets:
#   SSH_HOST: your-server.com (or IP address)
#   SSH_USER: your-username
#   SSH_PATH: /var/www/overlandn.com/tires
```

### Step 2: Create Deployment Workflow

Create `.github/workflows/deploy-overlandn.yml`:

```yaml
name: Deploy to overlandn.com

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "dist/*"
          target: ${{ secrets.SSH_PATH }}
          strip_components: 1
          rm: true

      - name: Restart web server (optional)
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            sudo systemctl reload nginx
            # or: sudo systemctl reload apache2
```

### Step 3: Push and Deploy

```bash
git add .github/workflows/deploy-overlandn.yml
git commit -m "Add automated deployment to overlandn.com"
git push origin main
```

Now every push to `main` automatically deploys to overlandn.com/tires!

---

## Option 3: Using Cloudflare with Custom Domain

If overlandn.com uses Cloudflare, you can use Cloudflare Pages with a custom path:

1. Deploy to Cloudflare Pages (see DEPLOYMENT.md)
2. Use Cloudflare Workers to proxy `/tires/*` to Pages
3. Benefits: Free, ultra-fast CDN, DDoS protection

---

## Verification Checklist

After deployment, verify:

- [ ] https://overlandn.com/tires/ loads the calculator
- [ ] Navigation works (refresh doesn't 404)
- [ ] Import/Export functionality works
- [ ] Browser console has no errors
- [ ] CSS and images load correctly
- [ ] Mobile responsive layout works

---

## SSL/HTTPS Setup

If overlandn.com already has SSL, the /tires path will automatically be covered.

If not, use Let's Encrypt (free):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d overlandn.com
```

---

## Quick Deploy Script

Create `deploy-overlandn.sh`:

```bash
#!/bin/bash

echo "Building production bundle..."
npm run build

echo "Deploying to overlandn.com/tires..."
rsync -avz --delete dist/ your-user@your-server:/var/www/overlandn.com/tires/

echo "Reloading web server..."
ssh your-user@your-server 'sudo systemctl reload nginx'

echo "✅ Deployed! Visit https://overlandn.com/tires/"
```

Make executable and run:
```bash
chmod +x deploy-overlandn.sh
./deploy-overlandn.sh
```

---

## Subdirectory vs Subdomain

**Current setup: overlandn.com/tires/** (subdirectory)
- ✅ No DNS changes needed
- ✅ Shares SSL certificate
- ✅ Easy to set up

**Alternative: tires.overlandn.com** (subdomain)
- Requires DNS A/CNAME record
- Separate SSL certificate (or wildcard cert)
- Change vite config: `base: '/'` instead of `'/tires/'`

---

## Updating the App

To update after code changes:

**Manual:**
```bash
npm run build
scp -r dist/* your-server:/var/www/overlandn.com/tires/
```

**Automated:**
Just push to GitHub:
```bash
git push origin main
# GitHub Actions deploys automatically
```

---

## Testing Locally with /tires Path

To test the production build locally:

```bash
npm run build
npx serve dist -p 8080
# Visit: http://localhost:8080/tires/
```

---

## Troubleshooting

### Issue: 404 on refresh
**Solution:** Ensure nginx/apache has `try_files` or rewrite rules (see configs above)

### Issue: CSS/JS not loading
**Solution:** Check that base path is `/tires/` in vite.config.js

### Issue: Blank page
**Solution:** Check browser console for path errors, verify base path

### Issue: Assets 404
**Solution:** Files should be in `/var/www/overlandn.com/tires/assets/`

---

## Performance Tips

1. **Enable Compression:**
   - Nginx: `gzip on;`
   - Apache: `mod_deflate`

2. **Cache Static Assets:**
   - Set far-future expires headers (1 year)

3. **Use CDN (optional):**
   - Cloudflare proxy (free)
   - Or serve directly (fast enough for this app)

4. **Monitor:**
   - Google Analytics (add to index.html if desired)
   - Server access logs

---

## Cost

**Hosting on overlandn.com/tires:**
- **$0** - Uses your existing server
- **Bandwidth:** ~500KB initial load, ~50KB cached
- **Storage:** ~2MB total

---

## Next Steps

1. Build: `npm run build`
2. Upload `dist/` to your server
3. Configure nginx/apache (see above)
4. Visit: https://overlandn.com/tires/
5. Share with the overlanding community!

---

**The tire calculator is perfect for overlandn.com!** 🚙⛰️
