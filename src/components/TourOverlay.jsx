import React from 'react';
import Logo from './Logo';

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
      {/* Logo en la esquina superior derecha */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        pointerEvents: 'auto' // Permitir interacción con el logo
      }}>
        <Logo 
          variant="white" 
          size="medium"
          sx={{
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))', // Sombra para mejor visibilidad
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
};

export default TourOverlay;