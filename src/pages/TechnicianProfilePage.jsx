import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findAccountByEmail } from '../lib/authStore'
import { addDirectMessage } from '../lib/chatStore'
import { createServiceRequest, getRequestsForTechnical } from '../lib/requestStore'
import { getAverageRatingForTechnical, getReviewsForTechnical } from '../lib/reviewStore'
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

function fieldClass(hasError) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-blue-900 outline-none transition ${
    hasError ? 'border-rose-400 focus:border-rose-500' : 'border-blue-300 focus:border-blue-900'
  }`
}

function TechnicianProfilePage() {
  const sessionUser = readSession()
  const customerAccount = sessionUser ? findAccountByEmail(sessionUser.email) : null
  const params = useParams()
  const services = useMemo(() => loadServices(), [])

  const technicalAccount = useMemo(() => {
    if (!params.email) {
      return null
    }

    const decodedEmail = decodeURIComponent(params.email)
    const account = findAccountByEmail(decodedEmail)
    if (!account || account.role !== 'technical') {
      return null
    }

    return account
  }, [params.email])

  const serviceOptions = useMemo(() => {
    if (!technicalAccount) {
      return services
    }
    const category = mapSpecialtyToCategory(technicalAccount.specialty ?? '')
    const filtered = services.filter((item) => item.category === category)
    return filtered.length > 0 ? filtered : services
  }, [technicalAccount, services])

  const [sentMessage, setSentMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [uploadError, setUploadError] = useState('')
  const [issueFile, setIssueFile] = useState(null)
  const [formData, setFormData] = useState({
    fullName: customerAccount?.name ?? sessionUser?.name ?? '',
    phone: customerAccount?.phone ?? sessionUser?.phone ?? '',
    location: customerAccount?.address ?? '',
    service: serviceOptions[0]?.title ?? services[0]?.title ?? '',
    details: '',
  })

  if (!sessionUser || sessionUser.role !== 'customer' || !customerAccount) {
    return <Navigate to="/jobs" replace />
  }

  if (!technicalAccount) {
    return (
      <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <h1 className="font-['Outfit'] text-3xl font-semibold text-blue-900">Technician not found</h1>
          <p className="mt-2 text-sm text-blue-600">This profile does not exist or is no longer available.</p>
          <Link
            to="/services"
            className="mt-4 inline-flex rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Back to Services
          </Link>
        </div>
      </section>
    )
  }

  const technicalReviews = getReviewsForTechnical(technicalAccount.email)
  const technicalAvgRating = getAverageRatingForTechnical(technicalAccount.email)
  const completedJobsCount = getRequestsForTechnical(technicalAccount.email).filter((item) => item.status === 'done').length

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
      assignedTechnicalEmail: technicalAccount.email,
      assignedTechnicalName: technicalAccount.name,
    })

    addDirectMessage(
      sessionUser,
      { email: technicalAccount.email, name: technicalAccount.name, role: 'technical' },
      `Hello, I sent request ${created.id} for ${created.service}.`,
    )

    setSentMessage(`Request ${created.id} sent to ${technicalAccount.name}.`)
    setFormData((prev) => ({
      ...prev,
      location: customerAccount.address ?? '',
      details: '',
    }))
    setIssueFile(null)
  }

  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Technician Profile</span>
          <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-blue-900">{technicalAccount.name}</h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-600">
            Review technician details, then send your request directly and continue in chat.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Professional Info</h2>
              <div className="mt-3 space-y-1 text-sm text-blue-700">
                <p>
                  <strong>Specialty:</strong> {technicalAccount.specialty ?? 'General Technician'}
                </p>
                <p>
                  <strong>Experience:</strong> {technicalAccount.yearsOfExperience ?? 0} year(s)
                </p>
                <p>
                  <strong>City:</strong> {technicalAccount.city}
                </p>
                <p>
                  <strong>Phone:</strong> {technicalAccount.phone}
                </p>
                <p>
                  <strong>Rating:</strong> {technicalAvgRating > 0 ? `${technicalAvgRating} / 5` : 'No ratings yet'}
                </p>
                <p>
                  <strong>Completed Jobs:</strong> {completedJobsCount}
                </p>
                <p>
                  <strong>Bio:</strong> {technicalAccount.bio || 'No bio added yet.'}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/chat?contact=${encodeURIComponent(technicalAccount.email)}`}
                  className="rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Open Chat
                </Link>
                <Link
                  to="/services"
                  className="rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Back to Services
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Experience Records</h2>
              {technicalAccount.experiences.length === 0 ? (
                <p className="mt-3 text-sm text-blue-600">No experience records added yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {technicalAccount.experiences.map((item) => (
                    <article key={item.id} className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <h3 className="text-sm font-semibold text-blue-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-blue-700">{item.details}</p>
                      <small className="text-xs text-blue-500">{item.years} year(s)</small>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Recent Customer Reviews</h2>
              {technicalReviews.slice(0, 3).length === 0 ? (
                <p className="mt-3 text-sm text-blue-600">No reviews yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {technicalReviews.slice(0, 3).map((review) => (
                    <article key={review.id} className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm font-semibold text-blue-800">Rating: {review.rating} / 5</p>
                      <p className="mt-1 text-sm text-blue-700">{review.comment || 'No comment'}</p>
                      <small className="text-xs text-blue-500">By {review.customerName}</small>
                    </article>
                  ))}
                </div>
              )}
            </article>
          </div>

          <form className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm lg:col-span-7" onSubmit={handleSubmit} noValidate>
            <h2 className="font-['Outfit'] text-2xl font-semibold text-blue-900">Send Request to This Technician</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                  {serviceOptions.map((item) => (
                    <option key={item.id} value={item.title}>
                      {item.title}
                    </option>
                  ))}
                </select>
                {errors.service ? <p className="mt-1 text-xs text-rose-600">{errors.service}</p> : null}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="issueFile" className="mb-1 block text-sm font-medium text-blue-700">
                  Attach Issue File
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
                Send Request
              </button>
              {sentMessage ? <span className="text-sm font-medium text-emerald-700">{sentMessage}</span> : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default TechnicianProfilePage
