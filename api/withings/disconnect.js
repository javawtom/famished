import { clearTokenCookie } from '../_withings.js'

export default function handler(req, res) {
  res.setHeader('Set-Cookie', clearTokenCookie())
  res.json({ disconnected: true })
}
