import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import { clearSession, readSession } from '../lib/session'

function ProtectedLayout() {
  const navigate = useNavigate()
  const sessionUser = readSession()

  if (!sessionUser) {
    return <Navigate to="/auth" replace />
  }

  const handleLogout = () => {
    clearSession()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <AppNavbar
        sessionName={sessionUser.name}
        sessionRole={sessionUser.role}
        sessionEmail={sessionUser.email}
        onLogout={handleLogout}
      />
      <main className="pt-24">
        <Outlet />
      </main>
      <footer className="border-t border-blue-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-blue-600 sm:px-6 lg:px-8">
          <p>
            <strong className="font-semibold text-blue-900">FIXHUB</strong> | Smart Home Maintenance
          </p>
          <p>&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}

export default ProtectedLayout
