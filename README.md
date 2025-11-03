# Elite Events Kenya - Backend API

Production-ready Node.js backend API for Elite Events Kenya - a tourism platform connecting international tourists with verified local Kenyan guides for authentic experiences at local rates.

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 15+ (primary) + Redis 7+ (caching)
- **ORM:** Prisma
- **Authentication:** JWT with Passport
- **Real-time:** Socket.io
- **File Storage:** AWS S3
- **Payments:** M-Pesa, Stripe, PayPal
- **Email:** SendGrid
- **SMS:** Africa's Talking

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 15
- Redis >= 7
- AWS Account (for S3)
- SendGrid Account
- Africa's Talking Account
- Payment Gateway Accounts (M-Pesa, Stripe, PayPal)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd Elite_backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see Environment Variables section below).

### 3. Database Setup

Start PostgreSQL and Redis (using Docker):

```bash
docker-compose up -d
```

Run Prisma migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start the Server

Development mode with hot reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API will be available at `http://localhost:5000`

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://user:pass@localhost:5432/elite_events
REDIS_URL=redis://localhost:6379

JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=elite-events-uploads

SENDGRID_API_KEY=your_key
FROM_EMAIL=noreply@eliteeventskenya.com

# Payment gateways
MPESA_CONSUMER_KEY=your_key
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your_id
```

## Project Structure

```
Elite_backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Database models (Prisma)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── socket/          # Socket.io handlers
│   └── server.js        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── tests/               # Test files
├── .env.example         # Environment template
├── docker-compose.yml   # Docker services
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `POST /api/users/me/upload-avatar` - Upload profile picture

### Guides
- `POST /api/guides/apply` - Submit guide application
- `GET /api/guides` - List all approved guides
- `GET /api/guides/:id` - Get guide profile
- `PUT /api/guides/:id` - Update guide profile

### Experiences
- `GET /api/experiences` - List experiences
- `GET /api/experiences/:id` - Get experience details
- `POST /api/experiences` - Create experience (guide only)
- `PUT /api/experiences/:id` - Update experience
- `DELETE /api/experiences/:id` - Delete experience

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/mpesa/initiate` - Initiate M-Pesa payment
- `POST /api/payments/stripe/create-intent` - Create Stripe payment
- `POST /api/payments/paypal/create-order` - Create PayPal order

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/guide/:guideId` - Get guide reviews
- `GET /api/reviews/experience/:experienceId` - Get experience reviews

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversation/:userId` - Get messages with user
- `POST /api/messages` - Send message

### Search
- `GET /api/search` - Global search

### Admin
- `GET /api/admin/applications` - List guide applications
- `PUT /api/admin/applications/:id/review` - Review application
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - Get platform analytics

Full API documentation available at `/api-docs` when server is running.

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Docker Deployment

Build and run with Docker Compose:

```bash
docker-compose up --build
```

This will start:
- API server on port 5000
- PostgreSQL on port 5432
- Redis on port 6379

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- XSS protection
- File upload validation

## Performance

- Redis caching for frequently accessed data
- Database query optimization with indexes
- Response compression
- Connection pooling
- Efficient file uploads to S3

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Contact: support@eliteeventskenya.com

## Authors

Elite Events Kenya Development Team
