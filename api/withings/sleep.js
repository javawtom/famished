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

      res.setHeader('Set-Cookie', makeTokenCookie(tokens))
    }

    // Get sleep data from last 7 days
    const now = Math.floor(Date.now() / 1000)
    const weekAgo = now - 7 * 24 * 60 * 60

    const response = await fetch('https://wbsapi.withings.net/v2/sleep', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${tokens.access_token}`,
      },
      body: new URLSearchParams({
        action: 'getsummary',
        startdateymd: new Date(weekAgo * 1000).toISOString().split('T')[0],
        enddateymd: new Date(now * 1000).toISOString().split('T')[0],
        data_fields: 'breathing_disturbances_intensity,deepsleepduration,durationtosleep,durationtowakeup,hr_average,hr_max,hr_min,lightsleepduration,remsleepduration,rr_average,rr_max,rr_min,sleep_efficiency,sleep_latency,sleep_score,snoring,snoringepisodecount,wakeupcount,wakeupduration',
      }),
    })

    const data = await response.json()

    if (data.status !== 0) {
      console.error('Sleep fetch failed:', data)
      return res.status(400).json({ error: 'Failed to fetch sleep data', details: data })
    }

    const sessions = (data.body?.series || []).map(s => ({
      date: s.date,
      startdate: s.startdate,
      enddate: s.enddate,
      score: s.data?.sleep_score,
      deepSleep: s.data?.deepsleepduration,
      remSleep: s.data?.remsleepduration,
      lightSleep: s.data?.lightsleepduration,
      wakeDuration: s.data?.wakeupduration,
      wakeupCount: s.data?.wakeupcount,
      hrAvg: s.data?.hr_average,
      hrMin: s.data?.hr_min,
      hrMax: s.data?.hr_max,
      rrAvg: s.data?.rr_average,
      efficiency: s.data?.sleep_efficiency,
      snoring: s.data?.snoring,
      snoringEpisodes: s.data?.snoringepisodecount,
      latency: s.data?.sleep_latency,
      durationToSleep: s.data?.durationtosleep,
    })).sort((a, b) => (b.startdate || 0) - (a.startdate || 0))

    const latest = sessions.length > 0 ? sessions[0] : null

    res.json({
      connected: true,
      sessions,
      latest,
    })
  } catch (err) {
    console.error('Sleep fetch error:', err)
    res.status(500).json({ error: err.message })
  }
}
