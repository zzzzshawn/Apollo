import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  console.log(c.env)
  return c.text('Hello Hono!')
})

export default app
