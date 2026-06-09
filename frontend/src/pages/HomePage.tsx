import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@mui/material'
import {
  CheckCircleOutlined,
  ErrorOutlined,
} from '@mui/icons-material'
import MainLayout from '../layouts/MainLayout'
import LoadingState from '../components/LoadingState'
import ErrorAlert from '../components/ErrorAlert'
import { fetchHealth, type HealthResponse } from '../services/healthService'
import { APP_NAME } from '../utils/constants'

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setError('Unable to reach the backend API. Is the server running?'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Welcome to {APP_NAME}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Controlled B2B commercial space matchmaking platform — Dealer Module.
        Phase 1 setup is complete. Backend connectivity is verified below.
      </Typography>

      {loading && <LoadingState />}
      {error && <ErrorAlert message={error} />}

      {health && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  API Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {health.status === 'ok' ? (
                    <CheckCircleOutlined color="success" />
                  ) : (
                    <ErrorOutlined color="warning" />
                  )}
                  <Chip
                    label={health.status.toUpperCase()}
                    color={health.status === 'ok' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Application: {health.app}
                </Typography>
                <Typography variant="body2">
                  Environment: {health.environment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Database
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {health.database === 'connected' ? (
                    <CheckCircleOutlined color="success" />
                  ) : (
                    <ErrorOutlined color="error" />
                  )}
                  <Chip
                    label={health.database.toUpperCase()}
                    color={health.database === 'connected' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                  {health.database === 'connected'
                    ? 'PostgreSQL is reachable.'
                    : 'Start PostgreSQL: docker compose up -d'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </MainLayout>
  )
}
