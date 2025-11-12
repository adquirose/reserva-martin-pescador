import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Divider,
  Grid,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  RequestQuote as PriceIcon
} from '@mui/icons-material';
import ImageCarousel from './ImageCarousel';

const FichaLote = ({ lote, onClose, open }) => {
  if (!open || !lote) return null;

  // Determinar color del estado
  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'disponible': return 'success';
      case 'vendido': return 'error';
      case 'reservado': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 2
      }}
      onClick={onClose}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          m: 2
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Typography variant="h5" component="h2">
            Lote {lote.numero}
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Carousel de imágenes - solo si hay imágenes */}
        {lote.imagenes && lote.imagenes.length > 0 && (
          <ImageCarousel 
            loteId={lote.id || lote.numero} 
            images={lote.imagenes}
            height={250} 
          />
        )}        <CardContent sx={{ p: 3 }}>
          {/* Estado */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="action" fontSize="medium" />
            <Typography variant="body2" color="text.secondary">
              Estado:
            </Typography>
            <Chip 
              label={lote.estado?.toUpperCase() || 'SIN ESTADO'}
              color={getEstadoColor(lote.estado)}
              size="small"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Información básica */}
          <Grid container spacing={2}>
            {/* Precio */}
            {lote.precio && (
              <Grid size={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PriceIcon color="primary" fontSize="medium" />
                  <Typography variant="body2" color="text.secondary">
                    Precio:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    UF {typeof lote.precio === 'number' ? lote.precio.toLocaleString('es-CL') : lote.precio}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {/* Superficie */}
            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeIcon color="action" fontSize="medium" />
                <Typography variant="body2" color="text.secondary">
                  Superficie:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {lote.superficie ? `${lote.superficie} m²` : 
                   lote.superficieLote ? `${lote.superficieLote} m²` : 
                   'No especificada'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>

        {/* Acciones */}
        <CardActions sx={{ p: 2, pt: 0 }}>
          {lote.estado === 'disponible' && (
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => {
                // Aquí se podría implementar lógica de contacto/reserva
              }}
            >
              Consultar Disponibilidad
            </Button>
          )}
          
          {lote.estado === 'reservado' && (
            <Button 
              variant="outlined" 
              color="warning" 
              fullWidth
              onClick={() => {
                // Acción de consulta
              }}
            >
              Consultar Reserva
            </Button>
          )}

          {lote.estado === 'vendido' && (
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth
              disabled
            >
              Lote Vendido
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  );
};

export default FichaLote;