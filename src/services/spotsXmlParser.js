// Parser específico para el archivo spots.xml original
export const parseSpotsXML = (xmlContent) => {
  console.log('📋 Parseando spots.xml original...');
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const spots = xmlDoc.querySelectorAll('spot');
  
  const spotsData = {};
  
  spots.forEach(spot => {
    const name = spot.getAttribute('name');
    const estado = spot.getAttribute('estado');
    const html = spot.getAttribute('html');
    const ath = spot.getAttribute('ath');
    const atv = spot.getAttribute('atv');
    
    // Extraer número del lote del name (ej: "ficha29" -> 29)
    const numeroMatch = name.match(/ficha(\d+)/);
    const numero = numeroMatch ? numeroMatch[1] : null;
    
    if (numero) {
      // Determinar vista basada en los rangos del tour.xml
      let vista = 'vista1';
      const numeroInt = parseInt(numero);
      
      if ([7,8,9,10,11,26,27].includes(numeroInt)) {
        vista = 'vista2';
      } else if ([12,13,14,15,16,28,29].includes(numeroInt)) {
        vista = 'vista3';
      } else if ([17,18,19,20,21,22,30,31].includes(numeroInt)) {
        vista = 'vista4';
      }
      
      spotsData[numero] = {
        numero,
        estado,
        html, // Identificador de display (puede ser "1", "M4", "J", etc.)
        name, // Nombre original del spot
        ath: parseFloat(ath),
        atv: parseFloat(atv),
        vista,
        krpano: {
          [vista]: {
            ath: parseFloat(ath),
            atv: parseFloat(atv)
          }
        }
      };
    }
  });
  
  console.log(`📍 Parseados ${Object.keys(spotsData).length} spots del XML original`);
  return spotsData;
};

// Función para obtener el identificador de display correcto
export const getDisplayId = (numeroLote) => {
  const numero = parseInt(numeroLote);
  
  // Mapeo especial para lotes con identificadores alfanuméricos
  const specialIds = {
    23: 'J',
    24: 'K', 
    25: 'L',
    26: 'M1',
    27: 'M2',
    28: 'M3',
    29: 'M4',
    30: 'M5',
    31: 'M6'
  };
  
  return specialIds[numero] || numero.toString();
};

// Función para cargar y parsear spots.xml
export const loadSpotsXML = async () => {
  try {
    const response = await fetch('/krpano/skin/spots.xml');
    const xmlText = await response.text();
    return parseSpotsXML(xmlText);
  } catch (error) {
    console.error('❌ Error cargando spots.xml:', error);
    return {};
  }
};