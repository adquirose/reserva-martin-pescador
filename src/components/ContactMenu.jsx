import React, { useState } from 'react';
import {
  Box,
  Fab,
  Menu,
  MenuItem,
  Typography,
  Divider,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import grupoMartinPescadorLogo from '../assets/grupo-martinpescador.png';

const ContactMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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

  return (
    <>
      <Fab
        color="primary"
        aria-label="menú de contacto"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1002,
          backgroundColor: 'rgba(25, 118, 210, 0.9)',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 1)',
          },
        }}
      >
        <MenuIcon />
      </Fab>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 320,
            maxWidth: 400,
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 0,
            },
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Información de Contacto
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ p: 0 }}>
            <ListItem sx={{ px: 0, pb: 1 }}>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Valentina Hernández"
                secondary="Ejecutiva Comercial"
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </ListItem>

            <Divider sx={{ my: 1 }} />

            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <PhoneIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Link 
                    href="tel:+56981208442" 
                    underline="none" 
                    color="inherit"
                    onClick={handlePhoneClick}
                    sx={{ cursor: 'pointer' }}
                  >
                    +56 9 8120 8442
                  </Link>
                }
                secondary="Teléfono directo"
              />
            </ListItem>

            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <WhatsAppIcon sx={{ color: '#25D366' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Link 
                    onClick={handleWhatsAppClick}
                    underline="none" 
                    color="inherit"
                    sx={{ cursor: 'pointer' }}
                  >
                    Enviar WhatsApp
                  </Link>
                }
                secondary="+56 9 8120 8442"
              />
            </ListItem>

            <Divider sx={{ my: 1 }} />

            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <EmailIcon color="info" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Link 
                    href="mailto:vhernandez@hfo.cl"
                    underline="none" 
                    color="inherit"
                    onClick={() => handleEmailClick('vhernandez@hfo.cl')}
                    sx={{ cursor: 'pointer' }}
                  >
                    vhernandez@hfo.cl
                  </Link>
                }
                secondary="Email personal"
              />
            </ListItem>

            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <EmailIcon color="info" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Link 
                    href="mailto:huillinco@grupomartinpescador.cl"
                    underline="none" 
                    color="inherit"
                    onClick={() => handleEmailClick('huillinco@grupomartinpescador.cl')}
                    sx={{ cursor: 'pointer' }}
                  >
                    huillinco@grupomartinpescador.cl
                  </Link>
                }
                secondary="Email proyecto"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Branding "Un proyecto de" dentro del menú */}
          <Box sx={{ textAlign: 'center', pt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontWeight: 'medium',
                mb: 1
              }}
            >
              Un proyecto de
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                component="img"
                src={grupoMartinPescadorLogo}
                alt="Grupo Martín Pescador"
                sx={{
                  maxHeight: '60px',
                  width: 'auto',
                  backgroundColor: '#1976d2', // Fondo azul para contrastar con logo blanco
                  padding: '8px 12px',
                  borderRadius: '6px',
                  filter: 'brightness(1.1)' // Realzar el logo
                }}
              />
            </Box>
          </Box>
        </Box>
      </Menu>
    </>
  );
};

export default ContactMenu;