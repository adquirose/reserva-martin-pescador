import React from 'react';

const TourOverlay = () => {
  // Componente simplificado sin botones de cierre
  // El tour ahora es la única vista disponible
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none', // No interfiere con la interacción del tour
      zIndex: 1000 
    }}>
      {/* Overlay vacío - reservado para futuras funcionalidades sin botones de cierre */}
    </div>
  );
};

export default TourOverlay;