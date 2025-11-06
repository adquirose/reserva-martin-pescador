import React from 'react';
import { Box } from '@mui/material';
import logoFinal from '../assets/logo-final.png';

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

  // Definir keyframes para pulso simple
  const pulseAnimation = {
    '@keyframes pulse': {
      '0%': {
        opacity: 1,
        transform: 'scale(1)',
      },
      '50%': {
        opacity: 0.7,
        transform: 'scale(1.03)',
      },
      '100%': {
        opacity: 1,
        transform: 'scale(1)',
      },
    },
  };

  return (
    <Box
      component="img"
      src={logoFinal} // Solo usar el logo de color
      alt="Reserva Martín Pescador Logo"
      sx={{
        ...getSizeStyles(),
        objectFit: 'contain',
        display: 'block',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
        // Animación de pulso simple
        ...pulseAnimation,
        animation: 'pulse 2s ease-in-out infinite',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.8)) brightness(1.1)',
        },
        ...sx
      }}
      {...props}
    />
  );
};

export default Logo;