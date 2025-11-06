// Parser para extraer datos detallados del data.xml de Krpano
export const parseDetailedDataXML = async () => {
  try {
    console.log('📋 Parseando información detallada del data.xml...');
    
    // Obtener el XML desde el servidor local
    const response = await fetch('/krpano/skin/data_20251003_133102.xml');
    const xmlText = await response.text();
    
    // Parsear el XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const dataElements = xmlDoc.querySelectorAll('data');
    
    const lotesParsed = {};
    
    dataElements.forEach(element => {
      const nombre = element.getAttribute('name');
      if (!nombre || !nombre.startsWith('ficha')) return;
      
      const content = element.textContent || element.innerHTML;
      
      // Extraer número de lote
      const numeroMatch = content.match(/Lote\s+(\d+)/);
      const numero = numeroMatch ? numeroMatch[1] : nombre.replace('ficha', '');
      
      // Extraer estado
      const estadoMatch = content.match(/Estado:\s*(.*?)(?:<br|$)/);
      let estado = 'disponible';
      if (estadoMatch) {
        const estadoText = estadoMatch[1].trim().toLowerCase();
        if (estadoText.includes('vendido')) estado = 'vendido';
        else if (estadoText.includes('reservado')) estado = 'reservado';
        else if (estadoText.includes('oferta')) estado = 'disponible';
      }
      
      // Extraer superficies
      const superficieTransitoMatch = content.match(/Superficie Transito:\s*([\d.,]+)\s*m2?/i);
      const superficieTotalMatch = content.match(/Superficie Total:\s*([\d.,]+)\s*m2?/i);
      const superficieLoteMatch = content.match(/Superficie lote:\s*([\d.,]+)\s*m2?/i);
      
      const superficieTransito = superficieTransitoMatch ? 
        parseFloat(superficieTransitoMatch[1].replace(/[.,]/g, match => match === ',' ? '.' : '')) : 0;
      const superficieTotal = superficieTotalMatch ? 
        parseFloat(superficieTotalMatch[1].replace(/[.,]/g, match => match === ',' ? '.' : '')) : 0;
      const superficieLote = superficieLoteMatch ? 
        parseFloat(superficieLoteMatch[1].replace(/[.,]/g, match => match === ',' ? '.' : '')) : 0;
      
      // Extraer precio
      const precioMatch = content.match(/Precio:\s*\$?\s*([\d.,]+)/);
      let precio = 'Consultar';
      if (estado === 'vendido') {
        precio = 'VENDIDO';
      } else if (precioMatch) {
        const precioValue = parseInt(precioMatch[1].replace(/[.,]/g, ''));
        precio = `$${precioValue.toLocaleString('es-CL')}`;
      }
      
      // Determinar etapa basada en el número
      let etapa = 1;
      const numeroInt = parseInt(numero);
      if (numeroInt >= 7 && numeroInt <= 11) etapa = 2;
      else if (numeroInt >= 12 && numeroInt <= 16) etapa = 3;
      else if (numeroInt >= 17 && numeroInt <= 22) etapa = 4;
      else if (numeroInt >= 26) etapa = Math.ceil((numeroInt - 22) / 5) + 2;
      
      lotesParsed[nombre] = {
        numero,
        estado,
        etapa,
        html: numero, // El nombre HTML en el tour
        superficieTransito,
        superficieTotal,
        superficieLote,
        precio
      };
    });
    
    console.log(`📋 Parseados ${Object.keys(lotesParsed).length} lotes del data.xml`);
    return lotesParsed;
  } catch (error) {
    console.error('Error parseando data.xml detallado:', error);
    return {};
  }
};

// Mapear coordenadas krpano por vista - Un lote puede estar en múltiples vistas
export const getKrpanoCoordinates = () => {
  return {
    // Cada lote puede tener múltiples vistas con diferentes coordenadas
    'ficha1': [
      { vista: 1, ath: '28.916', atv: '35.798' }
    ],
    'ficha2': [
      { vista: 1, ath: '27.125', atv: '55.297' }
    ],
    'ficha3': [
      { vista: 1, ath: '-120.248', atv: '68.913' }
    ],
    'ficha4': [
      { vista: 1, ath: '-135.452', atv: '33.403' }
    ],
    'ficha5': [
      { vista: 1, ath: '-137.427', atv: '22.095' },
      { vista: 2, ath: '-125.300', atv: '18.500' } // Ejemplo: visible desde vista 2 también
    ],
    'ficha6': [
      { vista: 1, ath: '-137.531', atv: '14.409' }
    ],
    'ficha23': [
      { vista: 1, ath: '-14.599', atv: '20.573' }
    ],
    'ficha24': [
      { vista: 1, ath: '-50.823', atv: '26.752' }
    ],
    'ficha25': [
      { vista: 1, ath: '-106.888', atv: '12.256' }
    ],
    
    'ficha26': [
      { vista: 2, ath: '-129.902', atv: '47.102' }
    ],
    'ficha27': [
      { vista: 2, ath: '-163.899', atv: '33.271' }
    ],
    'ficha7': [
      { vista: 2, ath: '40.358', atv: '72.961' },
      { vista: 3, ath: '35.200', atv: '68.500' } // Ejemplo: visible desde vista 3 también
    ],
    'ficha8': [
      { vista: 2, ath: '85.018', atv: '73.506' }
    ],
    'ficha9': [
      { vista: 2, ath: '119.940', atv: '68.194' }
    ],
    'ficha10': [
      { vista: 2, ath: '140.277', atv: '57.559' },
      { vista: 3, ath: '145.100', atv: '52.300' } // Ejemplo: visible desde vista 3 también
    ],
    'ficha11': [
      { vista: 2, ath: '146.658', atv: '47.294' }
    ],
    
    'ficha28': [
      { vista: 3, ath: '-13.371', atv: '52.450' }
    ],
    'ficha29': [
      { vista: 3, ath: '-75.930', atv: '36.938' }
    ],
    'ficha12': [
      { vista: 3, ath: '96.040', atv: '67.228' }
    ],
    'ficha13': [
      { vista: 3, ath: '143.409', atv: '79.303' }
    ],
    'ficha14': [
      { vista: 3, ath: '-136.213', atv: '71.415' }
    ],
    'ficha15': [
      { vista: 3, ath: '-123.802', atv: '55.109' },
      { vista: 4, ath: '-120.500', atv: '48.200' } // Ejemplo: visible desde vista 4 también
    ],
    'ficha16': [
      { vista: 3, ath: '-121.778', atv: '44.420' }
    ],
    
    'ficha30': [
      { vista: 4, ath: '45.844', atv: '34.744' }
    ],
    'ficha31': [
      { vista: 4, ath: '-11.168', atv: '52.328' }
    ],
    'ficha17': [
      { vista: 4, ath: '89.381', atv: '32.071' }
    ],
    'ficha18': [
      { vista: 4, ath: '90.637', atv: '38.446' }
    ],
    'ficha19': [
      { vista: 4, ath: '96.059', atv: '44.452' }
    ],
    'ficha20': [
      { vista: 4, ath: '105.982', atv: '53.599' }
    ],
    'ficha21': [
      { vista: 4, ath: '121.651', atv: '65.161' }
    ],
    'ficha22': [
      { vista: 4, ath: '155.722', atv: '73.411' }
    ]
  };
};