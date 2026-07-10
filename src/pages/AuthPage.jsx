import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthBrandPanel from '../components/auth/AuthBrandPanel'
import CustomerSignupForm from '../components/auth/CustomerSignupForm'
import LoginForm from '../components/auth/LoginForm'
import RoleSelectionForm from '../components/auth/RoleSelectionForm'
import TechnicalSignupForm from '../components/auth/TechnicalSignupForm'
import { DEMO_ACCOUNT_PASSWORD, getDemoLoginAccounts, upsertAccount, verifyLogin } from '../lib/authStore'
import { writeSession } from '../lib/session'

function toDigits(value) {
  return value.replace(/\D/g, '')
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(value) {
  const digits = toDigits(value)
  return digits.length >= 10 && digits.length <= 14
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })
}

function feedbackClass(type) {
  if (type === 'danger') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (type === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

const demoLoginAccounts = getDemoLoginAccounts()

function AuthPage() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState('role')
  const [selectedRole, setSelectedRole] = useState('customer')
  const [feedback, setFeedback] = useState(null)

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    nationalId: '',
    city: 'Sohag',
    address: '',
    bio: '',
    password: '',
    confirmPassword: '',
  })

  const [technicalForm, setTechnicalForm] = useState({
    name: '',
    email: '',
    phone: '',
    nationalId: '',
    city: 'Sohag',
    specialty: 'Electrical Technician',
    yearsOfExperience: '',
    bio: '',
    password: '',
    confirmPassword: '',
  })

  const [technicalCardImage, setTechnicalCardImage] = useState('')

  const clearFeedback = () => setFeedback(null)

  const screenTitle =
    screen === 'role'
      ? 'Choose User'
      : screen === 'customer'
        ? 'Customer Sign Up'
        : screen === 'technical'
          ? 'Technical Sign Up'
          : 'Log in'

  const handleRoleSubmit = (event) => {
    event.preventDefault()
    clearFeedback()
    setScreen(selectedRole === 'customer' ? 'customer' : 'technical')
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
    clearFeedback()
  }

  const handleCustomerChange = (event) => {
    const { name, value } = event.target
    setCustomerForm((prev) => ({ ...prev, [name]: value }))
    clearFeedback()
  }

  const handleTechnicalChange = (event) => {
    const { name, value } = event.target
    setTechnicalForm((prev) => ({ ...prev, [name]: value }))
    clearFeedback()
  }

  const handleTechnicalCardChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const imageDataUrl = await readImageAsDataUrl(file)
      setTechnicalCardImage(imageDataUrl)
      clearFeedback()
    } catch {
      setFeedback({ type: 'danger', text: 'Unable to load image. Try another file.' })
    }
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()

    if (!isValidEmail(loginForm.email.trim()) || loginForm.password.trim().length < 6) {
      setFeedback({ type: 'danger', text: 'Enter valid email and password.' })
      return
    }

    const session = verifyLogin(loginForm.email.trim(), loginForm.password)
    if (!session) {
      setFeedback({ type: 'danger', text: 'Wrong email or password.' })
      return
    }

    writeSession(session)
    navigate('/hub', { replace: true })
  }

  const handleCustomerSubmit = (event) => {
    event.preventDefault()

    if (
      customerForm.name.trim().length < 3 ||
      !isValidEmail(customerForm.email.trim()) ||
      !isValidPhone(customerForm.phone.trim()) ||
      toDigits(customerForm.nationalId).length !== 14 ||
      customerForm.address.trim().length < 4
    ) {
      setFeedback({ type: 'danger', text: 'Complete all customer fields correctly.' })
      return
    }

    if (customerForm.password.length < 6) {
      setFeedback({ type: 'danger', text: 'Password must be at least 6 characters.' })
      return
    }

    if (customerForm.password !== customerForm.confirmPassword) {
      setFeedback({ type: 'danger', text: 'Password and confirm password do not match.' })
      return
    }

    const customerAccount = {
      role: 'customer',
      name: customerForm.name.trim(),
      email: customerForm.email.trim(),
      phone: customerForm.phone.trim(),
      nationalId: toDigits(customerForm.nationalId),
      city: customerForm.city,
      address: customerForm.address.trim(),
      bio: customerForm.bio.trim(),
      password: customerForm.password,
      experiences: [],
      createdAt: new Date().toISOString(),
    }

    upsertAccount(customerAccount)
    setCustomerForm((prev) => ({
      ...prev,
      name: '',
      email: '',
      phone: '',
      nationalId: '',
      address: '',
      bio: '',
      password: '',
      confirmPassword: '',
    }))
    setLoginForm({ email: customerAccount.email, password: '' })
    setFeedback({ type: 'success', text: 'Customer account created. Now login.' })
    setScreen('login')
  }

  const handleTechnicalSubmit = (event) => {
    event.preventDefault()

    if (
      technicalForm.name.trim().length < 3 ||
      !isValidEmail(technicalForm.email.trim()) ||
      !isValidPhone(technicalForm.phone.trim()) ||
      toDigits(technicalForm.nationalId).length !== 14 ||
      technicalForm.specialty.trim().length < 3
    ) {
      setFeedback({ type: 'danger', text: 'Complete all technical fields correctly.' })
      return
    }

    if (!technicalCardImage) {
      setFeedback({ type: 'danger', text: 'Upload national ID card image for technical account.' })
      return
    }

    if (technicalForm.password.length < 6) {
      setFeedback({ type: 'danger', text: 'Password must be at least 6 characters.' })
      return
    }

    if (technicalForm.password !== technicalForm.confirmPassword) {
      setFeedback({ type: 'danger', text: 'Password and confirm password do not match.' })
      return
    }

    const technicalAccount = {
      role: 'technical',
      name: technicalForm.name.trim(),
      email: technicalForm.email.trim(),
      phone: technicalForm.phone.trim(),
      nationalId: toDigits(technicalForm.nationalId),
      city: technicalForm.city,
      specialty: technicalForm.specialty,
      yearsOfExperience: Number(technicalForm.yearsOfExperience || '0'),
      bio: technicalForm.bio.trim(),
      nationalCardImage: technicalCardImage,
      password: technicalForm.password,
      experiences: [],
      createdAt: new Date().toISOString(),
    }

    upsertAccount(technicalAccount)
    setTechnicalForm((prev) => ({
      ...prev,
      name: '',
      email: '',
      phone: '',
      nationalId: '',
      yearsOfExperience: '',
      bio: '',
      password: '',
      confirmPassword: '',
    }))
    setTechnicalCardImage('')
    setLoginForm({ email: technicalAccount.email, password: '' })
    setFeedback({ type: 'success', text: 'Technical account created. Now login.' })
    setScreen('login')
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#e2e8f0_0%,#f8fafc_45%,#f1f5f9_100%)] font-['Space_Grotesk']">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-2 lg:items-center lg:px-8">
        <section className="order-2 lg:order-1">
          <AuthBrandPanel />
        </section>

        <section className="order-1 lg:order-2">
          <div className="mx-auto w-full max-w-2xl rounded-3xl border border-blue-200 bg-white p-6 shadow-xl md:p-8">
            <h1 className="font-['Outfit'] text-3xl font-semibold text-blue-900 md:text-4xl">{screenTitle}</h1>

            <article className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 md:p-6">
              {feedback ? (
                <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${feedbackClass(feedback.type)}`}>
                  {feedback.text}
                </div>
              ) : null}

              {screen === 'role' ? (
                <RoleSelectionForm
                  selectedRole={selectedRole}
                  onRoleChange={setSelectedRole}
                  onSubmit={handleRoleSubmit}
                  onGoLogin={() => {
                    clearFeedback()
                    setScreen('login')
                  }}
                />
              ) : null}

              {screen === 'customer' ? (
                <CustomerSignupForm
                  values={customerForm}
                  error={feedback?.type === 'danger' ? feedback.text : ''}
                  onChange={handleCustomerChange}
                  onSubmit={handleCustomerSubmit}
                  onBack={() => {
                    clearFeedback()
                    setScreen('role')
                  }}
                />
              ) : null}

              {screen === 'technical' ? (
                <TechnicalSignupForm
                  values={technicalForm}
                  error={feedback?.type === 'danger' ? feedback.text : ''}
                  cardPreview={technicalCardImage}
                  onChange={handleTechnicalChange}
                  onCardChange={handleTechnicalCardChange}
                  onSubmit={handleTechnicalSubmit}
                  onBack={() => {
                    clearFeedback()
                    setScreen('role')
                  }}
                />
              ) : null}

              {screen === 'login' ? (
                <>
                  <LoginForm
                    values={loginForm}
                    error={feedback?.type === 'danger' ? feedback.text : ''}
                    onChange={handleLoginChange}
                    onSubmit={handleLoginSubmit}
                  />
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-blue-700 underline-offset-4 transition hover:text-blue-900 hover:underline"
                    onClick={() => {
                      clearFeedback()
                      setScreen('role')
                    }}
                  >
                    Create new account
                  </button>

                  <article className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <h2 className="font-['Outfit'] text-lg font-semibold text-blue-900">Demo Accounts Ready</h2>
                    <p className="mt-1 text-xs text-blue-600">
                      Password for all demo accounts: <strong>{DEMO_ACCOUNT_PASSWORD}</strong>
                    </p>
                    <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                      {demoLoginAccounts.map((account) => (
                        <div key={account.email} className="rounded-xl border border-blue-200 bg-white p-3">
                          <p className="text-sm font-semibold text-blue-900">{account.name}</p>
                          <p className="text-xs text-blue-600">
                            {account.email} - {account.role}
                            {account.specialty ? ` (${account.specialty})` : ''}
                          </p>
                          <button
                            type="button"
                            className="mt-2 rounded-lg border border-blue-300 bg-white px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            onClick={() => {
                              clearFeedback()
                              setLoginForm({
                                email: account.email,
                                password: DEMO_ACCOUNT_PASSWORD,
                              })
                            }}
                          >
                            Use This Account
                          </button>
                        </div>
                      ))}
                    </div>
                  </article>
                </>
              ) : null}
            </article>

            <div className="mt-4 text-right">
              <Link
                to="/admin/login"
                className="text-xs font-semibold uppercase tracking-wide text-blue-500 underline-offset-4 transition hover:text-blue-800 hover:underline"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthPage
