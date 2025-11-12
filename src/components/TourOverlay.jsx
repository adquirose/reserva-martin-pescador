import React from 'react';
import Logo from './Logo';
import ContactMenu from './ContactMenu';
import KrpanoMap from './KrpanoMap';
import MapboxMap from './MapboxMap';
import KrpanoPdfDownload from './KrpanoPdfDownload';

const TourOverlay = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none', // No interfiere con la interacción del tour
      zIndex: 1001 // Encima del tour pero debajo de cualquier modal
    }}>
      {/* Logo del proyecto en la esquina superior izquierda */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        pointerEvents: 'auto',
      }}>
        <Logo 
          size="large"
          sx={{
            margin: 0,
            padding: 0,
          }}
        />
      </div>

      {/* Contenedor de iconos centrados verticalmente a la izquierda */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '16px',
      }}>
        {/* Ícono de información */}
        <ContactMenu />
        
        {/* Botón de descarga PDF */}
        <KrpanoPdfDownload />
        
        {/* Mapa externo Mapbox */}
        <MapboxMap />
        
        {/* Planta/Minimap Krpano */}
        <KrpanoMap />
      </div>
    </div>
  );
};

export default TourOverlay;