import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { readAdminSession, verifyAdminCredentials, writeAdminSession } from '../lib/adminSession'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (readAdminSession()) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!verifyAdminCredentials(username.trim(), password)) {
      setError('Invalid admin credentials.')
      return
    }

    writeAdminSession()
    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_50%,#0f172a_100%)] px-4 py-8 font-['Space_Grotesk'] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center">
        <section className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 p-8 shadow-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Admin Access</span>
          <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-white">Admin Login</h1>
          <p className="mt-3 text-sm text-slate-300">Enter the admin username and password to open the dashboard.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="adminUsername" className="mb-1 block text-sm font-medium text-slate-200">
                Username
              </label>
              <input
                id="adminUsername"
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                  setError('')
                }}
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-white"
              />
            </div>

            <div>
              <label htmlFor="adminPassword" className="mb-1 block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-white"
              />
            </div>

            {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}

            <button
              type="submit"
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Open Dashboard
            </button>
          </form>

          <div className="mt-5 text-right">
            <Link to="/auth" className="text-xs font-semibold uppercase tracking-wide text-slate-300 underline-offset-4 hover:underline">
              Back to user login
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AdminLoginPage
