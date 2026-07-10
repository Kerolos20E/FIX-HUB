import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { findAccountByEmail } from '../lib/authStore'
import { addDirectMessage, editDirectMessage, loadChatContacts, loadThreadMessages, markAllChatsAsRead, unsendDirectMessage } from '../lib/chatStore'
import { getRequestsForCustomer, getRequestsForTechnical } from '../lib/requestStore'
import { readSession } from '../lib/session'

function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

const HIDDEN_CONTACTS_KEY_PREFIX = 'fixhub_hidden_contacts'

function hiddenContactsKey(userEmail) {
  return `${HIDDEN_CONTACTS_KEY_PREFIX}:${normalizeEmail(userEmail)}`
}

function readHiddenContacts(userEmail) {
  try {
    const raw = window.localStorage.getItem(hiddenContactsKey(userEmail))
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.map((item) => normalizeEmail(String(item))).filter(Boolean)
  } catch {
    return []
  }
}

function saveHiddenContacts(userEmail, contacts) {
  window.localStorage.setItem(hiddenContactsKey(userEmail), JSON.stringify(contacts))
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function renderAttachment(message) {
  if (!message.attachmentDataUrl) {
    return null
  }

  const mime = message.attachmentMimeType ?? ''
  if (mime.startsWith('image/')) {
    return <img src={message.attachmentDataUrl} alt={message.attachmentName ?? 'attachment'} className="mt-2 w-full rounded-lg border border-blue-200" />
  }

  if (mime.startsWith('video/')) {
    return (
      <video controls className="mt-2 w-full rounded-lg border border-blue-200">
        <source src={message.attachmentDataUrl} type={mime} />
      </video>
    )
  }

  if (mime.startsWith('audio/')) {
    return (
      <audio controls className="mt-2 w-full">
        <source src={message.attachmentDataUrl} type={mime} />
      </audio>
    )
  }

  return (
    <a
      href={message.attachmentDataUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
    >
      Open Attachment ({message.attachmentName ?? 'file'})
    </a>
  )
}

const aiPinnedMessages = [
  'AI assistant will be integrated here later.',
  'This pinned panel is reserved for smart repair suggestions.',
  'Soon: automatic diagnosis from issue images and text.',
]

function ChatPage() {
  const session = readSession()
  const [searchParams] = useSearchParams()
  const [text, setText] = useState('')
  const [selectedContactEmail, setSelectedContactEmail] = useState('')
  const [hiddenContactEmails, setHiddenContactEmails] = useState(() => (session ? readHiddenContacts(session.email) : []))
  const [editingMessageId, setEditingMessageId] = useState('')
  const [pendingAttachment, setPendingAttachment] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [recordError, setRecordError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [, setRefreshCounter] = useState(0)
  const mediaRecorderRef = useRef(null)
  const mediaStreamRef = useRef(null)

  const preferredContact = searchParams.get('contact') ?? ''
  const contactsMap = new Map()
  const requestContactKeys = new Set()

  const addContact = (contact) => {
    const key = normalizeEmail(contact.email)
    if (!key || key === normalizeEmail(session.email)) {
      return
    }
    if (!contactsMap.has(key)) {
      contactsMap.set(key, contact)
    }
  }

  loadChatContacts(session.email).forEach(addContact)

  if (session.role === 'customer') {
    getRequestsForCustomer(session.email).forEach((item) => {
      if (!item.assignedTechnicalEmail || !item.assignedTechnicalName) {
        return
      }
      requestContactKeys.add(normalizeEmail(item.assignedTechnicalEmail))
      addContact({
        email: item.assignedTechnicalEmail,
        name: item.assignedTechnicalName,
        role: 'technical',
      })
    })
  } else {
    getRequestsForTechnical(session.email).forEach((item) => {
      requestContactKeys.add(normalizeEmail(item.customerEmail))
      addContact({
        email: item.customerEmail,
        name: item.customerName,
        role: 'customer',
      })
    })
  }

  if (preferredContact) {
    const preferredAccount = findAccountByEmail(preferredContact)
    if (preferredAccount) {
      addContact({
        email: preferredAccount.email,
        name: preferredAccount.name,
        role: preferredAccount.role,
      })
    }
  }

  const contacts = Array.from(contactsMap.values())
    .filter((item) => {
      const key = normalizeEmail(item.email)
      return !hiddenContactEmails.includes(key) || requestContactKeys.has(key)
    })
    .sort((a, b) => a.name.localeCompare(b.name))
  const activeEmail = selectedContactEmail || preferredContact
  const selectedContact = contacts.find((item) => normalizeEmail(item.email) === normalizeEmail(activeEmail)) ?? contacts[0] ?? null

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!session?.email) {
      return
    }
    markAllChatsAsRead(session.email)
  }, [session?.email, selectedContactEmail])

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  const messages = selectedContact ? loadThreadMessages(session.email, selectedContact.email) : []
  const canSend = Boolean(selectedContact) && Boolean(editingMessageId ? text.trim() : text.trim() || pendingAttachment?.dataUrl)

  const handleSend = (event) => {
    event.preventDefault()
    if (!selectedContact || !canSend) {
      return
    }

    if (editingMessageId) {
      const edited = editDirectMessage(editingMessageId, session.email, text)
      if (!edited) {
        setRecordError('Unable to edit this message now.')
        return
      }

      setEditingMessageId('')
      setText('')
      setUploadError('')
      setRecordError('')
      setPendingAttachment(null)
      setRefreshCounter((value) => value + 1)
      return
    }

    addDirectMessage(session, selectedContact, {
      text,
      attachmentName: pendingAttachment?.name,
      attachmentDataUrl: pendingAttachment?.dataUrl,
      attachmentMimeType: pendingAttachment?.mimeType,
    })

    setText('')
    setPendingAttachment(null)
    setUploadError('')
    setRecordError('')
    setRefreshCounter((value) => value + 1)
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    setUploadError('')

    if (!file) {
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size must be less than 20MB.')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      setPendingAttachment({
        name: file.name,
        dataUrl,
        mimeType: file.type || 'application/octet-stream',
      })
    } catch {
      setUploadError('Could not read file.')
    } finally {
      event.target.value = ''
    }
  }

  const startVoiceRecording = async () => {
    setRecordError('')
    if (isRecording) {
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordError('Voice recording is not supported on this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: blob.type || 'audio/webm',
        })
        const dataUrl = await readFileAsDataUrl(file)
        setPendingAttachment({
          name: file.name,
          dataUrl,
          mimeType: file.type || 'audio/webm',
        })
        setIsRecording(false)

        stream.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
        mediaRecorderRef.current = null
      }

      mediaStreamRef.current = stream
      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch {
      setRecordError('Microphone permission denied or unavailable.')
    }
  }

  const stopVoiceRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return
    }
    mediaRecorderRef.current.stop()
  }

  const handleStartEdit = (message) => {
    if (isRecording) {
      stopVoiceRecording()
    }
    setEditingMessageId(message.id)
    setText(message.text ?? '')
    setPendingAttachment(null)
    setUploadError('')
    setRecordError('')
  }

  const handleCancelEdit = () => {
    setEditingMessageId('')
    setText('')
    setRecordError('')
  }

  const handleUnsend = (message) => {
    const confirmed = window.confirm('Do you want to unsend this message?')
    if (!confirmed) {
      return
    }

    const deleted = unsendDirectMessage(message.id, session.email)
    if (!deleted) {
      setRecordError('Unable to unsend this message now.')
      return
    }

    if (editingMessageId === message.id) {
      handleCancelEdit()
    }
    setRefreshCounter((value) => value + 1)
  }

  const handleHideContact = (email) => {
    const key = normalizeEmail(email)
    if (hiddenContactEmails.includes(key)) {
      return
    }

    const nextHidden = [...hiddenContactEmails, key]
    setHiddenContactEmails(nextHidden)
    saveHiddenContacts(session.email, nextHidden)

    if (normalizeEmail(selectedContactEmail) === key) {
      setSelectedContactEmail('')
    }
  }

  return (
    <section className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Chat</span>
          <h1 className="mt-2 font-['Outfit'] text-3xl font-semibold text-blue-900">Direct Customer and Technician Chat</h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-600">
            {session.role === 'customer'
              ? 'Open any technician chat from your list and continue conversation anytime.'
              : 'Open any customer chat, reply with text, voice, or files.'}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <article className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm lg:col-span-3">
            <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Contacts</h2>
            {contacts.length === 0 ? (
              <p className="mt-3 text-sm text-blue-600">No contacts yet. Send or receive a request first.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {contacts.map((item) => {
                  const active = selectedContact && normalizeEmail(item.email) === normalizeEmail(selectedContact.email)
                  return (
                    <div key={item.email} className="flex items-start gap-2">
                      <button
                        type="button"
                        className={`flex-1 rounded-xl border px-3 py-2 text-left transition ${
                          active ? 'border-blue-900 bg-blue-900 text-white' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                        onClick={() => setSelectedContactEmail(item.email)}
                      >
                        <strong className="block text-sm">{item.name}</strong>
                        <span className={`text-xs ${active ? 'text-blue-200' : 'text-blue-500'}`}>{item.role}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHideContact(item.email)}
                        className="mt-1 rounded-lg border border-rose-300 bg-white px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                        aria-label={`Remove ${item.name} from contacts list`}
                        title="Remove from contacts list"
                      >
                        x
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">
                {selectedContact ? `Chat with ${selectedContact.name}` : 'Select Contact'}
              </h2>
              {selectedContact ? <small className="text-xs text-blue-500">{selectedContact.email}</small> : null}
            </div>

            <div className="mt-4 grid max-h-[420px] min-h-[300px] gap-3 overflow-y-auto rounded-xl border border-blue-200 bg-blue-50 p-3">
              {!selectedContact ? (
                <p className="text-sm text-blue-600">Choose a contact from the left list to start chatting.</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-blue-600">No messages yet. Start the conversation.</p>
              ) : (
                messages.map((item) => {
                  const mine = normalizeEmail(item.senderEmail) === normalizeEmail(session.email)
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-3 ${
                        mine ? 'border-blue-900 bg-blue-900 text-white' : 'border-blue-200 bg-white text-blue-800'
                      }`}
                    >
                      <div className={`mb-1 text-xs ${mine ? 'text-blue-200' : 'text-blue-500'}`}>
                        <strong>{item.senderName}</strong> ({item.senderRole}) - {formatTime(item.createdAt)}
                      </div>
                      {item.text ? <p className="text-sm">{item.text}</p> : null}
                      {item.editedAt ? <p className={`mt-1 text-xs ${mine ? 'text-blue-200' : 'text-blue-500'}`}>edited</p> : null}
                      {renderAttachment(item)}
                      {mine ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.text ? (
                            <button
                              type="button"
                              className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                                editingMessageId === item.id
                                  ? 'bg-white text-blue-700'
                                  : mine
                                    ? 'border border-blue-200 text-white hover:bg-blue-800'
                                    : 'border border-blue-300 text-blue-700 hover:bg-blue-100'
                              }`}
                              onClick={() => handleStartEdit(item)}
                            >
                              Edit
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                              mine
                                ? 'border-blue-200 text-white hover:bg-blue-800'
                                : 'border-blue-300 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => handleUnsend(item)}
                          >
                            Unsend
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-blue-300 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  className="min-w-[180px] flex-1 rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs text-blue-700"
                  onChange={handleFileChange}
                  disabled={!selectedContact || isRecording || Boolean(editingMessageId)}
                />
                {!isRecording ? (
                  <button
                    type="button"
                    className="rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    onClick={startVoiceRecording}
                    disabled={!selectedContact || Boolean(editingMessageId)}
                  >
                    Record Voice
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                    onClick={stopVoiceRecording}
                  >
                    Stop Recording
                  </button>
                )}
                {pendingAttachment ? (
                  <button
                    type="button"
                    className="rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    onClick={() => setPendingAttachment(null)}
                  >
                    Remove Attachment
                  </button>
                ) : null}
              </div>

              {pendingAttachment ? <p className="mt-1 text-xs text-emerald-600">Attached: {pendingAttachment.name}</p> : null}
              {editingMessageId ? <p className="mt-1 text-xs text-blue-600">Editing mode is active. Attachments are disabled until you save/cancel.</p> : null}
              {uploadError ? <p className="mt-1 text-xs text-rose-600">{uploadError}</p> : null}
              {recordError ? <p className="mt-1 text-xs text-rose-600">{recordError}</p> : null}
            </div>

            <form className="mt-3 flex gap-2" onSubmit={handleSend}>
              <input
                className="w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900 outline-none transition focus:border-blue-900"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={
                  selectedContact
                    ? editingMessageId
                      ? 'Edit your message...'
                      : 'Write your message...'
                    : 'Select contact first'
                }
                disabled={!selectedContact}
              />
              {editingMessageId ? (
                <button
                  type="button"
                  className="rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              ) : null}
              <button
                type="submit"
                className="rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canSend}
              >
                {editingMessageId ? 'Save' : 'Send'}
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm lg:col-span-3">
            <h2 className="font-['Outfit'] text-xl font-semibold text-blue-900">Pinned AI Chat (Coming Soon)</h2>
            <div className="mt-3 space-y-2">
              {aiPinnedMessages.map((msg, index) => (
                <div key={index} className="rounded-xl border border-dashed border-blue-300 bg-blue-50 p-3 text-sm text-blue-600">
                  {msg}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <input
                className="w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm text-blue-900"
                placeholder="AI chat input will be enabled later..."
                disabled
              />
              <button
                type="button"
                className="w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm font-semibold text-blue-500"
                disabled
              >
                AI Reply (Soon)
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default ChatPage

