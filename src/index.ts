import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ✅ 반드시 필요
app.use(express.json())

// Home
app.get('/', (req, res) => { ... })

app.get('/about', (req, res) => { ... })

app.get('/api-data', (req, res) => { ... })

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 🔑 OAuth callback
app.get('/api/oauth/callback', (req, res) => {
  console.log('OAuth callback received:', req.query)
  res.status(200).send('oauth ok')
})

// 🔔 Webhook
app.post('/api/webhook/cafe24', (req, res) => {
  console.log('Cafe24 webhook received:', req.body)
  res.status(200).send('webhook ok')
})

export default app
