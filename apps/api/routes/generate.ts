import { Hono } from "hono";
import { z } from "zod";
import { Env } from "../src/types";
import { zValidator } from "@hono/zod-validator";
import { HfInference } from "@huggingface/inference";
import { generateUniqueId } from "../lib/utils";
import { createS3Client } from "../lib/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { HTTPException } from "hono/http-exception";
import { dbClient } from "../prisma/db";
import { getEmbeddings } from "../lib/embedding";

const app = new Hono<{ Bindings: Env }>();

const generateImageSchema = z.object({
  prompt: z
    .string()
    .max(120, { message: "Prompt must be less than 120 characters." }),
});

app.post("/", zValidator("json", generateImageSchema), async (c) => {
  try {
    // get prompt from body
    const body = c.req.valid("json");
    const prompt = body.prompt;

    // ? todo: check if text is nfsw

    // initialize HF
    const model = new HfInference(c.env.HUGGINGFACE_KEY);

    // Generate Image with prompt
    const blobImage = (await model.request({
      model: "alvdansen/littletinies",
      inputs: prompt,
    })) as Blob;

    //create id for image to save to bucket
    const imageId = generateUniqueId();
    // initialize a S#Client
    const r2 = createS3Client(c.env);

    // get bucket public url where u can upload file
    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: c.env.R2_BUCKET_NAME,
        Key: `images/${imageId}.jpeg`,
      }),
      { expiresIn: 60 }
    );

    // upload the file
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": blobImage.type,
      },
    });

    if(!uploadResponse.ok){
        throw new HTTPException(500, {
            message: "Failed to upload image. Please Try again."
        })
    }

    // now connect to db and save the image there
    const db = dbClient(c.env);

    // create embedding of the image
    const embedding = await getEmbeddings({
        env: c.env,
        text: prompt
    })
    // create buffer of embeddings
    const embeddingBuffer = Buffer.from(new Float32Array(embedding).buffer)
    
    await db.image.create({
        data: {
            id: imageId,
            prompt: prompt,
            embedding: embeddingBuffer
        }
    })

    const imageBuffer = await blobImage.arrayBuffer();

    return c.body(imageBuffer, 200, {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `inline; filename="${prompt}.jpeg`
    })



  } catch (error) {
    console.log(error);
  }
});

export { app as generate }
