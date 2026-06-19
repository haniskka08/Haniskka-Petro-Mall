import { useEffect, useState, useCallback, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Box, Button, Card, CardContent, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, IconButton, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Snackbar, Tooltip, Chip, InputAdornment,
  Divider, Stack, FormControl, InputLabel, Select, MenuItem, FormHelperText,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import {
  AddOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  LocalGasStation, PlaceOutlined, PhoneOutlined, InfoOutlined,
  MyLocationOutlined, CheckCircleOutlined, VerifiedOutlined,
  ErrorOutlined, HourglassTopOutlined, MapOutlined, TableRowsOutlined,
  GpsFixedOutlined,
} from '@mui/icons-material'
import DealerLayout from '../layouts/DealerLayout'
import apiClient from '../services/apiClient'
import { STATES, STATE_CITIES, validatePincode } from '../utils/indiaData'
import type { PincodeResult } from '../utils/indiaData'
import StationMap from '../components/StationMap'

interface Station {
  id: number; name: string; address: string; city: string; state: string
  pincode: string; latitude?: number; longitude?: number
  contact_number?: string; description?: string; dealer_id: number; status: string
}

type FormData = Omit<Station, 'id' | 'dealer_id'>
type FormErrors = Partial<Record<keyof FormData, string>>
type Touched = Partial<Record<keyof FormData, boolean>>

const EMPTY: FormData = {
  name: '', address: '', city: '', state: '', pincode: '',
  latitude: undefined, longitude: undefined, contact_number: '', description: '', status: 'pending',
}

type PincodeStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'error'

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  green:    { label: 'Green',    color: '#2E7D32', bg: 'rgba(46,125,50,0.1)' },
  pending:  { label: 'Pending',  color: '#FB8C00', bg: 'rgba(251,140,0,0.1)' },
  rejected: { label: 'Rejected', color: '#d32f2f', bg: 'rgba(211,47,47,0.1)' },
}

function validate(form: FormData, pincodeStatus: PincodeStatus): FormErrors {
  const errs: FormErrors = {}

  if (!form.name.trim()) errs.name = 'Station name is required.'
  else if (form.name.trim().length < 3) errs.name = 'Name must be at least 3 characters.'
  else if (form.name.trim().length > 100) errs.name = 'Name must be 100 characters or fewer.'

  if (!form.address.trim()) errs.address = 'Address is required.'
  else if (form.address.trim().length < 5) errs.address = 'Enter a complete address (min 5 chars).'

  if (!form.state) errs.state = 'Please select a state.'
  if (!form.city) errs.city = 'Please select a city.'

  if (!form.pincode.trim()) errs.pincode = 'Pincode is required.'
  else if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = 'Enter a valid 6-digit pincode.'
  else if (pincodeStatus === 'invalid') errs.pincode = 'This pincode does not exist.'
  else if (pincodeStatus === 'checking') errs.pincode = 'Verifying pincode…'

  if (form.contact_number && !/^[+]?[\d\s\-()]{7,15}$/.test(form.contact_number)) {
    errs.contact_number = 'Enter a valid phone number (7–15 digits).'
  }
  if (form.latitude !== undefined && form.latitude !== null && form.latitude !== ('' as any)) {
    const lat = Number(form.latitude)
    if (isNaN(lat) || lat < -90 || lat > 90) errs.latitude = 'Latitude must be between -90 and 90.'
  }
  if (form.longitude !== undefined && form.longitude !== null && form.longitude !== ('' as any)) {
    const lng = Number(form.longitude)
    if (isNaN(lng) || lng < -180 || lng > 180) errs.longitude = 'Longitude must be between -180 and 180.'
  }
  return errs
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
  const [form, setForm] = useState<FormData>(EMPTY)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Touched>({})
  const [saving, setSaving] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table')

  // Pincode validation state
  const [pincodeStatus, setPincodeStatus] = useState<PincodeStatus>('idle')
  const [pincodeResult, setPincodeResult] = useState<PincodeResult | null>(null)
  const [pincodeTimer, setPincodeTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Map pick mode state
  const [pickingOnMap, setPickingOnMap] = useState(false)
  const miniMapRef = useRef<any>(null)
  const miniMapContainerRef = useRef<HTMLDivElement>(null)

  // Geocoding state
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeMsg, setGeocodeMsg] = useState('')

  const cities = form.state ? (STATE_CITIES[form.state] ?? []).sort() : []

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
      s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q) || s.pincode.includes(q)
    ))
  }, [search, stations])

  useEffect(() => {
    if (submitAttempted || Object.keys(touched).length > 0) {
      setFormErrors(validate(form, pincodeStatus))
    }
  }, [form, submitAttempted, touched, pincodeStatus])

  const triggerPincodeCheck = useCallback((pincode: string) => {
    if (pincodeTimer) clearTimeout(pincodeTimer)
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus('idle'); setPincodeResult(null); return
    }
    setPincodeStatus('checking'); setPincodeResult(null)
    const t = setTimeout(async () => {
      const result = await validatePincode(pincode)
      setPincodeResult(result)
      setPincodeStatus(result.valid ? 'valid' : 'invalid')
    }, 700)
    setPincodeTimer(t)
  }, [pincodeTimer])

  useEffect(() => () => { if (pincodeTimer) clearTimeout(pincodeTimer) }, [pincodeTimer])

  // ── Geocode via Nominatim: pincode first, then city+state ──────────────────
  const geocodeAddress = async (address: string, city: string, state: string, pincode: string) => {
    if (!city && !pincode) return
    setGeocoding(true)
    setGeocodeMsg('')
    try {
      let results: any[] = []

      // Strategy 1: pincode lookup — most reliable for India
      if (pincode.length === 6) {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&countrycodes=in&limit=1`
        )
        results = await r.json()
      }

      // Strategy 2: address + city + state free-text
      if (!results.length && city) {
        const q = [address.trim(), city, state, 'India'].filter(Boolean).join(', ')
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=in`
        )
        results = await r.json()
      }

      // Strategy 3: city + state only (broadest fallback)
      if (!results.length && city && state) {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=India&limit=1`
        )
        results = await r.json()
      }

      if (results.length > 0) {
        const { lat, lon, display_name } = results[0]
        const rLat = parseFloat(parseFloat(lat).toFixed(6))
        const rLon = parseFloat(parseFloat(lon).toFixed(6))
        setForm(p => ({ ...p, latitude: rLat, longitude: rLon }))
        setTouched(p => ({ ...p, latitude: true, longitude: true }))
        const label = display_name.split(',').slice(0, 3).join(',')
        setGeocodeMsg(`✅ Found: ${label}`)
      } else {
        setGeocodeMsg('⚠️ Address not found. Try "Pick on Map" or enter coordinates manually.')
      }
    } catch {
      setGeocodeMsg('⚠️ Geocoding request failed. Check your internet connection.')
    } finally {
      setGeocoding(false)
    }
  }

  // Auto-trigger geocoding when city + state + pincode are filled and no coords yet
  useEffect(() => {
    if (form.city && form.state && form.pincode.length === 6 && !form.latitude && !form.longitude && dialogOpen) {
      const t = setTimeout(() => geocodeAddress(form.address, form.city, form.state, form.pincode), 800)
      return () => clearTimeout(t)
    }
  }, [form.city, form.state, form.pincode, dialogOpen])

  // Mini map for coordinate picking — uses static L import, ref-based container
  useEffect(() => {
    if (!pickingOnMap || !dialogOpen) return

    // Small delay for dialog DOM to finish rendering
    const timer = setTimeout(() => {
      const container = miniMapContainerRef.current
      if (!container) return

      // Clean up previous instance
      if (miniMapRef.current) { miniMapRef.current.remove(); miniMapRef.current = null }

      // Fix icons
      ;(L.Icon.Default.prototype as any)._getIconUrl = undefined
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const lat  = form.latitude  ? Number(form.latitude)  : 20.5937
      const lng  = form.longitude ? Number(form.longitude) : 78.9629
      const zoom = form.latitude  ? 13 : 5

      const map = L.map(container, { zoomControl: true }).setView([lat, lng], zoom)
      miniMapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19,
      }).addTo(map)

      let marker: L.Marker | null = null
      if (form.latitude && form.longitude) {
        marker = L.marker([lat, lng]).addTo(map)
        marker.bindPopup(`<b>⛽ ${form.name || 'Station'}</b><br/>${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup()
      }

      map.on('click', (e: L.LeafletMouseEvent) => {
        const rLat = parseFloat(e.latlng.lat.toFixed(6))
        const rLng = parseFloat(e.latlng.lng.toFixed(6))
        setForm(p => ({ ...p, latitude: rLat, longitude: rLng }))
        setTouched(p => ({ ...p, latitude: true, longitude: true }))
        setGeocodeMsg('')
        if (marker) marker.remove()
        marker = L.marker([rLat, rLng]).addTo(map)
        marker.bindPopup(`<b>⛽ ${form.name || 'Station'}</b><br/>${rLat}, ${rLng}`).openPopup()
      })
    }, 200)

    return () => {
      clearTimeout(timer)
      if (miniMapRef.current) { miniMapRef.current.remove(); miniMapRef.current = null }
    }
  }, [pickingOnMap, dialogOpen])

  const resetDialog = () => {
    setFormErrors({}); setTouched({}); setSubmitAttempted(false)
    setPincodeStatus('idle'); setPincodeResult(null); setPickingOnMap(false)
    setGeocodeMsg('')
    if (pincodeTimer) clearTimeout(pincodeTimer)
  }

  const openAdd = () => {
    setEditing(null); setForm(EMPTY); resetDialog(); setDialogOpen(true)
  }
  const openEdit = (s: Station) => {
    setEditing(s)
    setForm({
      name: s.name, address: s.address, city: s.city, state: s.state,
      pincode: s.pincode, latitude: s.latitude, longitude: s.longitude,
      contact_number: s.contact_number ?? '', description: s.description ?? '', status: s.status ?? 'pending',
    })
    resetDialog()
    if (s.pincode && /^\d{6}$/.test(s.pincode)) {
      setPincodeStatus('checking')
      validatePincode(s.pincode).then(r => {
        setPincodeResult(r); setPincodeStatus(r.valid ? 'valid' : 'invalid')
      })
    }
    setDialogOpen(true)
  }
  const openDelete = (s: Station) => { setDeleting(s); setDeleteDialogOpen(true) }

  const handleChange = (field: keyof FormData) => (e: any) => {
    const value = e.target.value
    setForm(p => {
      const updated = { ...p, [field]: value }
      if (field === 'state') updated.city = ''
      return updated
    })
    setTouched(p => ({ ...p, [field]: true }))
    if (field === 'pincode') triggerPincodeCheck(value)
  }

  const handleBlur = (field: keyof FormData) => () => {
    setTouched(p => ({ ...p, [field]: true }))
  }

  const showError = (field: keyof FormData) =>
    !!(touched[field] || submitAttempted) && !!formErrors[field]
  const helperText = (field: keyof FormData) =>
    (touched[field] || submitAttempted) ? formErrors[field] : ''

  const handleSave = async () => {
    setSubmitAttempted(true)
    if (pincodeStatus === 'checking') return
    const errs = validate(form, pincodeStatus)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    const payload = {
      ...form,
      latitude: form.latitude !== '' && form.latitude !== undefined ? Number(form.latitude) : null,
      longitude: form.longitude !== '' && form.longitude !== undefined ? Number(form.longitude) : null,
    }
    try {
      if (editing) {
        await apiClient.put(`/stations/${editing.id}`, payload)
        setSnack('Station updated successfully!')
      } else {
        await apiClient.post('/stations/', payload)
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

  const errorCount = Object.keys(formErrors).length

  const pincodeAdornment = () => {
    if (pincodeStatus === 'checking') return <HourglassTopOutlined sx={{ fontSize: 16, color: '#FB8C00', animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
    if (pincodeStatus === 'valid')    return <VerifiedOutlined sx={{ fontSize: 16, color: '#2E7D32' }} />
    if (pincodeStatus === 'invalid')  return <ErrorOutlined sx={{ fontSize: 16, color: '#d32f2f' }} />
    return null
  }

  const mappableCount = stations.filter(s => s.latitude && s.longitude).length

  return (
    <DealerLayout>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0D1B2A">Petrol Stations</Typography>
          <Typography variant="body2" color="text.secondary">
            {stations.length} station{stations.length !== 1 ? 's' : ''} registered
            {mappableCount > 0 && ` · ${mappableCount} on map`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            sx={{ bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 2 }}
          >
            <ToggleButton value="table" sx={{ px: 2, borderRadius: '8px 0 0 8px !important' }}>
              <TableRowsOutlined sx={{ fontSize: 16, mr: 0.5 }} /> Table
            </ToggleButton>
            <ToggleButton value="map" sx={{ px: 2, borderRadius: '0 8px 8px 0 !important' }}>
              <MapOutlined sx={{ fontSize: 16, mr: 0.5 }} /> Map
              {mappableCount > 0 && (
                <Chip label={mappableCount} size="small" sx={{ ml: 0.8, height: 18, fontSize: 10, bgcolor: '#0D47A1', color: '#fff' }} />
              )}
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            id="add-station-btn"
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={openAdd}
            sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(90deg,#0D47A1,#1565C0)', boxShadow: '0 4px 16px rgba(13,71,161,0.3)', fontWeight: 700 }}
          >
            Add Station
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── MAP VIEW ── */}
      {viewMode === 'map' && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
            ) : (
              <>
                {stations.filter(s => !s.latitude || !s.longitude).length > 0 && (
                  <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
                    <strong>{stations.filter(s => !s.latitude || !s.longitude).length}</strong> station(s) have no GPS coordinates and won't appear on the map.
                    Edit them to add coordinates, or use "Pick on Map" in the form.
                  </Alert>
                )}
                <StationMap
                  stations={filtered}
                  height={520}
                  onMarkerClick={openEdit}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Search */}
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                id="station-search"
                placeholder="Search by name, city, state or pincode…"
                size="small"
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ width: { xs: '100%', sm: 360 } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }}
              />
              {search && (
                <Typography variant="body2" color="text.secondary">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
                </Typography>
              )}
            </Box>

            {loading ? (
              <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <LocalGasStation sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary" fontWeight={600}>
                  {search ? 'No stations match your search.' : 'No stations yet.'}
                </Typography>
                {!search && (
                  <Button variant="contained" startIcon={<AddOutlined />} onClick={openAdd}
                    sx={{ mt: 2, borderRadius: 2, background: 'linear-gradient(90deg,#0D47A1,#1565C0)' }}>
                    Add Your First Station
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, bgcolor: '#F8FAFC', borderBottom: '2px solid rgba(0,0,0,0.06)' } }}>
                      <TableCell sx={{ width: 48 }}>#</TableCell>
                      <TableCell>Station Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell>Pincode</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Coordinates</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((s, i) => {
                      const sm = STATUS_META[s.status] ?? STATUS_META.pending
                      return (
                        <TableRow key={s.id} hover sx={{ '&:last-child td': { borderBottom: 0 }, transition: 'background 0.15s' }}>
                          <TableCell sx={{ color: 'text.disabled', fontWeight: 700, fontSize: 12 }}>{i + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'rgba(13,71,161,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <LocalGasStation sx={{ fontSize: 16, color: '#0D47A1' }} />
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={700} color="#0D1B2A">{s.name}</Typography>
                                {s.description && (
                                  <Typography variant="caption" color="text.disabled" noWrap sx={{ maxWidth: 160, display: 'block' }}>{s.description}</Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 180 }}>
                            <Typography variant="body2" color="text.secondary" noWrap>{s.address}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{s.city}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={s.state} size="small" sx={{ bgcolor: 'rgba(13,71,161,0.08)', color: '#0D47A1', fontWeight: 700, fontSize: 11, height: 22 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{s.pincode}</Typography>
                          </TableCell>
                          <TableCell>
                            {s.contact_number
                              ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneOutlined sx={{ fontSize: 13, color: 'text.disabled' }} /><Typography variant="body2">{s.contact_number}</Typography></Box>
                              : <Typography variant="body2" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={sm.label}
                              size="small"
                              sx={{ bgcolor: sm.bg, color: sm.color, fontWeight: 700, fontSize: 11, height: 22, border: `1px solid ${sm.color}33` }}
                            />
                          </TableCell>
                          <TableCell>
                            {s.latitude && s.longitude
                              ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <MyLocationOutlined sx={{ fontSize: 13, color: '#2E7D32' }} />
                                  <Typography variant="caption" fontFamily="monospace" color="#2E7D32">{Number(s.latitude).toFixed(4)}, {Number(s.longitude).toFixed(4)}</Typography>
                                </Box>
                              : <Typography variant="body2" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit Station">
                              <IconButton size="small" onClick={() => openEdit(s)}
                                sx={{ color: '#0D47A1', '&:hover': { bgcolor: 'rgba(13,71,161,0.08)' }, mr: 0.5 }}>
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Station">
                              <IconButton size="small" onClick={() => openDelete(s)}
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
                  Showing {filtered.length} of {stations.length} stations
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Typography variant="h6" fontWeight={800}>{editing ? 'Edit Station' : 'Add New Station'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {editing ? 'Update the station details below.' : 'Fill in the details to register a new petrol station.'}
          </Typography>
        </DialogTitle>

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
            {/* Basic Info */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'block' }}>
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <TextField
                  id="st-name" label="Station Name *" fullWidth
                  value={form.name} onChange={handleChange('name')} onBlur={handleBlur('name')}
                  error={showError('name')} helperText={helperText('name') || 'e.g. Highway Shell Station'}
                  inputProps={{ maxLength: 100 }}
                />
                <TextField
                  id="st-address" label="Full Address *" fullWidth multiline rows={2}
                  value={form.address} onChange={handleChange('address')} onBlur={handleBlur('address')}
                  error={showError('address')} helperText={helperText('address') || 'Street, landmark, locality'}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Location */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PlaceOutlined sx={{ fontSize: 14 }} /> Location Details
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth error={showError('state')}>
                  <InputLabel id="st-state-label">State *</InputLabel>
                  <Select labelId="st-state-label" id="st-state" value={form.state} label="State *"
                    onChange={handleChange('state')} onBlur={handleBlur('state')}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}>
                    {STATES.map(st => <MenuItem key={st} value={st}>{st}</MenuItem>)}
                  </Select>
                  {showError('state') && <FormHelperText>{helperText('state')}</FormHelperText>}
                  {!showError('state') && <FormHelperText>Select the state where this station is located</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={showError('city')} disabled={!form.state}>
                  <InputLabel id="st-city-label">City *</InputLabel>
                  <Select labelId="st-city-label" id="st-city" value={form.city} label="City *"
                    onChange={handleChange('city')} onBlur={handleBlur('city')}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}>
                    {cities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                  {showError('city') && <FormHelperText>{helperText('city')}</FormHelperText>}
                  {!showError('city') && !form.state && <FormHelperText>Select a state first</FormHelperText>}
                  {!showError('city') && form.state && <FormHelperText>{cities.length} cities available in {form.state}</FormHelperText>}
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    id="st-pincode" label="Pincode *" fullWidth
                    value={form.pincode} onChange={handleChange('pincode')} onBlur={handleBlur('pincode')}
                    error={showError('pincode') || pincodeStatus === 'invalid'}
                    helperText={
                      showError('pincode') ? helperText('pincode') :
                      pincodeStatus === 'checking' ? '⏳ Verifying pincode…' :
                      pincodeStatus === 'valid' ? pincodeResult?.message :
                      pincodeStatus === 'invalid' ? pincodeResult?.message :
                      '6-digit Indian postal code'
                    }
                    FormHelperTextProps={{
                      sx: {
                        color: pincodeStatus === 'valid' ? '#2E7D32' :
                               pincodeStatus === 'invalid' ? '#d32f2f' :
                               pincodeStatus === 'checking' ? '#FB8C00' : undefined,
                        fontWeight: pincodeStatus !== 'idle' ? 600 : 400,
                      }
                    }}
                    inputProps={{ maxLength: 6, pattern: '[0-9]*', inputMode: 'numeric' }}
                    InputProps={{
                      endAdornment: pincodeAdornment()
                        ? <InputAdornment position="end">{pincodeAdornment()}</InputAdornment>
                        : undefined,
                    }}
                  />
                  <TextField
                    id="st-contact" label="Contact Number" fullWidth
                    value={form.contact_number} onChange={handleChange('contact_number')} onBlur={handleBlur('contact_number')}
                    error={showError('contact_number')} helperText={helperText('contact_number') || 'Optional phone number'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ fontSize: 16 }} /></InputAdornment>
                    }}
                  />
                </Box>

                {pincodeStatus === 'valid' && pincodeResult?.postOffices && pincodeResult.postOffices.length > 0 && (
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(46,125,50,0.06)', borderRadius: 2, border: '1px solid rgba(46,125,50,0.2)' }}>
                    <Typography variant="caption" fontWeight={700} color="#2E7D32" display="block" sx={{ mb: 0.5 }}>
                      <VerifiedOutlined sx={{ fontSize: 12, mr: 0.5 }} />
                      Pincode verified — {pincodeResult.district}, {pincodeResult.state}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Post Offices: {pincodeResult.postOffices.slice(0, 4).join(', ')}{pincodeResult.postOffices.length > 4 ? ` +${pincodeResult.postOffices.length - 4} more` : ''}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Status */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'block' }}>
                Station Status
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="st-status-label">Validation Status</InputLabel>
                <Select labelId="st-status-label" id="st-status" value={form.status ?? 'pending'} label="Validation Status" onChange={handleChange('status')}>
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
                        {meta.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Current validation state of this station</FormHelperText>
              </FormControl>
            </Box>

            <Divider />

            {/* GPS Coordinates */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <MyLocationOutlined sx={{ fontSize: 14 }} /> GPS Coordinates
                  <Chip label="Optional" size="small" sx={{ ml: 1, height: 18, fontSize: 10 }} />
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Auto-locate button */}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => geocodeAddress(form.address, form.city, form.state, form.pincode)}
                    disabled={geocoding || !form.city || !form.state}
                    startIcon={geocoding ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : <MyLocationOutlined sx={{ fontSize: 14 }} />}
                    sx={{ borderRadius: 1.5, fontSize: 11, py: 0.4, px: 1.5, background: 'linear-gradient(90deg,#2E7D32,#388E3C)', '&:disabled': { bgcolor: 'rgba(0,0,0,0.12)' } }}
                  >
                    {geocoding ? 'Locating…' : 'Auto-locate'}
                  </Button>
                  {/* Pick on map button */}
                  <Button
                    size="small"
                    variant={pickingOnMap ? 'contained' : 'outlined'}
                    startIcon={<GpsFixedOutlined sx={{ fontSize: 14 }} />}
                    onClick={() => setPickingOnMap(p => !p)}
                    sx={{ borderRadius: 1.5, fontSize: 11, py: 0.4, ...(pickingOnMap ? { background: 'linear-gradient(90deg,#0D47A1,#1565C0)', color: '#fff' } : {}) }}
                  >
                    {pickingOnMap ? 'Hide Map' : 'Pick on Map'}
                  </Button>
                </Box>
              </Box>

              {/* Geocode result message */}
              {geocodeMsg && (
                <Box sx={{ mb: 1.5, p: 1, bgcolor: geocodeMsg.startsWith('✅') ? 'rgba(46,125,50,0.08)' : 'rgba(251,140,0,0.08)', borderRadius: 1.5, border: `1px solid ${geocodeMsg.startsWith('✅') ? 'rgba(46,125,50,0.3)' : 'rgba(251,140,0,0.3)'}` }}>
                  <Typography variant="caption" sx={{ color: geocodeMsg.startsWith('✅') ? '#2E7D32' : '#E65100', fontWeight: 600, fontSize: 11 }}>
                    {geocodeMsg}
                  </Typography>
                </Box>
              )}

              {/* Mini map picker */}
              {pickingOnMap && (
                <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', border: '2px solid #1565C0', position: 'relative' }}>
                  <Box sx={{
                    position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: 'rgba(13,27,42,0.85)', backdropFilter: 'blur(6px)',
                    borderRadius: 1.5, px: 1.5, py: 0.5, pointerEvents: 'none',
                  }}>
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, fontSize: 11 }}>
                      🖱️ Click anywhere on the map to pin your station
                    </Typography>
                  </Box>
                  <div ref={miniMapContainerRef} style={{ height: '260px', width: '100%' }} />
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  id="st-lat" label="Latitude" type="number" fullWidth
                  value={form.latitude ?? ''}
                  onChange={handleChange('latitude')} onBlur={handleBlur('latitude')}
                  error={showError('latitude')} helperText={helperText('latitude') || '-90 to 90'}
                  inputProps={{ step: 'any' }}
                />
                <TextField
                  id="st-lng" label="Longitude" type="number" fullWidth
                  value={form.longitude ?? ''}
                  onChange={handleChange('longitude')} onBlur={handleBlur('longitude')}
                  error={showError('longitude')} helperText={helperText('longitude') || '-180 to 180'}
                  inputProps={{ step: 'any' }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Description */}
            <TextField
              id="st-desc" label="Description" fullWidth multiline rows={3}
              value={form.description} onChange={handleChange('description')}
              helperText="Optional notes about this station"
              inputProps={{ maxLength: 500 }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            id="st-save-btn" variant="contained" onClick={handleSave}
            disabled={saving || pincodeStatus === 'checking'}
            startIcon={saving ? undefined : <CheckCircleOutlined />}
            sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(90deg,#0D47A1,#1565C0)', fontWeight: 700, minWidth: 140 }}
          >
            {saving
              ? <CircularProgress size={18} sx={{ color: '#fff' }} />
              : pincodeStatus === 'checking'
              ? 'Verifying…'
              : editing ? 'Update Station' : 'Create Station'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800} color="#d32f2f">Delete Station</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleting?.name}</strong>?</Typography>
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            This will permanently delete all associated spaces, utilities and images.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button id="st-confirm-delete" variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2 }}>
            Delete Station
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
