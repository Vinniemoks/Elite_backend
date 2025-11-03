const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/config/database');

describe('Reviews', () => {
  let token;
  let completedBookingId;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/reviews', () => {
    it('should create review for completed booking', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookingId: completedBookingId,
          rating: 5,
          comment: 'Amazing experience! Highly recommended.'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.review).toHaveProperty('id');
      expect(res.body.data.review.rating).toBe(5);
    });

    it('should not create review without completed booking', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookingId: 'invalid-id',
          rating: 5,
          comment: 'Test'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate rating range', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bookingId: completedBookingId,
          rating: 6,
          comment: 'Test'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/reviews/guide/:guideId', () => {
    it('should get guide reviews', async () => {
      const res = await request(app)
        .get('/api/reviews/guide/some-guide-id');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.reviews)).toBe(true);
    });
  });
});
