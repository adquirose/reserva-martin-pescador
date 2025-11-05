import React from 'react'
import { useSelector } from 'react-redux'
import { 
  Container, 
  Typography, 
  AppBar, 
  Toolbar,
  Box,
  Paper
} from '@mui/material'
import Counter from './components/Counter'
import KrpanoTour from './components/KrpanoTour'
import TourButton from './components/TourButton'
import ReservaInfo from './components/ReservaInfo'
import TourOverlay from './components/TourOverlay'

function App() {
  const showTourState = useSelector((state) => state.tour.showTour);

  return (
    <>
      {/* Tour de Krpano a pantalla completa */}
      {showTourState && (
        <>
          <KrpanoTour />
          <TourOverlay />
        </>
      )}

      {/* Contenido principal - solo visible cuando no está el tour */}
      {!showTourState && (
        <>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Reserva Martín Pescador
              </Typography>
              <TourButton variant="outlined" size="medium" />
            </Toolbar>
          </AppBar>
          
          <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                  ¡Bienvenido a Reserva Martín Pescador!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Descubre nuestras instalaciones con el tour virtual 360°
                </Typography>
                <TourButton size="large" />
              </Paper>
              
              <ReservaInfo />
              
              {/* Componente Counter como demo de Redux */}
              <Box sx={{ mt: 4 }}>
                <Counter />
              </Box>
            </Box>
          </Container>
        </>
      )}
    </>
  )
}

export default App
