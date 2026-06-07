import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const dist = join(__dirname, 'dist')

// --- Database setup ---
let pool = null
if (process.env.DATABASE_URL) {
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INT PRIMARY KEY DEFAULT 1,
        data JSONB NOT NULL DEFAULT '{}'
      )
    `)
    await pool.query(`INSERT INTO app_state (id, data) VALUES (1, '{}') ON CONFLICT DO NOTHING`)
    console.log('Database ready')
  } catch (e) {
    console.error('DB init error:', e.message)
    pool = null
  }
} else {
  console.warn('No DATABASE_URL — data will not sync across devices')
}

// --- Express app ---
const app = express()
app.use(express.json({ limit: '1mb' }))

app.get('/api/data', async (_req, res) => {
  if (!pool) return res.json({})
  try {
    const { rows } = await pool.query('SELECT data FROM app_state WHERE id = 1')
    res.json(rows[0]?.data || {})
  } catch (e) {
    console.error('GET /api/data error:', e.message)
    res.status(500).json({})
  }
})

app.post('/api/data', async (req, res) => {
  if (!pool) return res.json(req.body)
  try {
    await pool.query('UPDATE app_state SET data = $1 WHERE id = 1', [req.body])
    res.json({ ok: true })
  } catch (e) {
    console.error('POST /api/data error:', e.message)
    res.status(500).json({ ok: false })
  }
})

app.get('/health', (_req, res) => res.json({ ok: true, db: !!pool }))

// Static SPA
app.use(express.static(dist))
app.get('*', (_req, res) => {
  const idx = join(dist, 'index.html')
  if (!existsSync(idx)) return res.status(500).send('dist/index.html missing')
  res.sendFile(idx)
})

process.on('uncaughtException', err => { console.error('uncaughtException', err); process.exit(1) })
process.on('unhandledRejection', err => { console.error('unhandledRejection', err); process.exit(1) })

app.listen(PORT, '0.0.0.0', () => console.log(`Listening on 0.0.0.0:${PORT}`))
