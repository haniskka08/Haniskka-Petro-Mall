import { useEffect, useState } from 'react'
import {
  Box, Button, Card, CardContent, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Snackbar, Tooltip, Chip, MenuItem, Select,
  FormControl, InputLabel, InputAdornment,
} from '@mui/material'
import { AddOutlined, EditOutlined, DeleteOutlined, SearchOutlined, StoreOutlined } from '@mui/icons-material'
import DealerLayout from '../layouts/DealerLayout'
import apiClient from '../services/apiClient'

interface Station { id: number; name: string }
interface Space {
  id: number; station_id: number; name: string; space_type: string
  area_sqft?: number; monthly_rent?: number; availability_status: string
}

const TYPES = ['retail', 'food_court', 'atm', 'pharmacy', 'office', 'storage', 'other']
const STATUSES = ['available', 'occupied', 'under_renovation']
const STATUS_COLORS: Record<string, string> = { available: 'success', occupied: 'error', under_renovation: 'warning' }

const EMPTY = { station_id: 0, name: '', space_type: 'retail', area_sqft: '', monthly_rent: '', availability_status: 'available' }

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [filterStation, setFilterStation] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Space | null>(null)
  const [deleting, setDeleting] = useState<Space | null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([apiClient.get<Space[]>('/spaces/'), apiClient.get<Station[]>('/stations/')])
      .then(([sp, st]) => { setSpaces(sp.data); setStations(st.data) })
      .catch(() => setError('Failed to load spaces.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = spaces.filter(sp => {
    const matchStation = filterStation === 0 || sp.station_id === filterStation
    const matchSearch = !search || sp.name.toLowerCase().includes(search.toLowerCase())
    return matchStation && matchSearch
  })

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, station_id: stations[0]?.id ?? 0 }); setDialogOpen(true) }
  const openEdit = (s: Space) => { setEditing(s); setForm({ station_id: s.station_id, name: s.name, space_type: s.space_type, area_sqft: s.area_sqft ?? '', monthly_rent: s.monthly_rent ?? '', availability_status: s.availability_status }); setDialogOpen(true) }
  const set = (f: string) => (e: any) => setForm((p: any) => ({ ...p, [f]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || !form.station_id) { setError('Station and name are required.'); return }
    setSaving(true)
    const payload = { ...form, area_sqft: form.area_sqft ? Number(form.area_sqft) : null, monthly_rent: form.monthly_rent ? Number(form.monthly_rent) : null }
    try {
      if (editing) { await apiClient.put(`/spaces/${editing.id}`, payload); setSnack('Space updated!') }
      else { await apiClient.post('/spaces/', payload); setSnack('Space created!') }
      setDialogOpen(false); load()
    } catch (err: any) { setError(err?.response?.data?.detail ?? 'Save failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try { await apiClient.delete(`/spaces/${deleting.id}`); setSnack('Space deleted.'); setDeleteDialogOpen(false); load() }
    catch { setError('Failed to delete.') }
  }

  const stationName = (id: number) => stations.find(s => s.id === id)?.name ?? '—'

  return (
    <DealerLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0D1B2A">Commercial Spaces</Typography>
          <Typography variant="body2" color="text.secondary">Configure spaces inside your stations</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openAdd}
          sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(90deg,#7B1FA2,#9C27B0)', boxShadow: '0 4px 16px rgba(123,31,162,0.3)' }}>
          Add Space
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField placeholder="Search spaces…" size="small" value={search} onChange={e => setSearch(e.target.value)}
              sx={{ width: 240 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Station</InputLabel>
              <Select value={filterStation} label="Filter by Station" onChange={e => setFilterStation(Number(e.target.value))}>
                <MenuItem value={0}>All Stations</MenuItem>
                {stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          {loading ? <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box> :
            filtered.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <StoreOutlined sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No spaces found.</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', bgcolor: '#FAFAFA' } }}>
                    <TableCell>Name</TableCell><TableCell>Station</TableCell><TableCell>Type</TableCell>
                    <TableCell>Area (sqft)</TableCell><TableCell>Rent/mo</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(sp => (
                    <TableRow key={sp.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={700}>{sp.name}</Typography></TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{stationName(sp.station_id)}</TableCell>
                      <TableCell><Chip label={sp.space_type.replace('_', ' ')} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} /></TableCell>
                      <TableCell>{sp.area_sqft ?? '—'}</TableCell>
                      <TableCell>{sp.monthly_rent ? `₹${sp.monthly_rent.toLocaleString()}` : '—'}</TableCell>
                      <TableCell>
                        <Chip label={sp.availability_status.replace('_', ' ')} size="small" color={(STATUS_COLORS[sp.availability_status] as any) ?? 'default'} sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(sp)} sx={{ color: '#7B1FA2' }}><EditOutlined fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => { setDeleting(sp); setDeleteDialogOpen(true) }} sx={{ color: '#d32f2f' }}><DeleteOutlined fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>{editing ? 'Edit Space' : 'Add New Space'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <FormControl fullWidth>
            <InputLabel>Station *</InputLabel>
            <Select value={form.station_id} label="Station *" onChange={set('station_id')}>
              {stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Space Name *" fullWidth value={form.name} onChange={set('name')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={form.space_type} label="Type" onChange={set('space_type')}>
                {TYPES.map(t => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t.replace('_', ' ')}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={form.availability_status} label="Status" onChange={set('availability_status')}>
                {STATUSES.map(s => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Area (sqft)" type="number" fullWidth value={form.area_sqft} onChange={set('area_sqft')} />
            <TextField label="Monthly Rent (₹)" type="number" fullWidth value={form.monthly_rent} onChange={set('monthly_rent')} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ borderRadius: 2, background: 'linear-gradient(90deg,#7B1FA2,#9C27B0)' }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>Delete Space</DialogTitle>
        <DialogContent><Typography>Delete <strong>{deleting?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack('')} message={snack} />
    </DealerLayout>
  )
}
