import { useEffect, useState } from 'react'
import {
  Box, Button, Card, CardContent, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Snackbar, Tooltip, Chip, MenuItem,
  Select, FormControl, InputLabel, InputAdornment, Stack, Divider, FormHelperText,
} from '@mui/material'
import {
  AddOutlined, EditOutlined, DeleteOutlined, SearchOutlined, StoreOutlined,
  InfoOutlined, CheckCircleOutlined, SquareFootOutlined, CurrencyRupeeOutlined,
} from '@mui/icons-material'
import DealerLayout from '../layouts/DealerLayout'
import apiClient from '../services/apiClient'

interface Station { id: number; name: string }
interface Space {
  id: number; station_id: number; name: string; space_type: string
  area_sqft?: number; monthly_rent?: number; availability_status: string
}

interface FormData {
  station_id: number | ''
  name: string
  space_type: string
  area_sqft: string
  monthly_rent: string
  availability_status: string
}

interface FormErrors {
  station_id?: string
  name?: string
  space_type?: string
  area_sqft?: string
  monthly_rent?: string
  availability_status?: string
}

type Touched = Partial<Record<keyof FormData, boolean>>

const TYPES = [
  { value: 'retail',           label: 'Retail Shop' },
  { value: 'food_court',       label: 'Food Court' },
  { value: 'atm',              label: 'ATM' },
  { value: 'pharmacy',         label: 'Pharmacy' },
  { value: 'office',           label: 'Office' },
  { value: 'storage',          label: 'Storage' },
  { value: 'other',            label: 'Other' },
]

const STATUSES = [
  { value: 'available',        label: 'Available',        color: 'success' as const },
  { value: 'occupied',         label: 'Occupied',         color: 'error' as const   },
  { value: 'under_renovation', label: 'Under Renovation', color: 'warning' as const },
]

const STATUS_COLOR: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  available: 'success', occupied: 'error', under_renovation: 'warning',
}

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  retail:       { bg: 'rgba(13,71,161,0.08)',   color: '#0D47A1' },
  food_court:   { bg: 'rgba(230,81,0,0.08)',    color: '#E65100' },
  atm:          { bg: 'rgba(46,125,50,0.08)',   color: '#2E7D32' },
  pharmacy:     { bg: 'rgba(123,31,162,0.08)',  color: '#7B1FA2' },
  office:       { bg: 'rgba(0,96,100,0.08)',    color: '#006064' },
  storage:      { bg: 'rgba(66,66,66,0.08)',    color: '#424242' },
  other:        { bg: 'rgba(100,100,100,0.08)', color: '#616161' },
}

const EMPTY: FormData = {
  station_id: '', name: '', space_type: 'retail',
  area_sqft: '', monthly_rent: '', availability_status: 'available',
}

function validate(form: FormData): FormErrors {
  const errs: FormErrors = {}

  if (!form.station_id) errs.station_id = 'Please select a station.'

  if (!form.name.trim()) errs.name = 'Space name is required.'
  else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.'
  else if (form.name.trim().length > 100) errs.name = 'Name must be 100 characters or fewer.'

  if (!form.space_type) errs.space_type = 'Space type is required.'
  if (!form.availability_status) errs.availability_status = 'Status is required.'

  if (form.area_sqft !== '') {
    const v = Number(form.area_sqft)
    if (isNaN(v) || v <= 0) errs.area_sqft = 'Area must be a positive number.'
    else if (v > 100000) errs.area_sqft = 'Area seems too large (max 100,000 sqft).'
  }

  if (form.monthly_rent !== '') {
    const v = Number(form.monthly_rent)
    if (isNaN(v) || v < 0) errs.monthly_rent = 'Rent must be a positive number.'
    else if (v > 10000000) errs.monthly_rent = 'Rent seems too large.'
  }

  return errs
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [filterStation, setFilterStation] = useState(0)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Space | null>(null)
  const [deleting, setDeleting] = useState<Space | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([apiClient.get<Space[]>('/spaces/'), apiClient.get<Station[]>('/stations/')])
      .then(([sp, st]) => { setSpaces(sp.data); setStations(st.data) })
      .catch(() => setError('Failed to load spaces.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  // Live re-validate
  useEffect(() => {
    if (submitAttempted || Object.keys(touched).length > 0) {
      setFormErrors(validate(form))
    }
  }, [form, submitAttempted, touched])

  const filtered = spaces.filter(sp => {
    const matchStation = filterStation === 0 || sp.station_id === filterStation
    const matchStatus = !filterStatus || sp.availability_status === filterStatus
    const matchSearch = !search || sp.name.toLowerCase().includes(search.toLowerCase()) ||
      TYPES.find(t => t.value === sp.space_type)?.label.toLowerCase().includes(search.toLowerCase())
    return matchStation && matchStatus && matchSearch
  })

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY, station_id: stations[0]?.id ?? '' })
    setFormErrors({}); setTouched({}); setSubmitAttempted(false); setDialogOpen(true)
  }
  const openEdit = (s: Space) => {
    setEditing(s)
    setForm({
      station_id: s.station_id, name: s.name, space_type: s.space_type,
      area_sqft: s.area_sqft?.toString() ?? '', monthly_rent: s.monthly_rent?.toString() ?? '',
      availability_status: s.availability_status,
    })
    setFormErrors({}); setTouched({}); setSubmitAttempted(false); setDialogOpen(true)
  }

  const handleChange = (field: keyof FormData) => (e: any) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setTouched(p => ({ ...p, [field]: true }))
  }
  const handleBlur = (field: keyof FormData) => () => {
    setTouched(p => ({ ...p, [field]: true }))
    setFormErrors(validate(form))
  }

  const showError = (field: keyof FormData) =>
    !!(touched[field] || submitAttempted) && !!formErrors[field]
  const helperText = (field: keyof FormData) =>
    (touched[field] || submitAttempted) ? formErrors[field] : ''

  const handleSave = async () => {
    setSubmitAttempted(true)
    const errs = validate(form)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    const payload = {
      ...form,
      area_sqft:     form.area_sqft     ? Number(form.area_sqft)     : null,
      monthly_rent:  form.monthly_rent  ? Number(form.monthly_rent)  : null,
    }
    try {
      if (editing) { await apiClient.put(`/spaces/${editing.id}`, payload); setSnack('Space updated!') }
      else          { await apiClient.post('/spaces/', payload);             setSnack('Space created!') }
      setDialogOpen(false); load()
    } catch (err: any) { setError(err?.response?.data?.detail ?? 'Save failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try { await apiClient.delete(`/spaces/${deleting.id}`); setSnack('Space deleted.'); setDeleteDialogOpen(false); load() }
    catch { setError('Failed to delete space.') }
  }

  const stationName = (id: number) => stations.find(s => s.id === id)?.name ?? '—'
  const typeLabel   = (v: string) => TYPES.find(t => t.value === v)?.label ?? v
  const errorCount = Object.keys(formErrors).length

  // Stats
  const available = spaces.filter(s => s.availability_status === 'available').length
  const occupied  = spaces.filter(s => s.availability_status === 'occupied').length

  return (
    <DealerLayout>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0D1B2A">Commercial Spaces</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">{spaces.length} total</Typography>
            <Chip label={`${available} Available`} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 11, fontWeight: 600 }} />
            <Chip label={`${occupied} Occupied`}   size="small" color="error"   variant="outlined" sx={{ height: 20, fontSize: 11, fontWeight: 600 }} />
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={openAdd}
          disabled={stations.length === 0}
          sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(90deg,#7B1FA2,#9C27B0)', boxShadow: '0 4px 16px rgba(123,31,162,0.3)', fontWeight: 700 }}
        >
          Add Space
        </Button>
      </Box>

      {stations.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          You need to add a station before you can create spaces.
        </Alert>
      )}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Filters row */}
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search spaces…"
              size="small"
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ width: 240 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Station</InputLabel>
              <Select value={filterStation} label="Filter by Station" onChange={e => setFilterStation(Number(e.target.value))}>
                <MenuItem value={0}>All Stations</MenuItem>
                {stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select value={filterStatus} label="Filter by Status" onChange={e => setFilterStatus(e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>
            {(search || filterStation !== 0 || filterStatus) && (
              <Button size="small" onClick={() => { setSearch(''); setFilterStation(0); setFilterStatus('') }}>Clear filters</Button>
            )}
          </Box>

          {/* Table */}
          {loading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <StoreOutlined sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary" fontWeight={600}>
                {search || filterStation || filterStatus ? 'No spaces match your filters.' : 'No spaces yet.'}
              </Typography>
              {!search && !filterStation && !filterStatus && stations.length > 0 && (
                <Button variant="contained" startIcon={<AddOutlined />} onClick={openAdd}
                  sx={{ mt: 2, borderRadius: 2, background: 'linear-gradient(90deg,#7B1FA2,#9C27B0)' }}>
                  Add First Space
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, bgcolor: '#F8FAFC', borderBottom: '2px solid rgba(0,0,0,0.06)' } }}>
                    <TableCell sx={{ width: 48 }}>#</TableCell>
                    <TableCell>Space Name</TableCell>
                    <TableCell>Station</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SquareFootOutlined sx={{ fontSize: 13 }} /> Area (sqft)
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CurrencyRupeeOutlined sx={{ fontSize: 13 }} /> Monthly Rent
                      </Box>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((sp, i) => {
                    const tc = TYPE_COLOR[sp.space_type] ?? TYPE_COLOR.other
                    return (
                      <TableRow key={sp.id} hover sx={{ '&:last-child td': { borderBottom: 0 }, transition: 'background 0.15s' }}>
                        <TableCell sx={{ color: 'text.disabled', fontWeight: 700, fontSize: 12 }}>{i + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <StoreOutlined sx={{ fontSize: 15, color: tc.color }} />
                            </Box>
                            <Typography variant="body2" fontWeight={700} color="#0D1B2A">{sp.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>{stationName(sp.station_id)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={typeLabel(sp.space_type)}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: tc.color, color: tc.color, fontWeight: 600, fontSize: 11, height: 22 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {sp.area_sqft ? sp.area_sqft.toLocaleString() : <span style={{ color: '#9e9e9e' }}>—</span>}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {sp.monthly_rent
                            ? <Typography variant="body2" fontWeight={700} color="#2E7D32">₹{sp.monthly_rent.toLocaleString()}</Typography>
                            : <Typography variant="body2" color="text.disabled">—</Typography>}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={STATUSES.find(s => s.value === sp.availability_status)?.label ?? sp.availability_status}
                            size="small"
                            color={STATUS_COLOR[sp.availability_status] ?? 'default'}
                            sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit Space">
                            <IconButton size="small" onClick={() => openEdit(sp)}
                              sx={{ color: '#7B1FA2', '&:hover': { bgcolor: 'rgba(123,31,162,0.08)' }, mr: 0.5 }}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Space">
                            <IconButton size="small" onClick={() => { setDeleting(sp); setDeleteDialogOpen(true) }}
                              sx={{ color: '#d32f2f', '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          )}

          {!loading && filtered.length > 0 && (
            <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="caption" color="text.disabled">
                Showing {filtered.length} of {spaces.length} spaces
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Typography variant="h6" fontWeight={800}>{editing ? 'Edit Space' : 'Add New Space'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {editing ? 'Update the space details below.' : 'Configure a commercial space inside a station.'}
          </Typography>
        </DialogTitle>

        {/* Validation banner */}
        {submitAttempted && errorCount > 0 && (
          <Box sx={{ mx: 3, mt: 2, p: 1.5, bgcolor: 'rgba(211,47,47,0.06)', borderRadius: 2, border: '1px solid rgba(211,47,47,0.2)', display: 'flex', gap: 1, alignItems: 'center' }}>
            <InfoOutlined sx={{ fontSize: 16, color: '#d32f2f', flexShrink: 0 }} />
            <Typography variant="body2" color="#d32f2f" fontWeight={600}>
              Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before saving.
            </Typography>
          </Box>
        )}

        <DialogContent sx={{ pt: '16px !important' }}>
          <Stack spacing={2.5}>
            {/* Station selector */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'block' }}>
                Station Assignment
              </Typography>
              <FormControl fullWidth error={showError('station_id')}>
                <InputLabel>Station *</InputLabel>
                <Select
                  value={form.station_id}
                  label="Station *"
                  onChange={handleChange('station_id')}
                  onBlur={handleBlur('station_id')}
                >
                  {stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
                {showError('station_id') && (
                  <FormHelperText>{helperText('station_id')}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <Divider />

            {/* Space details */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'block' }}>
                Space Details
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Space Name *"
                  fullWidth
                  value={form.name}
                  onChange={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={showError('name')}
                  helperText={helperText('name') || 'e.g. Corner Retail Unit A, Main ATM Booth'}
                  inputProps={{ maxLength: 100 }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth error={showError('space_type')}>
                    <InputLabel>Space Type *</InputLabel>
                    <Select
                      value={form.space_type}
                      label="Space Type *"
                      onChange={handleChange('space_type')}
                      onBlur={handleBlur('space_type')}
                    >
                      {TYPES.map(t => (
                        <MenuItem key={t.value} value={t.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: TYPE_COLOR[t.value]?.color ?? '#666' }} />
                            {t.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {showError('space_type') && <FormHelperText>{helperText('space_type')}</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth error={showError('availability_status')}>
                    <InputLabel>Status *</InputLabel>
                    <Select
                      value={form.availability_status}
                      label="Status *"
                      onChange={handleChange('availability_status')}
                      onBlur={handleBlur('availability_status')}
                    >
                      {STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                    </Select>
                    {showError('availability_status') && <FormHelperText>{helperText('availability_status')}</FormHelperText>}
                  </FormControl>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Financial details */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Dimensions &amp; Pricing
                <Chip label="Optional" size="small" sx={{ ml: 1, height: 18, fontSize: 10 }} />
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Area (sqft)"
                  type="number"
                  fullWidth
                  value={form.area_sqft}
                  onChange={handleChange('area_sqft')}
                  onBlur={handleBlur('area_sqft')}
                  error={showError('area_sqft')}
                  helperText={helperText('area_sqft') || 'Floor area in square feet'}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SquareFootOutlined sx={{ fontSize: 16 }} /></InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 'any' }}
                />
                <TextField
                  label="Monthly Rent (₹)"
                  type="number"
                  fullWidth
                  value={form.monthly_rent}
                  onChange={handleChange('monthly_rent')}
                  onBlur={handleBlur('monthly_rent')}
                  error={showError('monthly_rent')}
                  helperText={helperText('monthly_rent') || 'Rental amount per month'}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 'any' }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? undefined : <CheckCircleOutlined />}
            sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(90deg,#7B1FA2,#9C27B0)', fontWeight: 700, minWidth: 130 }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editing ? 'Update Space' : 'Create Space'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800} color="#d32f2f">Delete Space</DialogTitle>
        <DialogContent>
          <Typography>Delete <strong>{deleting?.name}</strong>?</Typography>
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            This action cannot be undone. All data for this space will be permanently removed.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2 }}>
            Delete Space
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack('')}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </DealerLayout>
  )
}
