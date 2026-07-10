import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import logoPreview from '../../assets/logo-white.png'
import { getNavLinks } from '../../data/content'
import { getUnreadCountForUser } from '../../lib/chatStore'

function AppNavbar({ sessionName, sessionRole, sessionEmail, onLogout }) {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const navLinks = getNavLinks(sessionRole)

  const handleClose = () => setOpen(false)

  useEffect(() => {
    if (!sessionEmail) {
      setUnreadCount(0)
      return
    }

    const refreshUnread = () => {
      setUnreadCount(getUnreadCountForUser(sessionEmail))
    }

    refreshUnread()

    const timerId = window.setInterval(refreshUnread, 1500)
    const handleStorage = (event) => {
      if (!event.key || event.key.startsWith('fixhub_chat')) {
        refreshUnread()
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      window.clearInterval(timerId)
      window.removeEventListener('storage', handleStorage)
    }
  }, [sessionEmail])

  const renderNavLabel = (link) => {
    if (link.to !== '/chat') {
      return link.label
    }

    return (
      <span className="inline-flex items-center gap-1.5">
        <span>{link.label}</span>
        {unreadCount > 0 ? (
          <span className="min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-[#066cf4] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink
          to="/hub"
          onClick={handleClose}
          className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition"
        >
          <img
            src={logoPreview}
            alt="FixHub logo"
            className="h-11 w-11 rounded-xl object-cover shadow-sm"
          />
          <span className="flex flex-col leading-tight">
            <strong className="font-['Outfit'] text-sm font-semibold tracking-wide text-white">
              FIXHUB
            </strong>
            <small className="text-xs text-white/80">Smart Home Maintenance</small>
          </span>
        </NavLink>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/60 text-white transition hover:bg-white/10 md:hidden"
          aria-label="Toggle navigation"
        >
          <span className="text-xs font-semibold">{open ? 'Close' : 'Menu'}</span>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {renderNavLabel(link)}
            </NavLink>
          ))}
          <span className="ml-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium text-white">
            {sessionName} ({sessionRole})
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="ml-1 rounded-lg border border-white/60 px-3 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-blue-700"
          >
            Logout
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/20 px-4 pb-4 pt-3 md:hidden">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={handleClose}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-white text-blue-700' : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {renderNavLabel(link)}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-white/20 bg-white/10 px-3 py-2">
            <span className="text-xs font-medium text-white">
              {sessionName} ({sessionRole})
            </span>
            <button
              type="button"
              onClick={() => {
                handleClose()
                onLogout()
              }}
              className="rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default AppNavbar
