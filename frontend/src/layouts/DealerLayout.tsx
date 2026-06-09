import { useState } from 'react'
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Divider, Tooltip,
  useTheme, useMediaQuery,
} from '@mui/material'
import {
  Dashboard, LocalGasStation, StoreOutlined, ElectricalServices,
  StorefrontOutlined, ImageOutlined, PersonOutlined, LogoutOutlined,
  MenuOutlined,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES } from '../utils/constants'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: ROUTES.DASHBOARD },
  { label: 'Stations', icon: <LocalGasStation />, path: ROUTES.STATIONS },
  { label: 'Spaces', icon: <StoreOutlined />, path: ROUTES.SPACES },
  { label: 'Utilities', icon: <ElectricalServices />, path: ROUTES.UTILITIES },
  { label: 'Preferred Brands', icon: <StorefrontOutlined />, path: ROUTES.PREFERRED_BRANDS },
  { label: 'Upload Layouts', icon: <ImageOutlined />, path: ROUTES.IMAGES },
  { label: 'Profile', icon: <PersonOutlined />, path: ROUTES.PROFILE },
]

interface Props { children: React.ReactNode }

export default function DealerLayout({ children }: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { dealer, logout } = useAuth()

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN) }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0D1B2A' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LocalGasStation sx={{ color: '#FF6F00', fontSize: 32 }} />
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1, fontSize: 18 }}>
            PetroMall
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
            Dealer Portal
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2, mb: 1 }} />

      {/* Nav */}
      <List sx={{ flex: 1, px: 1 }}>
        {NAV_ITEMS.map(({ label, icon, path }) => {
          const active = location.pathname === path
          return (
            <ListItemButton
              key={path}
              onClick={() => { navigate(path); if (isMobile) setMobileOpen(false) }}
              sx={{
                borderRadius: 2, mb: 0.5, color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                bgcolor: active ? 'rgba(255,111,0,0.18)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', color: '#fff' },
                transition: 'all 0.15s',
              }}
            >
              <ListItemIcon sx={{ color: active ? '#FF6F00' : 'rgba(255,255,255,0.4)', minWidth: 40 }}>
                {icon}
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }} />
              {active && <Box sx={{ width: 3, height: 24, bgcolor: '#FF6F00', borderRadius: 4 }} />}
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />
      {/* Dealer info + logout */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#FF6F00', fontSize: 14, fontWeight: 700 }}>
          {dealer?.full_name?.[0]?.toUpperCase() ?? 'D'}
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body2" noWrap sx={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>
            {dealer?.full_name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
            {dealer?.company_name}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} size="small" sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#FF6F00' } }}>
            <LogoutOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6F8' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: DRAWER_WIDTH, border: 'none' } }}>
          {drawer}
        </Drawer>
      ) : (
        <Drawer variant="permanent"
          PaperProps={{ sx: { width: DRAWER_WIDTH, border: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.1)' } }}>
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: isMobile ? 0 : `${DRAWER_WIDTH}px` }}>
        {/* Top AppBar */}
        <AppBar position="sticky" elevation={0}
          sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', color: 'text.primary' }}>
          <Toolbar>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} edge="start" sx={{ mr: 2 }}>
                <MenuOutlined />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, color: '#0D1B2A' }}>
              {NAV_ITEMS.find(n => n.path === location.pathname)?.label ?? 'PetroMall'}
            </Typography>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#0D47A1', fontSize: 14, fontWeight: 700 }}>
              {dealer?.full_name?.[0]?.toUpperCase() ?? 'D'}
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
