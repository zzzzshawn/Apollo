import { Hono } from 'hono'
import { generate } from "../routes/generate"

const app = new Hono()

app.get('/', (c) => {
  const a = JSON.stringify(c.env)
  return c.text(`hello ${a}`)
})

app.route("/generate", generate)

export default app
