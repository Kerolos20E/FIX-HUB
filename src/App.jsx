import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedLayout from './layouts/ProtectedLayout'
import { readAdminSession } from './lib/adminSession'
import { readSession } from './lib/session'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import HubPage from './pages/HubPage'
import JobsPage from './pages/JobsPage'
import ProfilePage from './pages/ProfilePage'
import RequestPage from './pages/RequestPage'
import ServicesPage from './pages/ServicesPage'
import TechnicianProfilePage from './pages/TechnicianProfilePage'

function AuthGate() {
  const currentSession = readSession()
  if (currentSession) {
    return <Navigate to="/hub" replace />
  }
  return <AuthPage />
}

function AdminLoginGate() {
  if (readAdminSession()) {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <AdminLoginPage />
}

function AdminProtectedPage() {
  if (!readAdminSession()) {
    return <Navigate to="/admin/login" replace />
  }
  return <AdminDashboardPage />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthGate />} />
        <Route path="/admin/login" element={<AdminLoginGate />} />
        <Route path="/admin/dashboard" element={<AdminProtectedPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/hub" replace />} />
          <Route path="/hub" element={<HubPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/technician/:email" element={<TechnicianProfilePage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
