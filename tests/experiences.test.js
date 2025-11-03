const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/config/database');

describe('Experiences', () => {
  let guideToken;
  let touristToken;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/experiences', () => {
    it('should list all experiences', async () => {
      const res = await request(app)
        .get('/api/experiences');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.experiences)).toBe(true);
    });

    it('should filter experiences by category', async () => {
      const res = await request(app)
        .get('/api/experiences?category=cultural');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.experiences.every(e => e.category === 'cultural')).toBe(true);
    });
  });

  describe('POST /api/experiences', () => {
    it('should create experience as guide', async () => {
      const res = await request(app)
        .post('/api/experiences')
        .set('Authorization', `Bearer ${guideToken}`)
        .send({
          title: 'Test Experience',
          description: 'Test description',
          category: 'cultural',
          location: 'Nairobi',
          pricePerPerson: 50,
          duration: 3,
          maxGroupSize: 10
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.experience).toHaveProperty('id');
    });

    it('should not create experience as tourist', async () => {
      const res = await request(app)
        .post('/api/experiences')
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          title: 'Test Experience',
          description: 'Test description'
        });

      expect(res.statusCode).toBe(403);
    });
  });
});
