const SESSION_KEY = 'fixhub_session';
export function readSession() {
    try {
        const raw = window.localStorage.getItem(SESSION_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (!parsed.name || !parsed.phone || !parsed.email || !parsed.role) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
export function writeSession(user) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
export function clearSession() {
    window.localStorage.removeItem(SESSION_KEY);
}
