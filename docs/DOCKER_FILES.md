# Docker Files Reference

All Docker-related files in this project and what they do.

---

## Core Docker Files

### 1. `Dockerfile`
**Purpose**: Multi-stage build for production container

**Structure**:
```dockerfile
Stage 1: Builder (node:18-alpine)
├── Install dependencies (npm ci)
├── Build production bundle (vite build)
└── Output: /app/dist/

Stage 2: Runtime (nginx:alpine)
├── Copy nginx config
├── Copy built assets from Stage 1
└── Expose port 80
```

**Build Command**:
```bash
docker build -t tire-calculator .
```

**Result**: 92.7MB optimized production image

---

### 2. `docker-compose.yml`
**Purpose**: Orchestrate multiple container configurations

**Services Defined**:

**a) `tire-calculator` (Production)**
```yaml
Build: Dockerfile
Port: 8080:80
Network: tire-network
Restart: unless-stopped
```

**b) `tire-calculator-dev` (Development)**
```yaml
Image: node:18-alpine
Port: 3000:3000
Volumes: Source code mounted
Profile: dev (must be explicitly enabled)
```

**Usage**:
```bash
# Production
docker-compose up -d tire-calculator

# Development
docker-compose --profile dev up tire-calculator-dev
```

---

### 3. `nginx.conf`
**Purpose**: nginx web server configuration for production

**Features**:
- Gzip compression (text, css, js)
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Static asset caching (1 year for js/css/images)
- SPA routing (all routes → index.html)
- Error page handling

**Location**: Copied to `/etc/nginx/conf.d/default.conf` in container

---

### 4. `.dockerignore`
**Purpose**: Exclude files from Docker build context

**Excluded**:
- `node_modules/` (rebuilt in container)
- `dist/`, `build/` (generated during build)
- `.git/` (not needed in container)
- IDE files (`.vscode/`, `.idea/`)
- Docker files themselves
- Tests (optional exclusion for smaller image)

**Important**: `package-lock.json` is **NOT** excluded (required for `npm ci`)

---

## Helper Files

### 5. `Makefile`
**Purpose**: Quick command shortcuts

**Available Commands**:
```makefile
make help      # Show all commands
make build     # Build production image
make run       # Run production container
make dev       # Run development container
make stop      # Stop all containers
make clean     # Remove everything
make logs      # View production logs
make test      # Run tests in Docker
make rebuild   # Clean rebuild
```

**Usage**: `make <command>`

---

### 6. `start.sh`
**Purpose**: Interactive start script

**Features**:
- Checks Docker installation
- Prompts for mode (production/development)
- Builds and starts appropriate container
- Shows access URL and useful commands

**Usage**:
```bash
./start.sh
# Select: 1 (Production) or 2 (Development)
```

**Requirements**: Executable permissions (`chmod +x start.sh`)

---

## Documentation Files

### 7. `DOCKER.md`
**Full Docker reference guide**

**Contents**:
- Prerequisites and installation
- Deployment methods (Make, docker-compose, Docker CLI)
- Development mode setup
- Architecture explanation
- Configuration options
- Health checks and monitoring
- Troubleshooting
- Security best practices
- Advanced usage (multi-platform, CI/CD)

---

### 8. `QUICKSTART_DOCKER.md`
**60-second quick start guide**

**Contents**:
- Fastest path to running (production)
- Alternative methods (Make, docker-compose)
- Development mode
- Common commands
- Basic troubleshooting

---

### 9. `DOCKER_FILES.md` (this file)
**Reference of all Docker files**

---

## File Flow Diagram

```
User Action
    ↓
start.sh OR make OR docker-compose
    ↓
docker-compose.yml (orchestration)
    ↓
Dockerfile (build instructions)
    ├─→ .dockerignore (exclude files)
    ├─→ package.json + package-lock.json (dependencies)
    └─→ nginx.conf (web server config)
    ↓
Built Image (92.7MB)
    ↓
Running Container
    ↓
http://localhost:8080
```

---

## Build Context

**What Docker sees during build**:

```
tires/
├── package.json          ✓ Included
├── package-lock.json     ✓ Included (required for npm ci)
├── src/                  ✓ Included
├── public/               ✓ Included (if exists)
├── vite.config.js        ✓ Included
├── index.html            ✓ Included
├── nginx.conf            ✓ Included
├── node_modules/         ✗ Excluded (.dockerignore)
├── dist/                 ✗ Excluded (generated in build)
├── .git/                 ✗ Excluded
├── tests/                ✗ Excluded (optional)
└── README.md             ✗ Excluded (optional)
```

**Build context size**: ~500KB (without node_modules)

---

## Runtime Comparison

### Production Container (`tire-calculator`)

| Aspect | Value |
|--------|-------|
| Base Image | nginx:alpine |
| Final Size | 92.7MB |
| Startup Time | <2 seconds |
| Memory Usage | ~10MB |
| CPU Usage | Minimal (<1%) |
| Ports | 8080:80 |
| Health Check | Every 30s |
| Restart Policy | unless-stopped |

**Process inside**:
- nginx master process
- nginx worker processes (12 on 12-core system)
- No Node.js runtime

### Development Container (`tire-calculator-dev`)

| Aspect | Value |
|--------|-------|
| Base Image | node:18-alpine |
| Size | ~180MB (with node_modules) |
| Startup Time | ~5 seconds (npm install) |
| Memory Usage | ~150MB |
| CPU Usage | Moderate during HMR |
| Ports | 3000:3000 |
| Volumes | Source code mounted |
| Restart Policy | None |

**Process inside**:
- Node.js
- Vite dev server
- File watchers

---

## Network Architecture

```
Host Machine
    ↓
Port 8080 (or 3000 for dev)
    ↓
Docker Bridge Network: tire-network
    ↓
Container: tire-calculator
    ↓
nginx listening on port 80
    ↓
Serves: /usr/share/nginx/html/
    ├── index.html
    ├── assets/
    │   ├── index-*.js
    │   └── index-*.css
    └── [other static files]
```

---

## Security

### Production Container Security Features

1. **Minimal Attack Surface**
   - Alpine Linux base (~5MB)
   - Only nginx + static files
   - No build tools in final image

2. **Security Headers** (nginx.conf)
   ```
   X-Frame-Options: SAMEORIGIN
   X-Content-Type-Options: nosniff
   X-XSS-Protection: 1; mode=block
   ```

3. **Health Checks**
   - Automatic container restart if unhealthy
   - 30-second intervals

4. **No Secrets in Image**
   - No environment variables with secrets
   - No embedded credentials

5. **Read-Only Recommended** (optional)
   ```yaml
   read_only: true
   tmpfs:
     - /tmp
     - /var/cache/nginx
   ```

---

## Optimization Details

### Why Multi-Stage Build?

**Without multi-stage** (single stage):
- Final image: ~400MB
- Contains: Node.js, npm, build tools, source files
- Security risk: build tools in production

**With multi-stage** (current):
- Final image: 92.7MB
- Contains: Only nginx + built assets
- Secure: No build tools, no source code

**Savings**: ~307MB (76% smaller)

### Layer Caching Strategy

```dockerfile
# Layer 1: Base image (cached if same)
FROM node:18-alpine AS builder

# Layer 2: Dependencies (cached if package.json unchanged)
COPY package*.json ./
RUN npm ci

# Layer 3: Source code (rebuilt every time code changes)
COPY . .

# Layer 4: Build (only if Layer 2 or 3 changed)
RUN npm run build
```

**Benefit**: Incremental builds are fast (~30 seconds instead of 90 seconds)

---

## Customization Examples

### Change Port

Edit `docker-compose.yml`:
```yaml
services:
  tire-calculator:
    ports:
      - "9000:80"  # External:Internal
```

### Add Environment Variable

Edit `docker-compose.yml`:
```yaml
services:
  tire-calculator:
    environment:
      - NODE_ENV=production
      - VITE_API_KEY=${API_KEY}
```

### Custom nginx Config

Replace `nginx.conf` or add to it:
```nginx
server {
    listen 80;

    # Add custom location
    location /api {
        proxy_pass http://backend:3000;
    }
}
```

### Resource Limits

Edit `docker-compose.yml`:
```yaml
services:
  tire-calculator:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          memory: 128M
```

---

## Development Workflow

1. **Make code changes** (any file in `src/`)
2. **Save file**
3. **Vite detects change** (via file watcher)
4. **HMR updates browser** (~50-200ms)
5. **See results instantly** (no manual refresh)

**Volume Mount**:
```yaml
volumes:
  - .:/app                # Mount current dir
  - /app/node_modules     # Exclude node_modules
```

**Why exclude node_modules?**
- Host and container may have different architectures
- Prevents conflicts (Mac binaries != Linux binaries)
- Container manages its own dependencies

---

## Maintenance

### Update Dependencies

```bash
# Update package.json
npm update

# Rebuild Docker image
docker-compose build --no-cache tire-calculator
```

### Clean Docker System

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (use with caution)
docker system prune -a --volumes
```

### Check Image Layers

```bash
# View layer history
docker history tire-calculator:latest

# Analyze image
docker inspect tire-calculator:latest
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t myregistry/tire-calculator .
      - name: Push to registry
        run: docker push myregistry/tire-calculator
```

### GitLab CI Example

```yaml
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE .
    - docker push $CI_REGISTRY_IMAGE
```

---

## Summary

**Files Created**: 9 Docker-related files
- **Build**: `Dockerfile`, `.dockerignore`
- **Orchestration**: `docker-compose.yml`
- **Configuration**: `nginx.conf`
- **Helpers**: `Makefile`, `start.sh`
- **Documentation**: `DOCKER.md`, `QUICKSTART_DOCKER.md`, `DOCKER_FILES.md`

**Image Size**: 92.7MB (production)
**Startup Time**: <2 seconds
**Commands**: Make, docker-compose, or Docker CLI

**Ready to deploy to**:
- Local machine (development)
- VPS (production)
- Cloud platforms (AWS, GCP, Azure, DigitalOcean)
- Kubernetes
- Docker Swarm
