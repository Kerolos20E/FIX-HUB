const ADMIN_SESSION_KEY = 'fixhub_admin_session'

export const ADMIN_USERNAME = 'mohammed1'
export const ADMIN_PASSWORD = '123456789'

export function verifyAdminCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function readAdminSession() {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) {
      return false
    }

    const parsed = JSON.parse(raw)
    return Boolean(parsed?.isAdmin === true)
  } catch {
    return false
  }
}

export function writeAdminSession() {
  window.localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      isAdmin: true,
      signedInAt: new Date().toISOString(),
    }),
  )
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_SESSION_KEY)
}
