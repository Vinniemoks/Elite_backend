const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/config/database');

describe('Bookings', () => {
  let token;
  let experienceId;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          experienceId,
          bookingDate: '2024-12-25',
          startTime: '10:00',
          numberOfGuests: 2,
          specialRequests: 'Vegetarian meals'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
    });

    it('should not create booking without authentication', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          experienceId,
          bookingDate: '2024-12-25',
          numberOfGuests: 2
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/bookings', () => {
    it('should get user bookings', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('bookings');
    });
  });
});
