import React, { useState } from 'react';
import { Fab } from '@mui/material';
import { Dashboard as MiniMapIcon, DashboardCustomize as MiniMapMinIcon, Close as CloseIcon } from '@mui/icons-material';

const KrpanoMap = () => {
  const [mapState, setMapState] = useState('hidden'); // 'hidden', 'visible', 'minimized'

  // Obtener instancia de Krpano
  const getKrpanoInstance = () => {
    return window.krpano || null;
  };



  const toggleMap = () => {
    console.log(`🔄 Estado actual del mapa: ${mapState}`);
    
    if (mapState === 'hidden') {
      // Paso 1: Invisible → Minimizado (directamente)
      console.log('✅ Mostrando mapa minimizado...');
      
      const krpanoInstance = getKrpanoInstance();
      if (krpanoInstance) {
        krpanoInstance.call('mostrar_mapa_minimizado()'); // Mostrar directamente minimizado
      }
      
      setMapState('minimized');
    } else if (mapState === 'minimized') {
      // Paso 2: Minimizado → Maximizado
      console.log('📈 Maximizando mapa...');
      
      const krpanoInstance = getKrpanoInstance();
      if (krpanoInstance) {
        krpanoInstance.call('max_planta()'); // Maximizar
      }
      
      setMapState('visible');
    } else {
      // Paso 3: Maximizado → Invisible (ocultar completamente)
      console.log('❌ Ocultando mapa...');
      
      const krpanoInstance = getKrpanoInstance();
      if (krpanoInstance) {
        krpanoInstance.set('layer[mapcontainer].visible', false);
      }
      
      setMapState('hidden');
    }
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
    <Fab
      color="secondary"
      aria-label={label}
      title={label}
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
  );
};

export default KrpanoMap;