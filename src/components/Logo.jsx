import React from 'react';
import { Box } from '@mui/material';
import logoBlancoFinal from '../assets/logo-blanco-final.png';

const Logo = ({ 
  size = 'medium',
  sx = {},
  ...props 
}) => {




  // Configurar tamaños predefinidos con responsive design
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { 
          maxHeight: { xs: '35px', sm: '40px' },
          width: 'auto' 
        };
      case 'large':
        return { 
          maxHeight: { xs: '100px', sm: '140px', md: '180px', lg: '200px' },
          width: 'auto' 
        };
      case 'medium':
      default:
        return { 
          maxHeight: { xs: '50px', sm: '60px', md: '80px' },
          width: 'auto' 
        };
    }
  };

  return (
    <Box
      sx={{
        display: 'inline-block',
        ...sx
      }}
      {...props}
    >
      <Box
        component="img"
        src={logoBlancoFinal}
        alt="Reserva Martín Pescador Logo"
        sx={{
          ...getSizeStyles(),
          objectFit: 'contain',
          display: 'block',
          // Logo estático sin animaciones
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
          transition: 'filter 0.3s ease',
          '&:hover': {
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3)) brightness(1.05)',
          },
        }}
      />
    </Box>
  );
};

export default Logo;