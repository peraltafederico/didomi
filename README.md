# Didomi

### Running the Application

Option 1: Using Docker Compose (Recommended)

```bash
docker compose up -d
```

Option 2: Running Manually

Fill the .env file with the correct values, then run the following commands:

```bash
# Start only the PostgreSQL database
docker compose up -d --wait postgres

# Install dependencies
pnpm install

# Start the API in development mode
pnpm start:dev
```

### Running Tests

The project includes end-to-end tests that use a separate test database:

```bash
# Start the test database
docker compose up -d --wait postgres_test

# Run end-to-end tests
pnpm test:e2e
```
