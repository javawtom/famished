import { getConfig } from '../_withings.js'

export default function handler(req, res) {
  const { CLIENT_ID, REDIRECT_URI } = getConfig()

  const authUrl = 'https://account.withings.com/oauth2_user/authorize2'
    + '?response_type=code'
    + '&client_id=' + CLIENT_ID
    + '&redirect_uri=' + encodeURIComponent(REDIRECT_URI)
    + '&scope=user.metrics,user.activity'
    + '&state=famished-auth'

  res.redirect(302, authUrl)
}
