import { Hono } from 'hono'
import { generate } from "../routes/generate"
import { image } from '../routes/images'

const app = new Hono()

app.get('/', (c) => {
  return c.text(`hello`)
})

app.route("/generate", generate)
app.route("/images", image)

export default app
