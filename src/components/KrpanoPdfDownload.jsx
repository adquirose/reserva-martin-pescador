import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';

const KrpanoPdfDownload = () => {
  const handleDownloadPdf = () => {
    // URL del PDF del brochure
    const pdfUrl = 'https://lanube360.com/temporales/reserva-martin-pescador2/skin/brochure_RMP_2025.pdf';
    
    // Abrir el PDF en una nueva pestaña
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Tooltip 
      title="Descargar brochure del proyecto (PDF)" 
      placement="right" 
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            fontSize: '1rem',
            fontWeight: 500,
            padding: '8px 12px',
          }
        }
      }}
    >
      <Fab
        aria-label="descargar brochure pdf"
        onClick={handleDownloadPdf}
        sx={{
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
          backgroundColor: 'rgba(255, 87, 34, 0.9)', // Naranja vibrante para PDF
          border: '2px solid white',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          '&:hover': {
            backgroundColor: 'rgba(255, 87, 34, 1)',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        <PdfIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
      </Fab>
    </Tooltip>
  );
};

export default KrpanoPdfDownload;