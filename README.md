# 🛠️ FixHub

A home maintenance platform that connects **customers** with **technicians** for electrical, plumbing, air conditioning, and carpentry services — request a visit, chat directly with your technician, track job status, and leave ratings, all from one dashboard. Includes a separate **Admin** panel for managing services and users.

## Features

### For Customers
- 📝 **Submit service requests** with location, service type, issue details, and file/image attachments
- 🔍 **Browse services & technicians** filtered by category (Electrical, Plumbing, Air Conditioning, Carpentry)
- 👤 **View technician profiles** — specialty, experience, bio, average rating, and completed jobs
- 💬 **Direct chat** with assigned technicians — text, file attachments, and voice messages
- ⭐ **Rate & review** technicians after a completed job
- 📊 **Track request timeline** (Pending → In Progress → Done)

### For Technicians
- 📋 **Job board** — view, take, confirm, and complete customer requests
- 💬 **Chat with customers** to clarify details before/after starting a job
- 🧑‍🔧 **Manage profile** — specialty, years of experience, bio, national ID card, and work experience entries
- ⭐ **View ratings & reviews** received from customers

### For Admins
- ➕ **Add / delete services** offered on the platform
- 🗑️ **Delete registered users** (customers or technicians)
- 🔒 Separate, protected admin login (independent from customer/technician auth)

## Tech Stack

- [React](https://react.dev/) + [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- Browser `localStorage` as a lightweight data layer (accounts, services, requests, chat messages, reviews, sessions) — no backend server required
- Native browser APIs: `FileReader` (image/file uploads as data URLs) and `MediaRecorder` (in-chat voice messages)

## Project Structure

```
src/
├── components/
│   └── auth/                     # Auth screens: role selection, login, signup forms, brand panel
├── layouts/
│   └── ProtectedLayout.jsx        # Wraps authenticated routes (nav/shell)
├── lib/
│   ├── session.js                 # Customer/technician session read/write
│   ├── adminSession.js             # Admin session read/write/verify
│   ├── authStore.js               # Account CRUD (signup, login, update, delete)
│   ├── requestStore.js            # Service request CRUD + status transitions
│   ├── chatStore.js                # Direct messages between customers & technicians
│   ├── reviewStore.js              # Ratings & reviews for technicians
│   └── serviceStore.js             # Service catalog CRUD
├── data/
│   └── content.js                  # Static content: stats, hub cards, category tabs
├── pages/
│   ├── HomePage.jsx                 # Public landing page
│   ├── AuthPage.jsx                  # Role selection, customer/technician signup, login
│   ├── HubPage.jsx                    # Post-login dashboard hub (role-aware)
│   ├── ServicesPage.jsx                # Browse services & technicians by category
│   ├── TechnicianProfilePage.jsx        # Technician profile + send request form
│   ├── RequestPage.jsx                   # General service request form
│   ├── JobsPage.jsx                       # Technician job board
│   ├── ChatPage.jsx                        # Direct messaging (text/file/voice)
│   ├── ProfilePage.jsx                      # Edit profile, timeline, reviews, experience
│   ├── ContactPage.jsx                       # Support contact channels
│   ├── AdminLoginPage.jsx                     # Admin-only login
│   └── AdminDashboardPage.jsx                  # Add/delete services, delete users
└── App.jsx                                      # Route definitions
```

## User Roles & Routing

| Role | Entry point | Key routes |
|---|---|---|
| Customer | `/auth` → `/hub` | `/services`, `/technician/:email`, `/request`, `/chat`, `/profile` |
| Technician | `/auth` → `/hub` | `/jobs`, `/chat`, `/profile` |
| Admin | `/admin/login` | `/admin/dashboard` |

Protected routes redirect unauthenticated users back to `/auth` (or `/admin/login` for the admin panel).

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm

### Installation

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Notes

- This project stores all data (accounts, requests, chats, reviews) in the browser's `localStorage`, so it runs entirely client-side with no backend or database setup. Data is scoped to the browser it was created in and will not sync across devices.
- Demo accounts with a shared password are available on the login screen for quick testing of both customer and technician flows.

## License

This project is open source and available for anyone to use or modify.
