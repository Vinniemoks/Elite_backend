const { prisma } = require('../config/database');

class SearchService {
  async globalSearch(query, filters = {}) {
    const {
      type = 'all',
      category,
      location,
      minPrice,
      maxPrice,
      rating,
      page = 1,
      limit = 20
    } = filters;

    const skip = (page - 1) * limit;
    const results = {};

    if (type === 'all' || type === 'guides') {
      const guideWhere = {
        status: 'approved',
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
          { specializations: { has: query } }
        ]
      };

      if (location) guideWhere.region = location;
      if (rating) guideWhere.rating = { gte: parseFloat(rating) };

      results.guides = await prisma.guide.findMany({
        where: guideWhere,
        take: limit,
        skip,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profilePicture: true
            }
          }
        }
      });
    }

    if (type === 'all' || type === 'experiences') {
      const experienceWhere = {
        status: 'active',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (category) experienceWhere.category = category;
      if (location) experienceWhere.location = { contains: location, mode: 'insensitive' };
      if (minPrice) experienceWhere.pricePerPerson = { gte: parseFloat(minPrice) };
      if (maxPrice) {
        experienceWhere.pricePerPerson = {
          ...experienceWhere.pricePerPerson,
          lte: parseFloat(maxPrice)
        };
      }

      results.experiences = await prisma.experience.findMany({
        where: experienceWhere,
        take: limit,
        skip,
        include: {
          guide: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  profilePicture: true
                }
              }
            }
          }
        }
      });
    }

    return results;
  }
}

module.exports = new SearchService();
