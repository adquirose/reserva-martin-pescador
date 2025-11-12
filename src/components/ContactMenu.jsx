import React, { useState } from 'react';
import {
  Box,
  Modal,
  Typography,
  Divider,
  Fab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Tooltip
} from '@mui/material';
import {
  Info as InfoIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Close as CloseIcon,
  Explore as ExploreIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import grupoMartinPescadorLogo from '../assets/grupo-martinpescador.png';

const ContactMenu = () => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '56981208442'; // +56 9 8120 8442
    const message = 'Hola, me interesa obtener más información sobre Reserva Martín Pescador';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    handleClose();
  };

  const handlePhoneClick = () => {
    window.open('tel:+56981208442', '_self');
    handleClose();
  };

  const handleEmailClick = (email) => {
    window.open(`mailto:${email}`, '_self');
    handleClose();
  };

  const handleWazeClick = () => {
    // Coordenadas del proyecto Martín Pescador
    const lat = -42.6736055;
    const lng = -73.9892090;
    const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes&zoom=17`;
    window.open(wazeUrl, '_blank');
    handleClose();
  };

  const handleGoogleMapsClick = () => {
    // Coordenadas del proyecto Martín Pescador
    const lat = -42.6736055;
    const lng = -73.9892090;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
    handleClose();
  };

  return (
    <>
      <Tooltip 
        title="Información de contacto y ubicación" 
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
          aria-label="información de contacto"
          onClick={handleClick}
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            backgroundColor: 'rgba(33, 150, 243, 0.9)', // Azul vibrante
            border: '2px solid white',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 1)',
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
          <InfoIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
        </Fab>
      </Tooltip>

      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          sx={{
            minWidth: 320,
            maxWidth: 380,
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            outline: 'none',
          }}
        >
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            pb: 1,
            borderBottom: '2px solid',
            borderColor: 'primary.main'
          }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Información de Contacto
            </Typography>
            <Fab 
              size="small" 
              onClick={handleClose}
              sx={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' },
                width: 32,
                height: 32,
                minHeight: 32,
              }}
            >
              <CloseIcon sx={{ fontSize: '1rem' }} />
            </Fab>
          </Box>

          <List sx={{ p: 0 }}>
            <Box sx={{ 
              backgroundColor: 'rgba(25, 118, 210, 0.05)', 
              borderRadius: '8px', 
              p: 1.5, 
              mb: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  backgroundColor: 'primary.main',
                  borderRadius: '50%',
                  p: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Valentina Hernández
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ejecutiva Comercial
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <Box sx={{
                flex: 1,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderRadius: '8px',
                p: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { 
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={handlePhoneClick}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="success" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Llamar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      +56 9 8120 8442
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{
                flex: 1,
                backgroundColor: 'rgba(37, 211, 102, 0.1)',
                borderRadius: '8px',
                p: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { 
                  backgroundColor: 'rgba(37, 211, 102, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={handleWhatsAppClick}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WhatsAppIcon sx={{ color: '#25D366' }} />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      WhatsApp
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Mensaje directo
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ 
              backgroundColor: 'rgba(33, 150, 243, 0.05)', 
              borderRadius: '8px', 
              p: 1.5, 
              mb: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{
                  backgroundColor: 'info.main',
                  borderRadius: '50%',
                  p: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 0.2
                }}>
                  <EmailIcon sx={{ color: 'white', fontSize: '1.1rem' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary" sx={{ mb: 0.5 }}>
                    Correos electrónicos
                  </Typography>
                  <Link 
                    href="mailto:vhernandez@hfo.cl"
                    underline="hover" 
                    color="info.main"
                    onClick={() => handleEmailClick('vhernandez@hfo.cl')}
                    sx={{ cursor: 'pointer', fontSize: '0.9rem', display: 'block', mb: 0.3 }}
                  >
                    vhernandez@hfo.cl
                  </Link>
                  <Link 
                    href="mailto:huillinco@grupomartinpescador.cl"
                    underline="hover" 
                    color="info.main"
                    onClick={() => handleEmailClick('huillinco@grupomartinpescador.cl')}
                    sx={{ cursor: 'pointer', fontSize: '0.9rem', display: 'block' }}
                  >
                    huillinco@grupomartinpescador.cl
                  </Link>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 'bold',
                  mb: 1.5,
                  textAlign: 'center',
                  fontSize: '1rem'
                }}
              >
                ¿Cómo llegar al proyecto?
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Box sx={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 212, 170, 0.1)',
                  borderRadius: '8px',
                  p: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 212, 170, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={handleWazeClick}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ExploreIcon 
                      sx={{ 
                        color: '#ffffff',
                        backgroundColor: '#00D4AA',
                        borderRadius: '50%',
                        padding: '6px',
                        fontSize: '28px'
                      }} 
                    />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Waze
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Navegación GPS
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{
                  flex: 1,
                  backgroundColor: 'rgba(234, 67, 53, 0.1)',
                  borderRadius: '8px',
                  p: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    backgroundColor: 'rgba(234, 67, 53, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={handleGoogleMapsClick}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon 
                      sx={{ 
                        color: '#ffffff',
                        backgroundColor: '#EA4335',
                        borderRadius: '20%',
                        padding: '6px',
                        fontSize: '28px'
                      }} 
                    />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Google Maps
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ver ubicación
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </List>

          <Box sx={{ 
            borderTop: '1px solid', 
            borderColor: 'divider', 
            pt: 2, 
            textAlign: 'center' 
          }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 'medium',
                mb: 1.5
              }}
            >
              Un proyecto de
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              p: 1,
              backgroundColor: 'rgba(25, 118, 210, 0.05)',
              borderRadius: '8px'
            }}>
              <Box
                component="img"
                src={grupoMartinPescadorLogo}
                alt="Grupo Martín Pescador"
                sx={{
                  maxHeight: '50px',
                  width: 'auto',
                  backgroundColor: '#1976d2',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  filter: 'brightness(1.1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Box>
          </Box>
        </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default ContactMenu;