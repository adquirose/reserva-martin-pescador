// Servicio para leer y parsear los archivos XML principales de Krpano
// Lee directamente de /krpano/skin/data.xml y /krpano/skin/spots.xml

/**
 * Parser para el archivo data.xml principal
 * Extrae información detallada de cada parcela
 */
export const parseDataXMLMain = async () => {
  try {
    console.log('📋 Parseando archivo principal data.xml...');
    
    const response = await fetch('/krpano/skin/data.xml');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Verificar errores de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Error parseando XML: ${parserError.textContent}`);
    }
    
    const dataElements = xmlDoc.querySelectorAll('data');
    const lotesData = {};
    
    dataElements.forEach(element => {
      const nombre = element.getAttribute('name');
      if (!nombre || !nombre.startsWith('ficha')) return;
      
      const content = element.textContent || element.innerHTML;
      
      // Extraer número de parcela del nombre o contenido - mejorado para letras
      let numero = null;
      if (nombre.match(/ficha(\d+)/)) {
        numero = nombre.match(/ficha(\d+)/)[1];
      } else if (nombre.match(/ficha_([a-zA-Z]+)/)) {
        // Para casos como ficha_j, ficha_k, ficha_l, ficha_m1, etc.
        const letra = nombre.match(/ficha_([a-zA-Z]+)/)[1].toUpperCase();
        numero = letra;
      } else {
        // Para casos donde está en el contenido
        const parcelaMatch = content.match(/Parcela\s+([A-Za-z0-9]+)/i);
        if (parcelaMatch) {
          numero = parcelaMatch[1].toUpperCase();
        }
      }
      
      if (!numero) {
        console.warn(`No se pudo extraer número de: ${nombre}`);
        return;
      }
      
      // Extraer estado
      const estadoMatch = content.match(/Estado:\s*(.*?)(?:<br|$)/i);
      let estado = 'disponible';
      if (estadoMatch) {
        const estadoTexto = estadoMatch[1].toLowerCase().trim();
        if (estadoTexto.includes('vendida') || estadoTexto.includes('vendido')) {
          estado = 'vendido';
        } else if (estadoTexto.includes('reservada') || estadoTexto.includes('reservado')) {
          estado = 'reservado';
        }
      }
      
      // Extraer superficie - mejorado para manejar hectáreas
      const superficieMatch = content.match(/Superficie\s+aprox\.?:\s*(\d+(?:\.\d+)?)\s*(m2|ha\.?)/i);
      let superficieTotal = null;
      if (superficieMatch) {
        const valor = parseFloat(superficieMatch[1]);
        const unidad = superficieMatch[2].toLowerCase();
        
        if (unidad.includes('ha')) {
          // Convertir hectáreas a metros cuadrados
          superficieTotal = valor * 10000;
        } else {
          // Ya está en m2
          superficieTotal = valor;
        }
      }
      
      // Extraer metros de orilla (superficie tránsito)
      const orillaMatch = content.match(/Metros\s+orilla\s+lago:\s*(\d+(?:\.\d+)?)\s*mts?/i);
      let superficieTransito = null;
      if (orillaMatch) {
        superficieTransito = parseFloat(orillaMatch[1]);
      }
      
      // Extraer precio (mejorado para detectar más formatos)
      const precioMatch = content.match(/Precio:\s*(.*?)(?:<br|$)/i);
      let precio = null;
      let precioTexto = null;
      
      if (precioMatch) {
        precioTexto = precioMatch[1].trim();
        
        // Buscar números en el precio (USD, pesos, etc.)
        const numeroMatch = precioTexto.match(/[\d,.\s]+/);
        
        if (numeroMatch && !precioTexto.toLowerCase().includes('consultar')) {
          // Limpiar y convertir a número
          const numeroLimpio = numeroMatch[0].replace(/[,\s]/g, '');
          precio = parseFloat(numeroLimpio);
        } else if (precioTexto.toLowerCase().includes('consultar')) {
          // Marcar como "Consultar" pero mantener el texto
          precio = 'consultar';
        }
      }
      
      lotesData[numero] = {
        id: numero,           // ✅ Cambio: numero → id
        numero: numero,       // Mantener por compatibilidad
        estado,
        superficieTotal,
        superficieLote: superficieTotal, // Usar el mismo valor por defecto
        superficieTransito,
        precio,
        precioTexto: precioTexto, // Texto original del precio
        descripcion: content.replace(/<[^>]*>/g, '').trim(), // Descripción limpia
        
        // Campos adicionales extraídos del contenido
        metrosOrillaLago: superficieTransito, // Alias más descriptivo
        unidadSuperficie: superficieTotal > 50000 ? 'ha' : 'm²', // Indicar unidad original
        parcela: numero, // Alias del número
        
        // HTML original para referencia
        htmlOriginal: content,
        
        // Fuente del dato
        source: 'data.xml'
      };
    });
    
    console.log(`✅ Parseados ${Object.keys(lotesData).length} lotes del data.xml principal`);
    return lotesData;
    
  } catch (error) {
    console.error('❌ Error parseando data.xml principal:', error);
    throw error;
  }
};

/**
 * Parser para el archivo spots.xml principal
 * Extrae coordenadas y estados de los spots
 */
export const parseSpotsXMLMain = async () => {
  try {
    console.log('📍 Parseando archivo principal spots.xml...');
    
    const response = await fetch('/krpano/skin/spots.xml');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Verificar errores de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Error parseando XML: ${parserError.textContent}`);
    }
    
    const spots = xmlDoc.querySelectorAll('spot');
    const spotsData = {};
    
    spots.forEach(spot => {
      const name = spot.getAttribute('name');
      const estado = spot.getAttribute('estado') || 'disponible';
      const html = spot.getAttribute('html');
      const ath = spot.getAttribute('ath');
      const atv = spot.getAttribute('atv');
      
      if (!name || !ath || !atv) return;
      
      // Extraer número del spot
      let numero = null;
      
      // Casos normales: ficha1, ficha2, etc.
      const numeroMatch = name.match(/ficha(\d+)/);
      if (numeroMatch) {
        numero = numeroMatch[1];
      } else {
        // Casos especiales: ficha_j -> usar html="J"
        // Mapear identificadores especiales a números
        const specialMappings = {
          'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M',
          'M1': 'M1', 'M2': 'M2', 'M3': 'M3', 
          'M4': 'M4', 'M5': 'M5', 'M6': 'M6',
          'M7': 'M7', 'M8': 'M8'  // ✅ Agregamos M7 y M8
        };
        
        if (html && specialMappings[html]) {
          numero = specialMappings[html];
        } else if (html && /^\d+$/.test(html)) {
          numero = html;
        }
      }
      
      if (!numero) {
        console.warn(`No se pudo determinar número para spot: ${name} (html: ${html})`);
        return;
      }
      
      // Determinar vista basada en número o identificador alfanumérico
      let vista = 'vista1'; // Default
      const numeroInt = parseInt(numero);
      
      // Lotes numerados
      if (!isNaN(numeroInt)) {
        if ([7,8,9,10,11].includes(numeroInt)) {
          vista = 'vista2';
        } else if ([12,13,14,15,16].includes(numeroInt)) {
          vista = 'vista3';  
        } else if ([17,18,19,20,21,22,23,24,25,26,27,28,30,31].includes(numeroInt)) {
          vista = 'vista4';
        }
        // Solo los lotes 1-6, 29 quedan en vista1 por defecto
      } 
      // Lotes alfanuméricos
      else {
        // Asignar lotes M a vista específica según el archivo original
        if (['M5', 'M6', 'M7', 'M8'].includes(numero)) {
          vista = 'vista4';
        } else if (['M1', 'M2', 'M3', 'M4'].includes(numero)) {
          vista = 'vista1'; // o la vista que corresponda
        } else if (['J', 'K', 'L'].includes(numero)) {
          vista = 'vista1'; // o la vista que corresponda
        }
      }
      
      spotsData[numero] = {
        id: numero,         // ✅ Cambio: numero → id
        numero,             // Mantener por compatibilidad
        estado,
        html,
        name,
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
    });
    
    console.log(`✅ Parseados ${Object.keys(spotsData).length} spots del spots.xml principal`);
    return spotsData;
    
  } catch (error) {
    console.error('❌ Error parseando spots.xml principal:', error);
    throw error;
  }
};

/**
 * Combinar datos de ambos archivos XML principales
 * Crea estructura completa para cada lote
 */
export const combineXMLData = async () => {
  try {
    console.log('🔄 Combinando datos de data.xml y spots.xml...');
    
    const [dataXML, spotsXML] = await Promise.all([
      parseDataXMLMain(),
      parseSpotsXMLMain()
    ]);
    
    const lotesCompletos = {};
    
    // Crear lista de todos los números únicos
    const todosNumeros = new Set([
      ...Object.keys(dataXML),
      ...Object.keys(spotsXML)
    ]);
    
    todosNumeros.forEach(numero => {
      const dataInfo = dataXML[numero] || {};
      const spotInfo = spotsXML[numero] || {};
      
      // Determinar etapa y vista basada en número o identificador alfanumérico
      let etapa = 1;
      let vista = 'vista1';
      const numeroInt = parseInt(numero);
      
      // Lotes numerados
      if (!isNaN(numeroInt)) {
        if ([7,8,9,10,11].includes(numeroInt)) {
          etapa = 2;
          vista = 'vista2';
        } else if ([12,13,14,15,16].includes(numeroInt)) {
          etapa = 3;
          vista = 'vista3';
        } else if ([17,18,19,20,21,22,23,24,25,26,27,28,30,31].includes(numeroInt)) {
          etapa = 4;
          vista = 'vista4';
        }
        // Solo los lotes 1-6, 29 quedan en vista1 y etapa 1 por defecto
      } 
      // Lotes alfanuméricos
      else {
        etapa = 1; // Default para lotes especiales
        // Asignar vista según el lote alfanumérico
        if (['M5', 'M6', 'M7', 'M8'].includes(numero)) {
          vista = 'vista4';
        } else if (['M1', 'M2', 'M3', 'M4'].includes(numero)) {
          vista = 'vista1';
        } else if (['J', 'K', 'L'].includes(numero)) {
          vista = 'vista1';
        }
      }
      
      // Obtener HTML display ID correcto
      let html = spotInfo.html || numero;
      
      // Crear estructura krpano con la vista correcta
      let krpanoData = {};
      if (spotInfo.ath && spotInfo.atv) {
        krpanoData[vista] = {
          ath: spotInfo.ath,
          atv: spotInfo.atv
        };
      }
      
      lotesCompletos[numero] = {
        id: numero,           // ✅ Cambio: numero → id  
        numero: numero,       // Mantener por compatibilidad
        estado: spotInfo.estado || dataInfo.estado || 'disponible',
        html: html,
        etapa: etapa,
        krpano: krpanoData,
        
        // Datos económicos mejorados
        precio: dataInfo.precio,
        precioTexto: dataInfo.precioTexto || null,
        
        // Datos de superficies
        superficieTotal: dataInfo.superficieTotal,
        superficieLote: dataInfo.superficieLote,
        superficieTransito: dataInfo.superficieTransito,
        metrosOrillaLago: dataInfo.metrosOrillaLago,
        unidadSuperficie: dataInfo.unidadSuperficie,
        
        // Información descriptiva
        descripcion: dataInfo.descripcion || '',
        htmlOriginal: dataInfo.htmlOriginal || '',
        parcela: numero,
        
        // Datos adicionales del spot - usar vista calculada
        vista: vista,
        ath: spotInfo.ath,
        atv: spotInfo.atv,
        name: spotInfo.name,
        
        // Fuentes de datos
        source: 'COMBINED_XML'
      };
    });
    
    console.log(`🎉 Combinados ${Object.keys(lotesCompletos).length} lotes completos`);
    return lotesCompletos;
    
  } catch (error) {
    console.error('❌ Error combinando datos XML:', error);
    throw error;
  }
};

/**
 * Cargar todos los lotes desde archivos XML principales
 */
export const loadAllLotesFromXML = async () => {
  try {
    console.log('📂 Cargando lotes desde archivos XML principales...');
    const lotesCompletos = await combineXMLData();
    
    // Convertir a array y ordenar por número
    const lotesArray = Object.values(lotesCompletos).sort((a, b) => 
      parseInt(a.numero) - parseInt(b.numero)
    );
    
    console.log(`📊 Total de lotes cargados: ${lotesArray.length}`);
    console.log(`📋 Números: ${lotesArray.map(l => l.numero).join(', ')}`);
    
    return {
      lotesCompletos,
      lotesArray,
      count: lotesArray.length
    };
    
  } catch (error) {
    console.error('❌ Error cargando lotes desde XML:', error);
    throw error;
  }
};

export default {
  parseDataXMLMain,
  parseSpotsXMLMain, 
  combineXMLData,
  loadAllLotesFromXML
};