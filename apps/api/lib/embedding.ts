import { HfInference } from "@huggingface/inference"
import { Env } from "../src/types"


interface EmbeddingProps {
    env: Env,
    text: string
}

export const getEmbeddings = async ({env, text}: EmbeddingProps) => {
    const inference = new HfInference(env.HUGGINGFACE_KEY)

    try {
        const model = "thenlper/gte-small";

        const embeddings = (await inference.featureExtraction({
                model,
                inputs: text,
            })) as number[]

        return embeddings

    } catch (error) {
        console.log(error)
        return []
    }
}