import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectLoadingMessage } from '../store/features/loading/loadingSlice';

const LoadingScreen = ({ message, fullScreen = true }) => {
  const defaultMessage = useSelector(selectLoadingMessage);
  
  const containerStyles = {
    position: fullScreen ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  return (
    <Box sx={containerStyles}>
      <CircularProgress 
        size={60} 
        sx={{ 
          color: '#fff',
          mb: 2
        }} 
      />
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#fff',
          textAlign: 'center',
          fontWeight: 300,
          maxWidth: '300px'
        }}
      >
        {message || defaultMessage}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;