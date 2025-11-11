import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  LocationOn,
  Phone,
  Email,
  Wifi,
  Pool,
  Restaurant,
  LocalParking
} from '@mui/icons-material';
import TourButton from './TourButton';

const ReservaInfo = () => {
  const amenities = [
    { icon: <Wifi />, text: 'WiFi Gratuito' },
    { icon: <Pool />, text: 'Piscina' },
    { icon: <Restaurant />, text: 'Restaurante' },
    { icon: <LocalParking />, text: 'Estacionamiento' },
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h4" component="h2" gutterBottom>
              Reserva Martín Pescador
            </Typography>
            <Typography variant="body1" paragraph>
              Ubicada en un entorno natural privilegiado, nuestra reserva ofrece una experiencia única 
              de contacto con la naturaleza. Disfruta de instalaciones modernas en armonía con el 
              ambiente natural que nos rodea.
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Servicios y Comodidades
              </Typography>
              <Grid container spacing={1}>
                {amenities.map((amenity, index) => (
                  <Grid item key={index}>
                    <Chip 
                      icon={amenity.icon} 
                      label={amenity.text} 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Explora nuestras instalaciones
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Recorre cada rincón con nuestro tour virtual interactivo
              </Typography>
              <TourButton size="large" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información de Contacto
            </Typography>
            <List>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon>
                  <LocationOn color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Dirección"
                  secondary="Reserva Natural, Colombia"
                />
              </ListItem>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Teléfono"
                  secondary="+57 (123) 456-7890"
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email"
                  secondary="info@martinpescador.com"
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <TourButton variant="outlined" fullWidth />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ReservaInfo;