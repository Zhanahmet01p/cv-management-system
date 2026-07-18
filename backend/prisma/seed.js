const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Attributes
  const attributes = [
    { name: 'English Level', category: 'Language', type: 'SELECT' },
    { name: 'IELTS Score', category: 'Language', type: 'NUMERIC' },
    { name: 'GPA', category: 'Personal Information', type: 'NUMERIC' },
    { name: 'Remote Work Availability', category: 'Personal Information', type: 'BOOLEAN' },
    { name: 'Years of Experience', category: 'Personal Information', type: 'NUMERIC' },
    { name: 'Presentation Skills', category: 'Soft Skills', type: 'SELECT' },
    { name: 'Biography', category: 'Personal Information', type: 'TEXT' },
    { name: 'Personal Photo', category: 'Personal Information', type: 'IMAGE' }
  ];

  const dbAttributes = [];
  for (const attr of attributes) {
    const dbAttr = await prisma.attribute.upsert({
      where: { name: attr.name },
      update: {},
      create: attr
    });
    dbAttributes.push(dbAttr);
    console.log(`Created attribute: ${dbAttr.name}`);
  }

  // 2. Create Users
  const users = [
    {
      email: 'candidate@example.com',
      role: 'CANDIDATE',
      firstName: 'John',
      lastName: 'Smith',
      location: 'New York, USA',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'recruiter@example.com',
      role: 'RECRUITER',
      firstName: 'Sarah',
      lastName: 'Jones',
      location: 'London, UK',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
    },
    {
      email: 'admin@example.com',
      role: 'ADMIN',
      firstName: 'David',
      lastName: 'Miller',
      location: 'Berlin, Germany',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const dbUsers = [];
  for (const user of users) {
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    });
    dbUsers.push(dbUser);
    console.log(`Created user: ${dbUser.email} (${dbUser.role})`);
  }

  // 3. Create Positions
  const positions = [
    {
      title: 'Business Analyst',
      description: 'We are seeking a Business Analyst to join our dynamic team. The candidate will work closely with stakeholders to gather requirements, analyze business processes, and design solutions. High English proficiency is required.',
      maxProjects: 3,
      tags: ['Agile', 'Jira', 'SQL', 'Excel'],
      attributes: ['English Level', 'GPA']
    },
    {
      title: 'DevOps Engineer',
      description: 'Looking for a DevOps Engineer to manage and automate our cloud infrastructure. Experience with CI/CD pipelines, container orchestration, and cloud services (AWS) is key. Remote availability is highly preferred.',
      maxProjects: 3,
      tags: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
      attributes: ['Remote Work Availability', 'Years of Experience']
    },
    {
      title: 'QA Engineer',
      description: 'Join our team as a Quality Assurance Engineer to ensure the high standard of our web and mobile applications. Automated testing experience is a plus.',
      maxProjects: 2,
      tags: ['Selenium', 'Jest', 'Postman'],
      attributes: ['Remote Work Availability', 'Years of Experience']
    }
  ];

  for (const pos of positions) {
    const dbPos = await prisma.position.create({
      data: {
        title: pos.title,
        description: pos.description,
        maxProjects: pos.maxProjects,
        tags: {
          create: pos.tags.map(t => ({ name: t }))
        },
        attributes: {
          create: dbAttributes
            .filter(a => pos.attributes.includes(a.name))
            .map(a => ({ attributeId: a.id }))
        }
      }
    });
    console.log(`Created position: ${dbPos.title}`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
