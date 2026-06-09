import { useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, Switch, FormControlLabel, Button,
  Alert, Snackbar, CircularProgress, MenuItem, Select, FormControl, InputLabel, Avatar,
} from '@mui/material'
import {
  ElectricBolt, WaterDrop, Wifi, LocalParking,
  Wc, Videocam, SaveOutlined,
} from '@mui/icons-material'
import DealerLayout from '../layouts/DealerLayout'
import apiClient from '../services/apiClient'

interface Station { id: number; name: string }
interface Utility { id: number; station_id: number; electricity: boolean; water: boolean; internet: boolean; parking: boolean; washroom: boolean; cctv: boolean }

const UTILITY_ITEMS = [
  { key: 'electricity', label: 'Electricity', icon: <ElectricBolt />, color: '#F57C00', bg: 'rgba(245,124,0,0.08)' },
  { key: 'water', label: 'Water Supply', icon: <WaterDrop />, color: '#0288D1', bg: 'rgba(2,136,209,0.08)' },
  { key: 'internet', label: 'Internet / WiFi', icon: <Wifi />, color: '#7B1FA2', bg: 'rgba(123,31,162,0.08)' },
  { key: 'parking', label: 'Parking Area', icon: <LocalParking />, color: '#388E3C', bg: 'rgba(56,142,60,0.08)' },
  { key: 'washroom', label: 'Washroom', icon: <Wc />, color: '#00838F', bg: 'rgba(0,131,143,0.08)' },
  { key: 'cctv', label: 'CCTV Surveillance', icon: <Videocam />, color: '#C62828', bg: 'rgba(198,40,40,0.08)' },
]

export default function UtilitiesPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState(0)
  const [utility, setUtility] = useState<Record<string, boolean>>({
    electricity: false, water: false, internet: false, parking: false, washroom: false, cctv: false,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState('')

  useEffect(() => {
    apiClient.get<Station[]>('/stations/').then(r => {
      setStations(r.data)
      if (r.data.length > 0) setSelectedStation(r.data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedStation) return
    setLoading(true)
    apiClient.get<Utility>(`/stations/${selectedStation}/utilities`)
      .then(r => {
        const { electricity, water, internet, parking, washroom, cctv } = r.data
        setUtility({ electricity, water, internet, parking, washroom, cctv })
      })
      .catch(() => setError('Failed to load utilities.'))
      .finally(() => setLoading(false))
  }, [selectedStation])

  const toggle = (key: string) => setUtility(u => ({ ...u, [key]: !u[key] }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiClient.put(`/stations/${selectedStation}/utilities`, utility)
      setSnack('Utilities saved successfully!')
    } catch { setError('Failed to save utilities.') }
    finally { setSaving(false) }
  }

  return (
    <DealerLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="#0D1B2A">Utilities Management</Typography>
        <Typography variant="body2" color="text.secondary">Configure available utilities at each station</Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      {/* Station selector */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', mb: 3 }}>
        <CardContent>
          <FormControl fullWidth size="small" sx={{ maxWidth: 360 }}>
            <InputLabel>Select Station</InputLabel>
            <Select value={selectedStation} label="Select Station" onChange={e => setSelectedStation(Number(e.target.value))}>
              {stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
      ) : selectedStation === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>Select a station to manage its utilities.</Typography>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
            {UTILITY_ITEMS.map(({ key, label, icon, color, bg }) => (
              <Card key={key} sx={{
                borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                border: utility[key] ? `2px solid ${color}` : '2px solid transparent',
                transition: 'all 0.2s', cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 24px rgba(0,0,0,0.12)' },
              }} onClick={() => toggle(key)}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
                  <Avatar sx={{ bgcolor: utility[key] ? bg : '#F5F5F5', color: utility[key] ? color : '#bdbdbd', width: 52, height: 52, transition: 'all 0.2s' }}>
                    {icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: utility[key] ? color : 'text.primary' }}>{label}</Typography>
                    <Typography variant="caption" color="text.secondary">{utility[key] ? 'Available' : 'Not Available'}</Typography>
                  </Box>
                  <Switch checked={utility[key]} onChange={() => toggle(key)} sx={{ '& .MuiSwitch-thumb': { bgcolor: utility[key] ? color : '#bdbdbd' }, '& .MuiSwitch-track': { bgcolor: utility[key] ? `${color}60` : undefined } }} />
                </CardContent>
              </Card>
            ))}
          </Box>

          <Button variant="contained" startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveOutlined />}
            onClick={handleSave} disabled={saving}
            sx={{ borderRadius: 2, px: 4, py: 1.5, background: 'linear-gradient(90deg,#0D47A1,#1565C0)', boxShadow: '0 4px 16px rgba(13,71,161,0.3)' }}>
            {saving ? 'Saving…' : 'Save Utilities'}
          </Button>
        </>
      )}

      <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack('')} message={snack} />
    </DealerLayout>
  )
}
