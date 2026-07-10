import { defaultServiceCatalog } from '../data/content'

const SERVICE_KEY = 'fixhub_services'

function normalizeService(service, index) {
  return {
    id: Number(service?.id) || index + 1,
    title: String(service?.title ?? '').trim(),
    category: String(service?.category ?? '').trim(),
    description: String(service?.description ?? '').trim(),
    eta: String(service?.eta ?? '').trim(),
    icon: String(service?.icon ?? '🛠️').trim() || '🛠️',
  }
}

export function loadServices() {
  try {
    const raw = window.localStorage.getItem(SERVICE_KEY)
    if (!raw) {
      window.localStorage.setItem(SERVICE_KEY, JSON.stringify(defaultServiceCatalog))
      return [...defaultServiceCatalog]
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return [...defaultServiceCatalog]
    }

    const normalized = parsed
      .map((service, index) => normalizeService(service, index))
      .filter((service) => service.title && service.category)

    if (normalized.length === 0) {
      window.localStorage.setItem(SERVICE_KEY, JSON.stringify(defaultServiceCatalog))
      return [...defaultServiceCatalog]
    }

    return normalized
  } catch {
    return [...defaultServiceCatalog]
  }
}

function saveServices(services) {
  window.localStorage.setItem(SERVICE_KEY, JSON.stringify(services))
}

function nextServiceId(services) {
  return services.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

export function addService(payload) {
  const services = loadServices()
  const created = {
    id: nextServiceId(services),
    title: payload.title.trim(),
    category: payload.category.trim(),
    description: payload.description.trim(),
    eta: payload.eta.trim(),
    icon: payload.icon?.trim() || '🛠️',
  }

  saveServices([created, ...services])
  return created
}

export function deleteServiceById(serviceId) {
  const services = loadServices()
  const nextServices = services.filter((item) => Number(item.id) !== Number(serviceId))

  if (nextServices.length === services.length) {
    return false
  }

  saveServices(nextServices)
  return true
}
