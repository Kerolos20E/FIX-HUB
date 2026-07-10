const REVIEW_KEY = 'fixhub_reviews';
function normalize(value) {
    return value.trim().toLowerCase();
}
function buildReviewId(existingCount) {
    return `REV-${String(existingCount + 1).padStart(4, '0')}`;
}
export function loadReviews() {
    try {
        const raw = window.localStorage.getItem(REVIEW_KEY);
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
function saveReviews(reviews) {
    window.localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews));
}
export function addReview(input) {
    const reviews = loadReviews();
    const review = {
        id: buildReviewId(reviews.length),
        requestId: input.requestId,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        technicalEmail: input.technicalEmail,
        technicalName: input.technicalName,
        rating: Math.max(1, Math.min(5, Math.round(input.rating))),
        comment: input.comment.trim(),
        createdAt: new Date().toISOString(),
    };
    saveReviews([review, ...reviews]);
    return review;
}
export function getReviewsForTechnical(email) {
    const key = normalize(email);
    return loadReviews()
        .filter((item) => normalize(item.technicalEmail) === key)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export function findReviewForRequest(requestId, customerEmail) {
    const customerKey = normalize(customerEmail);
    return (loadReviews().find((item) => item.requestId === requestId && normalize(item.customerEmail) === customerKey) ?? null);
}
export function getAverageRatingForTechnical(email) {
    const reviews = getReviewsForTechnical(email);
    if (reviews.length === 0) {
        return 0;
    }
    const total = reviews.reduce((sum, item) => sum + item.rating, 0);
    return Number((total / reviews.length).toFixed(1));
}
