import express, { Request, Response } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ✅ JSON body parser
app.use(express.json())

// Home route
app.get('/', (req: Request, res: Response) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
      </head>
      <body>
        <h1>Welcome to Express on Vercel 🚀</h1>
      </body>
    </html>
  `)
})

app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

// 🔑 Cafe24 OAuth callback
app.get('/api/oauth/callback', (req: Request, res: Response) => {
  console.log('OAuth callback received:', req.query)
  res.status(200).send('oauth ok')
})

// 🔔 Cafe24 Webhook
app.post('/api/webhook/cafe24', (req: Request, res: Response) => {
  console.log('Cafe24 webhook received:', req.body)
  res.status(200).send('webhook ok')
})

export default app
