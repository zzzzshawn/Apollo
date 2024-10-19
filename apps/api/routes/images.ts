import { Hono } from "hono";
import { z } from "zod";
import { Env } from "../src/types";
import { zValidator } from "@hono/zod-validator";
import { dbClient } from "../prisma/db";
import { getEmbeddings } from "../lib/embedding";

const queryImageSchema = z.object({
  query: z.string().optional(),
  page: z.string().optional(),
});

type CountResult = {
    count: number
}

const app = new Hono<{ Bindings: Env }>();

app.get("/", zValidator("query", queryImageSchema), async (c) => {
  const query = c.req.query("query");
  const page = c.req.query("page");

  const pageAsNumber = Number(page);
  const fallbackPage =
    Number.isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;
  const limit = 12;
  const skip = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0;

  const db = dbClient(c.env);

  let embeddingBuffer = undefined;

  if (query) {
    const embedding = await getEmbeddings({
      env: c.env,
      text: query,
    });

    embeddingBuffer = Buffer.from(new Float32Array(embedding).buffer);
  }

  const data = await db.$queryRaw`
    SELECT id, prompt, vector_distance_cos(embedding, ${embeddingBuffer}) AS similarity
    FROM images
    ${embeddingBuffer ? `WHERE vector_distance_cos(embedding, ${embeddingBuffer}) < 0.4` : ""}
    ORDER BY ${embeddingBuffer ? "similarity" : "createdAt DESC"}
    LIMIT ${limit}
    OFFSET ${skip};
  `;

  // Count query to get the total number of matching records
  const countQuery = await db.$queryRaw<CountResult[]>`
    SELECT COUNT(*) AS count
    FROM images
    ${embeddingBuffer ? `WHERE vector_distance_cos(embedding, ${embeddingBuffer}) < 0.4` : ""};
  `;

  // Extract the count value from the result
  const count = countQuery[0]?.count ?? 0;

  return c.json({
    data,
    count
  })
});

app.get("/random", async (c)=> {
    const count = 12;
    const db = dbClient(c.env);
    
    const randomImages = await db.image.findMany({
        select: {
            id: true,
        },
        take: Number(count),
        orderBy: {
            createdAt: 'desc'
        },
    })

    return c.json({
        data: randomImages,
    })
})

export {app as image}