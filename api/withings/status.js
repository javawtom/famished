import { parseTokenCookie } from '../_withings.js'

export default function handler(req, res) {
  const tokens = parseTokenCookie(req.headers.cookie)
  res.json({
    connected: !!tokens,
    userid: tokens?.userid || null,
  })
}
