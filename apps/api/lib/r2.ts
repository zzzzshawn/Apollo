import { S3Client } from "@aws-sdk/client-s3";
import { Env } from "../src/types";

export const createS3Client = (env: Env) => {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = env;

    if( !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) throw new Error("R2 creds not found");

    return new S3Client({
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY
        }
    })
}