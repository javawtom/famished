import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_FILE = path.join(__dirname, '.withings-tokens.json')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const CLIENT_ID = process.env.WITHINGS_CLIENT_ID
const CLIENT_SECRET = process.env.WITHINGS_CLIENT_SECRET
const REDIRECT_URI = process.env.WITHINGS_REDIRECT_URI || 'http://localhost:2000/api/withings/callback'

// ============================================
// TOKEN PERSISTENCE
// ============================================

function loadTokens() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('Error loading tokens:', e.message)
  }
  return null
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2))
}

// ============================================
// OAUTH 2.0 FLOW
// ============================================

// Step 1: Redirect user to Withings authorization page
app.get('/api/withings/authorize', (req, res) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'user.metrics',
    state: 'famished-auth',
  })
  res.redirect(`https://account.withings.com/oauth2_user/authorize2?${params}`)
})

// Step 2: Handle callback with authorization code
app.get('/api/withings/callback', async (req, res) => {
  const { code, state } = req.query

  if (!code) {
    return res.status(400).json({ error: 'No authorization code received' })
  }

  try {
    // Exchange code for tokens
    const response = await fetch('https://wbsapi.withings.net/v2/oauth2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'requesttoken',
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    const data = await response.json()

    if (data.status !== 0) {
      console.error('Withings token error:', data)
      return res.status(400).json({ error: 'Failed to get tokens', details: data })
    }

    const tokens = {
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      userid: data.body.userid,
      expires_at: Date.now() + (data.body.expires_in * 1000),
    }

    saveTokens(tokens)
    console.log('Withings connected successfully for user:', tokens.userid)

    // Redirect back to the Progress page
    res.redirect('/progress?withings=connected')
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ============================================
// TOKEN REFRESH
// ============================================

async function getValidAccessToken() {
  let tokens = loadTokens()
  if (!tokens) return null

  // Refresh if expired or close to expiring (5 min buffer)
  if (Date.now() > tokens.expires_at - 300000) {
    try {
      const response = await fetch('https://wbsapi.withings.net/v2/oauth2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'requesttoken',
          grant_type: 'refresh_token',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
        }),
      })

      const data = await response.json()

      if (data.status !== 0) {
        console.error('Token refresh failed:', data)
        return null
      }

      tokens = {
        access_token: data.body.access_token,
        refresh_token: data.body.refresh_token,
        userid: data.body.userid,
        expires_at: Date.now() + (data.body.expires_in * 1000),
      }

      saveTokens(tokens)
    } catch (err) {
      console.error('Token refresh error:', err)
      return null
    }
  }

  return tokens.access_token
}

// ============================================
// WEIGHT MEASUREMENTS
// ============================================

// Get weight measurements (meastype 1 = weight in kg)
app.get('/api/withings/measurements', async (req, res) => {
  const accessToken = await getValidAccessToken()

  if (!accessToken) {
    return res.status(401).json({ error: 'Not connected', connected: false })
  }

  try {
    // Get measurements from the last 90 days
    const startdate = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)
    const enddate = Math.floor(Date.now() / 1000)

    const response = await fetch('https://wbsapi.withings.net/measure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: new URLSearchParams({
        action: 'getmeas',
        meastype: '1', // Weight
        category: '1', // Real measurements only (not objectives)
        startdate: startdate.toString(),
        enddate: enddate.toString(),
      }),
    })

    const data = await response.json()

    if (data.status !== 0) {
      console.error('Measurement fetch failed:', data)
      return res.status(400).json({ error: 'Failed to fetch measurements', details: data })
    }

    // Parse Withings measurement format
    // Withings returns weight as value * 10^unit (e.g., value=75123, unit=-3 → 75.123 kg)
    const measurements = []
    if (data.body && data.body.measuregrps) {
      for (const grp of data.body.measuregrps) {
        const date = new Date(grp.date * 1000).toISOString().split('T')[0]
        for (const measure of grp.measures) {
          if (measure.type === 1) { // Weight
            const weightKg = measure.value * Math.pow(10, measure.unit)
            const weightLbs = weightKg * 2.20462
            measurements.push({
              date,
              weightKg: Math.round(weightKg * 10) / 10,
              weightLbs: Math.round(weightLbs * 10) / 10,
              timestamp: grp.date,
            })
          }
        }
      }
    }

    // Sort by date, newest last
    measurements.sort((a, b) => a.timestamp - b.timestamp)

    res.json({
      connected: true,
      measurements,
      latest: measurements.length > 0 ? measurements[measurements.length - 1] : null,
    })
  } catch (err) {
    console.error('Measurement fetch error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Check connection status
app.get('/api/withings/status', (req, res) => {
  const tokens = loadTokens()
  res.json({
    connected: !!tokens,
    userid: tokens?.userid || null,
  })
})

// Disconnect
app.post('/api/withings/disconnect', (req, res) => {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE)
    }
    res.json({ disconnected: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ============================================
// START SERVER
// ============================================

const PORT = process.env.API_PORT || 3001
app.listen(PORT, () => {
  console.log(`✨ Withings API server running on http://localhost:${PORT}`)
  console.log(`   OAuth redirect URI: ${REDIRECT_URI}`)
})

export default app
