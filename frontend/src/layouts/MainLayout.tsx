import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material'
import { LocalGasStation } from '@mui/icons-material'
import { APP_NAME } from '../utils/constants'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <LocalGasStation sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {APP_NAME}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Dealer Module
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  )
}
