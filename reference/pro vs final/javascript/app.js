const STORAGE_KEY = "fixhub.accounts.v2";
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
    verifyIdentity: ""
};
const requiredElements = [
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
    confirmResetPassword
];
if (requiredElements.some((element) => !element)) {
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
function loadAccounts() {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
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
    if (!loginEmail) {
        return;
    }
    loginEmail.value = email;
    if (loginPassword) {
        loginPassword.value = "";
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
    if (!name || !isValidEmail(email) || phone.length < 10 || nationalId.length !== 14 || !address) {
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
    showFeedback("success", "Customer account created. Now log in with your email and password.");
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
    if (!name || !isValidEmail(email) || phone.length < 10 || nationalId.length !== 14 || !specialty) {
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
    showFeedback("success", "Technical account created. Now log in with your email and password.");
}
roleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.selectedRole = userRole?.value || "customer";
    showScreen(state.selectedRole === "customer" ? "customer" : "technical");
    showFeedback("info", `You selected ${state.selectedRole}. Complete the account form.`);
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
    showFeedback("success", `Welcome ${account.name}! Login completed successfully.`);
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
    showFeedback("success", "Password updated. Now log in with the new password.");
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
showScreen("role");
showFeedback("info", "Choose account type to start.");
