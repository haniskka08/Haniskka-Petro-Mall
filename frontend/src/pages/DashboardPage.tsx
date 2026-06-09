import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Table, TableBody, TableCell, TableHead, TableRow,
  Chip, CircularProgress, Alert, Paper, Avatar,
} from '@mui/material'
import {
  LocalGasStation, StoreOutlined, CheckCircleOutlined,
  ImageOutlined, AddOutlined, ArrowForwardOutlined,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import DealerLayout from '../layouts/DealerLayout'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES } from '../utils/constants'
import apiClient from '../services/apiClient'

interface Stats { total_stations: number; total_spaces: number; active_listings: number; uploaded_layouts: number }
interface Station { id: number; name: string; city: string; state: string }

const STAT_CARDS = [
  { key: 'total_stations', label: 'Total Stations', icon: <LocalGasStation />, color: '#0D47A1', bg: 'rgba(13,71,161,0.08)' },
  { key: 'total_spaces', label: 'Total Spaces', icon: <StoreOutlined />, color: '#7B1FA2', bg: 'rgba(123,31,162,0.08)' },
  { key: 'active_listings', label: 'Active Listings', icon: <CheckCircleOutlined />, color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  { key: 'uploaded_layouts', label: 'Uploaded Layouts', icon: <ImageOutlined />, color: '#E65100', bg: 'rgba(230,81,0,0.08)' },
]

export default function DashboardPage() {
  const { dealer } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiClient.get<Stats>('/dashboard/stats'),
      apiClient.get<Station[]>('/stations/'),
    ])
      .then(([s, st]) => { setStats(s.data); setStations(st.data.slice(0, 5)) })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const QUICK_ACTIONS = [
    { label: 'Add New Station', icon: <LocalGasStation />, path: ROUTES.STATIONS, color: '#0D47A1' },
    { label: 'Add Space', icon: <StoreOutlined />, path: ROUTES.SPACES, color: '#7B1FA2' },
    { label: 'Upload Layout', icon: <ImageOutlined />, path: ROUTES.IMAGES, color: '#E65100' },
  ]

  return (
    <DealerLayout>
      {/* Greeting */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#0D1B2A' }}>
          Good day, {dealer?.full_name?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your stations today.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_CARDS.map(({ key, label, icon, color, bg }) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={key}>
            <Card sx={{ borderRadius: 3, border: 'none', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-3px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>{label}</Typography>
                    {loading ? <CircularProgress size={24} /> : (
                      <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1 }}>
                        {stats ? (stats as any)[key] : 0}
                      </Typography>
                    )}
                  </Box>
                  <Avatar sx={{ bgcolor: bg, color, width: 52, height: 52 }}>{icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Stations */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography variant="h6" fontWeight={700}>Recent Stations</Typography>
                <Button size="small" endIcon={<ArrowForwardOutlined />} onClick={() => navigate(ROUTES.STATIONS)}>View all</Button>
              </Box>
              {loading ? (
                <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
              ) : stations.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <LocalGasStation sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">No stations yet. Add your first one!</Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(ROUTES.STATIONS)}>Add Station</Button>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 } }}>
                      <TableCell>Name</TableCell><TableCell>City</TableCell><TableCell>State</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stations.map(s => (
                      <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(ROUTES.STATIONS)}>
                        <TableCell><Typography variant="body2" fontWeight={600}>{s.name}</Typography></TableCell>
                        <TableCell>{s.city}</TableCell>
                        <TableCell><Chip label={s.state} size="small" sx={{ bgcolor: 'rgba(13,71,161,0.08)', color: '#0D47A1', fontWeight: 600 }} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {QUICK_ACTIONS.map(({ label, icon, path, color }) => (
                  <Paper key={label} onClick={() => navigate(path)} elevation={0} sx={{
                    p: 2, borderRadius: 2, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.07)',
                    display: 'flex', alignItems: 'center', gap: 2,
                    transition: 'all 0.15s', '&:hover': { borderColor: color, bgcolor: `${color}08`, transform: 'translateX(4px)' },
                  }}>
                    <Avatar sx={{ bgcolor: `${color}12`, color, width: 40, height: 40 }}>{icon}</Avatar>
                    <Typography variant="body2" fontWeight={600}>{label}</Typography>
                    <ArrowForwardOutlined sx={{ ml: 'auto', fontSize: 16, color: 'text.disabled' }} />
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DealerLayout>
  )
}
