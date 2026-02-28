# Docker Guide - Off-Road Tire Calculator

Complete guide for running the tire calculator with Docker.

---

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB available disk space
- Ports 8080 (production) and/or 3000 (development) available

**Install Docker**:
- Mac: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)
- Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

---

## Quick Start (TL;DR)

```bash
# Fastest way to run production
./start.sh
# Select option 1

# Or using Make
make run

# Or using docker-compose directly
docker-compose up -d tire-calculator
```

**Access**: [http://localhost:8080](http://localhost:8080)

---

## Production Deployment

### Method 1: Using Make (Recommended)

```bash
# Build and run
make run

# View available commands
make help

# View logs
make logs

# Stop
make stop

# Complete cleanup
make clean

# Rebuild from scratch
make rebuild
```

### Method 2: Using Docker Compose

```bash
# Build the image
docker-compose build tire-calculator

# Start container in background
docker-compose up -d tire-calculator

# View logs (follow mode)
docker-compose logs -f tire-calculator

# Stop container
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Method 3: Using Docker CLI

```bash
# Build image
docker build -t tire-calculator:latest .

# Run container
docker run -d \
  --name tire-calculator \
  -p 8080:80 \
  --restart unless-stopped \
  tire-calculator:latest

# View logs
docker logs -f tire-calculator

# Stop container
docker stop tire-calculator
docker rm tire-calculator
```

---

## Development Mode

### Hot Reload with Vite

```bash
# Using Make
make dev

# Or using docker-compose
docker-compose --profile dev up tire-calculator-dev

# Access at http://localhost:3000
```

**Features**:
- Hot module replacement (HMR)
- Instant updates on file save
- Source maps enabled
- Vite dev server with fast refresh
- Volume-mounted source code

**File watching**:
- Changes to `.jsx`, `.js`, `.css` files trigger reload
- No rebuild needed
- Terminal shows compilation status

---

## Container Architecture

### Multi-Stage Build

**Stage 1: Builder (node:18-alpine)**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

**Benefits**:
- Clean dependency installation
- Production build with Vite
- Tree-shaking and minification
- ~300MB intermediate image

**Stage 2: Runtime (nginx:alpine)**
```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

**Benefits**:
- Final image: ~50MB
- No Node.js runtime in production
- Efficient static file serving
- Battle-tested nginx

---

## Configuration

### Port Mapping

**Change production port** (from 8080 to 9000):
```yaml
# docker-compose.yml
services:
  tire-calculator:
    ports:
      - "9000:80"  # External:Internal
```

**Change development port** (from 3000 to 5173):
```yaml
# docker-compose.yml
services:
  tire-calculator-dev:
    ports:
      - "5173:3000"
```

### Environment Variables

Add to `docker-compose.yml`:
```yaml
services:
  tire-calculator:
    environment:
      - NODE_ENV=production
      - VITE_APP_TITLE=Custom Title
```

### Volume Mounts (Development)

Default configuration:
```yaml
volumes:
  - .:/app              # Mount current directory
  - /app/node_modules   # Exclude node_modules
```

**Why exclude node_modules?**
- Prevents host/container conflicts
- Faster startup
- Container manages its own dependencies

---

## nginx Configuration

### Current Setup

```nginx
# Gzip compression
gzip on;
gzip_types text/plain text/css application/javascript;

# Security headers
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";

# Cache static assets (1 year)
location ~* \.(js|css|png|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# SPA routing
location / {
    try_files $uri /index.html;
}
```

### Custom nginx Config

Create `nginx.custom.conf`:
```nginx
server {
    listen 80;
    server_name example.com;

    # Add custom config here
}
```

Update `Dockerfile`:
```dockerfile
COPY nginx.custom.conf /etc/nginx/conf.d/default.conf
```

---

## Health Checks

### Built-in Health Check

The Dockerfile includes:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

**Check status**:
```bash
docker inspect --format='{{.State.Health.Status}}' tire-calculator
# Returns: healthy, unhealthy, or starting
```

### Manual Health Check

```bash
# HTTP request
curl -f http://localhost:8080 || echo "Unhealthy"

# Inside container
docker exec tire-calculator wget --spider http://localhost/
```

---

## Logs and Debugging

### View Logs

```bash
# Production
docker-compose logs -f tire-calculator

# Development
docker-compose --profile dev logs -f tire-calculator-dev

# Last 50 lines
docker-compose logs --tail=50 tire-calculator

# Specific timeframe
docker-compose logs --since 30m tire-calculator
```

### Interactive Shell

```bash
# Production container (nginx)
docker exec -it tire-calculator sh

# Development container (node)
docker-compose --profile dev exec tire-calculator-dev sh

# Check nginx config
docker exec tire-calculator nginx -t

# View running processes
docker exec tire-calculator ps aux
```

### Debug Build

```bash
# Build without cache
docker-compose build --no-cache tire-calculator

# Build with verbose output
docker-compose build --progress=plain tire-calculator

# Inspect intermediate layers
docker history tire-calculator:latest
```

---

## Performance Optimization

### Image Size

Current sizes:
- Production: ~50MB
- Development: ~180MB (with node_modules)

**Further optimization**:
```dockerfile
# Use distroless for smaller runtime
FROM gcr.io/distroless/static-debian11
COPY --from=builder /app/dist /app
```

### Build Cache

Leverage layer caching:
```dockerfile
# Copy package.json first (cached if unchanged)
COPY package*.json ./
RUN npm ci

# Copy source last (changes frequently)
COPY . .
```

### Compression

nginx gzip is enabled for:
- text/plain
- text/css
- text/javascript
- application/javascript
- application/json

**Test compression**:
```bash
curl -H "Accept-Encoding: gzip" -I http://localhost:8080
# Look for: Content-Encoding: gzip
```

---

## Production Deployment Scenarios

### Reverse Proxy (nginx/Traefik)

**nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name tire-calc.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Traefik labels** (docker-compose.yml):
```yaml
services:
  tire-calculator:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.tire-calc.rule=Host(`tire-calc.example.com`)"
```

### SSL/TLS with Let's Encrypt

Using Traefik:
```yaml
labels:
  - "traefik.http.routers.tire-calc.tls.certresolver=letsencrypt"
```

Using nginx with certbot:
```bash
certbot --nginx -d tire-calc.example.com
```

### Cloud Deployment

**AWS ECS**:
- Use ECR to store image
- Create ECS task definition
- Configure ALB for load balancing

**Google Cloud Run**:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/tire-calculator
gcloud run deploy --image gcr.io/PROJECT_ID/tire-calculator
```

**DigitalOcean App Platform**:
- Connect GitHub repo
- Auto-deploy from Dockerfile
- Configure custom domain

---

## Continuous Integration

### GitHub Actions

`.github/workflows/docker.yml`:
```yaml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t tire-calculator .
      - name: Run tests
        run: docker run tire-calculator npm test
```

### GitLab CI

`.gitlab-ci.yml`:
```yaml
build:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE .
    - docker push $CI_REGISTRY_IMAGE
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080
# Or
sudo netstat -tulpn | grep 8080

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Container Exits Immediately

```bash
# Check exit code
docker-compose ps

# View logs
docker-compose logs tire-calculator

# Common causes:
# - nginx config syntax error
# - Missing files in dist/
# - Port conflict
```

### Build Failures

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check disk space
docker system df
```

### Volume Permission Issues (Linux)

```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Or run with user mapping
docker-compose run --user $(id -u):$(id -g) tire-calculator-dev
```

### Development Hot Reload Not Working

```bash
# Ensure volume is mounted
docker-compose --profile dev config

# Restart with clean slate
docker-compose --profile dev down -v
docker-compose --profile dev up tire-calculator-dev

# Check file watcher limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Maintenance

### Update Dependencies

```bash
# Rebuild with latest packages
docker-compose build --no-cache --pull tire-calculator

# Or update package.json and rebuild
npm update
docker-compose build tire-calculator
```

### Clean Up

```bash
# Remove stopped containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker rmi tire-calculator

# Clean entire Docker system
docker system prune -a --volumes
```

### Backup

```bash
# Export container
docker export tire-calculator > tire-calculator-backup.tar

# Save image
docker save tire-calculator:latest > tire-calculator-image.tar

# Load image elsewhere
docker load < tire-calculator-image.tar
```

---

## Security Best Practices

### 1. Run as Non-Root User

Add to Dockerfile:
```dockerfile
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser
USER appuser
```

### 2. Read-Only File System

```yaml
services:
  tire-calculator:
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx
```

### 3. Resource Limits

```yaml
services:
  tire-calculator:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

### 4. Security Scanning

```bash
# Scan image for vulnerabilities
docker scan tire-calculator:latest

# Or use Trivy
trivy image tire-calculator:latest
```

---

## Advanced Usage

### Custom Build Args

```bash
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg NGINX_VERSION=alpine \
  -t tire-calculator .
```

### Multi-Platform Builds

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t tire-calculator:latest .
```

### Docker Secrets

```bash
echo "sensitive_data" | docker secret create my_secret -
docker service create --secret my_secret tire-calculator
```

---

## Monitoring

### Prometheus Metrics

Add nginx-prometheus-exporter:
```yaml
services:
  exporter:
    image: nginx/nginx-prometheus-exporter
    command: -nginx.scrape-uri=http://tire-calculator/nginx_status
```

### Resource Usage

```bash
# Container stats
docker stats tire-calculator

# Detailed info
docker inspect tire-calculator
```

---

For questions or issues, refer to the main [README.md](README.md) or open an issue on GitHub.
