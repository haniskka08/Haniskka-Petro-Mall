import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ReactNode } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { ROUTES } from '../utils/constants'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { dealer, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={48} />
      </Box>
    )
  }

  if (!dealer) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <>{children}</>
}
