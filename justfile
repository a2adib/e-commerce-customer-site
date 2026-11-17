default:
  just --list

# Start development servers (frontend and admin)
dev *args:
  pnpm run dev {{args}}

# Alias for dev
run *args:
  just dev {{args}}

# Start customer storefront only
dev-frontend:
  pnpm run dev:frontend

# Start admin app only
dev-admin:
  pnpm run dev:admin

# Build all applications with Turborepo
build:
  pnpm run build

# Run linting across all packages
lint:
  pnpm run lint

# Install dependencies with pnpm
install:
  pnpm install

# Clean turbo and build caches
clean:
  pnpm run clean

# ── Backend Shortcuts (from Customer Site) ────────────────────────────────────
# Start backend server
backend *args:
  just -f ../e-commerce-backend/justfile -d ../e-commerce-backend run {{args}}

# Run database migrations in backend
backend-migrate:
  just -f ../e-commerce-backend/justfile -d ../e-commerce-backend migrate

# Seed database in backend
backend-seed:
  just -f ../e-commerce-backend/justfile -d ../e-commerce-backend seed
