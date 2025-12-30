import React, { useEffect, useState } from 'react';
import { Fab } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const whatsappNumber = '56981208442';
const whatsappMessage = 'Hola, Necesito información de Reserva Huillinco';
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

function WhatsappFloatingButton() {
  const [thumbsVisible, setThumbsVisible] = useState(true); // Inicia TRUE porque la barra de thumbs está visible por defecto

  useEffect(() => {
    const handleThumbsShow = () => {
      console.log('🟢 REACT: Thumbs SHOW recibido - cambiando estado a TRUE');
      setThumbsVisible(prev => {
        console.log('🔄 Estado anterior:', prev, '-> nuevo estado: true');
        return true;
      });
    };
    
    const handleThumbsHide = () => {
      console.log('🔴 REACT: Thumbs HIDE recibido - cambiando estado a FALSE'); 
      setThumbsVisible(prev => {
        console.log('🔄 Estado anterior:', prev, '-> nuevo estado: false');
        return false;
      });
    };
    
    window.addEventListener('krpano-thumbs-show', handleThumbsShow);
    window.addEventListener('krpano-thumbs-hide', handleThumbsHide);
    
    // Test manual para eventos
    window.testWhatsappButton = () => {
      setThumbsVisible(prev => !prev);
    };
    
    // Test manual para eventos desde consola
    window.testEventShow = () => {
      console.log('🧪 Disparando evento manual krpano-thumbs-show');
      window.dispatchEvent(new CustomEvent('krpano-thumbs-show'));
    };
    
    window.testEventHide = () => {
      console.log('🧪 Disparando evento manual krpano-thumbs-hide');
      window.dispatchEvent(new CustomEvent('krpano-thumbs-hide'));
    };
    
    console.log('🎯 WhatsApp: Event listeners registrados');
    
    return () => {
      window.removeEventListener('krpano-thumbs-show', handleThumbsShow);
      window.removeEventListener('krpano-thumbs-hide', handleThumbsHide);
      delete window.testWhatsappButton;
      delete window.testEventShow;
      delete window.testEventHide;
    };
  }, []);

  const fabStyle = {
    position: 'fixed !important',
    bottom: '24px !important', 
    right: '24px !important',
    zIndex: 99999,
    transform: thumbsVisible ? 'translateY(-130px)' : 'translateY(-60px)', // Abierta 130px, cerrada 60px
    transition: 'transform 0.3s ease !important',
    backgroundColor: '#25D366 !important', // Siempre verde
  };

  console.log('🎨 RENDER: thumbsVisible =', thumbsVisible, '| Transform =', thumbsVisible ? 'translateY(-120px)' : 'translateY(0)');

  return (
    <Fab
      color="success"
      aria-label="WhatsApp"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      sx={fabStyle}
    >
      <WhatsAppIcon />
    </Fab>
  );
}

export default WhatsappFloatingButton;
