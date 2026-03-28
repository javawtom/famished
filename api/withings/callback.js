import { exchangeCodeForTokens, makeTokenCookie } from '../_withings.js'

export default async function handler(req, res) {
  const { code } = req.query

  if (!code) {
    return res.status(400).json({ error: 'No authorization code received' })
  }

  try {
    const data = await exchangeCodeForTokens(code)

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

    // Store tokens in HttpOnly cookie
    res.setHeader('Set-Cookie', makeTokenCookie(tokens))

    // Redirect back to Progress page
    res.redirect(302, '/progress?withings=connected')
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.status(500).json({ error: err.message })
  }
}
