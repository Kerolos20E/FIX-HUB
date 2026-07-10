import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { clearAdminSession, readAdminSession } from '../lib/adminSession'
import { deleteAccountByEmail, loadAccounts } from '../lib/authStore'
import { addService, deleteServiceById, loadServices } from '../lib/serviceStore'

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900'

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState(() => loadServices())
  const [users, setUsers] = useState(() => loadAccounts())
  const [message, setMessage] = useState('')
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'Electrical',
    description: '',
    eta: '',
    icon: '',
  })

  const categoryOptions = useMemo(
    () => ['Electrical', 'Plumbing', 'Air Conditioning', 'Carpentry'],
    [],
  )

  if (!readAdminSession()) {
    return <Navigate to="/admin/login" replace />
  }

  const handleAdminLogout = () => {
    clearAdminSession()
    navigate('/admin/login', { replace: true })
  }

  const handleServiceInputChange = (event) => {
    const { name, value } = event.target
    setServiceForm((prev) => ({ ...prev, [name]: value }))
    setMessage('')
  }

  const handleAddService = (event) => {
    event.preventDefault()

    if (
      serviceForm.title.trim().length < 3 ||
      serviceForm.category.trim().length < 3 ||
      serviceForm.description.trim().length < 8 ||
      serviceForm.eta.trim().length < 2
    ) {
      setMessage('Complete service fields correctly before adding.')
      return
    }

    addService({
      title: serviceForm.title,
      category: serviceForm.category,
      description: serviceForm.description,
      eta: serviceForm.eta,
      icon: serviceForm.icon,
    })

    setServices(loadServices())
    setServiceForm({
      title: '',
      category: 'Electrical',
      description: '',
      eta: '',
      icon: '',
    })
    setMessage('Service added successfully.')
  }

  const handleDeleteService = (id) => {
    const deleted = deleteServiceById(id)
    if (!deleted) {
      setMessage('Service not found.')
      return
    }
    setServices(loadServices())
    setMessage('Service deleted successfully.')
  }

  const handleDeleteUser = (email) => {
    const deleted = deleteAccountByEmail(email)
    if (!deleted) {
      setMessage('User not found.')
      return
    }
    setUsers(loadAccounts())
    setMessage('User deleted successfully.')
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 font-['Space_Grotesk'] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin Dashboard</span>
              <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-slate-900">Management Panel</h1>
              <p className="mt-2 text-sm text-slate-600">
                Add and delete services, and delete registered users.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
          {message ? <p className="mt-4 text-sm font-medium text-slate-700">{message}</p> : null}
        </header>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Add New Service</h2>
            <form className="mt-4 space-y-3" onSubmit={handleAddService} noValidate>
              <div>
                <label htmlFor="serviceTitle" className="mb-1 block text-sm font-medium text-slate-700">
                  Service Title
                </label>
                <input
                  id="serviceTitle"
                  name="title"
                  className={inputClass}
                  value={serviceForm.title}
                  onChange={handleServiceInputChange}
                />
              </div>

              <div>
                <label htmlFor="serviceCategory" className="mb-1 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id="serviceCategory"
                  name="category"
                  className={inputClass}
                  value={serviceForm.category}
                  onChange={handleServiceInputChange}
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="serviceDescription" className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="serviceDescription"
                  name="description"
                  rows={3}
                  className={`${inputClass} min-h-24`}
                  value={serviceForm.description}
                  onChange={handleServiceInputChange}
                />
              </div>

              <div>
                <label htmlFor="serviceEta" className="mb-1 block text-sm font-medium text-slate-700">
                  ETA
                </label>
                <input
                  id="serviceEta"
                  name="eta"
                  className={inputClass}
                  value={serviceForm.eta}
                  onChange={handleServiceInputChange}
                  placeholder="e.g. 45 mins"
                />
              </div>

              <div>
                <label htmlFor="serviceIcon" className="mb-1 block text-sm font-medium text-slate-700">
                  Icon (optional)
                </label>
                <input
                  id="serviceIcon"
                  name="icon"
                  className={inputClass}
                  value={serviceForm.icon}
                  onChange={handleServiceInputChange}
                  placeholder="e.g. 🛠️"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add Service
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Delete Services</h2>
            {services.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No services found.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{service.title}</p>
                      <p className="text-xs text-slate-600">{service.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.id)}
                      className="rounded-lg border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Delete Registered Members</h2>
          {users.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No users found.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {users.map((user) => (
                <div
                  key={user.email}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-600">
                      {user.email} | {user.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user.email)}
                    className="rounded-lg border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Delete User
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminDashboardPage
