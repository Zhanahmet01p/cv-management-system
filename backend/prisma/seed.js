const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with demo data...');

  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.cV.deleteMany();
  await prisma.positionAttribute.deleteMany();
  await prisma.positionTag.deleteMany();
  await prisma.position.deleteMany();
  await prisma.userAttributeValue.deleteMany();
  await prisma.project.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.user.deleteMany();

  const attributes = [
    { name: 'English Level', category: 'Language', type: 'SELECT' },
    { name: 'IELTS Score', category: 'Language', type: 'NUMERIC' },
    { name: 'GPA', category: 'Education', type: 'NUMERIC' },
    { name: 'Remote Work Availability', category: 'Work Style', type: 'BOOLEAN' },
    { name: 'Years of Experience', category: 'Experience', type: 'NUMERIC' },
    { name: 'Presentation Skills', category: 'Soft Skills', type: 'SELECT' },
    { name: 'Biography', category: 'Personal Information', type: 'TEXT' },
    { name: 'Personal Photo', category: 'Personal Information', type: 'IMAGE' },
    { name: 'Leadership Experience', category: 'Soft Skills', type: 'BOOLEAN' },
    { name: 'Availability Start', category: 'Work Style', type: 'DATE' },
  ];

  const createdAttributes = [];
  for (const attr of attributes) {
    const dbAttr = await prisma.attribute.create({ data: attr });
    createdAttributes.push(dbAttr);
  }

  const users = [
    { email: 'candidate@example.com', role: 'CANDIDATE', firstName: 'John', lastName: 'Smith', location: 'New York, USA', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    { email: 'recruiter@example.com', role: 'RECRUITER', firstName: 'Sarah', lastName: 'Jones', location: 'London, UK', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
    { email: 'admin@example.com', role: 'ADMIN', firstName: 'David', lastName: 'Miller', location: 'Berlin, Germany', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { email: 'maya.chen@example.com', role: 'CANDIDATE', firstName: 'Maya', lastName: 'Chen', location: 'Singapore', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
    { email: 'luis.perez@example.com', role: 'CANDIDATE', firstName: 'Luis', lastName: 'Perez', location: 'Madrid, Spain', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
    { email: 'anna.kim@example.com', role: 'CANDIDATE', firstName: 'Anna', lastName: 'Kim', location: 'Seoul, South Korea', photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face' },
    { email: 'omar.hassan@example.com', role: 'RECRUITER', firstName: 'Omar', lastName: 'Hassan', location: 'Dubai, UAE', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
    { email: 'nina.petrov@example.com', role: 'RECRUITER', firstName: 'Nina', lastName: 'Petrov', location: 'Warsaw, Poland', photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face' },
    { email: 'daniel.rao@example.com', role: 'CANDIDATE', firstName: 'Daniel', lastName: 'Rao', location: 'Bengaluru, India', photoUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=150&h=150&fit=crop&crop=face' },
    { email: 'sofia.martin@example.com', role: 'CANDIDATE', firstName: 'Sofia', lastName: 'Martin', location: 'Lisbon, Portugal', photoUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&h=150&fit=crop&crop=face' },
  ];

  const createdUsers = [];
  for (const user of users) {
    const dbUser = await prisma.user.create({ data: user });
    createdUsers.push(dbUser);
  }

  for (const user of createdUsers) {
    const valueSeed = [
      { attributeName: 'English Level', value: 'Advanced' },
      { attributeName: 'IELTS Score', value: 7.5 },
      { attributeName: 'GPA', value: 3.8 },
      { attributeName: 'Remote Work Availability', value: true },
      { attributeName: 'Years of Experience', value: 4 },
      { attributeName: 'Presentation Skills', value: 'Excellent' },
      { attributeName: 'Leadership Experience', value: true },
      { attributeName: 'Availability Start', value: '2026-09-01' },
    ];

    for (const item of valueSeed) {
      const attr = createdAttributes.find(a => a.name === item.attributeName);
      if (attr) {
        await prisma.userAttributeValue.create({
          data: {
            userId: user.id,
            attributeId: attr.id,
            value: item.value,
          },
        });
      }
    }
  }

  const positionsData = [
    { title: 'Senior Frontend Engineer', description: 'Build polished user experiences with React, TypeScript, and modern build tooling. You will work in a cross-functional product team and influence architecture decisions.', maxProjects: 4, tags: ['React', 'TypeScript', 'Vite', 'Frontend'], attributes: ['English Level', 'Years of Experience', 'Remote Work Availability'] },
    { title: 'Backend Engineer', description: 'Design and maintain scalable APIs and services using Node.js, PostgreSQL, and distributed systems. Strong problem-solving and ownership are essential.', maxProjects: 3, tags: ['Node.js', 'PostgreSQL', 'Express', 'Backend'], attributes: ['English Level', 'Years of Experience', 'Leadership Experience'] },
    { title: 'Product Manager', description: 'Drive roadmap planning, discovery, and delivery for our B2B platform. You will coordinate stakeholders and translate insights into concrete requirements.', maxProjects: 2, tags: ['Roadmap', 'Strategy', 'Stakeholder Management', 'Analytics'], attributes: ['English Level', 'Presentation Skills', 'Leadership Experience'] },
    { title: 'Data Engineer', description: 'Build pipelines and data models to support analytics and machine learning workflows. Experience with ETL, orchestration, and cloud warehouses is valuable.', maxProjects: 3, tags: ['Python', 'ETL', 'Airflow', 'Big Data'], attributes: ['Years of Experience', 'Remote Work Availability'] },
    { title: 'UX Designer', description: 'Create thoughtful, user-centered product experiences for web and mobile products. A strong portfolio and collaborative mindset are required.', maxProjects: 2, tags: ['Figma', 'Design Systems', 'UX', 'Research'], attributes: ['Presentation Skills', 'English Level'] },
    { title: 'DevOps Engineer', description: 'Automate infrastructure and deployment processes using Docker, Kubernetes, Terraform, and cloud platforms. You will help raise engineering reliability.', maxProjects: 3, tags: ['Docker', 'Kubernetes', 'Terraform', 'AWS'], attributes: ['Remote Work Availability', 'Years of Experience'] },
    { title: 'QA Automation Engineer', description: 'Own test strategy and automation across web and API layers. Experience with Playwright or Cypress and CI pipelines is highly preferred.', maxProjects: 2, tags: ['Playwright', 'Cypress', 'Testing', 'CI/CD'], attributes: ['English Level', 'Years of Experience'] },
    { title: 'Machine Learning Engineer', description: 'Train and deploy machine learning models in production. Experience with Python, PyTorch, and MLOps is a plus.', maxProjects: 3, tags: ['Python', 'PyTorch', 'ML', 'MLOps'], attributes: ['Years of Experience', 'Leadership Experience'] },
    { title: 'Security Engineer', description: 'Support secure development practices, cloud security, and incident response. Strong understanding of authentication, networking, and compliance is needed.', maxProjects: 2, tags: ['Security', 'IAM', 'Cloud', 'Compliance'], attributes: ['English Level', 'Years of Experience'] },
    { title: 'Technical Writer', description: 'Produce clear technical documentation for internal tools and public APIs. Excellent writing and editing skills are essential.', maxProjects: 1, tags: ['Docs', 'Writing', 'API', 'Markdown'], attributes: ['English Level', 'Presentation Skills'] },
    { title: 'Mobile Engineer', description: 'Build native or cross-platform mobile apps with React Native or Swift. Strong UI and performance focus are required.', maxProjects: 3, tags: ['React Native', 'Swift', 'iOS', 'Android'], attributes: ['Years of Experience', 'Remote Work Availability'] },
    { title: 'Solutions Architect', description: 'Shape scalable technical solutions for enterprise customers and internal teams. This role requires strong systems thinking and stakeholder communication.', maxProjects: 4, tags: ['Architecture', 'Cloud', 'Enterprise', 'Design'], attributes: ['English Level', 'Leadership Experience'] },
    { title: 'Site Reliability Engineer', description: 'Improve uptime and operational excellence through automation, observability, and incident response. You will work across infrastructure and application systems.', maxProjects: 3, tags: ['SRE', 'Monitoring', 'Kubernetes', 'Observability'], attributes: ['Years of Experience', 'Remote Work Availability'] },
    { title: 'Research Engineer', description: 'Prototype new product concepts and validate ideas through experiments. Strong analytical and technical skills are needed.', maxProjects: 2, tags: ['Research', 'Experimentation', 'Python', 'Analytics'], attributes: ['English Level', 'GPA'] },
    { title: 'Customer Success Manager', description: 'Support customers as they adopt and expand our platform. You will coordinate onboarding, retention, and growth initiatives.', maxProjects: 2, tags: ['Customer Success', 'Onboarding', 'CRM', 'Communication'], attributes: ['Presentation Skills', 'Leadership Experience'] },
    { title: 'HR Business Partner', description: 'Partner with leaders to support hiring, employee engagement, and organizational development initiatives. Strong communication and judgment are required.', maxProjects: 1, tags: ['People', 'HR', 'Strategy', 'Operations'], attributes: ['Presentation Skills', 'English Level'] },
    { title: 'Cloud Platform Engineer', description: 'Own internal cloud platforms and developer tooling across multiple environments. Experience with Kubernetes and IaC is a strong plus.', maxProjects: 3, tags: ['Cloud', 'Terraform', 'Kubernetes', 'Platform'], attributes: ['Years of Experience', 'Remote Work Availability'] },
    { title: 'Data Scientist', description: 'Work on forecasting, experimentation, and product insight generation. Strong statistics and storytelling ability are important.', maxProjects: 2, tags: ['Statistics', 'Python', 'Experimentation', 'Insights'], attributes: ['English Level', 'GPA'] },
    { title: 'Growth Marketer', description: 'Improve acquisition funnels and conversion rates through data-driven campaign optimization. Strong analytical and creative thinking are key.', maxProjects: 1, tags: ['Growth', 'Marketing', 'Analytics', 'SEO'], attributes: ['English Level', 'Presentation Skills'] },
    { title: 'Fullstack Engineer', description: 'Work across frontend and backend layers to deliver features end-to-end. Strong ownership and modern web stack experience are expected.', maxProjects: 3, tags: ['React', 'Node.js', 'Fullstack', 'JavaScript'], attributes: ['English Level', 'Years of Experience'] },
  ];

  const createdPositions = [];
  for (const position of positionsData) {
    const dbPosition = await prisma.position.create({
      data: {
        title: position.title,
        description: position.description,
        maxProjects: position.maxProjects,
        tags: {
          create: position.tags.map(name => ({ name }))
        },
        attributes: {
          create: createdAttributes
            .filter(attr => position.attributes.includes(attr.name))
            .map(attr => ({ attributeId: attr.id }))
        },
      },
    });
    createdPositions.push(dbPosition);
  }

  const candidateUsers = createdUsers.filter(user => user.role === 'CANDIDATE');
  const recruiterUsers = createdUsers.filter(user => user.role === 'RECRUITER' || user.role === 'ADMIN');

  for (let i = 0; i < createdPositions.length; i++) {
    const position = createdPositions[i];
    const selectedCandidate = candidateUsers[i % candidateUsers.length];
    const selectedRecruiter = recruiterUsers[i % recruiterUsers.length];

    const cv = await prisma.cV.create({
      data: {
        userId: selectedCandidate.id,
        positionId: position.id,
        status: i % 3 === 0 ? 'PUBLISHED' : 'DRAFT',
      },
    });

    if (i % 2 === 0) {
      await prisma.comment.create({
        data: {
          positionId: position.id,
          userId: selectedRecruiter.id,
          text: `Feedback for ${position.title}: strong alignment with the role and a good fit for the team.`,
        },
      });
    }

    if (i % 4 !== 0) {
      await prisma.like.create({
        data: {
          cvId: cv.id,
          userId: selectedRecruiter.id,
        },
      });
    }
  }

  for (const user of createdUsers) {
    await prisma.project.create({
      data: {
        userId: user.id,
        name: `${user.firstName}'s Demo Project`,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-01'),
        description: 'A sample project demonstrating the user portfolio and working experience.',
        tags: ['React', 'Node.js', 'Prisma'],
      },
    });
  }

  console.log(`Seeded ${createdUsers.length} users, ${createdPositions.length} positions, and related CV/comment/like data.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
