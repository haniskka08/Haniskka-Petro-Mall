import { useState } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Typography, Checkbox,
  FormControlLabel, CircularProgress, Alert, Link as MuiLink, InputAdornment,
  IconButton,
} from '@mui/material'
import { LocalGasStation, Visibility, VisibilityOff, EmailOutlined, LockOutlined } from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES } from '../utils/constants'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      await login({ email, password })
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((d: any) => d?.msg ?? '').join(', ') : 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left branding panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' }, flex: 1, flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(145deg, #0D1B2A 0%, #0D47A1 60%, #1565C0 100%)',
        p: 6, position: 'relative', overflow: 'hidden',
      }}>
        {/* Background circles */}
        <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -100, left: -100 }} />
        <Box sx={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', bottom: -200, right: -200 }} />

        <LocalGasStation sx={{ fontSize: 80, color: '#FF6F00', mb: 3, filter: 'drop-shadow(0 0 24px rgba(255,111,0,0.4))' }} />
        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, textAlign: 'center', mb: 2, fontSize: { md: 36, lg: 42 } }}>
          PetroMall
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontWeight: 300, maxWidth: 320 }}>
          B2B Commercial Space Matchmaking Platform
        </Typography>
        <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 320 }}>
          {['Register petrol stations', 'Configure commercial spaces', 'Connect with top retail brands'].map(t => (
            <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF6F00', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>{t}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right form panel */}
      <Box sx={{
        flex: { xs: 1, md: 'none' }, width: { xs: '100%', md: 480 },
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', p: { xs: 3, md: 6 }, bgcolor: '#fff',
      }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
            <LocalGasStation sx={{ color: '#FF6F00', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={800}>PetroMall</Typography>
          </Box>

          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, color: '#0D1B2A' }}>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Sign in to your dealer account</Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              id="login-email" label="Email Address" type="email" fullWidth
              value={email} onChange={e => setEmail(e.target.value)} required
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> } }}
            />
            <TextField
              id="login-password" label="Password" type={showPwd ? 'text' : 'password'} fullWidth
              value={password} onChange={e => setPassword(e.target.value)} required
              slotProps={{ input: {
                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(p => !p)} edge="end" size="small">
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              } }}
            />
            <FormControlLabel
              control={<Checkbox id="remember-me" checked={remember} onChange={e => setRemember(e.target.checked)} size="small" />}
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <Button
              id="login-submit" type="submit" variant="contained" fullWidth size="large"
              disabled={loading}
              sx={{
                py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: 16,
                background: 'linear-gradient(90deg, #0D47A1, #1565C0)',
                boxShadow: '0 4px 20px rgba(13,71,161,0.35)',
                '&:hover': { boxShadow: '0 6px 28px rgba(13,71,161,0.5)' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary', textAlign: 'center' }}>
            Don't have an account?{' '}
            <MuiLink component={Link} to={ROUTES.REGISTER} sx={{ fontWeight: 600 }} underline="hover">
              Create one
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
