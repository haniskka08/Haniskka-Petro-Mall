import { Route, Routes, Navigate } from 'react-router-dom'
import { ROUTES } from '../utils/constants'
import ProtectedRoute from '../components/ProtectedRoute'

import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import HomePage from '../pages/HomePage'
import DashboardPage from '../pages/DashboardPage'
import StationsPage from '../pages/StationsPage'
import SpacesPage from '../pages/SpacesPage'
import UtilitiesPage from '../pages/UtilitiesPage'
import PreferredBrandsPage from '../pages/PreferredBrandsPage'
import LayoutImagesPage from '../pages/LayoutImagesPage'
import ProfilePage from '../pages/ProfilePage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Protected dealer routes */}
      <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path={ROUTES.STATIONS} element={<ProtectedRoute><StationsPage /></ProtectedRoute>} />
      <Route path={ROUTES.SPACES} element={<ProtectedRoute><SpacesPage /></ProtectedRoute>} />
      <Route path={ROUTES.UTILITIES} element={<ProtectedRoute><UtilitiesPage /></ProtectedRoute>} />
      <Route path={ROUTES.PREFERRED_BRANDS} element={<ProtectedRoute><PreferredBrandsPage /></ProtectedRoute>} />
      <Route path={ROUTES.IMAGES} element={<ProtectedRoute><LayoutImagesPage /></ProtectedRoute>} />
      <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}
