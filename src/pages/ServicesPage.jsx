import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getCategoryTabs } from '../data/content'
import { loadTechnicalAccounts } from '../lib/authStore'
import { getAverageRatingForTechnical } from '../lib/reviewStore'
import { getRequestsForTechnical } from '../lib/requestStore'
import { readSession } from '../lib/session'
import { loadServices } from '../lib/serviceStore'

function mapSpecialtyToCategory(specialty) {
  const value = specialty.trim().toLowerCase()
  if (value.includes('plumb')) {
    return 'Plumbing'
  }
  if (value.includes('carpent')) {
    return 'Carpentry'
  }
  if (value.includes('ac') || value.includes('air')) {
    return 'Air Conditioning'
  }
  return 'Electrical'
}

function getTechnicianCategory(account) {
  return mapSpecialtyToCategory(account.specialty ?? '')
}

function ServicesPage() {
  const session = readSession()
  const [activeCategory, setActiveCategory] = useState('All')
  const services = useMemo(() => loadServices(), [])
  const allTechnicians = useMemo(() => loadTechnicalAccounts(), [])
  const categoryTabs = useMemo(() => getCategoryTabs(services), [services])

  const filteredServices = useMemo(() => {
    if (activeCategory === 'All') {
      return services
    }
    return services.filter((item) => item.category === activeCategory)
  }, [activeCategory, services])

  const filteredTechnicians = useMemo(() => {
    if (activeCategory === 'All') {
      return allTechnicians
    }
    return allTechnicians.filter((item) => getTechnicianCategory(item) === activeCategory)
  }, [activeCategory, allTechnicians])

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  if (session.role === 'technical') {
    return <Navigate to="/jobs" replace />
  }

  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Services Page</span>
            <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-blue-900">Choose Service and Technician</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-blue-600">
              Click a category like Electrical or Plumbing to immediately see matching workers.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === tab
                    ? 'bg-blue-900 text-white'
                    : 'border border-blue-300 bg-white text-blue-700 hover:bg-blue-100'
                }`}
                onClick={() => setActiveCategory(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <article key={service.id} className="flex h-full flex-col rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <div className="text-3xl">{service.icon}</div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-blue-500">
                <span>{service.category}</span>
                <span>{service.eta}</span>
              </div>
              <h2 className="mt-3 font-['Outfit'] text-xl font-semibold text-blue-900">{service.title}</h2>
              <p className="mt-2 text-sm text-blue-600">{service.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  onClick={() => setActiveCategory(service.category)}
                >
                  Show Workers
                </button>
                <Link
                  to="/request"
                  className="rounded-xl bg-blue-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                >
                  General Request
                </Link>
              </div>
            </article>
          ))}
        </div>

        <article className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <h2 className="font-['Outfit'] text-2xl font-semibold text-blue-900">
            Available Technicians {activeCategory === 'All' ? '' : `- ${activeCategory}`}
          </h2>
          <p className="mt-2 text-sm text-blue-600">
            {filteredTechnicians.length} technician(s) available {activeCategory === 'All' ? 'across all categories.' : `for ${activeCategory}.`}
          </p>
        </article>

        {filteredTechnicians.length === 0 ? (
          <article className="rounded-3xl border border-blue-200 bg-white p-6 text-sm text-blue-600 shadow-sm">
            No technicians found in this category yet.
          </article>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTechnicians.map((technician) => {
              const category = getTechnicianCategory(technician)
              const avgRating = getAverageRatingForTechnical(technician.email)
              const completedJobs = getRequestsForTechnical(technician.email).filter((item) => item.status === 'done').length

              return (
                <article key={technician.email} className="flex h-full flex-col rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-blue-500">
                    <span>{category}</span>
                    <span>{technician.city}</span>
                  </div>
                  <h2 className="mt-3 font-['Outfit'] text-xl font-semibold text-blue-900">{technician.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-blue-700">{technician.specialty ?? 'General Technician'}</p>
                  <p className="mt-2 text-sm text-blue-600">{technician.bio || 'Experienced technician ready to review your issue.'}</p>
                  <p className="mt-2 text-sm text-blue-500">{technician.yearsOfExperience ?? 0} year(s) experience</p>
                  <p className="mt-1 text-sm text-blue-700">
                    Rating: {avgRating > 0 ? `${avgRating} / 5` : 'No ratings yet'}
                  </p>
                  <p className="mt-1 text-sm text-blue-700">Completed Jobs: {completedJobs}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/technician/${encodeURIComponent(technician.email)}`}
                      className="rounded-xl bg-blue-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                    >
                      Send Request
                    </Link>
                    <Link
                      to={`/technician/${encodeURIComponent(technician.email)}`}
                      className="rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/chat?contact=${encodeURIComponent(technician.email)}`}
                      className="rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Open Chat
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default ServicesPage
