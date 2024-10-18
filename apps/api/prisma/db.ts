import { PrismaClient } from "@prisma/client/extension";
import { Env } from "../src/types";
import { withAccelerate } from "@prisma/extension-accelerate";

export const dbClient = (env: Env) => {
  const { DATABASE_URL } = env;

  if(!DATABASE_URL){
    throw new Error("Database Credentials not found")
  }

  const prisma = new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
  }).$extends(withAccelerate())

  console.log('DB client generated')

  return prisma;
};
