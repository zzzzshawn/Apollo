import { PrismaClient } from "@prisma/client/edge";
import { Env } from "../src/types";
import { withAccelerate } from "@prisma/extension-accelerate";

export const dbClient = (env: Env) => {
  const { DATABASE_URL } = env;

  if(!DATABASE_URL){
    throw new Error("Database Credentials not found")
  }

  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate())

  console.log('DB client generated')

  return prisma;
};
