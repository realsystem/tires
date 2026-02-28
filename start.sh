#!/bin/bash

# Tire Calculator - Quick Start Script

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Off-Road Tire Calculator${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Prompt user for mode
echo "Select mode:"
echo "  1) Production (optimized build, port 8080)"
echo "  2) Development (hot reload, port 3000)"
echo ""
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}Building and starting production container...${NC}"
        docker-compose build tire-calculator
        docker-compose up -d tire-calculator

        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  ✓ Production server running!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo -e "  Access at: ${BLUE}http://localhost:8080${NC}"
        echo ""
        echo "Commands:"
        echo "  View logs:   docker-compose logs -f tire-calculator"
        echo "  Stop:        docker-compose down"
        echo "  Restart:     docker-compose restart tire-calculator"
        echo ""
        ;;
    2)
        echo ""
        echo -e "${YELLOW}Starting development container...${NC}"
        echo ""
        docker-compose --profile dev up tire-calculator-dev
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
