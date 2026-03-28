import { parseTokenCookie, refreshAccessToken, makeTokenCookie } from '../_withings.js'

export default async function handler(req, res) {
  let tokens = parseTokenCookie(req.headers.cookie)

  if (!tokens) {
    return res.status(401).json({ error: 'Not connected', connected: false })
  }

  try {
    // Refresh if expired or close to expiring (5 min buffer)
    if (Date.now() > tokens.expires_at - 300000) {
      const data = await refreshAccessToken(tokens.refresh_token)

      if (data.status !== 0) {
        console.error('Token refresh failed:', data)
        return res.status(401).json({ error: 'Token refresh failed', connected: false })
      }

      tokens = {
        access_token: data.body.access_token,
        refresh_token: data.body.refresh_token,
        userid: data.body.userid,
        expires_at: Date.now() + (data.body.expires_in * 1000),
      }

      // Update cookie with new tokens
      res.setHeader('Set-Cookie', makeTokenCookie(tokens))
    }

    // Get measurements from the last 90 days
    const startdate = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)
    const enddate = Math.floor(Date.now() / 1000)

    const response = await fetch('https://wbsapi.withings.net/measure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${tokens.access_token}`,
      },
      body: new URLSearchParams({
        action: 'getmeas',
        meastype: '1',
        category: '1',
        startdate: startdate.toString(),
        enddate: enddate.toString(),
      }),
    })

    const data = await response.json()

    if (data.status !== 0) {
      console.error('Measurement fetch failed:', data)
      return res.status(400).json({ error: 'Failed to fetch measurements', details: data })
    }

    const measurements = []
    if (data.body && data.body.measuregrps) {
      for (const grp of data.body.measuregrps) {
        const date = new Date(grp.date * 1000).toISOString().split('T')[0]
        for (const measure of grp.measures) {
          if (measure.type === 1) {
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
}
