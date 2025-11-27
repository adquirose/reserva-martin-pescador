import React, { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { Dashboard as MiniMapIcon, DashboardCustomize as MiniMapMinIcon, Close as CloseIcon } from '@mui/icons-material';

const KrpanoMap = () => {
  const [mapState, setMapState] = useState('hidden'); // 'hidden', 'visible', 'minimized'

  // Obtener instancia de Krpano
  const getKrpanoInstance = () => {
    return window.krpano || null;
  };



  const toggleMap = () => {
    let newState;
    
    if (mapState === 'hidden') {
      // Paso 1: Invisible → Minimizado (directamente)
      const krpanoInstance = getKrpanoInstance();
      if (krpanoInstance) {
        krpanoInstance.call('mostrar_mapa_minimizado()'); // Mostrar directamente minimizado
      }
      
      newState = 'minimized';
    } else if (mapState === 'minimized') {
      // Paso 2: Minimizado → Maximizado
      const krpanoInstance = getKrpanoInstance();
      if (krpanoInstance) {
        krpanoInstance.call('max_planta()'); // Maximizar
      }
      
      newState = 'visible';
    } else {
      // Paso 3: Maximizado → Invisible (ocultar completamente)
      const krpanoInstance = getKrpanoInstance();
      if (krpanoInstance) {
        krpanoInstance.set('layer[mapcontainer].visible', false);
      }
      
      newState = 'hidden';
    }
    
    setMapState(newState);
    
    // Emitir evento para que otros componentes puedan reaccionar
    window.dispatchEvent(new CustomEvent('krpano-map-state-change', {
      detail: { state: newState }
    }));
  };

  // Determinar el icono y color según el estado
  const getMapIconAndColor = () => {
    const iconProps = { sx: { fontSize: { xs: '1.2rem', sm: '1.5rem' } } };
    
    switch (mapState) {
      case 'hidden':
        return { 
          icon: <MiniMapIcon {...iconProps} />, 
          backgroundColor: 'rgba(76, 175, 80, 0.9)', // Verde vibrante
          label: 'Mostrar planta minimizada' 
        };
      case 'minimized':
        return { 
          icon: <MiniMapMinIcon {...iconProps} />, 
          backgroundColor: 'rgba(255, 193, 7, 0.9)', // Amarillo vibrante
          label: 'Maximizar planta' 
        };
      case 'visible':
        return { 
          icon: <CloseIcon {...iconProps} />, 
          backgroundColor: 'rgba(244, 67, 54, 0.9)', // Rojo vibrante
          label: 'Ocultar planta' 
        };
      default:
        return { 
          icon: <MiniMapIcon {...iconProps} />, 
          backgroundColor: 'rgba(76, 175, 80, 0.9)', 
          label: 'Mostrar planta' 
        };
    }
  };

  const { icon, backgroundColor, label } = getMapIconAndColor();

  return (
    <Tooltip 
      title={`${label} del masterplan`} 
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
        color="secondary"
        aria-label={label}
        onClick={toggleMap}
        sx={{
          backgroundColor: backgroundColor,
          '&:hover': {
            backgroundColor: backgroundColor.replace('0.9', '1'),
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease-in-out',
          boxShadow: 3,
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
          border: '2px solid white',
        }}
      >
        {icon}
      </Fab>
    </Tooltip>
  );
};

export default KrpanoMap;