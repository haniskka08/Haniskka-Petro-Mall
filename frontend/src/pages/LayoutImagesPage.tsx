import { useEffect, useRef, useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Alert, Snackbar, CircularProgress,
  MenuItem, Select, FormControl, InputLabel, IconButton, Tooltip, LinearProgress,
} from '@mui/material'
import { DeleteOutlined, CloudUploadOutlined, ImageOutlined } from '@mui/icons-material'
import DealerLayout from '../layouts/DealerLayout'
import apiClient from '../services/apiClient'

interface Station { id: number; name: string }
interface StationImage { id: number; file_name: string; file_path: string; file_size?: number; mime_type?: string; created_at: string }

const MAX_MB = 10
const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp']

export default function LayoutImagesPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState(0)
  const [images, setImages] = useState<StationImage[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiClient.get<Station[]>('/stations/').then(r => {
      setStations(r.data)
      if (r.data.length > 0) setSelectedStation(r.data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedStation) return
    setLoading(true)
    apiClient.get<StationImage[]>(`/stations/${selectedStation}/images`)
      .then(r => setImages(r.data))
      .catch(() => setError('Failed to load images.'))
      .finally(() => setLoading(false))
  }, [selectedStation])

  const validateFile = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED.includes(ext)) { setError(`Invalid file type. Allowed: ${ALLOWED.join(', ')}`); return false }
    if (file.size > MAX_MB * 1024 * 1024) { setError(`File too large. Max ${MAX_MB}MB.`); return false }
    return true
  }

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return
    setUploading(true); setUploadProgress(0)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const r = await apiClient.post<StationImage>(`/stations/${selectedStation}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / (e.total ?? 1))),
      })
      setImages(p => [...p, r.data]); setSnack('Image uploaded successfully!')
    } catch (err: any) { setError(err?.response?.data?.detail ?? 'Upload failed.') }
    finally { setUploading(false); setUploadProgress(0) }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || !selectedStation) return
    Array.from(files).forEach(f => uploadFile(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const deleteImage = async (id: number) => {
    try { await apiClient.delete(`/stations/images/${id}`); setImages(p => p.filter(img => img.id !== id)); setSnack('Image deleted.') }
    catch { setError('Failed to delete image.') }
  }

  const formatSize = (bytes?: number) => bytes ? `${(bytes / 1024).toFixed(1)} KB` : '—'

  return (
    <DealerLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="#0D1B2A">Layout Images</Typography>
        <Typography variant="body2" color="text.secondary">Upload station layout blueprints and photos</Typography>
      </Box>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      <FormControl size="small" sx={{ mb: 3, minWidth: 360 }}>
        <InputLabel>Select Station</InputLabel>
        <Select value={selectedStation} label="Select Station" onChange={e => setSelectedStation(Number(e.target.value))}>
          {stations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </Select>
      </FormControl>

      {/* Drop zone */}
      <Card sx={{
        borderRadius: 3, border: `2px dashed ${dragOver ? '#0D47A1' : 'rgba(0,0,0,0.15)'}`,
        bgcolor: dragOver ? 'rgba(13,71,161,0.04)' : '#FAFAFA', mb: 3,
        boxShadow: 'none', transition: 'all 0.2s',
        cursor: selectedStation ? 'pointer' : 'default',
      }}
        onClick={() => selectedStation && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}>
        <CardContent sx={{ py: 5, textAlign: 'center' }}>
          <CloudUploadOutlined sx={{ fontSize: 56, color: dragOver ? '#0D47A1' : '#BDBDBD', mb: 1.5, transition: 'color 0.2s' }} />
          <Typography variant="h6" fontWeight={700} color={dragOver ? '#0D47A1' : 'text.secondary'}>
            {dragOver ? 'Drop to upload' : 'Drag & drop images here'}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
            or click to browse — JPG, PNG, WebP up to {MAX_MB}MB
          </Typography>
          <Button variant="outlined" size="small" sx={{ borderRadius: 2 }} onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
            Browse Files
          </Button>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple hidden onChange={e => handleFiles(e.target.files)} />
        </CardContent>
      </Card>

      {uploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Uploading… {uploadProgress}%</Typography>
          <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 2, height: 6 }} />
        </Box>
      )}

      {/* Image grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : images.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ImageOutlined sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No images uploaded yet for this station.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {images.map(img => (
            <Card key={img.id} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', position: 'relative', '&:hover .overlay': { opacity: 1 } }}>
              <Box sx={{ height: 160, bgcolor: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img
                  src={`/api/v1/stations/images/${img.id}/file`}
                  alt={img.file_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </Box>
              {/* Hover overlay */}
              <Box className="overlay" sx={{
                position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}>
                <Tooltip title="Delete image">
                  <IconButton onClick={() => deleteImage(img.id)} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', '&:hover': { bgcolor: '#d32f2f' } }}>
                    <DeleteOutlined />
                  </IconButton>
                </Tooltip>
              </Box>
              <CardContent sx={{ p: '10px !important' }}>
                <Typography variant="caption" fontWeight={600} noWrap display="block">{img.file_name}</Typography>
                <Typography variant="caption" color="text.secondary">{formatSize(img.file_size)}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
    </DealerLayout>
  )
}
