import { Link } from 'react-router-dom'
import { getHubCards } from '../data/content'
import { readSession } from '../lib/session'

function HubPage() {
  const sessionUser = readSession()
  const role = sessionUser?.role ?? 'customer'
  const cards = getHubCards(role)

  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <article className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Central Page</span>
          <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-blue-900">
            Welcome, {sessionUser?.name ?? 'FixHub User'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-600">
            Logged in as <strong>{sessionUser?.role ?? 'user'}</strong>. From this central page, you can open all
            FixHub sections.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {role === 'technical' ? (
              <>
                <Link
                  className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                  to="/jobs"
                >
                  Open Requests Board
                </Link>
                <Link
                  className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  to="/chat"
                >
                  Open Customer Chat
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                  to="/request"
                >
                  Book Technician
                </Link>
                <Link
                  className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  to="/services"
                >
                  Browse Services
                </Link>
              </>
            )}
          </div>
        </article>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              to={card.to}
              key={card.title}
              className="group rounded-2xl border border-blue-200 bg-white p-5 shadow-sm transition hover:-tranblue-y-1 hover:border-blue-300 hover:shadow-md"
            >
              <div className="text-2xl">{card.icon}</div>
              <h2 className="mt-3 font-['Outfit'] text-xl font-semibold text-blue-900">{card.title}</h2>
              <p className="mt-2 text-sm text-blue-600">{card.text}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-blue-800">Open Page →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HubPage
