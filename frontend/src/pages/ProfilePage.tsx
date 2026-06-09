import { useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert,
  Snackbar, CircularProgress, Divider, Avatar, Grid, IconButton,
} from '@mui/material'
import { EditOutlined, SaveOutlined, LockOutlined, PersonOutlined } from '@mui/icons-material'
import DealerLayout from '../layouts/DealerLayout'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'

export default function ProfilePage() {
  const { dealer, refreshMe } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', company_name: '', address: '' })
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [error, setError] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [snack, setSnack] = useState('')

  useEffect(() => {
    if (dealer) {
      setForm({
        full_name: dealer.full_name,
        phone: dealer.phone,
        company_name: dealer.company_name,
        address: dealer.address ?? '',
      })
    }
  }, [dealer])

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))
  const setPwd = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPwdForm(p => ({ ...p, [f]: e.target.value }))

  const handleSaveProfile = async () => {
    setSaving(true); setError('')
    try {
      await authService.updateProfile(form)
      await refreshMe()
      setEditing(false)
      setSnack('Profile updated successfully!')
    } catch (err: any) {
      const d = err?.response?.data?.detail
      setError(typeof d === 'string' ? d : Array.isArray(d) ? d.map((x: any) => x?.msg ?? '').join(', ') : 'Failed to update profile.')
    } finally { setSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.new_password !== pwdForm.confirm_password) { setPwdError('New passwords do not match.'); return }
    if (pwdForm.new_password.length < 8) { setPwdError('Password must be at least 8 characters.'); return }
    setSavingPwd(true); setPwdError('')
    try {
      await authService.changePassword(pwdForm)
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' })
      setSnack('Password changed successfully!')
    } catch (err: any) {
      const d = err?.response?.data?.detail
      setPwdError(typeof d === 'string' ? d : Array.isArray(d) ? d.map((x: any) => x?.msg ?? '').join(', ') : 'Failed to change password.')
    } finally { setSavingPwd(false) }
  }

  return (
    <DealerLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="#0D1B2A">My Profile</Typography>
        <Typography variant="body2" color="text.secondary">Manage your account details</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: '#0D47A1', fontSize: 24, fontWeight: 700 }}>
                    {dealer?.full_name?.[0]?.toUpperCase() ?? 'D'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>{dealer?.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{dealer?.email}</Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setEditing(e => !e)} sx={{ color: editing ? '#0D47A1' : 'text.secondary' }}>
                  <EditOutlined />
                </IconButton>
              </Box>

              {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField id="profile-name" label="Full Name" fullWidth value={form.full_name} onChange={set('full_name')} disabled={!editing} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField id="profile-phone" label="Phone Number" fullWidth value={form.phone} onChange={set('phone')} disabled={!editing} />
                </Grid>
                <Grid size={12}>
                  <TextField id="profile-company" label="Company Name" fullWidth value={form.company_name} onChange={set('company_name')} disabled={!editing} />
                </Grid>
                <Grid size={12}>
                  <TextField id="profile-email" label="Email Address" fullWidth value={dealer?.email ?? ''} disabled
                    helperText="Email cannot be changed" />
                </Grid>
                <Grid size={12}>
                  <TextField id="profile-address" label="Address" fullWidth multiline rows={2} value={form.address} onChange={set('address')} disabled={!editing} />
                </Grid>
              </Grid>

              {editing && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button variant="contained" startIcon={saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveOutlined />}
                    onClick={handleSaveProfile} disabled={saving}
                    sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(90deg,#0D47A1,#1565C0)' }}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                  <Button variant="outlined" onClick={() => { setEditing(false); setError('') }} sx={{ borderRadius: 2 }}>
                    Cancel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Change password */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(230,81,0,0.1)', color: '#E65100', width: 40, height: 40 }}>
                  <LockOutlined />
                </Avatar>
                <Typography variant="h6" fontWeight={700}>Change Password</Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              {pwdError && <Alert severity="error" onClose={() => setPwdError('')} sx={{ mb: 2 }}>{pwdError}</Alert>}

              <Box component="form" onSubmit={handleChangePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField id="pwd-current" label="Current Password" type="password" fullWidth required value={pwdForm.current_password} onChange={setPwd('current_password')} />
                <TextField id="pwd-new" label="New Password" type="password" fullWidth required value={pwdForm.new_password} onChange={setPwd('new_password')} helperText="Minimum 8 characters" />
                <TextField id="pwd-confirm" label="Confirm New Password" type="password" fullWidth required value={pwdForm.confirm_password} onChange={setPwd('confirm_password')}
                  error={!!pwdForm.confirm_password && pwdForm.new_password !== pwdForm.confirm_password}
                  helperText={pwdForm.confirm_password && pwdForm.new_password !== pwdForm.confirm_password ? 'Passwords do not match' : ''} />
                <Button type="submit" variant="contained" disabled={savingPwd}
                  sx={{ borderRadius: 2, background: 'linear-gradient(90deg,#E65100,#F57C00)', boxShadow: '0 4px 16px rgba(230,81,0,0.3)' }}>
                  {savingPwd ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Change Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack('')} message={snack} />
    </DealerLayout>
  )
}
