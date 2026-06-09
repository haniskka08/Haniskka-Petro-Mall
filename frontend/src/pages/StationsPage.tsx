import { useEffect, useState } from 'react'
import {
  Box, Button, Card, CardContent, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Snackbar, Tooltip, Chip, InputAdornment,
} from '@mui/material'
import { AddOutlined, EditOutlined, DeleteOutlined, SearchOutlined, LocalGasStation } from '@mui/icons-material'
import DealerLayout from '../layouts/DealerLayout'
import apiClient from '../services/apiClient'

interface Station {
  id: number; name: string; address: string; city: string; state: string
  pincode: string; latitude?: number; longitude?: number
  contact_number?: string; description?: string; dealer_id: number
}
const EMPTY: Omit<Station, 'id' | 'dealer_id'> = {
  name: '', address: '', city: '', state: '', pincode: '',
  latitude: undefined, longitude: undefined, contact_number: '', description: '',
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [filtered, setFiltered] = useState<Station[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Station | null>(null)
  const [deleting, setDeleting] = useState<Station | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    apiClient.get<Station[]>('/stations/').then(r => {
      setStations(r.data); setFiltered(r.data)
    }).catch(() => setError('Failed to load stations.')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(stations.filter(s =>
      s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.state.toLowerCase().includes(q)
    ))
  }, [search, stations])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true) }
  const openEdit = (s: Station) => { setEditing(s); setForm({ name: s.name, address: s.address, city: s.city, state: s.state, pincode: s.pincode, latitude: s.latitude, longitude: s.longitude, contact_number: s.contact_number ?? '', description: s.description ?? '' }); setDialogOpen(true) }
  const openDelete = (s: Station) => { setDeleting(s); setDeleteDialogOpen(true) }

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || !form.address || !form.city || !form.state || !form.pincode) { setError('Please fill all required fields.'); return }
    setSaving(true)
    try {
      if (editing) {
        await apiClient.put(`/stations/${editing.id}`, form)
        setSnack('Station updated successfully!')
      } else {
        await apiClient.post('/stations/', form)
        setSnack('Station created successfully!')
      }
      setDialogOpen(false); load()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to save station.')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await apiClient.delete(`/stations/${deleting.id}`)
      setSnack('Station deleted.'); setDeleteDialogOpen(false); load()
    } catch { setError('Failed to delete station.') }
  }

  return (
    <DealerLayout>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0D1B2A">Petrol Stations</Typography>
          <Typography variant="body2" color="text.secondary">Manage all your registered stations</Typography>
        </Box>
        <Button id="add-station-btn" variant="contained" startIcon={<AddOutlined />} onClick={openAdd}
          sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(90deg,#0D47A1,#1565C0)', boxShadow: '0 4px 16px rgba(13,71,161,0.3)' }}>
          Add Station
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <TextField id="station-search" placeholder="Search by name, city or state…" size="small" value={search} onChange={e => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', sm: 320 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} />
          </Box>
          {loading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <LocalGasStation sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">{search ? 'No stations match your search.' : 'No stations yet. Click "Add Station" to get started.'}</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', bgcolor: '#FAFAFA' } }}>
                  <TableCell>#</TableCell><TableCell>Name</TableCell><TableCell>Address</TableCell>
                  <TableCell>City</TableCell><TableCell>State</TableCell><TableCell>Contact</TableCell><TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((s, i) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ color: 'text.disabled', fontWeight: 600 }}>{i + 1}</TableCell>
                    <TableCell><Typography variant="body2" fontWeight={700}>{s.name}</Typography></TableCell>
                    <TableCell sx={{ maxWidth: 200 }}><Typography variant="body2" noWrap>{s.address}</Typography></TableCell>
                    <TableCell>{s.city}</TableCell>
                    <TableCell><Chip label={s.state} size="small" sx={{ bgcolor: 'rgba(13,71,161,0.08)', color: '#0D47A1', fontWeight: 600 }} /></TableCell>
                    <TableCell>{s.contact_number || '—'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(s)} sx={{ color: '#0D47A1', '&:hover': { bgcolor: 'rgba(13,71,161,0.08)' } }}><EditOutlined fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => openDelete(s)} sx={{ color: '#d32f2f', '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}><DeleteOutlined fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{editing ? 'Edit Station' : 'Add New Station'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField id="st-name" label="Station Name *" fullWidth value={form.name} onChange={set('name')} />
          <TextField id="st-address" label="Address *" fullWidth value={form.address} onChange={set('address')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField id="st-city" label="City *" fullWidth value={form.city} onChange={set('city')} />
            <TextField id="st-state" label="State *" fullWidth value={form.state} onChange={set('state')} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField id="st-pincode" label="Pincode *" fullWidth value={form.pincode} onChange={set('pincode')} />
            <TextField id="st-contact" label="Contact Number" fullWidth value={form.contact_number} onChange={set('contact_number')} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField id="st-lat" label="Latitude" type="number" fullWidth value={form.latitude ?? ''} onChange={set('latitude')} />
            <TextField id="st-lng" label="Longitude" type="number" fullWidth value={form.longitude ?? ''} onChange={set('longitude')} />
          </Box>
          <TextField id="st-desc" label="Description" fullWidth multiline rows={3} value={form.description} onChange={set('description')} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button id="st-save-btn" variant="contained" onClick={handleSave} disabled={saving}
            sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(90deg,#0D47A1,#1565C0)' }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>Delete Station</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleting?.name}</strong>? This will also delete all associated spaces, utilities and images.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button id="st-confirm-delete" variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack('')} message={snack} />
    </DealerLayout>
  )
}
