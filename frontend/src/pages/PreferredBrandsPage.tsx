import { useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip,
  Alert, Snackbar, CircularProgress, MenuItem, Select, FormControl,
  InputLabel, IconButton, Avatar, Tooltip, InputAdornment,
} from '@mui/material'
import { AddOutlined, DeleteOutlined, SearchOutlined, StorefrontOutlined } from '@mui/icons-material'
import DealerLayout from '../layouts/DealerLayout'
import apiClient from '../services/apiClient'

interface Station { id: number; name: string }
interface Brand { id: number; station_id: number; brand_name: string; brand_category?: string }

const PRESET_BRANDS = [
  { name: 'Starbucks', category: 'Coffee & Beverages' },
  { name: 'KFC', category: 'Fast Food' },
  { name: "Domino's", category: 'Fast Food' },
  { name: 'Apollo Pharmacy', category: 'Healthcare' },
  { name: 'HDFC ATM', category: 'Banking' },
  { name: "McDonald's", category: 'Fast Food' },
  { name: 'Subway', category: 'Fast Food' },
  { name: 'Café Coffee Day', category: 'Coffee & Beverages' },
  { name: 'ICICI ATM', category: 'Banking' },
  { name: 'MedPlus', category: 'Healthcare' },
  { name: '1mg', category: 'Healthcare' },
  { name: 'BigBasket', category: 'Grocery' },
  { name: 'SBI ATM', category: 'Banking' },
  { name: 'Axis Bank ATM', category: 'Banking' },
  { name: 'Pizza Hut', category: 'Fast Food' },
]

export default function PreferredBrandsPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState(0)
  const [brands, setBrands] = useState<Brand[]>([])
  const [search, setSearch] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [customCat, setCustomCat] = useState('')
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
    apiClient.get<Brand[]>(`/stations/${selectedStation}/brands`)
      .then(r => setBrands(r.data))
      .catch(() => setError('Failed to load brands.'))
      .finally(() => setLoading(false))
  }, [selectedStation])

  const isSelected = (name: string) => brands.some(b => b.brand_name === name)

  const togglePreset = async (name: string, category: string) => {
    if (isSelected(name)) {
      const brand = brands.find(b => b.brand_name === name)
      if (!brand) return
      try { await apiClient.delete(`/stations/brands/${brand.id}`); setBrands(p => p.filter(b => b.id !== brand.id)) }
      catch { setError('Failed to remove brand.') }
    } else {
      try {
        const r = await apiClient.post<Brand>(`/stations/${selectedStation}/brands`, { brand_name: name, brand_category: category })
        setBrands(p => [...p, r.data])
      } catch { setError('Failed to add brand.') }
    }
  }

  const addCustom = async () => {
    if (!customBrand.trim()) return
    try {
      const r = await apiClient.post<Brand>(`/stations/${selectedStation}/brands`, { brand_name: customBrand.trim(), brand_category: customCat.trim() || null })
      setBrands(p => [...p, r.data]); setCustomBrand(''); setCustomCat(''); setSnack('Brand added!')
    } catch { setError('Failed to add brand.') }
  }

  const removeBrand = async (id: number) => {
    try { await apiClient.delete(`/stations/brands/${id}`); setBrands(p => p.filter(b => b.id !== id)) }
    catch { setError('Failed to remove brand.') }
  }

  const filteredPresets = PRESET_BRANDS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <DealerLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="#0D1B2A">Preferred Brands</Typography>
        <Typography variant="body2" color="text.secondary">Select brands you'd like to host at your stations</Typography>
      </Box>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      <FormControl size="small" sx={{ mb: 3, minWidth: 360 }}>
        <InputLabel>Select Station</InputLabel>
        <Select value={selectedStation} label="Select Station" onChange={e => setSelectedStation(Number(e.target.value))}>
          {stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </Select>
      </FormControl>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' }, gap: 3 }}>
        {/* Brand catalog */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Brand Catalog</Typography>
            <TextField placeholder="Search brands…" size="small" fullWidth value={search} onChange={e => setSearch(e.target.value)} sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} />
            {loading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box> : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {filteredPresets.map(p => {
                  const selected = isSelected(p.name)
                  return (
                    <Chip key={p.name} label={p.name} icon={<StorefrontOutlined />} onClick={() => togglePreset(p.name, p.category)}
                      sx={{
                        px: 1, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                        bgcolor: selected ? '#0D47A1' : 'rgba(0,0,0,0.05)',
                        color: selected ? '#fff' : 'text.primary',
                        '& .MuiChip-icon': { color: selected ? '#fff' : 'text.secondary' },
                        '&:hover': { transform: 'scale(1.04)', boxShadow: selected ? '0 4px 16px rgba(13,71,161,0.3)' : '0 2px 8px rgba(0,0,0,0.1)' },
                      }} />
                  )
                })}
              </Box>
            )}

            {/* Custom brand */}
            <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>Add Custom Brand</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField size="small" placeholder="Brand name" value={customBrand} onChange={e => setCustomBrand(e.target.value)} sx={{ flex: 1, minWidth: 160 }} />
                <TextField size="small" placeholder="Category (optional)" value={customCat} onChange={e => setCustomCat(e.target.value)} sx={{ flex: 1, minWidth: 160 }} />
                <Button variant="contained" startIcon={<AddOutlined />} onClick={addCustom} disabled={!customBrand.trim()}
                  sx={{ borderRadius: 2, background: 'linear-gradient(90deg,#0D47A1,#1565C0)', whiteSpace: 'nowrap' }}>
                  Add
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Selected brands */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', height: 'fit-content' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Selected Brands <Chip label={brands.length} size="small" sx={{ ml: 1, bgcolor: '#0D47A1', color: '#fff', fontWeight: 700 }} />
            </Typography>
            {brands.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No brands selected yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {brands.map(b => (
                  <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(13,71,161,0.04)', border: '1px solid rgba(13,71,161,0.1)' }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(13,71,161,0.12)', color: '#0D47A1', fontSize: 14 }}>
                      {b.brand_name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{b.brand_name}</Typography>
                      {b.brand_category && <Typography variant="caption" color="text.secondary">{b.brand_category}</Typography>}
                    </Box>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => removeBrand(b.id)} sx={{ color: '#d32f2f', '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
    </DealerLayout>
  )
}
