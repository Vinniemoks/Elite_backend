---
title: Elite Events Kenya - Complete Backend Implementation
description: Production-ready Node.js backend API for Elite Events Kenya tourism platform
version: 1.0.0
---

# Elite Events Kenya - Complete Backend Implementation Spec

## Overview

Build a production-ready Node.js/Express backend API for Elite Events Kenya  - a tourism platform connecting international tourists with verified local Kenyan guides for authentic experiences at local rates.

**Technology Stack:**
- Node.js 18+ with Express.js
- PostgreSQL 15+ (primary) + Redis 7+ (caching)
- Prisma ORM
- JWT Authentication
- Socket.io for real-time messaging
- AWS S3 for file storage
- M-Pesa, Stripe, PayPal payment integration
- SendGrid for email, Africa's Talking for SMS

## Project Structure

```
backend/
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
├── .env.example
├── package.json
└── docker-compose.yml
```

## Requirements


### Core Features
1. User authentication (JWT-based, email/password, social login)
2. Guide application system with file uploads
3. Guide profile management
4. Experience/tour listings (CRUD)
5. Booking system with availability checking
6. Multi-payment gateway (M-Pesa, Stripe, PayPal)
7. Real-time messaging (Socket.io)
8. Review and rating system
9. Admin dashboard endpoints
10. File upload and storage (AWS S3)
11. Email notifications (SendGrid)
12. SMS notifications (Africa's Talking)
13. Search and filtering
14. Analytics and reporting

### API Endpoints (62+ total)
- Authentication: 7 endpoints
- Users: 4 endpoints
- Guides: 6 endpoints
- Experiences: 5 endpoints
- Bookings: 6 endpoints
- Payments: 7 endpoints
- Reviews: 5 endpoints
- Messages: 5 endpoints
- Search: 1 endpoint
- Admin: 8 endpoints
- Uploads: 3 endpoints

## Implementation Tasks

### Task 1: Project Setup and Configuration

**Description:** Initialize the Node.js project with all required dependencies and configuration files.

**Files to create:**
- `package.json` with all dependencies
- `.env.example` with environment variables
- `.gitignore`
- `docker-compose.yml` for PostgreSQL and Redis
- `README.md` with setup instructions

**Dependencies to install:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.4.5",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "@prisma/client": "^5.8.0",
    "pg": "^8.11.3",
    "redis": "^4.6.12",
    "socket.io": "^4.6.1",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "aws-sdk": "^2.1540.0",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.5",
    "@sendgrid/mail": "^8.1.0",
    "africastalking": "^0.6.3",
    "axios": "^1.6.5",
    "stripe": "^14.12.0",
    "@paypal/checkout-server-sdk": "^1.0.3",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "uuid": "^9.0.1",
    "date-fns": "^3.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.3",
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "eslint": "^8.56.0",
    "prettier": "^3.2.4",
    "prisma": "^5.8.0"
  }
}
```


### Task 2: Database Schema Implementation (Prisma)

**Description:** Create the complete Prisma schema with all 11 tables and relationships.

**File:** `prisma/schema.prisma`

**Schema includes:**
1. users - All user accounts
2. guides - Guide profiles
3. guide_applications - Application submissions
4. experiences - Tour/experience listings
5. bookings - Booking records
6. payments - Payment transactions
7. reviews - User reviews and ratings
8. messages - Chat messages
9. availability_calendar - Guide availability
10. notifications - System notifications
11. audit_logs - Admin audit trail

**Key relationships:**
- User → Guide (one-to-one)
- Guide → Experiences (one-to-many)
- User → Bookings (one-to-many as tourist)
- Guide → Bookings (one-to-many as guide)
- Booking → Payment (one-to-one)
- Booking → Review (one-to-one)
- User → Messages (one-to-many as sender/receiver)

**Indexes required:**
- Email, user_type, status on users
- user_id, rating on guides
- guide_id, category, status on experiences
- tourist_id, guide_id, booking_date, status on bookings
- booking_id, status on payments
- guide_id, rating on reviews
- sender_id, receiver_id, created_at on messages

### Task 3: Authentication System

**Description:** Implement JWT-based authentication with email verification and password reset.

**Files to create:**
- `src/controllers/authController.js`
- `src/middleware/auth.js`
- `src/utils/jwt.js`
- `src/utils/bcrypt.js`
- `src/routes/auth.js`

**Endpoints:**
1. POST /api/auth/register - Register new user
2. POST /api/auth/login - Login user
3. POST /api/auth/verify-email - Verify email with token
4. POST /api/auth/forgot-password - Request password reset
5. POST /api/auth/reset-password - Reset password with token
6. POST /api/auth/refresh-token - Refresh JWT token
7. POST /api/auth/logout - Logout user (blacklist token)

**Features:**
- Password hashing with bcrypt (10 rounds)
- JWT token generation (7-day expiry)
- Refresh token (30-day expiry)
- Email verification tokens
- Password reset tokens (1-hour expiry)
- Rate limiting (5 attempts per 15 minutes)
- Role-based access control middleware


### Task 4: User Management

**Description:** Implement user profile management endpoints.

**Files to create:**
- `src/controllers/userController.js`
- `src/routes/users.js`

**Endpoints:**
1. GET /api/users/me - Get current user profile
2. PUT /api/users/me - Update user profile
3. POST /api/users/me/upload-avatar - Upload profile picture
4. DELETE /api/users/me - Soft delete account

**Features:**
- Profile image upload to S3
- Input validation
- Authorization checks
- Soft delete (status='deleted')

### Task 5: Guide Application System

**Description:** Implement guide application submission and review system.

**Files to create:**
- `src/controllers/guideController.js`
- `src/routes/guides.js`
- `src/middleware/upload.js`

**Endpoints:**
1. POST /api/guides/apply - Submit guide application
2. GET /api/guides - List all approved guides (public)
3. GET /api/guides/:id - Get single guide profile
4. PUT /api/guides/:id - Update guide profile (auth required)
5. GET /api/guides/:id/availability - Get availability calendar
6. POST /api/guides/:id/availability - Set availability

**Features:**
- Multipart form data handling
- File uploads (resume: PDF/DOC, video: MP4/WEBM)
- File size validation (resume: 5MB, video: 50MB)
- Upload to AWS S3
- Application status tracking
- Email notifications on status change
- Pagination and filtering
- Search by region, specialization, rating

### Task 6: Experience Management

**Description:** Implement CRUD operations for tour/experience listings.

**Files to create:**
- `src/controllers/experienceController.js`
- `src/routes/experiences.js`

**Endpoints:**
1. GET /api/experiences - List experiences with filters
2. GET /api/experiences/:id - Get single experience
3. POST /api/experiences - Create experience (guide only)
4. PUT /api/experiences/:id - Update experience (guide only)
5. DELETE /api/experiences/:id - Delete experience (guide only)

**Features:**
- Category filtering (nightlife, cultural, adventure, food, nature)
- Price range filtering
- Location filtering
- Rating filtering
- Pagination
- Image gallery upload
- Authorization (guide must own experience)


### Task 7: Booking System

**Description:** Implement booking creation, management, and calendar integration.

**Files to create:**
- `src/controllers/bookingController.js`
- `src/routes/bookings.js`
- `src/services/bookingService.js`

**Endpoints:**
1. POST /api/bookings - Create new booking
2. GET /api/bookings - List user's bookings
3. GET /api/bookings/:id - Get booking details
4. PUT /api/bookings/:id/cancel - Cancel booking
5. PUT /api/bookings/:id/confirm - Confirm booking (guide only)
6. PUT /api/bookings/:id/complete - Complete booking (guide only)

**Features:**
- Availability checking before booking
- Price calculation (base price + service fee 10%)
- Multi-currency support (USD/KES)
- Booking status workflow
- Cancellation policy enforcement (24-hour window)
- Email notifications on status changes
- Calendar conflict prevention
- Guest count validation

### Task 8: Payment Integration

**Description:** Integrate M-Pesa, Stripe, and PayPal payment gateways.

**Files to create:**
- `src/controllers/paymentController.js`
- `src/routes/payments.js`
- `src/services/mpesaService.js`
- `src/services/stripeService.js`
- `src/services/paypalService.js`
- `src/config/payments/mpesa.js`
- `src/config/payments/stripe.js`
- `src/config/payments/paypal.js`

**Endpoints:**
1. POST /api/payments/mpesa/initiate - Initiate M-Pesa STK Push
2. POST /api/payments/mpesa/callback - M-Pesa callback handler
3. POST /api/payments/stripe/create-intent - Create Stripe payment intent
4. POST /api/payments/stripe/webhook - Stripe webhook handler
5. POST /api/payments/paypal/create-order - Create PayPal order
6. POST /api/payments/paypal/capture-order - Capture PayPal payment
7. GET /api/payments/:id/status - Check payment status

**M-Pesa Integration:**
- Safaricom Daraja API
- STK Push implementation
- Callback URL handling
- Transaction verification
- Sandbox and production modes

**Stripe Integration:**
- Payment Intents API
- 3D Secure support
- Webhook signature verification
- Refund processing

**PayPal Integration:**
- Orders API v2
- Order creation and capture
- Webhook handling
- Refund processing

**Features:**
- Payment status tracking
- Automatic booking confirmation on payment
- Email receipts
- SMS confirmations
- Refund processing
- Transaction logging


### Task 9: Real-time Messaging System

**Description:** Implement Socket.io for real-time chat between tourists and guides.

**Files to create:**
- `src/socket/messageHandler.js`
- `src/controllers/messageController.js`
- `src/routes/messages.js`

**Socket.io Events:**
- `connection` - User connects
- `send_message` - Send message
- `typing` - Typing indicator
- `stop_typing` - Stop typing
- `new_message` - Receive message
- `message_sent` - Message confirmation
- `user_typing` - User typing notification
- `disconnect` - User disconnects

**REST Endpoints:**
1. GET /api/messages/conversations - Get user's conversations
2. GET /api/messages/conversation/:userId - Get messages with user
3. POST /api/messages - Send message (fallback)
4. PUT /api/messages/:id/read - Mark message as read
5. GET /api/messages/unread-count - Get unread count

**Features:**
- JWT authentication for Socket.io
- Message persistence in database
- Read receipts
- Typing indicators
- File attachments support
- Conversation history
- Unread message counts
- Real-time notifications

### Task 10: Review and Rating System

**Description:** Implement review submission, moderation, and rating calculation.

**Files to create:**
- `src/controllers/reviewController.js`
- `src/routes/reviews.js`
- `src/services/reviewService.js`

**Endpoints:**
1. POST /api/reviews - Create review (tourist, completed booking required)
2. GET /api/reviews/guide/:guideId - Get guide reviews
3. GET /api/reviews/experience/:experienceId - Get experience reviews
4. PUT /api/reviews/:id/response - Guide response to review
5. PUT /api/reviews/:id/helpful - Mark review as helpful

**Features:**
- Verified booking requirement
- 5-star rating system
- Photo uploads (up to 5 images)
- Review moderation (pending/approved/rejected)
- Guide response capability
- Helpful vote system
- Average rating calculation
- Review sorting (newest, highest, lowest)
- Pagination


### Task 11: Search and Filtering

**Description:** Implement global search across guides and experiences.

**Files to create:**
- `src/controllers/searchController.js`
- `src/routes/search.js`
- `src/services/searchService.js`

**Endpoint:**
1. GET /api/search - Global search

**Query Parameters:**
- `q` - Search query (text)
- `category` - Filter by category
- `type` - Search type (guides/experiences/all)
- `location` - Filter by location
- `min_price` - Minimum price
- `max_price` - Maximum price
- `rating` - Minimum rating
- `page` - Page number
- `limit` - Results per page

**Features:**
- Full-text search using PostgreSQL
- Search across multiple fields
- Relevance scoring
- Fuzzy matching
- Autocomplete suggestions
- Search history (optional)
- Popular searches tracking

### Task 12: Admin Dashboard Backend

**Description:** Implement admin endpoints for platform management.

**Files to create:**
- `src/controllers/adminController.js`
- `src/routes/admin.js`
- `src/middleware/adminAuth.js`

**Endpoints:**
1. GET /api/admin/applications - List guide applications
2. GET /api/admin/applications/:id - Get application details
3. PUT /api/admin/applications/:id/review - Approve/reject application
4. GET /api/admin/users - List all users
5. PUT /api/admin/users/:id/suspend - Suspend/unsuspend user
6. GET /api/admin/bookings - List all bookings
7. GET /api/admin/payments - List all payments
8. GET /api/admin/analytics - Get platform analytics

**Features:**
- Admin-only access control
- User management (view, suspend, delete)
- Guide application review
- Booking oversight
- Payment monitoring
- Content moderation
- Analytics dashboard data
- Audit logging
- Export functionality (CSV)

**Analytics Metrics:**
- Total users (tourists, guides)
- Total bookings
- Revenue (total, by period)
- Average booking value
- Top guides
- Top experiences
- Conversion rates
- User growth
- Booking trends


### Task 13: File Upload and Storage

**Description:** Implement AWS S3 integration for file uploads.

**Files to create:**
- `src/services/uploadService.js`
- `src/config/aws-s3.js`
- `src/middleware/upload.js`
- `src/routes/upload.js`

**Endpoints:**
1. POST /api/upload/image - Upload image
2. POST /api/upload/video - Upload video
3. POST /api/upload/document - Upload document

**Features:**
- AWS S3 integration
- Multer middleware for multipart uploads
- File type validation
- File size limits (images: 5MB, videos: 50MB, docs: 5MB)
- Automatic file naming (timestamp + UUID)
- Public URL generation
- Image optimization (optional with Sharp)
- Thumbnail generation
- Secure signed URLs for private files

**Supported File Types:**
- Images: JPEG, PNG, WebP
- Videos: MP4, WebM, QuickTime
- Documents: PDF, DOC, DOCX

### Task 14: Email Notification Service

**Description:** Implement SendGrid email service for transactional emails.

**Files to create:**
- `src/services/emailService.js`
- `src/config/email.js`
- `src/templates/email/` (email templates)

**Email Types:**
1. Welcome email (on registration)
2. Email verification
3. Password reset
4. Booking confirmation (tourist)
5. New booking notification (guide)
6. Booking reminder (24 hours before)
7. Booking cancellation
8. Payment receipt
9. Review request (after completed booking)
10. Guide application status update

**Features:**
- SendGrid API integration
- HTML email templates
- Dynamic content injection
- Email queue with retry logic
- Unsubscribe handling
- Email tracking (opens, clicks)
- Fallback to AWS SES (optional)


### Task 15: SMS Notification Service

**Description:** Implement Africa's Talking SMS service for critical notifications.

**Files to create:**
- `src/services/smsService.js`
- `src/config/sms.js`

**SMS Types:**
1. Phone verification OTP
2. Booking confirmation
3. Payment confirmation
4. Booking reminder
5. Urgent updates

**Features:**
- Africa's Talking API integration
- OTP generation and verification
- SMS queue
- Delivery status tracking
- Rate limiting
- Cost optimization (send only critical SMS)

### Task 16: Middleware Implementation

**Description:** Create all required middleware for security, validation, and error handling.

**Files to create:**
- `src/middleware/auth.js` - JWT authentication
- `src/middleware/roleCheck.js` - Role-based access control
- `src/middleware/validation.js` - Request validation
- `src/middleware/errorHandler.js` - Global error handler
- `src/middleware/rateLimiter.js` - Rate limiting
- `src/middleware/upload.js` - File upload handling

**Features:**
- JWT token verification
- Role-based access (tourist, guide, admin)
- Input validation with express-validator
- Centralized error handling
- Rate limiting (per IP, per user)
- Request logging
- CORS configuration
- Security headers (helmet)
- Request size limiting
- XSS protection
- SQL injection prevention

### Task 17: Configuration Files

**Description:** Create all configuration files for external services.

**Files to create:**
- `src/config/database.js` - PostgreSQL connection
- `src/config/redis.js` - Redis connection
- `src/config/aws-s3.js` - AWS S3 configuration
- `src/config/email.js` - SendGrid configuration
- `src/config/sms.js` - Africa's Talking configuration
- `src/config/payments/mpesa.js` - M-Pesa configuration
- `src/config/payments/stripe.js` - Stripe configuration
- `src/config/payments/paypal.js` - PayPal configuration

**Environment Variables Required:**
```
NODE_ENV=production
PORT=5000
API_URL=https://api.eliteeventskenya.com
FRONTEND_URL=https://eliteeventskenya.com

DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379

JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=7d

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=elite-events-uploads

MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://api.../callback

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

PAYPAL_CLIENT_ID=your_id
PAYPAL_CLIENT_SECRET=your_secret

SENDGRID_API_KEY=SG.your_key
FROM_EMAIL=noreply@eliteeventskenya.com

AT_API_KEY=your_key
AT_USERNAME=your_username
```


### Task 18: Main Server Setup

**Description:** Create the main Express server with all routes and middleware.

**File:** `src/server.js`

**Features:**
- Express app initialization
- Middleware setup (cors, helmet, compression, morgan)
- Route mounting
- Socket.io integration
- Error handling
- Graceful shutdown
- Health check endpoint
- API documentation (Swagger)

**Server Structure:**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Socket.io
require('./socket/messageHandler')(io);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Task 19: Testing Suite

**Description:** Create comprehensive test suite with Jest and Supertest.

**Files to create:**
- `tests/setup.js` - Test setup
- `tests/auth.test.js` - Authentication tests
- `tests/users.test.js` - User tests
- `tests/guides.test.js` - Guide tests
- `tests/bookings.test.js` - Booking tests
- `tests/payments.test.js` - Payment tests
- `tests/reviews.test.js` - Review tests
- `tests/messages.test.js` - Message tests

**Test Coverage:**
- Unit tests for controllers
- Unit tests for services
- Integration tests for API endpoints
- End-to-end tests for critical flows
- Minimum 80% code coverage

**Test Examples:**
- User registration and login
- Guide application submission
- Booking creation and payment
- Review submission
- Message sending
- Admin operations


### Task 20: Docker Configuration

**Description:** Create Docker and Docker Compose configuration for containerization.

**Files to create:**
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: elite_events_kenya
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Task 21: API Documentation

**Description:** Create Swagger/OpenAPI documentation for all endpoints.

**Files to create:**
- `src/docs/swagger.js` - Swagger configuration
- `src/docs/schemas/` - Schema definitions

**Features:**
- OpenAPI 3.0 specification
- Interactive API documentation
- Request/response examples
- Authentication documentation
- Error response documentation
- Available at `/api-docs`

**Swagger Setup:**
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Elite Events Kenya API',
      version: '1.0.0',
      description: 'API documentation for Elite Events Kenya platform'
    },
    servers: [
      {
        url: 'https://api.eliteeventskenya.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```


### Task 22: Deployment Configuration

**Description:** Create deployment configuration and documentation.

**Files to create:**
- `nginx.conf` - Nginx reverse proxy configuration
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `DEPLOYMENT.md` - Deployment documentation

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.eliteeventskenya.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.eliteeventskenya.com;

    ssl_certificate /etc/letsencrypt/live/api.eliteeventskenya.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.eliteeventskenya.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    client_max_body_size 50M;
}
```

**CI/CD Pipeline:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to server
        run: |
          # SSH and deploy commands
```

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting on all endpoints
- [ ] Validate and sanitize all inputs
- [ ] Use parameterized queries (Prisma handles this)
- [ ] Hash passwords with bcrypt (min 10 rounds)
- [ ] Implement CORS properly
- [ ] Use helmet for security headers
- [ ] Keep dependencies updated
- [ ] Implement proper error handling (no stack traces in production)
- [ ] Use environment variables for secrets
- [ ] Implement audit logging
- [ ] Regular security audits
- [ ] Implement 2FA for admin accounts
- [ ] Monitor for suspicious activity
- [ ] Regular database backups
- [ ] Implement CSRF protection
- [ ] Use secure session management
- [ ] Validate file uploads properly
- [ ] Implement SQL injection prevention
- [ ] Use secure cookie settings


## Performance Requirements

- API response time < 200ms (95th percentile)
- Database query time < 50ms
- File upload time < 5s for 5MB files
- WebSocket latency < 100ms
- Support 1000+ concurrent users
- 99.9% uptime
- Horizontal scaling capability
- Efficient database queries with proper indexes
- Redis caching for frequently accessed data
- Connection pooling for database
- Response compression
- CDN integration for static files

## Quality Assurance

### Code Quality
- ESLint configuration for code linting
- Prettier for code formatting
- Consistent naming conventions
- Comprehensive code comments
- Modular and reusable code
- DRY principle adherence
- SOLID principles

### Testing Requirements
- Unit tests for all controllers
- Unit tests for all services
- Integration tests for all API endpoints
- End-to-end tests for critical flows
- Test coverage > 80%
- Automated testing in CI/CD
- Load testing for performance
- Security testing

### Documentation Requirements
- API documentation (Swagger)
- Code documentation (JSDoc)
- Setup instructions (README)
- Deployment guide
- Environment variables documentation
- Database schema documentation
- Architecture documentation

## Success Criteria

### Functional Requirements
- [ ] All 62+ API endpoints implemented and functional
- [ ] Database schema properly implemented with all 11 tables
- [ ] Authentication system secure and working
- [ ] All three payment gateways integrated and tested
- [ ] File uploads working correctly with S3
- [ ] Real-time messaging functional with Socket.io
- [ ] Email notifications sending correctly
- [ ] SMS notifications sending correctly
- [ ] Admin features complete and functional
- [ ] Search functionality working
- [ ] Review system complete

### Non-Functional Requirements
- [ ] API response times meet performance requirements
- [ ] Security measures implemented and tested
- [ ] Tests passing with >80% coverage
- [ ] API documentation complete
- [ ] Deployment documentation complete
- [ ] Docker configuration working
- [ ] CI/CD pipeline functional
- [ ] Error handling comprehensive
- [ ] Logging implemented
- [ ] Monitoring setup

### Integration Requirements
- [ ] Frontend can successfully call all endpoints
- [ ] Payment gateways tested in sandbox mode
- [ ] Email service sending emails
- [ ] SMS service sending messages
- [ ] File uploads to S3 working
- [ ] WebSocket connections stable
- [ ] Database migrations working
- [ ] Redis caching functional

## Timeline Estimate

### Week 1-2: Foundation
- Project setup and configuration
- Database schema implementation
- Authentication system
- Core middleware

### Week 3-4: Core Features
- User management
- Guide application system
- Experience management
- Booking system

### Week 4-5: Payments
- M-Pesa integration
- Stripe integration
- PayPal integration
- Payment testing

### Week 5-6: Communication
- Real-time messaging
- Email service
- SMS service
- Notification system

### Week 6-7: Advanced Features
- Review system
- Search functionality
- Admin features
- Analytics

### Week 7-8: Testing & Deployment
- Comprehensive testing
- Bug fixes
- Documentation
- Deployment setup
- Production launch

**Total Estimated Time:** 8 weeks

## Support and Maintenance

### Ongoing Tasks
- Monitor server health
- Database backups (daily)
- Security updates
- Dependency updates
- Performance optimization
- Bug fixes
- Feature enhancements
- User support

### Monitoring Tools
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring (UptimeRobot)
- Log aggregation (Loggly)
- Analytics (Google Analytics)

## Conclusion

This comprehensive specification provides everything needed to build a production-ready backend for Elite Events Kenya. Follow the tasks sequentially, ensure all requirements are met, and maintain high code quality throughout development.

**Key Success Factors:**
1. Follow the specification closely
2. Write tests as you develop
3. Document as you go
4. Security first approach
5. Performance optimization
6. Regular code reviews
7. Continuous integration
8. Comprehensive testing

**Ready to Start:** Click "Start Task" to begin implementation!

