# Makefile for Off-Road Tire Calculator
# Quick commands for Docker operations

.PHONY: help build run dev stop clean logs test

help: ## Show this help message
	@echo "Off-Road Tire Calculator - Docker Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build production Docker image
	docker-compose build tire-calculator

run: ## Run production container (http://localhost:8080)
	docker-compose up -d tire-calculator
	@echo ""
	@echo "✓ Tire Calculator running at http://localhost:8080"

dev: ## Run development container with hot reload (http://localhost:3000)
	docker-compose --profile dev up tire-calculator-dev
	@echo ""
	@echo "✓ Development server running at http://localhost:3000"

stop: ## Stop all running containers
	docker-compose down

clean: ## Remove containers, images, and volumes
	docker-compose down -v --rmi all

logs: ## Show container logs
	docker-compose logs -f tire-calculator

logs-dev: ## Show development container logs
	docker-compose logs -f tire-calculator-dev

test: ## Run tests in Docker
	docker run --rm -v $(PWD):/app -w /app node:18-alpine sh -c "npm install && npm test"

shell: ## Open shell in running container
	docker exec -it tire-calculator sh

rebuild: clean build run ## Clean, rebuild, and run production container

# Quick start commands
quick-prod: build run ## Build and run production (http://localhost:8080)

quick-dev: ## Run development mode immediately (http://localhost:3000)
	docker-compose --profile dev up tire-calculator-dev
