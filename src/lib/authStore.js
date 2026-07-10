const ACCOUNT_KEY = 'fixhub_accounts'

export const DEMO_ACCOUNT_PASSWORD = 'Fixhub@123'

const DEMO_CARD_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="%23dbeafe"/><rect x="16" y="16" width="608" height="328" rx="16" fill="%23ffffff"/><text x="40" y="78" font-size="34" font-family="Arial" fill="%230f172a">FixHub Demo ID</text><text x="40" y="128" font-size="24" font-family="Arial" fill="%23334155">For technical profile preview</text></svg>'

const DEMO_ACCOUNTS = [
  {
    role: 'customer',
    isDemo: true,
    name: 'Mona Hassan',
    email: 'mona.hassan@fixhub.demo',
    phone: '+201001112233',
    nationalId: '29801011234567',
    city: 'Cairo',
    address: 'Nasr City, Cairo',
    bio: 'Home owner looking for quick and reliable maintenance.',
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [],
    createdAt: '2026-04-10T08:30:00.000Z',
  },
  {
    role: 'customer',
    isDemo: true,
    name: 'Yasser Ali',
    email: 'yasser.ali@fixhub.demo',
    phone: '+201009998877',
    nationalId: '29705051234568',
    city: 'Giza',
    address: 'Dokki, Giza',
    bio: 'Needs trusted workers for apartment maintenance.',
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [],
    createdAt: '2026-04-10T09:00:00.000Z',
  },
  {
    role: 'technical',
    isDemo: true,
    name: 'Ahmed Nabil',
    email: 'ahmed.nabil@fixhub.demo',
    phone: '+201112223334',
    nationalId: '19001011234561',
    city: 'Cairo',
    specialty: 'Electrical Technician',
    yearsOfExperience: 9,
    bio: 'Certified electrical technician for home wiring and breaker panels.',
    nationalCardImage: DEMO_CARD_IMAGE,
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [
      {
        id: 'ahmed-electric-1',
        title: 'Breaker Panel Upgrade',
        years: 4,
        details: 'Upgraded old breaker panels and balanced load safety.',
      },
      {
        id: 'ahmed-electric-2',
        title: 'Indoor Lighting Setup',
        years: 3,
        details: 'Installed smart indoor lighting and troubleshooting.',
      },
    ],
    createdAt: '2026-04-10T10:00:00.000Z',
  },
  {
    role: 'technical',
    isDemo: true,
    name: 'Sara Adel',
    email: 'sara.adel@fixhub.demo',
    phone: '+201113334445',
    nationalId: '19102021234562',
    city: 'Giza',
    specialty: 'Electrical Technician',
    yearsOfExperience: 7,
    bio: 'Electrical specialist for urgent home faults and appliance lines.',
    nationalCardImage: DEMO_CARD_IMAGE,
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [
      {
        id: 'sara-electric-1',
        title: 'Emergency Fault Repairs',
        years: 3,
        details: 'Resolved short circuits and unstable voltage issues.',
      },
      {
        id: 'sara-electric-2',
        title: 'Outdoor Power Lines',
        years: 2,
        details: 'Handled protected outdoor line routing for villas.',
      },
    ],
    createdAt: '2026-04-10T10:20:00.000Z',
  },
  {
    role: 'technical',
    isDemo: true,
    name: 'Mostafa Sami',
    email: 'mostafa.sami@fixhub.demo',
    phone: '+201114445556',
    nationalId: '18903031234563',
    city: 'Alexandria',
    specialty: 'Plumber',
    yearsOfExperience: 11,
    bio: 'Plumber focused on leak control and pressure balancing.',
    nationalCardImage: DEMO_CARD_IMAGE,
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [
      {
        id: 'mostafa-plumb-1',
        title: 'Leak Detection Projects',
        years: 5,
        details: 'Solved concealed leak cases in bathrooms and kitchens.',
      },
      {
        id: 'mostafa-plumb-2',
        title: 'Water Pump Calibration',
        years: 3,
        details: 'Calibrated domestic pumps for stable flow.',
      },
    ],
    createdAt: '2026-04-10T10:40:00.000Z',
  },
  {
    role: 'technical',
    isDemo: true,
    name: 'Huda Saleh',
    email: 'huda.saleh@fixhub.demo',
    phone: '+201115556667',
    nationalId: '19204041234564',
    city: 'Cairo',
    specialty: 'Plumber',
    yearsOfExperience: 6,
    bio: 'Plumbing technician for drains, sinks, and bathroom systems.',
    nationalCardImage: DEMO_CARD_IMAGE,
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [
      {
        id: 'huda-plumb-1',
        title: 'Drain Cleaning and Repair',
        years: 2,
        details: 'Handled recurring clogging and pipe replacement.',
      },
      {
        id: 'huda-plumb-2',
        title: 'Faucet and Valve Service',
        years: 2,
        details: 'Installed and maintained valves for apartment units.',
      },
    ],
    createdAt: '2026-04-10T11:00:00.000Z',
  },
  {
    role: 'technical',
    isDemo: true,
    name: 'Karim Fathy',
    email: 'karim.fathy@fixhub.demo',
    phone: '+201116667778',
    nationalId: '18805051234565',
    city: 'Cairo',
    specialty: 'AC Technician',
    yearsOfExperience: 10,
    bio: 'AC specialist for cooling recovery, maintenance, and gas checks.',
    nationalCardImage: DEMO_CARD_IMAGE,
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [
      {
        id: 'karim-ac-1',
        title: 'Compressor Diagnostics',
        years: 4,
        details: 'Diagnosed compressor faults and restored cooling.',
      },
      {
        id: 'karim-ac-2',
        title: 'Seasonal AC Maintenance',
        years: 4,
        details: 'Preventive checks for residential split units.',
      },
    ],
    createdAt: '2026-04-10T11:20:00.000Z',
  },
  {
    role: 'technical',
    isDemo: true,
    name: 'Dina Hany',
    email: 'dina.hany@fixhub.demo',
    phone: '+201117778889',
    nationalId: '19306061234566',
    city: 'Giza',
    specialty: 'AC Technician',
    yearsOfExperience: 5,
    bio: 'AC and ventilation technician for homes and small offices.',
    nationalCardImage: DEMO_CARD_IMAGE,
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [
      {
        id: 'dina-ac-1',
        title: 'Airflow Optimization',
        years: 2,
        details: 'Improved cooling output through airflow balancing.',
      },
      {
        id: 'dina-ac-2',
        title: 'Filter and Coil Cleaning',
        years: 2,
        details: 'Deep cleaning and sanitization of indoor units.',
      },
    ],
    createdAt: '2026-04-10T11:40:00.000Z',
  },
  {
    role: 'technical',
    isDemo: true,
    name: 'Omar Emad',
    email: 'omar.emad@fixhub.demo',
    phone: '+201118889990',
    nationalId: '18707071234569',
    city: 'Alexandria',
    specialty: 'Carpenter',
    yearsOfExperience: 12,
    bio: 'Carpentry pro for door fixes, shelves, and custom wood repair.',
    nationalCardImage: DEMO_CARD_IMAGE,
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [
      {
        id: 'omar-carp-1',
        title: 'Door and Lock Alignment',
        years: 5,
        details: 'Corrected broken hinges and door misalignment.',
      },
      {
        id: 'omar-carp-2',
        title: 'Wall Shelf Installation',
        years: 3,
        details: 'Installed load-safe shelves and custom fittings.',
      },
    ],
    createdAt: '2026-04-10T12:00:00.000Z',
  },
  {
    role: 'technical',
    isDemo: true,
    name: 'Nada Tarek',
    email: 'nada.tarek@fixhub.demo',
    phone: '+201119990001',
    nationalId: '19408081234560',
    city: 'Cairo',
    specialty: 'Carpenter',
    yearsOfExperience: 6,
    bio: 'Furniture repair and finishing specialist.',
    nationalCardImage: DEMO_CARD_IMAGE,
    password: DEMO_ACCOUNT_PASSWORD,
    experiences: [
      {
        id: 'nada-carp-1',
        title: 'Furniture Reinforcement',
        years: 2,
        details: 'Repaired damaged wood structures and supports.',
      },
      {
        id: 'nada-carp-2',
        title: 'Kitchen Cabinet Fixes',
        years: 2,
        details: 'Adjusted cabinet doors and replaced hinges.',
      },
    ],
    createdAt: '2026-04-10T12:20:00.000Z',
  },
]

function normalize(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function cloneDemoAccount(account) {
  return {
    ...account,
    experiences: (account.experiences ?? []).map((item) => ({ ...item })),
  }
}

export function getDemoLoginAccounts() {
  return DEMO_ACCOUNTS.map((item) => ({
    name: item.name,
    email: item.email,
    role: item.role,
    specialty: item.role === 'technical' ? item.specialty : undefined,
    password: DEMO_ACCOUNT_PASSWORD,
  }))
}

export function loadAccounts() {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAccounts(accounts) {
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts))
}

export function ensureDemoAccounts() {
  const accounts = loadAccounts()
  const existingEmails = new Set(accounts.map((item) => normalize(item.email)))
  let changed = false

  DEMO_ACCOUNTS.forEach((demoAccount) => {
    const key = normalize(demoAccount.email)
    if (existingEmails.has(key)) {
      return
    }

    accounts.push(cloneDemoAccount(demoAccount))
    existingEmails.add(key)
    changed = true
  })

  if (changed) {
    saveAccounts(accounts)
  }

  return changed
}

export function upsertAccount(record) {
  const accounts = loadAccounts()
  const key = normalize(record.email)
  const existingIndex = accounts.findIndex((item) => normalize(item.email) === key)
  if (existingIndex >= 0) {
    accounts[existingIndex] = record
  } else {
    accounts.push(record)
  }
  saveAccounts(accounts)
}

export function findAccountByEmail(email) {
  const key = normalize(email)
  return loadAccounts().find((item) => normalize(item.email) === key) ?? null
}

export function loadTechnicalAccounts() {
  return loadAccounts().filter((item) => item.role === 'technical')
}

export function verifyLogin(email, password) {
  const account = findAccountByEmail(email)
  if (!account) {
    return null
  }
  if (account.password !== password) {
    return null
  }
  return {
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role,
  }
}

export function updateAccount(email, updater) {
  const accounts = loadAccounts()
  const key = normalize(email)
  const targetIndex = accounts.findIndex((item) => normalize(item.email) === key)
  if (targetIndex < 0) {
    return null
  }
  const nextRecord = updater(accounts[targetIndex])
  accounts[targetIndex] = nextRecord
  saveAccounts(accounts)
  return nextRecord
}

export function deleteAccountByEmail(email) {
  const key = normalize(email)
  const accounts = loadAccounts()
  const nextAccounts = accounts.filter((item) => normalize(item.email) !== key)

  if (nextAccounts.length === accounts.length) {
    return false
  }

  saveAccounts(nextAccounts)
  return true
}
