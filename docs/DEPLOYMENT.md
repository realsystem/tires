# Deployment Guide

## GitHub Pages (Free & Easy)

Your app will be live at: **https://realsystem.github.io/tires/**

### Setup Steps:

1. **Enable GitHub Pages** (one-time setup):
   - Go to: https://github.com/realsystem/tires/settings/pages
   - Under "Build and deployment":
     - Source: **GitHub Actions**
   - Click Save

2. **Deploy** (automatic):
   - Already configured! Every push to `main` auto-deploys
   - GitHub Actions workflow builds and deploys automatically
   - Check progress: https://github.com/realsystem/tires/actions

3. **Access your app**:
   - Live URL: https://realsystem.github.io/tires/
   - Updates automatically on every push to main

### Manual Deploy:
```bash
git push origin main
# Wait 2-3 minutes for deployment
# Visit https://realsystem.github.io/tires/
```

---

## Alternative Hosting Options

### Option 2: Vercel (Recommended for Custom Domain)

**Features:**
- Custom domain support (e.g., tires.yourdomain.com)
- Automatic HTTPS
- Global CDN
- Auto-deploy on git push

**Setup:**
1. Visit: https://vercel.com/new
2. Import Git Repository → Select `realsystem/tires`
3. Framework Preset: **Vite**
4. Click Deploy
5. Done! Live at: https://tires.vercel.app

**Custom Domain:**
- Add in Vercel dashboard → Settings → Domains
- Update DNS records as shown
- Auto HTTPS certificate

---

### Option 3: Netlify

**Features:**
- Drag & drop deployment
- Custom domains
- Form handling (if needed later)
- Automatic HTTPS

**Setup:**
1. Visit: https://app.netlify.com/start
2. Connect to GitHub → Select `realsystem/tires`
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click Deploy
5. Live at: https://random-name.netlify.app

**Custom Domain:**
- Settings → Domain management → Add custom domain

---

### Option 4: Cloudflare Pages

**Features:**
- Ultra-fast global CDN
- Unlimited bandwidth (free)
- Auto HTTPS
- DDoS protection

**Setup:**
1. Visit: https://dash.cloudflare.com/
2. Pages → Create a project
3. Connect to GitHub → Select `realsystem/tires`
4. Build settings:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy
6. Live at: https://tires.pages.dev

---

## Performance Comparison

| Platform | Speed | Custom Domain | Free Tier | Auto Deploy |
|----------|-------|---------------|-----------|-------------|
| **GitHub Pages** | Fast | Yes (CNAME) | Unlimited | ✅ |
| **Vercel** | Ultra Fast | Yes (Easy) | 100GB bandwidth | ✅ |
| **Netlify** | Fast | Yes | 100GB bandwidth | ✅ |
| **Cloudflare** | Ultra Fast | Yes | Unlimited | ✅ |

---

## Recommended Setup

**For this project:**
1. **GitHub Pages** - Already configured, free, easy
2. **Vercel** - If you want custom domain or faster global CDN

**Both are free and production-ready.**

---

## Monitoring Deployment

**GitHub Pages:**
```bash
# Check deployment status
gh workflow view deploy.yml

# View live logs
gh run watch
```

**Or visit:**
- Actions tab: https://github.com/realsystem/tires/actions
- Click on latest "Deploy to GitHub Pages" workflow
- Monitor build and deployment

---

## Troubleshooting

### GitHub Pages not loading:
1. Check Settings → Pages → Source is "GitHub Actions"
2. Verify workflow ran: https://github.com/realsystem/tires/actions
3. Wait 2-3 minutes after first deploy

### Build fails:
1. Check Actions logs for errors
2. Verify `npm run build` works locally
3. Check Node version matches (18.x or 20.x)

### Wrong base path:
- vite.config.js sets `base: '/tires/'` for GitHub Pages
- For custom domain, remove the base or set to '/'

---

## Custom Domain Setup (GitHub Pages)

1. **Add CNAME file:**
   ```bash
   echo "tires.yourdomain.com" > dist/CNAME
   ```

2. **Update DNS records:**
   ```
   Type: CNAME
   Name: tires
   Value: realsystem.github.io
   ```

3. **Enable in GitHub:**
   - Settings → Pages → Custom domain
   - Enter: tires.yourdomain.com
   - Check "Enforce HTTPS"

---

## Environment Variables (if needed)

For different environments:

```javascript
// vite.config.js
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://api.example.com'
    )
  }
})
```

Set in hosting platform:
- **Vercel/Netlify**: Dashboard → Environment Variables
- **GitHub Pages**: Use GitHub Secrets + workflow env vars

---

## Next Steps

1. Push these changes to enable GitHub Pages
2. Visit https://github.com/realsystem/tires/settings/pages
3. Set Source to "GitHub Actions"
4. Wait 2-3 minutes
5. Access at: https://realsystem.github.io/tires/

**That's it!** Your tire calculator will be live and accessible worldwide.

---

## Custom Domain Redirect

To serve from your own domain (e.g., `overlandn.com/tires`):

**Nginx:**
```nginx
location /tires {
    return 301 https://realsystem.github.io/tires$request_uri;
}
```

**Apache:**
```apache
RedirectMatch 301 ^/tires(/.*)$ https://realsystem.github.io/tires$1
```

Then reload your web server. That's it!
