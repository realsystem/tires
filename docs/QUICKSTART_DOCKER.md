# Docker Quick Start - 60 Seconds to Running

## Fastest Path: Production Mode

```bash
# 1. Clone or navigate to project
cd /path/to/tires

# 2. Run the start script
./start.sh
# Select option 1 (Production)

# 3. Access the calculator
# Open browser: http://localhost:8080
```

**That's it.** The calculator is running in an optimized production container.

---

## Alternative: Using Make

```bash
# Build and run
make run

# View logs
make logs

# Stop
make stop
```

---

## Alternative: Direct docker-compose

```bash
# Build image
docker-compose build tire-calculator

# Start container
docker-compose up -d tire-calculator

# View logs
docker-compose logs -f tire-calculator

# Stop
docker-compose down
```

---

## Development Mode (Hot Reload)

```bash
# Start dev container
make dev

# Or
docker-compose --profile dev up tire-calculator-dev

# Access at http://localhost:3000
# Files update instantly on save
```

---

## What's Running?

**Production Container**:
- **Port**: 8080
- **Web Server**: nginx (Alpine Linux)
- **Image Size**: ~50MB
- **Features**: Gzip compression, security headers, SPA routing
- **Build**: Optimized production Vite bundle

**Development Container**:
- **Port**: 3000
- **Web Server**: Vite dev server
- **Features**: Hot module replacement (HMR), source maps
- **Build**: Development mode with instant reload

---

## Verify It's Working

```bash
# Check container status
docker ps | grep tire-calculator

# View nginx logs
docker logs tire-calculator

# Check health
docker inspect tire-calculator | grep -A 5 Health
```

**Expected**:
- Container status: `Up` with `(healthy)` tag
- nginx logs showing worker processes started
- Port 8080 exposed and accessible

---

## Access the Application

**Production**: [http://localhost:8080](http://localhost:8080)
**Development**: [http://localhost:3000](http://localhost:3000)

---

## Common Commands

```bash
# Stop everything
docker-compose down

# Restart
docker-compose restart tire-calculator

# View real-time logs
docker-compose logs -f tire-calculator

# Clean rebuild
make rebuild

# Remove all data
make clean
```

---

## Need More?

- Full guide: [DOCKER.md](DOCKER.md)
- Main documentation: [README.md](README.md)
- Examples: [EXAMPLES.md](EXAMPLES.md)

---

## Troubleshooting

**Port 8080 already in use?**
```bash
# Find what's using it
lsof -i :8080

# Or change the port in docker-compose.yml
ports:
  - "9000:80"  # Use 9000 instead
```

**Container won't start?**
```bash
# Check logs
docker-compose logs tire-calculator

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache tire-calculator
docker-compose up tire-calculator
```

**Permission errors (Linux)?**
```bash
sudo chown -R $USER:$USER .
```

---

**System Requirements**:
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB disk space
- Port 8080 available (production) or 3000 (dev)

**Installation**:
- Mac: [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)
- Windows: [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
