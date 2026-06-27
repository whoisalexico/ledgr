import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEFAULT_CATEGORIES: { name: string; type: "INCOME" | "EXPENSE" }[] = [
  { name: "Зарплата", type: "INCOME" },
  { name: "Подработка", type: "INCOME" },
  { name: "Инвестиции", type: "INCOME" },
  { name: "Другое", type: "INCOME" },
  { name: "Продукты", type: "EXPENSE" },
  { name: "Транспорт", type: "EXPENSE" },
  { name: "Подписки", type: "EXPENSE" },
  { name: "Техника", type: "EXPENSE" },
  { name: "Развлечения", type: "EXPENSE" },
  { name: "Здоровье", type: "EXPENSE" },
  { name: "Другое", type: "EXPENSE" },
];

async function main() {
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: cat.name, type: cat.type },
    });

    if (!existing) {
      await prisma.category.create({
        data: { name: cat.name, type: cat.type, userId: null },
      });
    }
  }
  console.log(`Готово: ${DEFAULT_CATEGORIES.length} дефолтных категорий`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
