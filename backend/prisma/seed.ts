import { prisma } from "../src/lib/prisma.js";

const categories = [
  { name: "Salary", type: "INCOME", slug: "salary" },
  { name: "Freelance", type: "INCOME", slug: "freelance" },
  { name: "Business", type: "INCOME", slug: "business" },
  { name: "Investments", type: "INCOME", slug: "investments" },
  { name: "Other Income", type: "INCOME", slug: "other-income" },

  { name: "Food", type: "EXPENSE", slug: "food" },
  { name: "Transport", type: "EXPENSE", slug: "transport" },
  { name: "Housing", type: "EXPENSE", slug: "housing" },
  { name: "Education", type: "EXPENSE", slug: "education" },
  { name: "Utilities", type: "EXPENSE", slug: "utilities" },
  { name: "Healthcare", type: "EXPENSE", slug: "healthcare" },
  { name: "Entertainment", type: "EXPENSE", slug: "entertainment" },
  { name: "Shopping", type: "EXPENSE", slug: "shopping" },
  { name: "Other Expenses", type: "EXPENSE", slug: "other-expenses" },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log(`Successfully seeded ${categories.length} categories.`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
