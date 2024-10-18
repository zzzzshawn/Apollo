import { Hono } from 'hono'
import { dbClient } from '../prisma/db'

const app = new Hono()

app.get('/', (c) => {
  const a = JSON.stringify(c.env)
  return c.text(`hello ${a}`)
})

export default app
