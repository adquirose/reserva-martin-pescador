import React from 'react';
import { Box } from '@mui/material';
import logoImage from '../assets/logo.png';
import logo1Image from '../assets/logo1.png';
import logoWsImage from '../assets/logo-ws.png';

const Logo = ({ 
  variant = 'default', 
  size = 'medium',
  sx = {},
  ...props 
}) => {
  // Seleccionar la imagen del logo según la variante
  const getLogoSrc = () => {
    switch (variant) {
      case 'white':
        return logoWsImage;
      case 'alt':
        return logo1Image;
      default:
        return logoImage;
    }
  };

  // Configurar tamaños predefinidos
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { maxHeight: '40px', width: 'auto' };
      case 'large':
        return { maxHeight: '120px', width: 'auto' };
      case 'medium':
      default:
        return { maxHeight: '60px', width: 'auto' };
    }
  };

  return (
    <Box
      component="img"
      src={getLogoSrc()}
      alt="Reserva Martín Pescador Logo"
      sx={{
        ...getSizeStyles(),
        objectFit: 'contain',
        display: 'block',
        ...sx
      }}
      {...props}
    />
  );
};

export default Logo;