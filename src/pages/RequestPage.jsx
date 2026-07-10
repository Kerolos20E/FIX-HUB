import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { findAccountByEmail } from '../lib/authStore'
import { createServiceRequest, formatStatusLabel, getRequestsForCustomer } from '../lib/requestStore'
import { readSession } from '../lib/session'
import { loadServices } from '../lib/serviceStore'

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function formatDate(iso) {
  return new Date(iso).toLocaleString()
}

function fieldClass(hasError) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-blue-900 outline-none transition ${
    hasError ? 'border-rose-400 focus:border-rose-500' : 'border-blue-300 focus:border-blue-900'
  }`
}

function RequestPage() {
  const sessionUser = readSession()
  const services = useMemo(() => loadServices(), [])
  const account = sessionUser ? findAccountByEmail(sessionUser.email) : null
  const [sentMessage, setSentMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [uploadError, setUploadError] = useState('')
  const [issueFile, setIssueFile] = useState(null)

  const [formData, setFormData] = useState({
    fullName: account?.name ?? sessionUser?.name ?? '',
    phone: account?.phone ?? sessionUser?.phone ?? '',
    location: account?.address ?? '',
    service: services[0]?.title ?? '',
    details: '',
  })

  if (!sessionUser || sessionUser.role === 'technical') {
    return <Navigate to="/jobs" replace />
  }

  const myRecentRequests = getRequestsForCustomer(sessionUser.email).slice(0, 5)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setSentMessage('')
  }

  const handleIssueFileChange = async (event) => {
    const file = event.target.files?.[0]
    setUploadError('')
    setSentMessage('')
    if (!file) {
      setIssueFile(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB.')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      setIssueFile({ name: file.name, dataUrl })
    } catch {
      setUploadError('Could not read file. Please try another one.')
    }
  }

  const validate = (payload) => {
    const nextErrors = {}

    if (payload.fullName.trim().length < 3) {
      nextErrors.fullName = 'Enter your full name.'
    }

    if (!/^[+]?[0-9\s-]{8,16}$/.test(payload.phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number.'
    }

    if (!payload.location.trim()) {
      nextErrors.location = 'Location is required.'
    }

    if (!payload.service.trim()) {
      nextErrors.service = 'Select a service.'
    }

    if (payload.details.trim().length < 10) {
      nextErrors.details = 'Write at least 10 characters.'
    }

    return nextErrors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(formData)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setSentMessage('')
      return
    }

    setErrors({})

    const created = createServiceRequest({
      customerEmail: sessionUser.email,
      customerName: formData.fullName.trim(),
      customerPhone: formData.phone.trim(),
      service: formData.service,
      location: formData.location.trim(),
      details: formData.details.trim(),
      attachmentName: issueFile?.name,
      attachmentDataUrl: issueFile?.dataUrl,
    })

    setSentMessage(`Request ${created.id} submitted successfully.`)
    setFormData((prev) => ({
      ...prev,
      location: account?.address ?? '',
      details: '',
    }))
    setIssueFile(null)
  }

  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Request Page</span>
            <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-blue-900">Book a Technician</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-blue-600">
              Create a request and attach image/file for the issue to help the worker prepare.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              className="inline-flex rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              to="/services"
            >
              Choose Specific Technician from Services
            </Link>
          </div>
        </div>

        <form className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-blue-700">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className={fieldClass(Boolean(errors.fullName))}
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName ? <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p> : null}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-blue-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={fieldClass(Boolean(errors.phone))}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone ? <p className="mt-1 text-xs text-rose-600">{errors.phone}</p> : null}
            </div>

            <div>
              <label htmlFor="location" className="mb-1 block text-sm font-medium text-blue-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className={fieldClass(Boolean(errors.location))}
                value={formData.location}
                onChange={handleChange}
                placeholder="District / Area"
              />
              {errors.location ? <p className="mt-1 text-xs text-rose-600">{errors.location}</p> : null}
            </div>

            <div>
              <label htmlFor="service" className="mb-1 block text-sm font-medium text-blue-700">
                Service
              </label>
              <select
                id="service"
                name="service"
                className={fieldClass(Boolean(errors.service))}
                value={formData.service}
                onChange={handleChange}
              >
                {services.map((item) => (
                  <option key={item.id} value={item.title}>
                    {item.title}
                  </option>
                ))}
              </select>
              {errors.service ? <p className="mt-1 text-xs text-rose-600">{errors.service}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="issueFile" className="mb-1 block text-sm font-medium text-blue-700">
                Attach Issue File (Image/PDF/Any file)
              </label>
              <input
                id="issueFile"
                type="file"
                className="w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900"
                onChange={handleIssueFileChange}
              />
              {uploadError ? <p className="mt-1 text-xs text-rose-600">{uploadError}</p> : null}
              {issueFile ? <p className="mt-1 text-xs text-emerald-600">Attached: {issueFile.name}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="details" className="mb-1 block text-sm font-medium text-blue-700">
                Issue Details
              </label>
              <textarea
                id="details"
                name="details"
                rows={4}
                className={fieldClass(Boolean(errors.details))}
                value={formData.details}
                onChange={handleChange}
                placeholder="Describe the issue"
              />
              {errors.details ? <p className="mt-1 text-xs text-rose-600">{errors.details}</p> : null}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Submit Request
            </button>
            {sentMessage ? <span className="text-sm font-medium text-emerald-700">{sentMessage}</span> : null}
          </div>
        </form>

        <article className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <h2 className="font-['Outfit'] text-2xl font-semibold text-blue-900">My Latest Requests</h2>
          {myRecentRequests.length === 0 ? (
            <p className="mt-3 text-sm text-blue-600">No requests yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {myRecentRequests.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      {item.id} - {item.service}
                    </p>
                    <p className="text-xs text-blue-600">{item.location}</p>
                    <p className="text-xs text-blue-600">
                      Technician: {item.assignedTechnicalName ?? 'Waiting for technician'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold uppercase text-white">
                      {formatStatusLabel(item.status)}
                    </span>
                    <p className="mt-1 text-xs text-blue-500">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}

export default RequestPage
