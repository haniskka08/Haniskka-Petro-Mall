import { useState } from 'react'
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  Link as MuiLink, InputAdornment, LinearProgress, Grid,
} from '@mui/material'
import {
  LocalGasStation, PersonOutlined, EmailOutlined,
  LockOutlined, PhoneOutlined, BusinessOutlined,
} from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES } from '../utils/constants'

function getPasswordStrength(pwd: string) {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['', '#f44336', '#ff9800', '#2196f3', '#4caf50']

// Safely convert any API error to a string
function toErrorString(detail: unknown): string {
  if (!detail) return ''
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(', ')
  }
  if (typeof detail === 'object') return JSON.stringify(detail)
  return String(detail)
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', company_name: '', password: '', confirm_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const strength = getPasswordStrength(form.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate(ROUTES.LOGIN), 2000)
    } catch (err: any) {
      setError(toErrorString(err?.response?.data?.detail) || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left branding */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' }, flex: 1, flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(145deg, #0D1B2A 0%, #1A237E 60%, #283593 100%)',
        p: 6, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: -150, right: -150 }} />
        <LocalGasStation sx={{ fontSize: 72, color: '#FF6F00', mb: 3, filter: 'drop-shadow(0 0 20px rgba(255,111,0,0.4))' }} />
        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, textAlign: 'center', mb: 2 }}>Join PetroMall</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', textAlign: 'center', maxWidth: 300 }}>
          Create your dealer account and start listing your petrol station commercial spaces.
        </Typography>
      </Box>

      {/* Right form */}
      <Box sx={{
        flex: { xs: 1, md: 'none' }, width: { xs: '100%', md: 520 },
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', p: { xs: 3, md: 5 }, bgcolor: '#fff', overflowY: 'auto',
      }}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
            <LocalGasStation sx={{ color: '#FF6F00', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={800}>PetroMall</Typography>
          </Box>

          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, color: '#0D1B2A' }}>Create Account</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Fill in your details to get started</Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Account created! Redirecting to login…</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* MUI v9: use size prop instead of item xs */}
              <Grid size={12}>
                <TextField id="reg-full-name" label="Full Name" fullWidth required value={form.full_name} onChange={set('full_name')}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              </Grid>
              <Grid size={12}>
                <TextField id="reg-email" label="Email Address" type="email" fullWidth required value={form.email} onChange={set('email')}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField id="reg-phone" label="Phone Number" fullWidth required value={form.phone} onChange={set('phone')}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField id="reg-company" label="Company Name" fullWidth required value={form.company_name} onChange={set('company_name')}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><BusinessOutlined sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              </Grid>
              <Grid size={12}>
                <TextField id="reg-password" label="Password" type="password" fullWidth required value={form.password} onChange={set('password')}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
                {form.password && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress variant="determinate" value={strength * 25}
                      sx={{ height: 4, borderRadius: 2, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: STRENGTH_COLORS[strength] } }} />
                    <Typography variant="caption" sx={{ color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</Typography>
                  </Box>
                )}
              </Grid>
              <Grid size={12}>
                <TextField id="reg-confirm" label="Confirm Password" type="password" fullWidth required value={form.confirm_password} onChange={set('confirm_password')}
                  error={!!form.confirm_password && form.password !== form.confirm_password}
                  helperText={form.confirm_password && form.password !== form.confirm_password ? 'Passwords do not match' : ''}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlined sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment> } }} />
              </Grid>
            </Grid>

            <Button id="reg-submit" type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{
              mt: 3, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: 16,
              background: 'linear-gradient(90deg, #0D47A1, #1565C0)',
              boxShadow: '0 4px 20px rgba(13,71,161,0.35)',
            }}>
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary', textAlign: 'center' }}>
            Already have an account?{' '}
            <MuiLink component={Link} to={ROUTES.LOGIN} sx={{ fontWeight: 600 }} underline="hover">Sign in</MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
