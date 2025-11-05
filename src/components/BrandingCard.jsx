import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Logo from './Logo';

const BrandingCard = ({ 
  showTitle = true,
  showSubtitle = true,
  variant = 'default',
  size = 'medium',
  sx = {},
  ...props 
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        ...sx
      }}
      {...props}
    >
      <Logo 
        variant={variant}
        size={size}
        sx={{ mb: showTitle ? 1 : 0 }}
      />
      
      {showTitle && (
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1976d2',
            mb: showSubtitle ? 0.5 : 0
          }}
        >
          Reserva Martín Pescador
        </Typography>
      )}
      
      {showSubtitle && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          Tour Virtual 360°
        </Typography>
      )}
    </Paper>
  );
};

export default BrandingCard;