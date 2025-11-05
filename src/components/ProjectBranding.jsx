import React from 'react';
import { Box, Typography } from '@mui/material';
import Logo from './Logo';

const ProjectBranding = ({ sx = {}, ...props }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        padding: 2,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        ...sx
      }}
      {...props}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#666',
          fontWeight: 'medium',
          mb: 1,
          textAlign: 'center'
        }}
      >
        Un proyecto de
      </Typography>
      
      <Logo 
        variant="grupo"
        size="small"
        sx={{
          maxHeight: '32px',
          width: 'auto'
        }}
      />
    </Box>
  );
};

export default ProjectBranding;