import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPostgresAdapter({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

