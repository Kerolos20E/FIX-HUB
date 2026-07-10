import { useState } from 'react'
import { findAccountByEmail, updateAccount } from '../lib/authStore'
import { getRequestsForCustomer, getRequestsForTechnical } from '../lib/requestStore'
import { addReview, findReviewForRequest, getAverageRatingForTechnical, getReviewsForTechnical } from '../lib/reviewStore'
import { readSession, writeSession } from '../lib/session'

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })
}

function toTimelineStatus(status) {
  if (status === 'done') {
    return 'Done'
  }
  if (status === 'in_progress') {
    return 'In Progress'
  }
  return 'Pending'
}

function formatDate(iso) {
  return new Date(iso).toLocaleString()
}

function noticeClass(type) {
  if (type === 'danger') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (type === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

const fieldClass =
  'w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900 outline-none transition focus:border-blue-900'

function ProfilePage() {
  const session = readSession()
  const initialAccount = session ? findAccountByEmail(session.email) : null
  const [account, setAccount] = useState(initialAccount)
  const [notice, setNotice] = useState(null)
  const [experienceDraft, setExperienceDraft] = useState({
    title: '',
    years: '',
    details: '',
  })
  const [reviewDrafts, setReviewDrafts] = useState({})

  if (!session || !account) {
    return (
      <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <h1 className="font-['Outfit'] text-3xl font-semibold text-blue-900">Profile not found</h1>
          <p className="mt-2 text-sm text-blue-600">Login first to view your profile details.</p>
        </div>
      </section>
    )
  }

  const timelineRequests =
    account.role === 'technical' ? getRequestsForTechnical(account.email) : getRequestsForCustomer(account.email)

  const completedRequests = timelineRequests.filter((item) => item.status === 'done')
  const reviewableRequests =
    account.role === 'customer'
      ? completedRequests.filter((item) => item.assignedTechnicalEmail && item.assignedTechnicalName)
      : []
  const technicalReviews = account.role === 'technical' ? getReviewsForTechnical(account.email) : []
  const technicalAverageRating = account.role === 'technical' ? getAverageRatingForTechnical(account.email) : 0

  const applyAccountUpdate = (updater) => {
    const updated = updateAccount(session.email, updater)
    if (!updated) {
      setNotice({ type: 'danger', text: 'Unable to update profile now.' })
      return
    }

    setAccount(updated)
    writeSession({
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
    })
  }

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target
    setAccount((prev) => (prev ? { ...prev, [name]: value } : prev))
    setNotice(null)
  }

  const handleCardImageChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const image = await readImageAsDataUrl(file)
      setAccount((prev) => (prev ? { ...prev, nationalCardImage: image } : prev))
      setNotice(null)
    } catch {
      setNotice({ type: 'danger', text: 'Failed to load image.' })
    }
  }

  const handleSaveProfile = (event) => {
    event.preventDefault()

    if (!account.name.trim() || account.name.trim().length < 3) {
      setNotice({ type: 'danger', text: 'Name must be at least 3 characters.' })
      return
    }

    if (!account.city.trim()) {
      setNotice({ type: 'danger', text: 'City is required.' })
      return
    }

    if (account.role === 'technical' && !account.nationalCardImage) {
      setNotice({ type: 'danger', text: 'Technical profile requires national card image.' })
      return
    }

    applyAccountUpdate(() => ({
      ...account,
      yearsOfExperience: Number(account.yearsOfExperience ?? 0),
    }))
    setNotice({ type: 'success', text: 'Profile updated successfully.' })
  }

  const handleExperienceChange = (event) => {
    const { name, value } = event.target
    setExperienceDraft((prev) => ({ ...prev, [name]: value }))
    setNotice(null)
  }

  const handleAddExperience = (event) => {
    event.preventDefault()

    if (
      experienceDraft.title.trim().length < 3 ||
      Number(experienceDraft.years) < 0 ||
      experienceDraft.details.trim().length < 6
    ) {
      setNotice({ type: 'danger', text: 'Complete experience fields correctly.' })
      return
    }

    const entry = {
      id: `${experienceDraft.title.trim().toLowerCase().replace(/\s+/g, '-')}-${account.experiences.length + 1}`,
      title: experienceDraft.title.trim(),
      years: Number(experienceDraft.years),
      details: experienceDraft.details.trim(),
    }

    applyAccountUpdate((current) => ({
      ...current,
      experiences: [entry, ...current.experiences],
    }))

    setExperienceDraft({ title: '', years: '', details: '' })
    setNotice({ type: 'success', text: 'Experience added to profile.' })
  }

  const removeExperience = (id) => {
    applyAccountUpdate((current) => ({
      ...current,
      experiences: current.experiences.filter((item) => item.id !== id),
    }))
    setNotice({ type: 'info', text: 'Experience removed.' })
  }

  const updateReviewDraft = (requestId, updater) => {
    setReviewDrafts((prev) => {
      const current = prev[requestId] ?? { rating: 5, comment: '' }
      return { ...prev, [requestId]: updater(current) }
    })
    setNotice(null)
  }

  const submitReview = (request) => {
    if (account.role !== 'customer') {
      return
    }

    if (!request.assignedTechnicalEmail || !request.assignedTechnicalName) {
      setNotice({ type: 'danger', text: 'This request is not linked to a technician yet.' })
      return
    }

    if (findReviewForRequest(request.id, account.email)) {
      setNotice({ type: 'info', text: 'You already submitted a review for this request.' })
      return
    }

    const draft = reviewDrafts[request.id] ?? { rating: 5, comment: '' }
    if (draft.comment.trim().length < 3) {
      setNotice({ type: 'danger', text: 'Please add a short comment with your rating.' })
      return
    }

    addReview({
      requestId: request.id,
      customerEmail: account.email,
      customerName: account.name,
      technicalEmail: request.assignedTechnicalEmail,
      technicalName: request.assignedTechnicalName,
      rating: draft.rating,
      comment: draft.comment.trim(),
    })

    setReviewDrafts((prev) => ({ ...prev, [request.id]: { rating: 5, comment: '' } }))
    setNotice({ type: 'success', text: 'Thanks, your rating has been submitted.' })
  }

  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Profile</span>
          <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-blue-900">
            {account.role === 'technical' ? 'Technical Worker Profile' : 'Customer Profile'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-600">
            {account.role === 'technical'
              ? 'Manage your technical profile and track all requests assigned to you.'
              : 'Manage customer profile and track repair requests with status.'}
          </p>
        </div>

        {notice ? (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${noticeClass(notice.type)}`}>
            {notice.text}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-12">
          <form
            className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm lg:col-span-7"
            onSubmit={handleSaveProfile}
            noValidate
          >
            <h2 className="font-['Outfit'] text-2xl font-semibold text-blue-900">Main Information</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-blue-700">Full Name</label>
                <input className={fieldClass} name="name" value={account.name} onChange={handleProfileFieldChange} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-700">Role</label>
                <input className={fieldClass} value={account.role} readOnly />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-700">Email</label>
                <input className={fieldClass} value={account.email} readOnly />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-700">Phone</label>
                <input className={fieldClass} name="phone" value={account.phone} onChange={handleProfileFieldChange} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-700">National ID</label>
                <input
                  className={fieldClass}
                  name="nationalId"
                  value={account.nationalId}
                  onChange={handleProfileFieldChange}
                  maxLength={14}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-blue-700">City</label>
                <select className={fieldClass} name="city" value={account.city} onChange={handleProfileFieldChange}>
                  <option value="Sohag">Sohag</option>
                  <option value="Cairo">Cairo</option>
                  <option value="Alexandria">Alexandria</option>
                  <option value="Giza">Giza</option>
                  <option value="Assiut">Assiut</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-blue-700">Address</label>
                <input className={fieldClass} name="address" value={account.address ?? ''} onChange={handleProfileFieldChange} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-blue-700">Bio</label>
                <textarea className={`${fieldClass} min-h-24`} rows={3} name="bio" value={account.bio ?? ''} onChange={handleProfileFieldChange} />
              </div>

              {account.role === 'technical' ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-700">Specialty</label>
                    <input className={fieldClass} name="specialty" value={account.specialty ?? ''} onChange={handleProfileFieldChange} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-700">Years of Experience</label>
                    <input
                      className={fieldClass}
                      name="yearsOfExperience"
                      type="number"
                      min={0}
                      value={account.yearsOfExperience ?? 0}
                      onChange={handleProfileFieldChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-blue-700">National Card Image</label>
                    <input
                      className="w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900"
                      type="file"
                      accept="image/*"
                      onChange={handleCardImageChange}
                    />
                  </div>
                </>
              ) : null}
            </div>
            <button
              type="submit"
              className="mt-5 rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Save Profile
            </button>
          </form>

          <div className="space-y-4 lg:col-span-5">
            <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Profile Snapshot</h2>
              <div className="mt-3 space-y-1 text-sm text-blue-700">
                <p>
                  <strong>Name:</strong> {account.name}
                </p>
                <p>
                  <strong>Role:</strong> {account.role}
                </p>
                <p>
                  <strong>City:</strong> {account.city}
                </p>
                <p>
                  <strong>Tracked Requests:</strong> {timelineRequests.length}
                </p>
              </div>
              {account.role === 'technical' && account.nationalCardImage ? (
                <img src={account.nationalCardImage} alt="National card" className="mt-4 w-full rounded-xl object-cover" />
              ) : null}
            </article>

            {account.role === 'technical' ? (
              <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Customer Rating</h2>
                <p className="mt-3 text-sm text-blue-700">
                  <strong>Average Rating:</strong> {technicalAverageRating > 0 ? `${technicalAverageRating} / 5` : 'No ratings yet'}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Total Reviews:</strong> {technicalReviews.length}
                </p>
                {technicalReviews.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {technicalReviews.slice(0, 3).map((review) => (
                      <article key={review.id} className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm">
                        <p className="font-semibold text-blue-800">Rating: {review.rating} / 5</p>
                        <p className="mt-1 text-blue-700">{review.comment}</p>
                        <small className="text-blue-500">
                          {review.customerName} - {formatDate(review.createdAt)}
                        </small>
                      </article>
                    ))}
                  </div>
                ) : null}
              </article>
            ) : null}

            <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Repair Timeline</h2>
              {timelineRequests.length === 0 ? (
                <p className="mt-3 text-sm text-blue-600">No repair tasks yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {timelineRequests.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          {item.id} - {item.service}
                        </p>
                        <p className="text-xs text-blue-600">{item.location}</p>
                        {account.role === 'technical' ? (
                          <p className="text-xs text-blue-600">Customer: {item.customerName}</p>
                        ) : (
                          <p className="text-xs text-blue-600">
                            Technician: {item.assignedTechnicalName ?? 'Waiting assignment'}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold uppercase text-white">
                        {toTimelineStatus(item.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>

            {account.role === 'customer' ? (
              <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Rate Completed Jobs</h2>
                {reviewableRequests.length === 0 ? (
                  <p className="mt-3 text-sm text-blue-600">No completed jobs available for rating yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {reviewableRequests.map((item) => {
                      const existing = findReviewForRequest(item.id, account.email)
                      const draft = reviewDrafts[item.id] ?? { rating: 5, comment: '' }

                      return (
                        <article key={item.id} className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                          <p className="text-sm font-semibold text-blue-900">
                            {item.id} - {item.service}
                          </p>
                          <p className="text-xs text-blue-600">Technician: {item.assignedTechnicalName}</p>

                          {existing ? (
                            <div className="mt-2 text-sm text-blue-700">
                              <p>Rating: {existing.rating} / 5</p>
                              <p>{existing.comment}</p>
                            </div>
                          ) : (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-blue-700">Rating:</label>
                                <select
                                  className="rounded-lg border border-blue-300 bg-white px-2 py-1 text-xs text-blue-900"
                                  value={draft.rating}
                                  onChange={(event) =>
                                    updateReviewDraft(item.id, (current) => ({
                                      ...current,
                                      rating: Number(event.target.value),
                                    }))
                                  }
                                >
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <option key={rating} value={rating}>
                                      {rating}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <textarea
                                className={`${fieldClass} min-h-20`}
                                rows={2}
                                placeholder="Write your feedback..."
                                value={draft.comment}
                                onChange={(event) =>
                                  updateReviewDraft(item.id, (current) => ({
                                    ...current,
                                    comment: event.target.value,
                                  }))
                                }
                              />
                              <button
                                type="button"
                                className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                                onClick={() => submitReview(item)}
                              >
                                Submit Rating
                              </button>
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                )}
              </article>
            ) : (
              <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Completed Jobs</h2>
                {completedRequests.length === 0 ? (
                  <p className="mt-3 text-sm text-blue-600">No completed jobs yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {completedRequests.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                        <div>
                          <p className="text-sm font-semibold text-blue-900">
                            {item.id} - {item.service}
                          </p>
                          <p className="text-xs text-blue-600">{item.customerName}</p>
                        </div>
                        <p className="text-xs text-blue-500">{formatDate(item.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            )}

            {account.role === 'technical' ? (
              <article className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Add Experience</h2>
                <form onSubmit={handleAddExperience} noValidate className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-700">Work Title</label>
                    <input className={fieldClass} name="title" value={experienceDraft.title} onChange={handleExperienceChange} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-700">Years</label>
                    <input
                      className={fieldClass}
                      name="years"
                      type="number"
                      min={0}
                      value={experienceDraft.years}
                      onChange={handleExperienceChange}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-blue-700">Details</label>
                    <textarea className={`${fieldClass} min-h-24`} rows={3} name="details" value={experienceDraft.details} onChange={handleExperienceChange} />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Add Experience
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  {account.experiences.length === 0 ? (
                    <p className="text-sm text-blue-600">No experiences added yet.</p>
                  ) : (
                    account.experiences.map((item) => (
                      <article key={item.id} className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                        <h3 className="text-sm font-semibold text-blue-900">{item.title}</h3>
                        <p className="mt-1 text-sm text-blue-700">{item.details}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <small className="text-xs text-blue-500">{item.years} years</small>
                          <button
                            type="button"
                            className="rounded-lg border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                            onClick={() => removeExperience(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
