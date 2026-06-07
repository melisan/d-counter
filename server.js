import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const dist = join(__dirname, 'dist')

console.log('=== startup ===')
console.log('PORT env:', process.env.PORT)
console.log('Using port:', PORT)
console.log('dist path:', dist)
console.log('dist exists:', existsSync(dist))
console.log('index.html exists:', existsSync(join(dist, 'index.html')))

const app = express()

app.get('/health', (_req, res) => res.json({ ok: true, port: PORT }))
app.use(express.static(dist))
app.get('*', (_req, res) => {
  const idx = join(dist, 'index.html')
  if (!existsSync(idx)) return res.status(500).send('dist/index.html missing')
  res.sendFile(idx)
})

process.on('uncaughtException', err => { console.error('uncaughtException', err); process.exit(1) })
process.on('unhandledRejection', err => { console.error('unhandledRejection', err); process.exit(1) })

app.listen(PORT, '0.0.0.0', () => console.log(`Listening on 0.0.0.0:${PORT}`))
