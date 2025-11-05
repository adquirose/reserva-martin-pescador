import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Box,
  Typography,
  Button,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { Explore } from '@mui/icons-material';
import { showTour } from '../store/features/tour/tourSlice';

const TourButton = ({ variant = 'contained', size = 'large', fullWidth = false }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleStartTour = async () => {
    setLoading(true);
    
    // Simular un pequeño delay para mostrar el loading
    await new Promise(resolve => setTimeout(resolve, 800));
    
    dispatch(showTour());
    setLoading(false);
  };

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Explore />}
        onClick={handleStartTour}
        disabled={loading}
        sx={{
          minHeight: size === 'large' ? 48 : 36,
        }}
      >
        {loading ? 'Cargando Tour...' : 'Ver Tour 360°'}
      </Button>

      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: 999,
          backdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(0,0,0,0.7)'
        }}
        open={loading}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Preparando Tour Virtual...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Cargando experiencia 360°
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
};

export default TourButton;