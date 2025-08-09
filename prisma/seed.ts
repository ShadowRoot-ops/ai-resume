// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clear existing templates
  await prisma.resumeTemplate.deleteMany();

  // Create basic templates
  await prisma.resumeTemplate.createMany({
    data: [
      {
        name: "Professional Classic",
        description: "A traditional layout perfect for corporate roles",
        category: "basic",
        isPremium: false,
        thumbnailUrl: "/templates/professional-classic.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Times New Roman",
            colorPaletteIndex: 0,
          },
          layout: "classic",
        }),
      },
      {
        name: "Modern Minimal",
        description: "Clean design with contemporary spacing",
        category: "basic",
        isPremium: false,
        thumbnailUrl: "/templates/modern-minimal.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Inter",
            colorPaletteIndex: 1,
          },
          layout: "minimal",
        }),
      },
    ],
  });

  // Create Indian corporate templates
  await prisma.resumeTemplate.createMany({
    data: [
      {
        name: "TCS Standard",
        description: "Optimized for TCS ATS systems",
        category: "indian_corporate",
        company: "TCS",
        isPremium: true,
        thumbnailUrl: "/templates/tcs-standard.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Calibri",
            colorPaletteIndex: 2,
          },
          layout: "corporate",
          atsKeywords: ["TCS", "technical", "Java", "agile"],
        }),
      },
      {
        name: "Infosys Professional",
        description: "Structured for Infosys hiring processes",
        category: "indian_corporate",
        company: "Infosys",
        isPremium: true,
        thumbnailUrl: "/templates/infosys-professional.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Calibri",
            colorPaletteIndex: 3,
          },
          layout: "corporate",
          atsKeywords: ["Infosys", "technical", "Java", "agile"],
        }),
      },
      {
        name: "Wipro Technical",
        description: "Focused on technical roles at Wipro",
        category: "indian_corporate",
        company: "Wipro",
        isPremium: true,
        thumbnailUrl: "/templates/wipro-technical.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Arial",
            colorPaletteIndex: 4,
          },
          layout: "technical",
          atsKeywords: ["Wipro", "technical", "Java", "agile"],
        }),
      },
    ],
  });

  // Create startup templates
  await prisma.resumeTemplate.createMany({
    data: [
      {
        name: "Startup Impact",
        description: "Highlights achievements for startup environments",
        category: "startup",
        isPremium: true,
        thumbnailUrl: "/templates/startup-impact.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Poppins",
            colorPaletteIndex: 5,
          },
          layout: "impact",
          atsKeywords: ["startup", "growth", "agile", "metrics"],
        }),
      },
      {
        name: "Flipkart Tech",
        description: "Tech-focused template for Flipkart roles",
        category: "startup",
        company: "Flipkart",
        isPremium: true,
        thumbnailUrl: "/templates/flipkart-tech.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Poppins",
            colorPaletteIndex: 6,
          },
          layout: "tech",
          atsKeywords: ["ecommerce", "scale", "technology"],
        }),
      },
      {
        name: "Swiggy Operations",
        description: "Operations-focused template for Swiggy",
        category: "startup",
        company: "Swiggy",
        isPremium: true,
        thumbnailUrl: "/templates/swiggy-operations.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Roboto",
            colorPaletteIndex: 7,
          },
          layout: "operations",
          atsKeywords: ["food tech", "logistics", "operations"],
        }),
      },
    ],
  });

  // Create government templates
  await prisma.resumeTemplate.createMany({
    data: [
      {
        name: "Public Sector Standard",
        description: "Formal structure for government roles",
        category: "government",
        isPremium: true,
        thumbnailUrl: "/templates/public-sector.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Times New Roman",
            colorPaletteIndex: 0,
          },
          layout: "formal",
          atsKeywords: ["public sector", "government", "policy"],
        }),
      },
      {
        name: "UPSC Format",
        description: "Structured for civil services applications",
        category: "government",
        isPremium: true,
        thumbnailUrl: "/templates/upsc-format.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Times New Roman",
            colorPaletteIndex: 0,
          },
          layout: "formal",
          atsKeywords: ["civil services", "administration", "public policy"],
        }),
      },
    ],
  });

  // Create campus recruitment templates
  await prisma.resumeTemplate.createMany({
    data: [
      {
        name: "Campus Fresh",
        description: "Perfect for new graduates with limited experience",
        category: "fresher",
        isPremium: true,
        thumbnailUrl: "/templates/campus-fresh.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Calibri",
            colorPaletteIndex: 8,
          },
          layout: "education_first",
          atsKeywords: ["fresher", "graduate", "internship", "projects"],
        }),
      },
      {
        name: "Engineering Campus",
        description: "Highlights technical projects and education",
        category: "fresher",
        isPremium: true,
        thumbnailUrl: "/templates/engineering-campus.jpg",
        templateData: JSON.stringify({
          style: {
            fontFamily: "Arial",
            colorPaletteIndex: 9,
          },
          layout: "technical_education",
          atsKeywords: ["engineering", "technical", "projects", "fresher"],
        }),
      },
    ],
  });

  console.log("Database seeded with templates!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
