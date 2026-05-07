import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import { authAPI } from './api'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MemberDetailPage from './pages/MemberDetailPage'
import MemberTreePage from './pages/MemberTreePage'
import AdminDashboard from './pages/AdminDashboard'
import './index.css'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  console.log('ProtectedRoute check - isAuthenticated:', isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  const setUser = useAuthStore((state) => state.setUser)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    console.log('App mounted, checking for token')
    const token = localStorage.getItem('token')
    console.log('Token from localStorage:', token)
    
    if (token && !isAuthenticated) {
      authAPI
        .getCurrentUser()
        .then((response) => {
          console.log('User verified:', response.data.data)
          setUser(response.data.data, token)
        })
        .catch((err) => {
          console.error('Token verification failed:', err)
          localStorage.removeItem('token')
        })
    }
  }, [isAuthenticated, setUser])

  console.log('App rendering, isAuthenticated:', isAuthenticated)

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Router>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/:memberId"
              element={
                <ProtectedRoute>
                  <MemberDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/:memberId/tree"
              element={
                <ProtectedRoute>
                  <MemberTreePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        <footer
          style={{
            textAlign: 'center',
            padding: '12px 16px 18px',
            color: 'white',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          @Developed by Akshita Joshi
        </footer>
      </Router>
    </div>
  )
}

export default App
