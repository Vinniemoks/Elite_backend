const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eliteeventskenya.com' },
    update: {},
    create: {
      email: 'admin@eliteeventskenya.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      userType: 'admin',
      status: 'active',
      emailVerified: true
    }
  });

  console.log('Admin user created:', admin.email);

  // Create sample tourist
  const tourist = await prisma.user.upsert({
    where: { email: 'tourist@example.com' },
    update: {},
    create: {
      email: 'tourist@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'John',
      lastName: 'Doe',
      userType: 'tourist',
      status: 'active',
      emailVerified: true,
      phoneNumber: '+254712345678'
    }
  });

  console.log('Sample tourist created:', tourist.email);

  // Create sample guide user
  const guideUser = await prisma.user.upsert({
    where: { email: 'guide@example.com' },
    update: {},
    create: {
      email: 'guide@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Jane',
      lastName: 'Smith',
      userType: 'guide',
      status: 'active',
      emailVerified: true,
      phoneNumber: '+254723456789'
    }
  });

  // Create guide profile
  const guide = await prisma.guide.upsert({
    where: { userId: guideUser.id },
    update: {},
    create: {
      userId: guideUser.id,
      bio: 'Experienced tour guide with 5+ years showing tourists the best of Kenya',
      languages: ['English', 'Swahili', 'French'],
      specializations: ['Wildlife Safari', 'Cultural Tours', 'Adventure'],
      region: 'Nairobi',
      rating: 4.8,
      totalReviews: 0,
      status: 'active'
    }
  });

  console.log('Sample guide created:', guideUser.email);

  // Create sample experiences
  const experience1 = await prisma.experience.create({
    data: {
      guideId: guide.id,
      title: 'Nairobi City Walking Tour',
      description: 'Explore the vibrant streets of Nairobi with a local guide',
      category: 'cultural',
      location: 'Nairobi CBD',
      pricePerPerson: 50,
      currency: 'USD',
      duration: 3,
      maxGroupSize: 10,
      images: [],
      status: 'active'
    }
  });

  const experience2 = await prisma.experience.create({
    data: {
      guideId: guide.id,
      title: 'Maasai Mara Safari Adventure',
      description: 'Experience the wildlife of Maasai Mara National Reserve',
      category: 'adventure',
      location: 'Maasai Mara',
      pricePerPerson: 300,
      currency: 'USD',
      duration: 8,
      maxGroupSize: 6,
      images: [],
      status: 'active'
    }
  });

  console.log('Sample experiences created');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
