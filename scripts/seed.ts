// scripts/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const user = await prisma.user.create({
    data: {
      clerkId: "test_clerk_id", // Added this line
      name: "Test Recruiter",
      email: "test@example.com",
      role: "recruiter",
    },
  });

  // Create sample templates for the user
  await prisma.template.createMany({
    data: [
      {
        companyName: "Google",
        jobTitle: "Software Engineer",
        industry: "Technology",
        seniorityLevel: "Mid-level",
        department: "Engineering",
        resumeContent: JSON.stringify({
          personalInfo: {
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "(555) 123-4567",
            location: "San Francisco, CA",
          },
          summary:
            "Experienced software engineer with expertise in full-stack development.",
          skills: ["JavaScript", "React", "Node.js", "Python"],
          experience: [
            {
              title: "Senior Software Engineer",
              company: "Tech Corp",
              location: "San Francisco, CA",
              startDate: "2021-01",
              endDate: "Present",
              description: "Led development of core product features.",
            },
          ],
        }),
        tipsAndInsights: JSON.stringify([
          "Focus on impact rather than responsibilities",
          "Highlight collaborative projects",
          "Include metrics wherever possible",
        ]),
        keySkills: JSON.stringify([
          "JavaScript",
          "React",
          "Node.js",
          "Python",
          "AWS",
        ]),
        cultureFitIndicators: JSON.stringify([
          "Open source contributions",
          "Team collaboration skills",
          "Initiative and innovation",
        ]),
        redFlags: JSON.stringify([
          "Lack of quantifiable achievements",
          "Job hopping without clear progression",
          "Missing relevant technical skills",
        ]),
        sampleInterviewQuestions: JSON.stringify([
          "Describe a complex technical problem you solved",
          "How do you approach testing your code?",
          "Explain a project where you had to make technical compromises",
        ]),
        downloads: 123,
        views: 456,
        successRate: 87,
        atsScore: 92,
        isPublic: true,
        userId: user.id,
      },
      {
        companyName: "Microsoft",
        jobTitle: "Product Manager",
        industry: "Technology",
        seniorityLevel: "Senior",
        department: "Product",
        resumeContent: JSON.stringify({
          personalInfo: {
            name: "Alex Johnson",
            email: "alex.johnson@example.com",
            phone: "(555) 987-6543",
            location: "Seattle, WA",
          },
          summary:
            "Strategic product manager with 7+ years experience in SaaS products.",
          skills: [
            "Product Strategy",
            "User Research",
            "Agile/Scrum",
            "Data Analytics",
          ],
          experience: [
            {
              title: "Senior Product Manager",
              company: "Software Inc",
              location: "Seattle, WA",
              startDate: "2020-06",
              endDate: "Present",
              description:
                "Led product strategy resulting in 40% revenue growth.",
            },
          ],
        }),
        tipsAndInsights: JSON.stringify([
          "Emphasize business impact metrics",
          "Showcase cross-functional leadership",
          "Highlight customer-centric initiatives",
        ]),
        keySkills: JSON.stringify([
          "Product Strategy",
          "User Research",
          "Agile/Scrum",
          "Data Analytics",
          "Roadmapping",
        ]),
        cultureFitIndicators: JSON.stringify([
          "Growth mindset",
          "Customer-focused approach",
          "Strategic thinking",
        ]),
        redFlags: JSON.stringify([
          "Lack of quantifiable results",
          "Missing evidence of stakeholder management",
          "Poor communication skills",
        ]),
        sampleInterviewQuestions: JSON.stringify([
          "How do you prioritize features in a product roadmap?",
          "Describe a time when you had to make a tough product decision",
          "How do you measure the success of a product?",
        ]),
        downloads: 89,
        views: 345,
        successRate: 82,
        atsScore: 88,
        isPublic: true,
        userId: user.id,
      },
      {
        companyName: "Amazon",
        jobTitle: "Data Scientist",
        industry: "Technology",
        seniorityLevel: "Mid-level",
        department: "Data Science",
        resumeContent: JSON.stringify({
          personalInfo: {
            name: "Sarah Chen",
            email: "sarah.chen@example.com",
            phone: "(555) 456-7890",
            location: "Seattle, WA",
          },
          summary:
            "Data scientist with 5+ years experience in machine learning and analytics.",
          skills: ["Python", "SQL", "Machine Learning", "Data Visualization"],
          experience: [
            {
              title: "Senior Data Scientist",
              company: "Analytics Co",
              location: "Seattle, WA",
              startDate: "2019-03",
              endDate: "Present",
              description:
                "Developed ML models improving recommendation accuracy by 35%.",
            },
          ],
        }),
        tipsAndInsights: JSON.stringify([
          "Showcase specific ML/AI projects",
          "Include business outcomes of your models",
          "Demonstrate both technical and business understanding",
        ]),
        keySkills: JSON.stringify([
          "Python",
          "SQL",
          "Machine Learning",
          "Data Visualization",
          "A/B Testing",
        ]),
        cultureFitIndicators: JSON.stringify([
          "Bias for action",
          "Deep problem-solving skills",
          "Data-driven decision making",
        ]),
        redFlags: JSON.stringify([
          "Lack of practical implementation examples",
          "Missing business impact metrics",
          "Poor communication of technical concepts",
        ]),
        sampleInterviewQuestions: JSON.stringify([
          "Describe a complex data problem you solved",
          "How do you ensure your models are free from bias?",
          "How do you communicate technical findings to non-technical stakeholders?",
        ]),
        downloads: 76,
        views: 289,
        successRate: 79,
        atsScore: 85,
        isPublic: true,
        userId: user.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
