export const defaultServiceCatalog = [
  {
    id: 1,
    title: 'Emergency Electrical Repair',
    category: 'Electrical',
    description: 'Fast diagnostics, rewiring, and breaker fixes by certified technicians.',
    eta: '30-45 mins',
    icon: '⚡',
  },
  {
    id: 2,
    title: 'Smart Plumbing Rescue',
    category: 'Plumbing',
    description: 'Leak detection, pipe repair, and pressure balancing for stable water flow.',
    eta: '45-60 mins',
    icon: '💧',
  },
  {
    id: 3,
    title: 'AC Deep Care',
    category: 'Air Conditioning',
    description: 'Cooling recovery, gas checks, and airflow optimization.',
    eta: '60 mins',
    icon: '❄️',
  },
  {
    id: 4,
    title: 'Precision Carpentry',
    category: 'Carpentry',
    description: 'Door repair, shelf mounting, and furniture reinforcement.',
    eta: '50 mins',
    icon: '🪚',
  },
  {
    id: 5,
    title: 'Lighting Upgrade Pack',
    category: 'Electrical',
    description: 'Modern indoor and outdoor lighting setup with safe wiring.',
    eta: '70 mins',
    icon: '💡',
  },
  {
    id: 6,
    title: 'Kitchen and Bathroom Plumbing',
    category: 'Plumbing',
    description: 'Sink, faucet, and drainage services with long-term reliability.',
    eta: '55 mins',
    icon: '🚰',
  },
];

export function getCategoryTabs(services) {
  const categories = new Set()
  services.forEach((item) => {
    categories.add(item.category)
  })

  return ['All', ...Array.from(categories)]
}
export const stats = [
  { label: 'Homes Fixed', value: '1250+' },
  { label: 'Avg Response', value: '28m' },
  { label: 'Customer Rating', value: '98%' },
  { label: 'Certified Pros', value: '76+' },
]

export function getNavLinks(role) {
  if (role === 'technical') {
    return [
      { to: '/hub', label: 'Hub' },
      { to: '/home', label: 'Home' },
      { to: '/jobs', label: 'Requests Board' },
      { to: '/chat', label: 'Chat' },
      { to: '/contact', label: 'Contact' },
      { to: '/profile', label: 'Profile' },
    ]
  }

  return [
    { to: '/hub', label: 'Hub' },
    { to: '/home', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/request', label: 'Request' },
    { to: '/chat', label: 'Chat' },
    { to: '/contact', label: 'Contact' },
    { to: '/profile', label: 'Profile' },
  ]
}

export function getHubCards(role) {
  if (role === 'technical') {
    return [
      {
        title: 'Home Overview',
        text: 'See FixHub presentation and live service performance.',
        to: '/home',
        icon: '🏠',
      },
      {
        title: 'Requests Board',
        text: 'View customer issues, confirm requests, and complete jobs.',
        to: '/jobs',
        icon: '🗂️',
      },
      {
        title: 'Chat',
        text: 'Talk directly with customers and keep AI pinned placeholder.',
        to: '/chat',
        icon: '💬',
      },
      {
        title: 'Contact',
        text: 'Reach support by phone, email, or direct message in seconds.',
        to: '/contact',
        icon: '🎧',
      },
      {
        title: 'Profile',
        text: 'Manage your profile, skills, and request timeline.',
        to: '/profile',
        icon: '👤',
      },
    ]
  }

  return [
    {
      title: 'Home Overview',
      text: 'See FixHub presentation and live service performance.',
      to: '/home',
      icon: '🏠',
    },
    {
      title: 'Services',
      text: 'Browse categories and compare all available maintenance services.',
      to: '/services',
      icon: '🛠️',
    },
    {
      title: 'Request Visit',
      text: 'Submit a detailed request and get matched with the right technician.',
      to: '/request',
      icon: '📨',
    },
    {
      title: 'Chat',
      text: 'Chat between customer and worker, with pinned AI placeholder.',
      to: '/chat',
      icon: '💬',
    },
    {
      title: 'Contact',
      text: 'Reach support by phone, email, or direct message in seconds.',
      to: '/contact',
      icon: '🎧',
    },
    {
      title: 'Profile',
      text: 'Edit your account details and track fix status.',
      to: '/profile',
      icon: '👤',
    },
  ]
}
