# Complete API Endpoints - Elite Events Kenya

Base URL: `http://localhost:5000` (Development)  
Production URL: `https://api.eliteeventskenya.com`

## Authentication Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+254712345678",
  "userType": "TOURIST"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_here"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

## User Endpoints

### Get Current User
```http
GET /api/users/me
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+254712345678"
}
```

### Upload Avatar
```http
POST /api/users/me/upload-avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

avatar: <file>
```

### Delete Account
```http
DELETE /api/users/me
Authorization: Bearer {token}
```

## Guide Endpoints

### List All Guides
```http
GET /api/guides?page=1&limit=10&region=Nairobi&rating=4
```

### Get Guide Profile
```http
GET /api/guides/:id
```

### Apply as Guide
```http
POST /api/guides/apply
Authorization: Bearer {token}
Content-Type: multipart/form-data

bio: "Experienced guide..."
region: "Nairobi"
languages: "English,Swahili"
specializations: "Wildlife,Cultural"
yearsOfExperience: 5
licenseNumber: "LIC123"
resume: <file>
video: <file>
idDocument: <file>
certifications: <files>
```

### Update Guide Profile
```http
PUT /api/guides/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "bio": "Updated bio",
  "region": "Nairobi",
  "languages": "English,Swahili,French",
  "specializations": "Wildlife,Cultural,Adventure"
}
```

### Get Guide Availability
```http
GET /api/guides/:id/availability?startDate=2024-01-01&endDate=2024-01-31
```

### Set Guide Availability
```http
POST /api/guides/:id/availability
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-01-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "isAvailable": true
}
```

## Experience Endpoints

### List Experiences
```http
GET /api/experiences?page=1&limit=10&category=cultural&location=Nairobi&minPrice=50&maxPrice=200
```

### Get Experience
```http
GET /api/experiences/:id
```

### Create Experience (Guide Only)
```http
POST /api/experiences
Authorization: Bearer {token}
Content-Type: multipart/form-data

title: "Nairobi City Tour"
description: "Explore the vibrant city..."
category: "cultural"
location: "Nairobi"
duration: 3
maxGroupSize: 10
pricePerPerson: 50
currency: "USD"
inclusions: "Transport,Guide,Lunch"
exclusions: "Personal expenses"
meetingPoint: "City Center"
images: <files>
```

### Update Experience (Guide Only)
```http
PUT /api/experiences/:id
Authorization: Bearer {token}
Content-Type: multipart/form-data

title: "Updated Title"
pricePerPerson: 60
status: "ACTIVE"
images: <files>
```

### Delete Experience (Guide Only)
```http
DELETE /api/experiences/:id
Authorization: Bearer {token}
```

## Booking Endpoints

### Get User Bookings
```http
GET /api/bookings
Authorization: Bearer {token}
```

### Get Guide Bookings
```http
GET /api/bookings/guide
Authorization: Bearer {token}
```

### Get Booking Details
```http
GET /api/bookings/:id
Authorization: Bearer {token}
```

### Create Booking
```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "experienceId": "uuid",
  "date": "2024-12-25",
  "numberOfPeople": 2,
  "specialRequests": "Vegetarian meals",
  "currency": "USD"
}
```

### Update Booking Status
```http
PATCH /api/bookings/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

## Payment Endpoints

### Process Stripe Payment
```http
POST /api/payments/stripe
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "uuid",
  "paymentMethodId": "pm_xxx"
}
```

### Process M-Pesa Payment
```http
POST /api/payments/mpesa
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "uuid",
  "phoneNumber": "+254712345678"
}
```

### M-Pesa Callback (Public)
```http
POST /api/payments/mpesa/callback
Content-Type: application/json

{
  "Body": {
    "stkCallback": {
      "ResultCode": 0,
      "CheckoutRequestID": "xxx"
    }
  }
}
```

### Get Payment Status
```http
GET /api/payments/:id
Authorization: Bearer {token}
```

## Review Endpoints

### Get Experience Reviews
```http
GET /api/experiences/:experienceId/reviews?page=1&limit=10
```

### Create Review
```http
POST /api/experiences/:experienceId/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Amazing experience!"
}
```

### Add Guide Response
```http
POST /api/reviews/:reviewId/response
Authorization: Bearer {token}
Content-Type: application/json

{
  "response": "Thank you for your feedback!"
}
```

## Message Endpoints

### Get Conversations
```http
GET /api/messages/conversations
Authorization: Bearer {token}
```

### Get Message History
```http
GET /api/messages/:userId?page=1&limit=50
Authorization: Bearer {token}
```

### Send Message
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipientId": "uuid",
  "content": "Hello!"
}
```

## Search Endpoint

### Global Search
```http
GET /api/search?q=safari&type=experiences&category=adventure&minPrice=100&maxPrice=500
```

## Notification Endpoints

### Get Notifications
```http
GET /api/notifications?page=1&limit=20&status=UNREAD
Authorization: Bearer {token}
```

### Mark as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer {token}
```

### Mark All as Read
```http
PATCH /api/notifications/read-all
Authorization: Bearer {token}
```

### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer {token}
```

### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer {token}
```

## Upload Endpoints

### Upload Image
```http
POST /api/upload/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

image: <file>
```

### Upload Video
```http
POST /api/upload/video
Authorization: Bearer {token}
Content-Type: multipart/form-data

video: <file>
```

### Upload Document
```http
POST /api/upload/document
Authorization: Bearer {token}
Content-Type: multipart/form-data

document: <file>
```

## Admin Endpoints (Admin Only)

### Get Applications
```http
GET /api/admin/applications?status=PENDING&page=1&limit=20
Authorization: Bearer {admin_token}
```

### Get Application Details
```http
GET /api/admin/applications/:id
Authorization: Bearer {admin_token}
```

### Review Application
```http
PUT /api/admin/applications/:id/review
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "APPROVED",
  "reason": "Optional rejection reason"
}
```

### Get All Users
```http
GET /api/admin/users?userType=TOURIST&status=ACTIVE&page=1&limit=20
Authorization: Bearer {admin_token}
```

### Suspend User
```http
PUT /api/admin/users/:id/suspend
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "suspend": true
}
```

### Get All Bookings
```http
GET /api/admin/bookings?status=CONFIRMED&page=1&limit=20
Authorization: Bearer {admin_token}
```

### Get All Payments
```http
GET /api/admin/payments?status=COMPLETED&page=1&limit=20
Authorization: Bearer {admin_token}
```

### Get Analytics
```http
GET /api/admin/analytics
Authorization: Bearer {admin_token}
```

## Health Check

### Server Health
```http
GET /health
```

Response:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## WebSocket Events (Socket.IO)

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Send Message
```javascript
socket.emit('send_message', {
  recipientId: 'uuid',
  content: 'Hello!'
});
```

### Receive Message
```javascript
socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

### Typing Indicator
```javascript
socket.emit('typing', { recipientId: 'uuid' });
socket.emit('stop_typing', { recipientId: 'uuid' });
```

### Mark as Read
```javascript
socket.emit('mark_read', { messageId: 'uuid' });
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limits

- Authentication endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes
- Upload endpoints: 20 requests per hour

## Frontend Integration

All endpoints are configured to accept requests from:
- Development: `http://localhost:3000`
- Production: `https://eliteeventskenya.com`

Configure CORS_ORIGIN in `.env` to match your frontend URL.
