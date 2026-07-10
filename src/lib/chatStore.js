const CHAT_KEY = 'fixhub_chat_messages';
const CHAT_READ_KEY = 'fixhub_chat_read_state';
function normalizeEmail(value) {
    return value.trim().toLowerCase();
}
function saveAllMessages(messages) {
    window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
}
function loadReadState() {
    try {
        const raw = window.localStorage.getItem(CHAT_READ_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return {};
        }
        return parsed;
    }
    catch {
        return {};
    }
}
function saveReadState(state) {
    window.localStorage.setItem(CHAT_READ_KEY, JSON.stringify(state));
}
function isChannel(value) {
    return value === 'worker_customer' || value === 'ai_pinned';
}
function isRole(value) {
    return value === 'customer' || value === 'technical';
}
function asString(value) {
    return typeof value === 'string' ? value : '';
}
function normalizeStoredMessage(raw, index) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const item = raw;
    const senderEmail = asString(item.senderEmail);
    const receiverEmail = asString(item.receiverEmail);
    if (!senderEmail || !receiverEmail) {
        return null;
    }
    const text = asString(item.text).trim();
    const attachmentDataUrl = asString(item.attachmentDataUrl);
    if (!text && !attachmentDataUrl) {
        return null;
    }
    const channel = isChannel(item.channel) ? item.channel : 'worker_customer';
    const senderRole = isRole(item.senderRole) ? item.senderRole : 'customer';
    const receiverRole = isRole(item.receiverRole) ? item.receiverRole : 'technical';
    const createdAt = asString(item.createdAt) || new Date().toISOString();
    const editedAt = asString(item.editedAt);
    return {
        id: asString(item.id) || `MSG-${String(index + 1).padStart(5, '0')}`,
        channel,
        threadId: asString(item.threadId) || buildThreadId(senderEmail, receiverEmail),
        senderEmail,
        senderName: asString(item.senderName) || 'User',
        senderRole,
        receiverEmail,
        receiverName: asString(item.receiverName) || 'User',
        receiverRole,
        text: text || undefined,
        attachmentName: asString(item.attachmentName) || undefined,
        attachmentDataUrl: attachmentDataUrl || undefined,
        attachmentMimeType: asString(item.attachmentMimeType) || undefined,
        createdAt,
        editedAt: editedAt || undefined,
    };
}
function loadAllMessages() {
    try {
        const raw = window.localStorage.getItem(CHAT_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        const normalized = parsed
            .map((item, index) => normalizeStoredMessage(item, index))
            .filter((item) => Boolean(item));
        if (normalized.length !== parsed.length) {
            saveAllMessages(normalized);
        }
        return normalized;
    }
    catch {
        return [];
    }
}
function buildMessageId(count) {
    return `MSG-${String(count + 1).padStart(5, '0')}`;
}
function sortByCreatedAt(messages) {
    return [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
export function buildThreadId(emailA, emailB) {
    const [left, right] = [normalizeEmail(emailA), normalizeEmail(emailB)].sort();
    return `${left}::${right}`;
}
export function loadChatMessages(channel) {
    return sortByCreatedAt(loadAllMessages().filter((item) => item.channel === channel));
}
export function loadThreadMessages(userEmail, contactEmail) {
    const threadId = buildThreadId(userEmail, contactEmail);
    return sortByCreatedAt(loadAllMessages().filter((item) => item.channel === 'worker_customer' && item.threadId === threadId));
}
export function loadChatContacts(userEmail) {
    const key = normalizeEmail(userEmail);
    const messages = loadAllMessages().filter((item) => {
        return normalizeEmail(item.senderEmail) === key || normalizeEmail(item.receiverEmail) === key;
    });
    const contactsMap = new Map();
    messages.forEach((item) => {
        const senderEmail = normalizeEmail(item.senderEmail);
        const receiverEmail = normalizeEmail(item.receiverEmail);
        if (senderEmail === key && receiverEmail !== key) {
            contactsMap.set(receiverEmail, {
                email: item.receiverEmail,
                name: item.receiverName,
                role: item.receiverRole,
            });
        }
        if (receiverEmail === key && senderEmail !== key) {
            contactsMap.set(senderEmail, {
                email: item.senderEmail,
                name: item.senderName,
                role: item.senderRole,
            });
        }
    });
    return Array.from(contactsMap.values());
}
export function addDirectMessage(sender, receiver, message) {
    const payload = typeof message === 'string' ? { text: message } : message;
    const trimmedText = payload.text?.trim() ?? '';
    const attachmentDataUrl = payload.attachmentDataUrl?.trim() ?? '';
    const attachmentMimeType = payload.attachmentMimeType?.trim() ?? '';
    const attachmentName = payload.attachmentName?.trim() ?? '';
    if (!trimmedText && !attachmentDataUrl) {
        throw new Error('Message text or attachment is required.');
    }
    const all = loadAllMessages();
    const nextMessage = {
        id: buildMessageId(all.length),
        channel: 'worker_customer',
        threadId: buildThreadId(sender.email, receiver.email),
        senderEmail: sender.email,
        senderName: sender.name,
        senderRole: sender.role,
        receiverEmail: receiver.email,
        receiverName: receiver.name,
        receiverRole: receiver.role,
        text: trimmedText || undefined,
        attachmentName: attachmentName || undefined,
        attachmentDataUrl: attachmentDataUrl || undefined,
        attachmentMimeType: attachmentMimeType || undefined,
        createdAt: new Date().toISOString(),
    };
    saveAllMessages([...all, nextMessage]);
    return nextMessage;
}

export function editDirectMessage(messageId, senderEmail, nextText) {
    const all = loadAllMessages();
    const targetIndex = all.findIndex((item) => item.id === messageId);
    if (targetIndex < 0) {
        return null;
    }
    const target = all[targetIndex];
    if (normalizeEmail(target.senderEmail) !== normalizeEmail(senderEmail)) {
        return null;
    }
    const trimmedText = nextText.trim();
    if (!trimmedText && !target.attachmentDataUrl) {
        return null;
    }
    const updated = {
        ...target,
        text: trimmedText || undefined,
        editedAt: new Date().toISOString(),
    };
    all[targetIndex] = updated;
    saveAllMessages(all);
    return updated;
}

export function unsendDirectMessage(messageId, senderEmail) {
    const all = loadAllMessages();
    const target = all.find((item) => item.id === messageId);
    if (!target) {
        return false;
    }
    if (normalizeEmail(target.senderEmail) !== normalizeEmail(senderEmail)) {
        return false;
    }
    const next = all.filter((item) => item.id !== messageId);
    saveAllMessages(next);
    return true;
}

export function markAllChatsAsRead(userEmail) {
    const key = normalizeEmail(userEmail);
    if (!key) {
        return;
    }
    const state = loadReadState();
    state[key] = {
        lastSeenAt: new Date().toISOString(),
    };
    saveReadState(state);
}

export function getUnreadCountForUser(userEmail) {
    const key = normalizeEmail(userEmail);
    if (!key) {
        return 0;
    }
    const state = loadReadState();
    const lastSeenAt = asString(state[key]?.lastSeenAt);
    const incoming = loadAllMessages().filter((item) => item.channel === 'worker_customer' && normalizeEmail(item.receiverEmail) === key);
    if (!lastSeenAt) {
        return incoming.length;
    }
    return incoming.filter((item) => item.createdAt > lastSeenAt).length;
}
