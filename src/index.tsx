import { Hono } from 'hono'
import { renderer } from './renderer'

type Bindings = {
  FULLNAME: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!{c.env.FULLNAME}</h1>)
})

export default app
