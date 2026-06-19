/**
 * AuthedImg — fetches an image via the authenticated apiClient and renders it.
 * Needed because native <img src="..."> tags never send the Authorization header,
 * causing 401 errors when the backend endpoint requires authentication.
 */
import { useEffect, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { ImageOutlined, BrokenImageOutlined } from '@mui/icons-material'
import apiClient from '../services/apiClient'

interface AuthedImgProps {
  /** API path relative to base URL, e.g. "/stations/images/5/file" */
  src: string
  alt?: string
  style?: React.CSSProperties
  onClick?: () => void
  placeholderSize?: number
}

export default function AuthedImg({
  src,
  alt = '',
  style,
  onClick,
  placeholderSize = 24,
}: AuthedImgProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    let objectUrl = ''
    setStatus('loading')
    setBlobUrl(null)

    apiClient.get(src, { responseType: 'blob' })
      .then(r => {
        objectUrl = URL.createObjectURL(r.data)
        setBlobUrl(objectUrl)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))

    // Revoke object URL on unmount or when src changes (prevents memory leaks)
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [src])

  if (status === 'loading') {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.04)' }}>
        <CircularProgress size={placeholderSize * 0.6} thickness={4} />
      </Box>
    )
  }

  if (status === 'error' || !blobUrl) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.04)' }}>
        <BrokenImageOutlined sx={{ fontSize: placeholderSize, color: 'text.disabled' }} />
      </Box>
    )
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      style={{ display: 'block', ...style }}
      onClick={onClick}
    />
  )
}
