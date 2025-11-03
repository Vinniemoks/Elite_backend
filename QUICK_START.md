# Quick Start Guide - Elite Events Kenya Backend

Get the backend up and running in 5 minutes!

## Prerequisites

Ensure you have installed:
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))
- Redis 7+ ([Download](https://redis.io/download))
- Git

## Step 1: Clone & Install

```bash
cd Elite_backend
npm install
```

## Step 2: Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your local settings (minimum required):

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/elite_events
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

## Step 3: Start Services

### Option A: Using Docker (Recommended)

```bash
docker-compose up -d
```

This starts PostgreSQL and Redis automatically.

### Option B: Manual Setup

Start PostgreSQL and Redis on your system:

```bash
# PostgreSQL (varies by OS)
sudo service postgresql start

# Redis
redis-server
```

## Step 4: Database Setup

Generate Prisma Client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Seed the database with sample data:

```bash
npm run prisma:seed
```

This creates:
- Admin user: `admin@eliteeventskenya.com` / `admin123`
- Tourist user: `tourist@example.com` / `password123`
- Guide user: `guide@example.com` / `password123`
- Sample experiences

## Step 5: Start the Server

Development mode (with hot reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start at `http://localhost:5000`

## Step 6: Verify Installation

### Check Health Endpoint

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Server is running"
}
```

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tourist@example.com",
    "password": "password123"
  }'
```

You should receive a JWT token in the response.

### View API Documentation

Open your browser and navigate to:
```
http://localhost:5000/api-docs
```

## Common Commands

```bash
# Development
npm run dev              # Start with hot reload
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Database
npm run prisma:studio    # Open Prisma Studio (GUI)
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Production
npm start                # Start production server
```

## Troubleshooting

### Port Already in Use

Change the PORT in `.env`:
```env
PORT=5001
```

### Database Connection Error

1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. Check DATABASE_URL in `.env` matches your PostgreSQL credentials

3. Create database manually if needed:
   ```bash
   createdb elite_events_kenya
   ```

### Redis Connection Error

1. Verify Redis is running:
   ```bash
   redis-cli ping
   ```
   Should return: `PONG`

2. Check REDIS_URL in `.env`

### Module Not Found

Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Error

Regenerate Prisma Client:
```bash
npm run prisma:generate
```

## Next Steps

1. **Explore the API**: Use the Swagger docs at `/api-docs`
2. **Read Documentation**: Check out `API_DOCUMENTATION.md`
3. **Run Tests**: Execute `npm test` to ensure everything works
4. **Configure Services**: Set up AWS S3, SendGrid, payment gateways
5. **Deploy**: Follow `DEPLOYMENT.md` for production deployment

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes

3. Run tests:
   ```bash
   npm test
   npm run lint
   ```

4. Commit and push:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

5. Create a Pull Request

## Useful Resources

- [README.md](./README.md) - Full project documentation
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints
- [BACKEND.md](./BACKEND.md) - Implementation specification
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

## Support

Need help?
- Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for implementation status
- Review [SECURITY.md](./SECURITY.md) for security guidelines
- Email: support@eliteeventskenya.com

---

**Happy Coding! 🚀**
