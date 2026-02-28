# Redirect overlandn.com/tires to GitHub Pages

**Simple redirect from your domain to the GitHub Pages deployment.**

Your tire calculator will be accessible at: **https://overlandn.com/tires/**
Served from: **https://realsystem.github.io/tires/**

---

## Option 1: Simple Redirect (Nginx)

Add to your nginx config for overlandn.com:

```nginx
# /etc/nginx/sites-available/overlandn.com

server {
    listen 80;
    listen 443 ssl;
    server_name overlandn.com;

    # Your existing SSL config
    # ssl_certificate ...
    # ssl_certificate_key ...

    # Your existing root location
    location / {
        root /var/www/overlandn.com;
        index index.html;
    }

    # Redirect /tires to GitHub Pages
    location /tires {
        return 301 https://realsystem.github.io/tires$request_uri;
    }

    # Alternative: Keep URL but proxy content
    # location /tires/ {
    #     proxy_pass https://realsystem.github.io/tires/;
    #     proxy_set_header Host realsystem.github.io;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_ssl_server_name on;
    # }
}
```

Reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Result:**
- User visits: `https://overlandn.com/tires`
- Redirects to: `https://realsystem.github.io/tires/`
- URL changes in browser (301 redirect)

---

## Option 2: Transparent Proxy (Nginx)

Keep overlandn.com URL visible (doesn't change to GitHub Pages):

```nginx
# /etc/nginx/sites-available/overlandn.com

server {
    listen 80;
    listen 443 ssl;
    server_name overlandn.com;

    # Your existing SSL config
    # ssl_certificate ...
    # ssl_certificate_key ...

    # Proxy /tires to GitHub Pages
    location /tires/ {
        proxy_pass https://realsystem.github.io/tires/;
        proxy_set_header Host realsystem.github.io;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_server_name on;

        # Cache responses
        proxy_cache_valid 200 1h;
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

**Result:**
- User visits: `https://overlandn.com/tires`
- Stays at: `https://overlandn.com/tires`
- Content served from GitHub Pages (transparent)

---

## Option 3: Simple Redirect (Apache)

Add to your Apache config or .htaccess:

```apache
# /etc/apache2/sites-available/overlandn.com.conf

<VirtualHost *:80>
    ServerName overlandn.com

    # Your existing config
    DocumentRoot /var/www/overlandn.com

    # Redirect /tires to GitHub Pages
    RedirectMatch 301 ^/tires(/.*)?$ https://realsystem.github.io/tires$1
</VirtualHost>

<VirtualHost *:443>
    ServerName overlandn.com

    # Your existing SSL config
    # SSLEngine on
    # SSLCertificateFile ...
    # SSLCertificateKeyFile ...

    DocumentRoot /var/www/overlandn.com

    # Redirect /tires to GitHub Pages
    RedirectMatch 301 ^/tires(/.*)?$ https://realsystem.github.io/tires$1
</VirtualHost>
```

Reload Apache:
```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

## Option 4: Transparent Proxy (Apache)

Keep overlandn.com URL visible:

```apache
# Enable required modules first
sudo a2enmod proxy proxy_http ssl

# /etc/apache2/sites-available/overlandn.com.conf

<VirtualHost *:443>
    ServerName overlandn.com

    # Your existing SSL config
    SSLEngine on
    SSLProxyEngine on

    # Proxy /tires to GitHub Pages
    ProxyPass /tires/ https://realsystem.github.io/tires/
    ProxyPassReverse /tires/ https://realsystem.github.io/tires/

    # Set proper headers
    <Location /tires/>
        ProxyPreserveHost Off
        RequestHeader set Host "realsystem.github.io"
    </Location>
</VirtualHost>
```

---

## Option 5: Cloudflare Page Rules (No Server Config)

If overlandn.com uses Cloudflare, use Page Rules:

1. Log into Cloudflare dashboard
2. Go to your overlandn.com domain
3. Rules → Page Rules → Create Page Rule
4. Settings:
   - URL: `overlandn.com/tires*`
   - Setting: **Forwarding URL** (301 - Permanent Redirect)
   - Destination: `https://realsystem.github.io/tires/$1`
5. Save and Deploy

**Free tier:** 3 page rules included

---

## Option 6: Cloudflare Workers (Advanced)

For transparent proxying without changing URL:

```javascript
// Cloudflare Worker for overlandn.com

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // If path starts with /tires, proxy to GitHub Pages
  if (url.pathname.startsWith('/tires')) {
    const githubUrl = 'https://realsystem.github.io' + url.pathname
    const githubRequest = new Request(githubUrl, request)

    const response = await fetch(githubRequest)

    // Return response with original URL
    return new Response(response.body, response)
  }

  // Let other requests pass through
  return fetch(request)
}
```

Deploy:
1. Cloudflare Dashboard → Workers
2. Create Worker → Paste code
3. Add Route: `overlandn.com/tires/*`

---

## Recommended Approach

**Best option: Simple 301 Redirect (Option 1)**

**Pros:**
- ✅ Simplest to set up (2 lines of config)
- ✅ No caching issues
- ✅ Fast (no proxy overhead)
- ✅ GitHub Pages handles all traffic
- ✅ Free bandwidth

**Cons:**
- ❌ URL changes to GitHub Pages domain

**If you want to keep overlandn.com URL:** Use Option 2 (transparent proxy)

---

## Quick Setup (Nginx)

```bash
# 1. Edit nginx config
sudo nano /etc/nginx/sites-available/overlandn.com

# 2. Add this inside server block:
#    location /tires {
#        return 301 https://realsystem.github.io/tires$request_uri;
#    }

# 3. Test and reload
sudo nginx -t
sudo systemctl reload nginx

# 4. Done! Visit https://overlandn.com/tires
```

---

## Quick Setup (Apache)

```bash
# 1. Edit Apache config
sudo nano /etc/apache2/sites-available/overlandn.com.conf

# 2. Add this inside VirtualHost:
#    RedirectMatch 301 ^/tires(/.*)?$ https://realsystem.github.io/tires$1

# 3. Test and reload
sudo apache2ctl configtest
sudo systemctl reload apache2

# 4. Done! Visit https://overlandn.com/tires
```

---

## Testing

After setup:

```bash
# Test redirect
curl -I https://overlandn.com/tires

# Should show:
# HTTP/1.1 301 Moved Permanently
# Location: https://realsystem.github.io/tires/
```

Or just visit in browser: https://overlandn.com/tires

---

## SSL/HTTPS

Your existing SSL certificate for overlandn.com will handle the initial request. The redirect to GitHub Pages uses GitHub's SSL certificate.

---

## No Server Access?

If you don't have server access but control DNS:

**Use Cloudflare** (free):
1. Point overlandn.com DNS to Cloudflare
2. Use Cloudflare Page Rules (Option 5 above)
3. Free SSL included

---

## Performance

**Simple Redirect (301):**
- Initial request: overlandn.com (your server)
- Browser redirects to: realsystem.github.io (GitHub CDN)
- Fast, cached by browsers

**Transparent Proxy:**
- Every request: overlandn.com → your server → GitHub Pages
- Adds latency (2x hops)
- Can cache responses to improve speed

---

## Summary

**Simplest approach:**
1. Add 2 lines to your nginx/apache config (Option 1)
2. Reload web server
3. Visit https://overlandn.com/tires → redirects to GitHub Pages
4. Done!

**No copying files, no manual uploads, no maintenance!** 🎉
