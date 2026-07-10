const REQUEST_KEY = 'fixhub_service_requests';
function normalize(value) {
    return value.trim().toLowerCase();
}
export function loadServiceRequests() {
    try {
        const raw = window.localStorage.getItem(REQUEST_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
export function saveServiceRequests(requests) {
    window.localStorage.setItem(REQUEST_KEY, JSON.stringify(requests));
}
function buildRequestId(existingCount) {
    return `REQ-${String(existingCount + 1).padStart(4, '0')}`;
}
export function createServiceRequest(input) {
    const requests = loadServiceRequests();
    const request = {
        id: buildRequestId(requests.length),
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        service: input.service,
        location: input.location,
        details: input.details,
        attachmentName: input.attachmentName,
        attachmentDataUrl: input.attachmentDataUrl,
        createdAt: new Date().toISOString(),
        status: 'pending',
        assignedTechnicalEmail: input.assignedTechnicalEmail,
        assignedTechnicalName: input.assignedTechnicalName,
    };
    saveServiceRequests([request, ...requests]);
    return request;
}
export function updateServiceRequest(requestId, updater) {
    const requests = loadServiceRequests();
    const targetIndex = requests.findIndex((item) => item.id === requestId);
    if (targetIndex < 0) {
        return null;
    }
    const updated = updater(requests[targetIndex]);
    requests[targetIndex] = updated;
    saveServiceRequests(requests);
    return updated;
}
export function getRequestsForCustomer(email) {
    const key = normalize(email);
    return loadServiceRequests().filter((item) => normalize(item.customerEmail) === key);
}
export function getRequestsForTechnical(email) {
    const key = normalize(email);
    return loadServiceRequests().filter((item) => item.assignedTechnicalEmail && normalize(item.assignedTechnicalEmail) === key);
}
export function getRequestsVisibleToTechnical(email) {
    const key = normalize(email);
    return loadServiceRequests().filter((item) => {
        if (!item.assignedTechnicalEmail) {
            return true;
        }
        return normalize(item.assignedTechnicalEmail) === key;
    });
}
export function getAllRequestsSorted() {
    return loadServiceRequests().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function formatStatusLabel(status) {
    if (status === 'done') {
        return 'Done';
    }
    if (status === 'in_progress') {
        return 'In Progress';
    }
    return 'Pending';
}
