import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/prisma/client";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const skills = await prisma.skill.findMany({ orderBy: [{ category: "asc" }, { displayOrder: "asc" }] });
  console.log("CURRENT SKILLS IN DB:", JSON.stringify(skills, null, 2));
}
main().catch(console.error).finally(() => process.exit(0));
