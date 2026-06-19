import { AppBar, Box, Container, Toolbar, Typography, Button } from '@mui/material'
import { LocalGasStation } from '@mui/icons-material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../utils/constants'
import { useAuth } from '../contexts/AuthContext'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { dealer, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.HOME)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <LocalGasStation sx={{ mr: 1.5 }} />
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to={ROUTES.HOME}
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            {APP_NAME}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mr: 3, display: { xs: 'none', sm: 'block' } }}>
            Dealer Module
          </Typography>

          {dealer ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={RouterLink} to={ROUTES.DASHBOARD}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={RouterLink} to={ROUTES.LOGIN}>
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to={ROUTES.REGISTER}>
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  )
}
