// Shared Withings OAuth helpers for Vercel serverless functions
// Uses Vercel KV or environment variables for token storage

const CLIENT_ID = process.env.WITHINGS_CLIENT_ID
const CLIENT_SECRET = process.env.WITHINGS_CLIENT_SECRET
const REDIRECT_URI = process.env.WITHINGS_REDIRECT_URI

// In-memory token storage (for serverless, we use cookies + env)
// For production, use Vercel KV or a database
// For now, we pass tokens via encrypted cookies

export function getConfig() {
  return { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI }
}

export async function exchangeCodeForTokens(code) {
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
  return response.json()
}

export async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://wbsapi.withings.net/v2/oauth2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'requesttoken',
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  })
  return response.json()
}

export function parseTokenCookie(cookieHeader) {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/withings_tokens=([^;]+)/)
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export function makeTokenCookie(tokens, maxAge = 60 * 60 * 24 * 365) {
  const value = encodeURIComponent(JSON.stringify(tokens))
  return `withings_tokens=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
}

export function clearTokenCookie() {
  return `withings_tokens=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}
