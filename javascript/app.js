const ACCOUNT_STORAGE_KEY = "fixhub.accounts.v3";
const SESSION_STORAGE_KEY = "fixhub.session.v1";
const REQUEST_STORAGE_KEY = "fixhub.requests.v1";
const authPortal = document.getElementById("authPortal");
const appPortal = document.getElementById("appPortal");
const sessionName = document.getElementById("sessionName");
const logoutBtn = document.getElementById("logoutBtn");
const roleForm = document.getElementById("roleForm");
const customerForm = document.getElementById("customerForm");
const technicalForm = document.getElementById("technicalForm");
const loginForm = document.getElementById("loginForm");
const verifyForm = document.getElementById("verifyForm");
const resetForm = document.getElementById("resetForm");
const feedback = document.getElementById("feedback");
const userRole = document.getElementById("userRole");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const verifyEmail = document.getElementById("verifyEmail");
const verifyCode = document.getElementById("verifyCode");
const newPassword = document.getElementById("newPassword");
const confirmResetPassword = document.getElementById("confirmResetPassword");
const forgotLink = document.getElementById("forgotLink");
const openRoleFromLogin = document.getElementById("openRoleFromLogin");
const resendCode = document.getElementById("resendCode");
const goLoginFromRole = document.getElementById("goLoginFromRole");
const bookingForm = document.getElementById("bookingForm");
const bookingFeedback = document.getElementById("bookingFeedback");
const bookingName = document.getElementById("bookingName");
const bookingPhone = document.getElementById("bookingPhone");
const bookingEmail = document.getElementById("bookingEmail");
const bookingService = document.getElementById("bookingService");
const bookingAddress = document.getElementById("bookingAddress");
const bookingDetails = document.getElementById("bookingDetails");
const requestsBody = document.getElementById("requestsBody");
const clearRequestsBtn = document.getElementById("clearRequestsBtn");
const screens = {
    role: roleForm,
    customer: customerForm,
    technical: technicalForm,
    login: loginForm,
    verify: verifyForm,
    reset: resetForm
};
const state = {
    selectedRole: "customer",
    verificationCode: "246810",
    verifyIdentity: "",
    currentAccount: null
};
const requiredElements = [
    authPortal,
    appPortal,
    roleForm,
    customerForm,
    technicalForm,
    loginForm,
    verifyForm,
    resetForm,
    feedback,
    userRole,
    loginEmail,
    loginPassword,
    verifyEmail,
    verifyCode,
    newPassword,
    confirmResetPassword,
    bookingForm,
    bookingFeedback,
    bookingName,
    bookingPhone,
    bookingEmail,
    bookingService,
    bookingAddress,
    bookingDetails,
    requestsBody,
    clearRequestsBtn
];
if (requiredElements.some((item) => !item)) {
    throw new Error("FIXHUB: Missing required DOM elements.");
}
function normalize(value) {
    return value.trim().toLowerCase();
}
function onlyDigits(value) {
    return value.replace(/\D/g, "");
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(value) {
    const digits = onlyDigits(value);
    return digits.length >= 10 && digits.length <= 14;
}
function loadAccounts() {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw) {
        return [];
    }
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
}
function upsertAccount(nextAccount) {
    const accounts = loadAccounts();
    const existingIndex = accounts.findIndex((account) => normalize(account.email) === normalize(nextAccount.email));
    if (existingIndex >= 0) {
        accounts[existingIndex] = nextAccount;
    }
    else {
        accounts.push(nextAccount);
    }
    saveAccounts(accounts);
}
function findAccountByEmail(email) {
    const key = normalize(email);
    return loadAccounts().find((account) => normalize(account.email) === key);
}
function updatePasswordByEmail(email, password) {
    const key = normalize(email);
    const accounts = loadAccounts();
    const target = accounts.find((account) => normalize(account.email) === key);
    if (!target) {
        return false;
    }
    target.password = password;
    saveAccounts(accounts);
    return true;
}
function showFeedback(type, message) {
    if (!feedback) {
        return;
    }
    feedback.className = `alert alert-${type}`;
    feedback.textContent = message;
    feedback.classList.remove("d-none");
}
function hideFeedback() {
    if (!feedback) {
        return;
    }
    feedback.classList.add("d-none");
}
function showBookingFeedback(type, message) {
    if (!bookingFeedback) {
        return;
    }
    bookingFeedback.className = `alert alert-${type}`;
    bookingFeedback.textContent = message;
    bookingFeedback.classList.remove("d-none");
}
function clearBookingFeedback() {
    if (!bookingFeedback) {
        return;
    }
    bookingFeedback.classList.add("d-none");
}
function showScreen(screen) {
    Object.keys(screens).forEach((id) => {
        const element = screens[id];
        if (!element) {
            return;
        }
        if (id === screen) {
            element.classList.add("active");
        }
        else {
            element.classList.remove("active");
        }
    });
}
function prefillLoginEmail(email) {
    if (!loginEmail || !loginPassword) {
        return;
    }
    loginEmail.value = email;
    loginPassword.value = "";
}
function setSession(email) {
    localStorage.setItem(SESSION_STORAGE_KEY, normalize(email));
}
function clearSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}
function getSessionEmail() {
    return normalize(localStorage.getItem(SESSION_STORAGE_KEY) || "");
}
function loadRequests() {
    const raw = localStorage.getItem(REQUEST_STORAGE_KEY);
    if (!raw) {
        return [];
    }
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function saveRequests(requests) {
    localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(requests));
}
function getCurrentAccountRequests() {
    if (!state.currentAccount) {
        return [];
    }
    const emailKey = normalize(state.currentAccount.email);
    return loadRequests().filter((request) => normalize(request.accountEmail) === emailKey);
}
function renderRequestsTable() {
    if (!requestsBody) {
        return;
    }
    const requests = getCurrentAccountRequests();
    if (!requests.length) {
        requestsBody.innerHTML =
            '<tr><td colspan="5" class="text-center text-secondary py-4">No requests yet.</td></tr>';
        return;
    }
    requestsBody.innerHTML = requests
        .map((request, index) => {
        return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${request.date}</td>
                    <td>${request.service}</td>
                    <td>${request.address}</td>
                    <td><span class="status-pill status-pending">${request.status}</span></td>
                </tr>
            `;
    })
        .join("");
}
function resetBookingForm(account) {
    if (!bookingForm || !bookingName || !bookingPhone || !bookingEmail || !bookingAddress || !bookingDetails) {
        return;
    }
    bookingForm.reset();
    bookingName.value = account.name;
    bookingPhone.value = account.phone;
    bookingEmail.value = account.email;
    bookingAddress.value = account.address ?? "";
    bookingDetails.value = "";
}
function openPortal(account) {
    state.currentAccount = account;
    if (authPortal && appPortal) {
        authPortal.classList.add("d-none");
        appPortal.classList.remove("d-none");
    }
    document.body.classList.remove("mode-auth");
    document.body.classList.add("mode-portal");
    if (sessionName) {
        sessionName.textContent = account.name;
    }
    resetBookingForm(account);
    renderRequestsTable();
    clearBookingFeedback();
}
function openAuth(screen = "login") {
    state.currentAccount = null;
    if (authPortal && appPortal) {
        appPortal.classList.add("d-none");
        authPortal.classList.remove("d-none");
    }
    document.body.classList.remove("mode-portal");
    document.body.classList.add("mode-auth");
    showScreen(screen);
    if (screen === "role") {
        showFeedback("info", "Choose account type to start.");
    }
    else if (screen === "login") {
        showFeedback("info", "Sign in to continue to the full portal.");
    }
    else {
        hideFeedback();
    }
}
function createCustomerAccount() {
    const nameEl = document.getElementById("customerName");
    const emailEl = document.getElementById("customerEmail");
    const phoneEl = document.getElementById("customerPhone");
    const nationalIdEl = document.getElementById("customerNationalId");
    const cityEl = document.getElementById("customerCity");
    const addressEl = document.getElementById("customerAddress");
    const passwordEl = document.getElementById("customerPassword");
    const confirmPasswordEl = document.getElementById("customerConfirmPassword");
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const phone = onlyDigits(phoneEl.value);
    const nationalId = onlyDigits(nationalIdEl.value);
    const city = cityEl.value;
    const address = addressEl.value.trim();
    const password = passwordEl.value;
    const confirmPassword = confirmPasswordEl.value;
    if (!name || !isValidEmail(email) || !isValidPhone(phone) || nationalId.length !== 14 || !address) {
        showFeedback("danger", "Please complete all customer fields correctly.");
        return;
    }
    if (password.length < 6) {
        showFeedback("danger", "Password must be at least 6 characters.");
        return;
    }
    if (password !== confirmPassword) {
        showFeedback("danger", "Password and confirm password are not the same.");
        return;
    }
    const account = {
        role: "customer",
        name,
        email,
        phone,
        nationalId,
        city,
        address,
        password
    };
    upsertAccount(account);
    customerForm?.reset();
    prefillLoginEmail(email);
    showScreen("login");
    showFeedback("success", "Customer account created. Now sign in.");
}
function createTechnicalAccount() {
    const nameEl = document.getElementById("technicalName");
    const emailEl = document.getElementById("technicalEmail");
    const phoneEl = document.getElementById("technicalPhone");
    const nationalIdEl = document.getElementById("technicalNationalId");
    const cityEl = document.getElementById("technicalCity");
    const specialtyEl = document.getElementById("technicalSpecialty");
    const passwordEl = document.getElementById("technicalPassword");
    const confirmPasswordEl = document.getElementById("technicalConfirmPassword");
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const phone = onlyDigits(phoneEl.value);
    const nationalId = onlyDigits(nationalIdEl.value);
    const city = cityEl.value;
    const specialty = specialtyEl.value;
    const password = passwordEl.value;
    const confirmPassword = confirmPasswordEl.value;
    if (!name || !isValidEmail(email) || !isValidPhone(phone) || nationalId.length !== 14 || !specialty) {
        showFeedback("danger", "Please complete all technical fields correctly.");
        return;
    }
    if (password.length < 6) {
        showFeedback("danger", "Password must be at least 6 characters.");
        return;
    }
    if (password !== confirmPassword) {
        showFeedback("danger", "Password and confirm password are not the same.");
        return;
    }
    const account = {
        role: "technical",
        name,
        email,
        phone,
        nationalId,
        city,
        specialty,
        password
    };
    upsertAccount(account);
    technicalForm?.reset();
    prefillLoginEmail(email);
    showScreen("login");
    showFeedback("success", "Technical account created. Now sign in.");
}
roleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.selectedRole = userRole?.value || "customer";
    showScreen(state.selectedRole === "customer" ? "customer" : "technical");
    showFeedback("info", `You selected ${state.selectedRole}. Complete the account form.`);
});
goLoginFromRole?.addEventListener("click", () => {
    showScreen("login");
    showFeedback("info", "Sign in to continue.");
});
customerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    createCustomerAccount();
});
technicalForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    createTechnicalAccount();
});
loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = loginEmail?.value.trim() || "";
    const password = loginPassword?.value || "";
    if (!isValidEmail(email) || !password) {
        showFeedback("danger", "Enter valid email and password.");
        return;
    }
    const account = findAccountByEmail(email);
    if (!account) {
        showFeedback("warning", "No account found with this email. Create account first.");
        return;
    }
    if (account.password !== password) {
        showFeedback("danger", "Incorrect password.");
        return;
    }
    setSession(account.email);
    showFeedback("success", `Welcome ${account.name}. Login completed.`);
    openPortal(account);
});
forgotLink?.addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("verify");
    if (verifyEmail && loginEmail?.value.trim()) {
        verifyEmail.value = loginEmail.value.trim();
    }
    showFeedback("info", "Enter your email and code. Click resend for a new code.");
});
openRoleFromLogin?.addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("role");
    showFeedback("info", "Choose user type to create a new account.");
});
resendCode?.addEventListener("click", (event) => {
    event.preventDefault();
    state.verificationCode = `${Math.floor(100000 + Math.random() * 900000)}`;
    showFeedback("info", `Demo code sent: ${state.verificationCode}`);
});
verifyForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = verifyEmail?.value.trim() || "";
    const code = verifyCode?.value.trim() || "";
    if (!isValidEmail(email) || !code) {
        showFeedback("danger", "Enter valid email and code.");
        return;
    }
    const account = findAccountByEmail(email);
    if (!account) {
        showFeedback("warning", "No account found with this email.");
        return;
    }
    if (code !== state.verificationCode) {
        showFeedback("danger", "Invalid code. Click resend to generate a new one.");
        return;
    }
    state.verifyIdentity = email;
    showScreen("reset");
    showFeedback("success", "Code verified. Set your new password.");
});
resetForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const pass = newPassword?.value || "";
    const confirmPass = confirmResetPassword?.value || "";
    if (pass.length < 6) {
        showFeedback("danger", "Password must be at least 6 characters.");
        return;
    }
    if (pass !== confirmPass) {
        showFeedback("danger", "Password and confirm password are not the same.");
        return;
    }
    if (!state.verifyIdentity) {
        showFeedback("warning", "Please verify your email first.");
        return;
    }
    const updated = updatePasswordByEmail(state.verifyIdentity, pass);
    if (!updated) {
        showFeedback("danger", "Could not update password.");
        return;
    }
    resetForm.reset();
    prefillLoginEmail(state.verifyIdentity);
    showScreen("login");
    showFeedback("success", "Password updated. Now sign in with the new password.");
});
document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => {
        const target = button.getAttribute("data-back");
        if (!target) {
            return;
        }
        showScreen(target);
        showFeedback("info", "Returned to previous step.");
    });
});
bookingForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.currentAccount || !bookingName || !bookingPhone || !bookingEmail || !bookingService || !bookingAddress || !bookingDetails) {
        return;
    }
    const payload = {
        name: bookingName.value.trim(),
        phone: bookingPhone.value.trim(),
        email: bookingEmail.value.trim(),
        service: bookingService.value.trim(),
        address: bookingAddress.value.trim(),
        details: bookingDetails.value.trim()
    };
    if (payload.name.length < 3 ||
        !isValidPhone(payload.phone) ||
        !isValidEmail(payload.email) ||
        !payload.service ||
        payload.address.length < 4 ||
        payload.details.length < 10) {
        showBookingFeedback("danger", "Complete all booking fields with valid values.");
        return;
    }
    const requests = loadRequests();
    const request = {
        id: `${Date.now()}`,
        accountEmail: state.currentAccount.email,
        date: new Date().toLocaleString(),
        service: payload.service,
        address: payload.address,
        details: payload.details,
        status: "Pending"
    };
    requests.unshift(request);
    saveRequests(requests);
    showBookingFeedback("success", "Request submitted successfully.");
    resetBookingForm(state.currentAccount);
    renderRequestsTable();
});
clearRequestsBtn?.addEventListener("click", () => {
    if (!state.currentAccount) {
        return;
    }
    const confirmed = window.confirm("Delete all your requests?");
    if (!confirmed) {
        return;
    }
    const emailKey = normalize(state.currentAccount.email);
    const filtered = loadRequests().filter((request) => normalize(request.accountEmail) !== emailKey);
    saveRequests(filtered);
    renderRequestsTable();
    showBookingFeedback("info", "All your requests have been removed.");
});
document.querySelectorAll(".book-service").forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.getAttribute("data-service");
        if (value && bookingService) {
            bookingService.value = value;
        }
        const target = document.getElementById("booking");
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});
logoutBtn?.addEventListener("click", () => {
    clearSession();
    openAuth("login");
    showFeedback("info", "You have logged out.");
});
function initializeFromSession() {
    const sessionEmail = getSessionEmail();
    if (!sessionEmail) {
        openAuth("role");
        return;
    }
    const account = findAccountByEmail(sessionEmail);
    if (!account) {
        clearSession();
        openAuth("role");
        return;
    }
    openPortal(account);
}
initializeFromSession();
