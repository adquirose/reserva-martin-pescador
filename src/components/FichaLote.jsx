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
  LocationOn as LocationIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon
} from '@mui/icons-material';

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

  // Formatear precio
  const formatearPrecio = (precio) => {
    if (!precio || precio === null || precio === undefined) return 'Consultar precio';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio);
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
            Lote {lote.html || lote.numero}
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Estado */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="action" />
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
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <HomeIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Número:
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {lote.numero}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Etapa:
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {lote.etapa || 'No especificada'}
              </Typography>
            </Grid>

            {/* Precio */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MoneyIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Precio:
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                color={lote.estado === 'disponible' ? 'primary.main' : 'text.secondary'}
              >
                {formatearPrecio(lote.precio)}
              </Typography>
            </Grid>

            {/* Superficies */}
            {lote.superficieLote && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Superficie Lote:
                </Typography>
                <Typography variant="body1">
                  {lote.superficieLote} m²
                </Typography>
              </Grid>
            )}

            {lote.superficieTotal && (
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Superficie Total:
                </Typography>
                <Typography variant="body1">
                  {lote.superficieTotal} m²
                </Typography>
              </Grid>
            )}

            {lote.superficieTransito && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Superficie Tránsito:
                </Typography>
                <Typography variant="body1">
                  {lote.superficieTransito} m²
                </Typography>
              </Grid>
            )}
          </Grid>

          {/* Información adicional */}
          {lote.descripcion && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Descripción:
              </Typography>
              <Typography variant="body1">
                {lote.descripcion}
              </Typography>
            </>
          )}
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
                console.log('Consultar lote:', lote.numero);
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
                console.log('Consultar reserva:', lote.numero);
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