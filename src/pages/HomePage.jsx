import { Link } from 'react-router-dom'
import logoPreview from '../assets/fixhub-logo.png'
import { stats } from '../data/content'

function HomePage() {
  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-12">
          <article className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm lg:col-span-7">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Home Page</span>
            <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-blue-900 md:text-4xl">
              Smart Home Maintenance with FixHub
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-blue-600 md:text-base">
              One platform for electrical, plumbing, air conditioning, and carpentry services. Fully responsive and
              built with React components.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/services"
                className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Explore Services
              </Link>
              <Link
                to="/request"
                className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Request a Visit
              </Link>
            </div>
          </article>

          <article className="grid place-items-center rounded-3xl border border-blue-200 bg-white p-4 shadow-sm lg:col-span-5">
            <img src={logoPreview} alt="FixHub logo" className="h-full w-full rounded-2xl object-cover" />
          </article>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-blue-200 bg-white p-5 text-center shadow-sm">
              <h3 className="font-['Outfit'] text-2xl font-semibold text-blue-900">{item.value}</h3>
              <p className="mt-1 text-sm text-blue-600">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomePage
