import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { findAccountByEmail } from '../lib/authStore'
import { addDirectMessage } from '../lib/chatStore'
import { formatStatusLabel, getRequestsVisibleToTechnical, updateServiceRequest } from '../lib/requestStore'
import { readSession } from '../lib/session'

function formatDate(iso) {
  return new Date(iso).toLocaleString()
}

function JobsPage() {
  const session = readSession()
  const account = session ? findAccountByEmail(session.email) : null
  const [requests, setRequests] = useState(() => {
    if (!session) {
      return []
    }
    return getRequestsVisibleToTechnical(session.email).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  if (!session || session.role !== 'technical' || !account) {
    return <Navigate to="/request" replace />
  }

  const refreshBoard = () => {
    setRequests(getRequestsVisibleToTechnical(session.email).sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }

  const confirmRequest = (requestId) => {
    const updated = updateServiceRequest(requestId, (item) => {
      const assignedToMe = item.assignedTechnicalEmail === session.email
      const unassigned = !item.assignedTechnicalEmail
      if (item.status !== 'pending' || (!assignedToMe && !unassigned)) {
        return item
      }

      return {
        ...item,
        status: 'in_progress',
        assignedTechnicalEmail: session.email,
        assignedTechnicalName: session.name,
      }
    })

    if (!updated) {
      return
    }

    addDirectMessage(
      session,
      { email: updated.customerEmail, name: updated.customerName, role: 'customer' },
      `I confirmed your request ${updated.id} and started working on it.`,
    )
    refreshBoard()
  }

  const markDone = (requestId) => {
    const updated = updateServiceRequest(requestId, (item) => {
      const mine = item.assignedTechnicalEmail === session.email
      if (!mine || item.status !== 'in_progress') {
        return item
      }
      return { ...item, status: 'done' }
    })

    if (!updated) {
      return
    }

    addDirectMessage(
      session,
      { email: updated.customerEmail, name: updated.customerName, role: 'customer' },
      `Request ${updated.id} is completed. Please check and confirm.`,
    )
    refreshBoard()
  }

  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Technician Board</span>
          <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-blue-900">Customer Requests</h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-600">
            This board receives customer issues. Confirm a request to start work, then mark it done.
          </p>
          <button
            type="button"
            onClick={refreshBoard}
            className="mt-4 rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Refresh Board
          </button>
        </div>

        {requests.length === 0 ? (
          <article className="rounded-3xl border border-blue-200 bg-white p-6 text-sm text-blue-600 shadow-sm">
            No requests available right now.
          </article>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => {
              const isMine = item.assignedTechnicalEmail === session.email
              const isUnassigned = !item.assignedTechnicalEmail
              const canConfirmPending = item.status === 'pending' && (isMine || isUnassigned)

              return (
                <article key={item.id} className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">{item.id}</h2>
                      <p className="text-sm text-blue-600">
                        {item.customerName} - {item.customerPhone}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold uppercase text-white">
                      {formatStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-blue-700">
                    <p>
                      <strong>Service:</strong> {item.service}
                    </p>
                    <p>
                      <strong>Location:</strong> {item.location}
                    </p>
                    <p>
                      <strong>Details:</strong> {item.details}
                    </p>
                    <p>
                      <strong>Created:</strong> {formatDate(item.createdAt)}
                    </p>
                    <p>
                      <strong>Assigned To:</strong> {item.assignedTechnicalName ?? 'Open for technicians'}
                    </p>
                  </div>

                  {item.attachmentDataUrl ? (
                    <a
                      href={item.attachmentDataUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Open Attachment ({item.attachmentName ?? 'file'})
                    </a>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {canConfirmPending ? (
                      <button
                        type="button"
                        className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                        onClick={() => confirmRequest(item.id)}
                      >
                        {isUnassigned ? 'Take Request' : 'Confirm Request'}
                      </button>
                    ) : null}

                    {isMine && item.status === 'in_progress' ? (
                      <button
                        type="button"
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                        onClick={() => markDone(item.id)}
                      >
                        Mark as Done
                      </button>
                    ) : null}

                    <Link
                      to={`/chat?contact=${encodeURIComponent(item.customerEmail)}`}
                      className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
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

export default JobsPage
