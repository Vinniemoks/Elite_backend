# Elite Events Kenya - API Documentation

Base URL: `https://api.eliteeventskenya.com`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses follow this format:

```json
{
  "status": "success" | "error",
  "data": {},
  "message": "Optional message"
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "tourist",
  "phoneNumber": "+254712345678"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "newpassword123"
}
```

### Users

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+254712345678",
  "bio": "Travel enthusiast"
}
```

### Guides

#### Apply as Guide
```http
POST /api/guides/apply
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "bio": "Experienced guide...",
  "languages": ["English", "Swahili"],
  "specializations": ["Wildlife", "Cultural"],
  "region": "Nairobi",
  "resume": <file>,
  "video": <file>
}
```

#### List Guides
```http
GET /api/guides?page=1&limit=20&region=Nairobi&rating=4
```

#### Get Guide Profile
```http
GET /api/guides/:id
```

### Experiences

#### List Experiences
```http
GET /api/experiences?category=cultural&location=Nairobi&minPrice=50&maxPrice=200
```

#### Get Experience
```http
GET /api/experiences/:id
```

#### Create Experience (Guide only)
```http
POST /api/experiences
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nairobi City Tour",
  "description": "Explore Nairobi...",
  "category": "cultural",
  "location": "Nairobi",
  "pricePerPerson": 50,
  "duration": 3,
  "maxGroupSize": 10,
  "images": ["url1", "url2"]
}
```

### Bookings

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "experienceId": "uuid",
  "bookingDate": "2024-12-25",
  "startTime": "10:00",
  "numberOfGuests": 2,
  "specialRequests": "Vegetarian meals"
}
```

#### List User Bookings
```http
GET /api/bookings
Authorization: Bearer <token>
```

#### Cancel Booking
```http
PUT /api/bookings/:id/cancel
Authorization: Bearer <token>
```

### Payments

#### Initiate M-Pesa Payment
```http
POST /api/payments/mpesa/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "uuid",
  "phoneNumber": "+254712345678"
}
```

#### Create Stripe Payment Intent
```http
POST /api/payments/stripe/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "uuid"
}
```

### Reviews

#### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Amazing experience!",
  "photos": ["url1", "url2"]
}
```

#### Get Guide Reviews
```http
GET /api/reviews/guide/:guideId?page=1&limit=20
```

### Search

#### Global Search
```http
GET /api/search?q=safari&type=experiences&category=adventure&minPrice=100
```

### Admin (Admin only)

#### Get Applications
```http
GET /api/admin/applications?status=pending
Authorization: Bearer <admin_token>
```

#### Review Application
```http
PUT /api/admin/applications/:id/review
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved",
  "reason": "Optional rejection reason"
}
```

#### Get Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <admin_token>
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limits

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- File uploads: 20 requests per hour
