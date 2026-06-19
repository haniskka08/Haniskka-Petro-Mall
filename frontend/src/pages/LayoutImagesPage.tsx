import { useEffect, useRef, useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Alert, Snackbar, CircularProgress,
  MenuItem, Select, FormControl, InputLabel, IconButton, Tooltip, LinearProgress,
  Chip, Table, TableHead, TableBody, TableRow, TableCell, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack,
} from '@mui/material'
import {
  DeleteOutlined, CloudUploadOutlined, ImageOutlined, CheckCircleOutlined,
  ErrorOutlineOutlined, WarningAmberOutlined, CloseOutlined, VisibilityOutlined,
  InsertDriveFileOutlined,
} from '@mui/icons-material'
import DealerLayout from '../layouts/DealerLayout'
import apiClient from '../services/apiClient'
import AuthedImg from '../components/AuthedImg'

interface Station { id: number; name: string }
interface StationImage {
  id: number; file_name: string; file_path: string
  file_size?: number; mime_type?: string; created_at: string
}

interface QueueItem {
  file: File
  id: string
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

const MAX_MB       = 10
const MAX_IMAGES   = 20
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp']
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

function validateFile(file: File, existing: StationImage[], queue: QueueItem[]): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTS.includes(ext)) return `"${file.name}" — invalid type. Allowed: JPG, PNG, WebP.`
  if (!ALLOWED_MIME.includes(file.type)) return `"${file.name}" — unsupported MIME type.`
  if (file.size > MAX_MB * 1024 * 1024) return `"${file.name}" — exceeds ${MAX_MB} MB limit.`
  if (file.size === 0) return `"${file.name}" — file is empty.`
  const allNames = [...existing.map(i => i.file_name), ...queue.map(q => q.file.name)]
  if (allNames.includes(file.name)) return `"${file.name}" — already uploaded or queued.`
  return null
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_ICON: Record<QueueItem['status'], React.ReactNode> = {
  pending:   <InsertDriveFileOutlined sx={{ fontSize: 16, color: '#9e9e9e' }} />,
  uploading: <CircularProgress size={14} thickness={5} />,
  done:      <CheckCircleOutlined sx={{ fontSize: 16, color: '#2E7D32' }} />,
  error:     <ErrorOutlineOutlined sx={{ fontSize: 16, color: '#d32f2f' }} />,
}

export default function LayoutImagesPage() {
  const [stations, setStations]             = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState(0)
  const [images, setImages]                 = useState<StationImage[]>([])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [snack, setSnack]                   = useState('')
  const [dragOver, setDragOver]             = useState(false)
  const [queue, setQueue]                   = useState<QueueItem[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [previewImg, setPreviewImg]         = useState<StationImage | null>(null)
  const [deleteTarget, setDeleteTarget]     = useState<StationImage | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Load stations on mount
  useEffect(() => {
    apiClient.get<Station[]>('/stations/').then(r => {
      setStations(r.data)
      if (r.data.length > 0) setSelectedStation(r.data[0].id)
    }).catch(() => setError('Failed to load stations.'))
  }, [])

  // Load images when station changes
  useEffect(() => {
    if (!selectedStation) return
    setLoading(true); setQueue([])
    apiClient.get<StationImage[]>(`/stations/${selectedStation}/images`)
      .then(r => setImages(r.data))
      .catch(() => setError('Failed to load images.'))
      .finally(() => setLoading(false))
  }, [selectedStation])

  const slotsLeft = MAX_IMAGES - images.length

  // Build queue from chosen files
  const enqueueFiles = (files: FileList | null) => {
    if (!files || !selectedStation) return
    const errs: string[] = []
    const newItems: QueueItem[] = []

    // Check total capacity first
    const pendingCount = queue.filter(q => q.status !== 'done').length
    if (images.length + pendingCount + files.length > MAX_IMAGES) {
      errs.push(`You can upload at most ${MAX_IMAGES} images per station. ${slotsLeft} slot(s) remaining.`)
    }

    Array.from(files).forEach(file => {
      const err = validateFile(file, images, [...queue, ...newItems])
      if (err) { errs.push(err); return }
      const preview = URL.createObjectURL(file)
      newItems.push({ file, id: `${file.name}-${Date.now()}-${Math.random()}`, preview, status: 'pending', progress: 0 })
    })

    setValidationErrors(errs)
    if (newItems.length > 0) setQueue(p => [...p, ...newItems])
  }

  const removeFromQueue = (id: string) => {
    setQueue(p => {
      const item = p.find(q => q.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return p.filter(q => q.id !== id)
    })
  }

  const uploadAll = async () => {
    const pending = queue.filter(q => q.status === 'pending')
    if (pending.length === 0) return

    for (const item of pending) {
      setQueue(p => p.map(q => q.id === item.id ? { ...q, status: 'uploading', progress: 0 } : q))
      const fd = new FormData()
      fd.append('file', item.file)
      try {
        const r = await apiClient.post<StationImage>(`/stations/${selectedStation}/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / (e.total ?? 1))
            setQueue(p => p.map(q => q.id === item.id ? { ...q, progress: pct } : q))
          },
        })
        setImages(prev => [...prev, r.data])
        setQueue(p => p.map(q => q.id === item.id ? { ...q, status: 'done', progress: 100 } : q))
        URL.revokeObjectURL(item.preview)
      } catch (err: any) {
        const msg = err?.response?.data?.detail ?? 'Upload failed.'
        setQueue(p => p.map(q => q.id === item.id ? { ...q, status: 'error', error: msg } : q))
      }
    }
    setSnack('Upload complete!')
    // Clean up done items after a short delay
    setTimeout(() => setQueue(p => p.filter(q => q.status !== 'done')), 2000)
  }

  const retryItem = (item: QueueItem) => {
    setQueue(p => p.map(q => q.id === item.id ? { ...q, status: 'pending', progress: 0, error: undefined } : q))
  }

  const clearQueue = () => {
    queue.forEach(q => URL.revokeObjectURL(q.preview))
    setQueue([]); setValidationErrors([])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    enqueueFiles(e.dataTransfer.files)
  }

  const confirmDeleteImage = async () => {
    if (!deleteTarget) return
    try {
      await apiClient.delete(`/stations/images/${deleteTarget.id}`)
      setImages(p => p.filter(i => i.id !== deleteTarget.id))
      setSnack('Image deleted.')
    } catch { setError('Failed to delete image.') }
    finally { setDeleteTarget(null) }
  }

  const pendingCount   = queue.filter(q => q.status === 'pending').length
  const uploadingCount = queue.filter(q => q.status === 'uploading').length
  const errorCount     = queue.filter(q => q.status === 'error').length
  const isUploading    = uploadingCount > 0

  return (
    <DealerLayout>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0D1B2A">Layout Images</Typography>
          <Typography variant="body2" color="text.secondary">
            Upload station layout blueprints and photos (max {MAX_IMAGES} per station)
          </Typography>
        </Box>
        {selectedStation > 0 && (
          <Chip
            label={`${images.length} / ${MAX_IMAGES} uploaded`}
            color={images.length >= MAX_IMAGES ? 'error' : images.length >= MAX_IMAGES * 0.8 ? 'warning' : 'success'}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* Validation errors list */}
      {validationErrors.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningAmberOutlined />}
          onClose={() => setValidationErrors([])}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
            {validationErrors.length} file{validationErrors.length > 1 ? 's' : ''} rejected:
          </Typography>
          {validationErrors.map((e, i) => (
            <Typography key={i} variant="caption" display="block">• {e}</Typography>
          ))}
        </Alert>
      )}

      {/* Station selector */}
      <FormControl size="small" sx={{ mb: 3, minWidth: 360 }}>
        <InputLabel>Select Station</InputLabel>
        <Select
          value={selectedStation}
          label="Select Station"
          onChange={e => setSelectedStation(Number(e.target.value))}
        >
          {stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </Select>
      </FormControl>

      {stations.length === 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          You need to add a station before uploading images.
        </Alert>
      )}

      {selectedStation > 0 && (
        <>
          {/* Drop zone */}
          <Card
            sx={{
              borderRadius: 3, mb: 3, boxShadow: 'none',
              border: `2px dashed ${dragOver ? '#0D47A1' : images.length >= MAX_IMAGES ? '#ef9a9a' : 'rgba(0,0,0,0.15)'}`,
              bgcolor: dragOver ? 'rgba(13,71,161,0.04)' : images.length >= MAX_IMAGES ? 'rgba(211,47,47,0.02)' : '#FAFAFA',
              transition: 'all 0.2s',
              cursor: images.length < MAX_IMAGES ? 'pointer' : 'not-allowed',
              opacity: images.length >= MAX_IMAGES ? 0.7 : 1,
            }}
            onClick={() => images.length < MAX_IMAGES && fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); if (images.length < MAX_IMAGES) setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <CardContent sx={{ py: 5, textAlign: 'center' }}>
              <CloudUploadOutlined sx={{ fontSize: 52, color: dragOver ? '#0D47A1' : '#BDBDBD', mb: 1.5, transition: 'color 0.2s' }} />
              {images.length >= MAX_IMAGES ? (
                <>
                  <Typography variant="h6" fontWeight={700} color="error">Image limit reached</Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                    Delete existing images to upload new ones (max {MAX_IMAGES})
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" fontWeight={700} color={dragOver ? '#0D47A1' : 'text.secondary'}>
                    {dragOver ? 'Drop to upload' : 'Drag & drop images here'}
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                    or click to browse — JPG, PNG, WebP up to {MAX_MB} MB each · {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} remaining
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}
                    onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
                    Browse Files
                  </Button>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                hidden
                onChange={e => { enqueueFiles(e.target.files); if (fileRef.current) fileRef.current.value = '' }}
              />
            </CardContent>
          </Card>

          {/* Upload queue */}
          {queue.length > 0 && (
            <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Upload Queue</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {pendingCount > 0 && <Chip label={`${pendingCount} pending`} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />}
                      {uploadingCount > 0 && <Chip label={`${uploadingCount} uploading`} size="small" color="primary" sx={{ height: 20, fontSize: 11 }} />}
                      {errorCount > 0 && <Chip label={`${errorCount} failed`} size="small" color="error" sx={{ height: 20, fontSize: 11 }} />}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {errorCount > 0 && (
                      <Button size="small" variant="outlined" color="error" sx={{ borderRadius: 2 }}
                        onClick={() => queue.filter(q => q.status === 'error').forEach(retryItem)}>
                        Retry Failed
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="contained"
                      onClick={uploadAll}
                      disabled={isUploading || pendingCount === 0}
                      startIcon={isUploading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <CloudUploadOutlined />}
                      sx={{ borderRadius: 2, background: 'linear-gradient(90deg,#0D47A1,#1565C0)' }}
                    >
                      {isUploading ? 'Uploading…' : `Upload ${pendingCount} file${pendingCount !== 1 ? 's' : ''}`}
                    </Button>
                    {!isUploading && (
                      <Tooltip title="Clear all">
                        <IconButton size="small" onClick={clearQueue}><CloseOutlined fontSize="small" /></IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', bgcolor: '#F8FAFC' } }}>
                        <TableCell sx={{ width: 60 }}>Preview</TableCell>
                        <TableCell>File Name</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell sx={{ width: 200 }}>Progress</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {queue.map(item => (
                        <TableRow key={item.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell>
                            <Box sx={{ width: 44, height: 44, borderRadius: 1.5, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                              <img src={item.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>{item.file.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{formatBytes(item.file.size)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={item.file.type.split('/')[1].toUpperCase()} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                          </TableCell>
                          <TableCell>
                            {item.status === 'uploading' && (
                              <Box>
                                <LinearProgress variant="determinate" value={item.progress} sx={{ borderRadius: 2, height: 5, mb: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">{item.progress}%</Typography>
                              </Box>
                            )}
                            {item.status === 'error' && (
                              <Typography variant="caption" color="error">{item.error}</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {STATUS_ICON[item.status]}
                              <Typography variant="caption" sx={{ textTransform: 'capitalize', color: item.status === 'error' ? 'error.main' : item.status === 'done' ? 'success.main' : 'text.secondary' }}>
                                {item.status}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {item.status !== 'uploading' && (
                              <IconButton size="small" onClick={() => removeFromQueue(item.id)} sx={{ color: 'text.disabled' }}>
                                <CloseOutlined fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Uploaded images */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700} color="#0D1B2A">
              Uploaded Images ({images.length})
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
          ) : images.length === 0 ? (
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ py: 6, textAlign: 'center' }}>
                <ImageOutlined sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary" fontWeight={600}>No images uploaded yet.</Typography>
                <Typography variant="body2" color="text.disabled">Upload station layout blueprints and photos above.</Typography>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, bgcolor: '#F8FAFC', borderBottom: '2px solid rgba(0,0,0,0.06)' } }}>
                        <TableCell sx={{ width: 72 }}>Thumbnail</TableCell>
                        <TableCell>File Name</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Uploaded On</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {images.map((img, i) => (
                        <TableRow key={img.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell>
                            <Box
                              sx={{ width: 52, height: 52, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                              onClick={() => setPreviewImg(img)}
                            >
                              <AuthedImg
                                src={`/stations/images/${img.id}/file`}
                                alt={img.file_name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onClick={() => setPreviewImg(img)}
                                placeholderSize={20}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'rgba(13,71,161,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ImageOutlined sx={{ fontSize: 14, color: '#0D47A1' }} />
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 200 }}>{img.file_name}</Typography>
                                <Typography variant="caption" color="text.disabled">#{i + 1}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{formatBytes(img.file_size)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={img.mime_type?.split('/')[1]?.toUpperCase() ?? 'IMAGE'}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{formatDate(img.created_at)}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Preview">
                              <IconButton size="small" onClick={() => setPreviewImg(img)}
                                sx={{ color: '#0D47A1', '&:hover': { bgcolor: 'rgba(13,71,161,0.08)' }, mr: 0.5 }}>
                                <VisibilityOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete image">
                              <IconButton size="small" onClick={() => setDeleteTarget(img)}
                                sx={{ color: '#d32f2f', '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}>
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" color="text.disabled">
                    {images.length} of {MAX_IMAGES} slots used
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Image preview dialog */}
      <Dialog open={!!previewImg} onClose={() => setPreviewImg(null)} maxWidth="md" PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', bgcolor: '#000' } }}>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setPreviewImg(null)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', zIndex: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            <CloseOutlined />
          </IconButton>
          {previewImg && (
            <AuthedImg
              src={`/stations/images/${previewImg.id}/file`}
              alt={previewImg.file_name}
              style={{ display: 'block', maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
              placeholderSize={48}
            />
          )}
        </Box>
        {previewImg && (
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(0,0,0,0.8)' }}>
            <Typography variant="body2" fontWeight={700} color="#fff">{previewImg.file_name}</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">{formatBytes(previewImg.file_size)} · {formatDate(previewImg.created_at)}</Typography>
          </Box>
        )}
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800} color="#d32f2f">Delete Image</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.file_name}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDeleteImage} sx={{ borderRadius: 2 }}>Delete Image</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack('')}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </DealerLayout>
  )
}
