import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample regions
  const regions = [
    { name: 'Tashkent' },
    { name: 'Samarqand' },
    { name: 'Buxoro' },
    { name: 'Andijon' },
    { name: "Farg'ona" },
    { name: 'Namangan' },
    { name: 'Navoiy' },
    { name: 'Qashqadaryo' },
    { name: 'Surxondaryo' },
    { name: 'Jizzax' },
    { name: 'Sirdaryo' },
    { name: 'Xorazm' },
    { name: "Qoraqalpog'iston" },
  ];

  for (const region of regions) {
    try {
      await prisma.region.upsert({
        where: { name: region.name },
        update: {},
        create: region,
      });
      console.log(`Created region: ${region.name}`);
    } catch (error) {
      console.log(`Region ${region.name} already exists`);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
