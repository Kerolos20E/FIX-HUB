import { addDirectMessage, loadChatMessages } from './chatStore'
import { ensureDemoAccounts, loadAccounts } from './authStore'
import { loadServiceRequests, saveServiceRequests } from './requestStore'
import { addReview, loadReviews } from './reviewStore'

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
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

function buildRequestId(index) {
  return `REQ-${String(index).padStart(4, '0')}`
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function nextRequestNumber(requests) {
  return (
    requests.reduce((max, item) => {
      const match = /^REQ-(\d+)$/.exec(String(item.id ?? ''))
      if (!match) {
        return max
      }
      return Math.max(max, Number(match[1]))
    }, 0) + 1
  )
}

function getServiceTitle(category, index) {
  const catalog = {
    Electrical: ['Emergency Electrical Repair', 'Lighting Upgrade Pack'],
    Plumbing: ['Smart Plumbing Rescue', 'Kitchen and Bathroom Plumbing'],
    'Air Conditioning': ['AC Deep Care'],
    Carpentry: ['Precision Carpentry'],
  }

  const titles = catalog[category] ?? ['General Home Maintenance']
  return titles[index % titles.length]
}

function createDemoRequests(accounts, existingRequests) {
  const demoCustomers = accounts.filter((item) => item.role === 'customer' && item.isDemo)
  const demoTechnicians = accounts.filter((item) => item.role === 'technical' && item.isDemo)

  if (demoCustomers.length < 2 || demoTechnicians.length === 0) {
    return []
  }

  const requests = [...existingRequests]
  let idCounter = nextRequestNumber(requests)

  demoTechnicians.forEach((technical, technicalIndex) => {
    const category = mapSpecialtyToCategory(technical.specialty ?? '')
    const technicalKey = normalize(technical.email)
    const existingForTechnical = requests.filter((item) => {
      const assignedKey = normalize(item.assignedTechnicalEmail)
      const customerKey = normalize(item.customerEmail)
      return assignedKey === technicalKey && customerKey.endsWith('@fixhub.demo')
    })

    const missingCount = Math.max(0, 2 - existingForTechnical.length)
    const startingSlot = existingForTechnical.length

    for (let offset = 0; offset < missingCount; offset += 1) {
      const slot = startingSlot + offset
      const customer = demoCustomers[(technicalIndex + slot) % demoCustomers.length]
      const status = slot === 0 ? 'done' : 'in_progress'
      const requestNumber = idCounter
      idCounter += 1

      requests.push({
        id: buildRequestId(requestNumber),
        customerEmail: customer.email,
        customerName: customer.name,
        customerPhone: customer.phone,
        service: getServiceTitle(category, technicalIndex + slot),
        location: customer.address || `${customer.city} District`,
        details:
          status === 'done'
            ? `Completed ${category.toLowerCase()} maintenance and tested all points.`
            : `Customer reported issue in ${category.toLowerCase()} system and requested urgent follow-up.`,
        createdAt: hoursAgo(90 - requestNumber * 3),
        status,
        assignedTechnicalEmail: technical.email,
        assignedTechnicalName: technical.name,
      })
    }
  })

  return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function seedRequestsIfNeeded(accounts) {
  const storedRequests = loadServiceRequests()
  const nextRequests = createDemoRequests(accounts, storedRequests)
  if (nextRequests.length === 0) {
    return storedRequests
  }

  const changed = nextRequests.length !== storedRequests.length
  if (changed) {
    saveServiceRequests(nextRequests)
  }
  return nextRequests
}

function seedReviewsIfNeeded(accounts, requests) {
  const existingReviews = loadReviews()
  const existingReviewRequests = new Set(existingReviews.map((item) => item.requestId))
  const accountsByEmail = new Map(accounts.map((item) => [normalize(item.email), item]))
  const doneRequests = requests.filter((item) => item.status === 'done')
  const feedback = [
    { rating: 5, comment: 'Very professional and solved the issue quickly.' },
    { rating: 4, comment: 'Arrived on time and explained every step clearly.' },
    { rating: 5, comment: 'Excellent quality and clean finishing.' },
    { rating: 4, comment: 'Good communication and fast execution.' },
  ]

  doneRequests.forEach((request, index) => {
    if (existingReviewRequests.has(request.id)) {
      return
    }

    const customer = accountsByEmail.get(normalize(request.customerEmail))
    const technical = accountsByEmail.get(normalize(request.assignedTechnicalEmail))
    if (!customer) {
      return
    }
    if (!customer.isDemo || !technical?.isDemo) {
      return
    }

    const entry = feedback[index % feedback.length]
    addReview({
      requestId: request.id,
      customerEmail: customer.email,
      customerName: customer.name,
      technicalEmail: request.assignedTechnicalEmail,
      technicalName: request.assignedTechnicalName,
      rating: entry.rating,
      comment: entry.comment,
    })

    existingReviewRequests.add(request.id)
  })
}

function seedMessagesIfNeeded(accounts, requests) {
  if (loadChatMessages('worker_customer').length > 0) {
    return
  }

  const accountsByEmail = new Map(accounts.map((item) => [normalize(item.email), item]))
  const seededThreads = requests.slice(0, 6)

  seededThreads.forEach((request) => {
    const customer = accountsByEmail.get(normalize(request.customerEmail))
    const technical = accountsByEmail.get(normalize(request.assignedTechnicalEmail))
    if (!customer || !technical) {
      return
    }

    addDirectMessage(
      { email: customer.email, name: customer.name, role: 'customer' },
      { email: technical.email, name: technical.name, role: 'technical' },
      `Hi ${technical.name.split(' ')[0]}, I need help with ${request.service}.`,
    )

    addDirectMessage(
      { email: technical.email, name: technical.name, role: 'technical' },
      { email: customer.email, name: customer.name, role: 'customer' },
      `Sure ${customer.name.split(' ')[0]}, I reviewed your issue and will handle it shortly.`,
    )
  })
}

export function ensureDemoData() {
  if (typeof window === 'undefined') {
    return
  }

  ensureDemoAccounts()
  const accounts = loadAccounts()
  const requests = seedRequestsIfNeeded(accounts)
  seedReviewsIfNeeded(accounts, requests)
  seedMessagesIfNeeded(accounts, requests)
}
