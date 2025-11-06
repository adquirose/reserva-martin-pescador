// Servicios de Firestore para Reserva Martin Pescador
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where 
} from 'firebase/firestore';
import { db, PROJECT_PATH, LOTES_COLLECTION } from '../config/firebase';

// Mantener compatibilidad con código existente
const COLLECTION_NAME = 'reserva-martin-pescador';

// ===== FUNCIÓN PARA PARSEAR DATA.XML =====

/**
 * Función para parsear el archivo data.xml y extraer información detallada de parcelas
 */
const parseDataXML = async () => {
  try {
    const response = await fetch('/krpano/skin/data.xml');
    const xmlText = await response.text();
    
    // Extraer todas las fichas usando regex
    const fichaRegex = /<data name="(ficha\d+)">([\s\S]*?)<\/data>/g;
    const parcelas = {};
    
    let match;
    while ((match = fichaRegex.exec(xmlText)) !== null) {
      const fichaName = match[1];
      const content = match[2];
      
      // Extraer título de la parcela
      const titleMatch = content.match(/<h2>(.*?)<\/h2>/);
      const titulo = titleMatch ? titleMatch[1].trim() : '';
      
      // Extraer estado
      const estadoMatch = content.match(/Estado:\s*(.*?)\s*<br/);
      const estado = estadoMatch ? estadoMatch[1].trim() : '';
      
      // Extraer superficie (convertir a número)
      const superficieMatch = content.match(/Superficie aprox\.:\s*([\d.,]+)\s*(m2|ha)/);
      let superficie = 0;
      if (superficieMatch) {
        const numero = parseFloat(superficieMatch[1].replace(',', '.'));
        const unidad = superficieMatch[2];
        superficie = unidad === 'ha' ? numero * 10000 : numero; // Convertir hectáreas a m2
      }
      
      // Extraer metros orilla lago (convertir a número)
      const orillaMatch = content.match(/Metros orilla lago:\s*([\d.,]+)\s*mts?/);
      const metrosOrilla = orillaMatch ? parseFloat(orillaMatch[1].replace(',', '.')) : 0;
      
      // Extraer precio
      const precioMatch = content.match(/Precio:\s*(.*?)(?:\s*<\/p>|\s*$)/s);
      let precio = '';
      if (precioMatch) {
        precio = precioMatch[1]
          .trim()
          .replace(/<br\/?>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      parcelas[fichaName] = {
        titulo,
        estado: estado.toLowerCase(),
        superficie,
        metrosOrilla,
        precio
      };
    }
    
    console.log(`📋 Parseadas ${Object.keys(parcelas).length} parcelas del data.xml`);
    return parcelas;
  } catch (error) {
    console.error('Error parseando data.xml:', error);
    return {};
  }
};

// ===== SERVICIOS PARA SPOTS/LOTES =====

/**
 * Obtener todos los spots/lotes del proyecto
 */
export const getAllSpots = async () => {
  try {
    const spotsCollection = collection(db, COLLECTION_NAME, 'project-data', 'spots');
    const spotsSnapshot = await getDocs(spotsCollection);
    const spots = spotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return spots;
  } catch (error) {
    console.error('Error al obtener spots:', error);
    throw error;
  }
};

/**
 * Obtener un spot específico por ID
 */
export const getSpotById = async (spotId) => {
  try {
    const spotRef = doc(db, COLLECTION_NAME, 'project-data', 'spots', spotId);
    const spotSnap = await getDoc(spotRef);
    
    if (spotSnap.exists()) {
      return {
        id: spotSnap.id,
        ...spotSnap.data()
      };
    } else {
      throw new Error('Spot no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener spot:', error);
    throw error;
  }
};

/**
 * Obtener spots por estado (disponible, vendido, reservado)
 */
export const getSpotsByEstado = async (estado) => {
  try {
    const spotsCollection = collection(db, COLLECTION_NAME, 'project-data', 'spots');
    const q = query(spotsCollection, where('estado', '==', estado));
    const spotsSnapshot = await getDocs(q);
    const spots = spotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return spots;
  } catch (error) {
    console.error('Error al obtener spots por estado:', error);
    throw error;
  }
};

/**
 * Crear un nuevo spot
 */
export const createSpot = async (spotData) => {
  try {
    const spotsCollection = collection(db, COLLECTION_NAME, 'project-data', 'spots');
    const docRef = await addDoc(spotsCollection, {
      ...spotData,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear spot:', error);
    throw error;
  }
};

/**
 * Actualizar un spot existente
 */
export const updateSpot = async (spotId, spotData) => {
  try {
    const spotRef = doc(db, COLLECTION_NAME, 'project-data', 'spots', spotId);
    await updateDoc(spotRef, {
      ...spotData,
      fechaActualizacion: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar spot:', error);
    throw error;
  }
};

/**
 * Eliminar un spot
 */
export const deleteSpot = async (spotId) => {
  try {
    const spotRef = doc(db, COLLECTION_NAME, 'project-data', 'spots', spotId);
    await deleteDoc(spotRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar spot:', error);
    throw error;
  }
};

// ===== SERVICIOS PARA ESCENAS/VISTAS =====

/**
 * Obtener todas las escenas del tour
 */
export const getAllScenes = async () => {
  try {
    const scenesCollection = collection(db, COLLECTION_NAME, 'project-data', 'scenes');
    const scenesSnapshot = await getDocs(scenesCollection);
    const scenes = scenesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return scenes;
  } catch (error) {
    console.error('Error al obtener escenas:', error);
    throw error;
  }
};

/**
 * Obtener configuración del proyecto
 */
export const getProjectConfig = async () => {
  try {
    const configRef = doc(db, COLLECTION_NAME, 'project-config');
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return configSnap.data();
    } else {
      // Devolver configuración por defecto si no existe
      return {
        title: 'Reserva Martin Pescador',
        description: 'Tour virtual del proyecto inmobiliario',
        settings: {
          enableMaps: false,
          enableGyro: true,
          enableThumbs: true
        }
      };
    }
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    throw error;
  }
};

/**
 * Actualizar configuración del proyecto
 */
export const updateProjectConfig = async (configData) => {
  try {
    const configRef = doc(db, COLLECTION_NAME, 'project-config');
    await updateDoc(configRef, {
      ...configData,
      fechaActualizacion: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    throw error;
  }
};

// ===== SERVICIOS PARA INICIALIZACIÓN =====

/**
 * Verificar si los datos del proyecto ya existen
 */
export const checkIfProjectExists = async () => {
  try {
    const configRef = doc(db, COLLECTION_NAME, 'project-config');
    const configSnap = await getDoc(configRef);
    return configSnap.exists();
  } catch (error) {
    console.error('Error verificando existencia del proyecto:', error);
    return false;
  }
};

/**
 * Inicializar datos del proyecto SOLO si no existen
 * Es seguro ejecutar múltiples veces - no sobrescribe datos existentes
 */
export const initializeProjectData = async () => {
  try {
    // 1. Verificar si ya existe configuración del proyecto
    const projectExists = await checkIfProjectExists();
    
    if (projectExists) {
      console.log('ℹ️ El proyecto ya está inicializado. No se crearán datos duplicados.');
      return { alreadyExists: true, message: 'Proyecto ya inicializado' };
    }

    console.log('🚀 Inicializando nuevo proyecto en Firestore...');

    // 2. Parsear información detallada del data.xml
    console.log('📋 Parseando información detallada de parcelas...');
    const parcelasDetalle = await parseDataXML();

    // 3. Extraer TODOS los datos reales del XML de spots
    const spotsFromXML = [
      // VISTA 1
      { name: 'ficha1', numero: '1', estado: 'vendido', html: '1', vista: 1, ath: '28.916', atv: '35.798' },
      { name: 'ficha2', numero: '2', estado: 'vendido', html: '2', vista: 1, ath: '27.125', atv: '55.297' },
      { name: 'ficha3', numero: '3', estado: 'vendido', html: '3', vista: 1, ath: '-120.248', atv: '68.913' },
      { name: 'ficha4', numero: '4', estado: 'vendido', html: '4', vista: 1, ath: '-135.452', atv: '33.403' },
      { name: 'ficha5', numero: '5', estado: 'vendido', html: '5', vista: 1, ath: '-137.427', atv: '22.095' },
      { name: 'ficha6', numero: '6', estado: 'vendido', html: '6', vista: 1, ath: '-137.531', atv: '14.409' },
      { name: 'ficha23', numero: '23', estado: 'vendido', html: 'J', vista: 1, ath: '-14.599', atv: '20.573' },
      { name: 'ficha24', numero: '24', estado: 'vendido', html: 'K', vista: 1, ath: '-50.823', atv: '26.752' },
      { name: 'ficha25', numero: '25', estado: 'vendido', html: 'L', vista: 1, ath: '-106.888', atv: '12.256' },
      
      // VISTA 2
      { name: 'ficha26', numero: '26', estado: 'vendido', html: 'M1', vista: 2, ath: '-129.902', atv: '47.102' },
      { name: 'ficha27', numero: '27', estado: 'vendido', html: 'M2', vista: 2, ath: '-163.899', atv: '33.271' },
      { name: 'ficha7', numero: '7', estado: 'vendido', html: '7', vista: 2, ath: '40.358', atv: '72.961' },
      { name: 'ficha8', numero: '8', estado: 'vendido', html: '8', vista: 2, ath: '85.018', atv: '73.506' },
      { name: 'ficha9', numero: '9', estado: 'vendido', html: '9', vista: 2, ath: '119.940', atv: '68.194' },
      { name: 'ficha10', numero: '10', estado: 'vendido', html: '10', vista: 2, ath: '140.277', atv: '57.559' },
      { name: 'ficha11', numero: '11', estado: 'vendido', html: '11', vista: 2, ath: '146.658', atv: '47.294' },
      
      // VISTA 3
      { name: 'ficha28', numero: '28', estado: 'disponible', html: 'M3', vista: 3, ath: '-13.371', atv: '52.450' },
      { name: 'ficha29', numero: '29', estado: 'disponible', html: 'M4', vista: 3, ath: '-75.930', atv: '36.938' },
      { name: 'ficha12', numero: '12', estado: 'disponible', html: '12', vista: 3, ath: '96.040', atv: '67.228' },
      { name: 'ficha13', numero: '13', estado: 'disponible', html: '13', vista: 3, ath: '143.409', atv: '79.303' },
      { name: 'ficha14', numero: '14', estado: 'disponible', html: '14', vista: 3, ath: '-136.213', atv: '71.415' },
      { name: 'ficha15', numero: '15', estado: 'disponible', html: '15', vista: 3, ath: '-123.802', atv: '55.109' },
      { name: 'ficha16', numero: '16', estado: 'disponible', html: '16', vista: 3, ath: '-121.778', atv: '44.420' },
      
      // VISTA 4
      { name: 'ficha30', numero: '30', estado: 'disponible', html: 'M5', vista: 4, ath: '45.844', atv: '34.744' },
      { name: 'ficha31', numero: '31', estado: 'disponible', html: 'M6', vista: 4, ath: '-11.168', atv: '52.328' },
      { name: 'ficha17', numero: '17', estado: 'disponible', html: '17', vista: 4, ath: '89.381', atv: '32.071' },
      { name: 'ficha18', numero: '18', estado: 'disponible', html: '18', vista: 4, ath: '90.637', atv: '38.446' },
      { name: 'ficha19', numero: '19', estado: 'disponible', html: '19', vista: 4, ath: '96.059', atv: '44.452' },
      { name: 'ficha20', numero: '20', estado: 'disponible', html: '20', vista: 4, ath: '105.982', atv: '53.599' },
      { name: 'ficha21', numero: '21', estado: 'disponible', html: '21', vista: 4, ath: '121.651', atv: '65.161' },
      { name: 'ficha22', numero: '22', estado: 'disponible', html: '22', vista: 4, ath: '155.722', atv: '73.411' }
    ];

    // 4. Crear colección de spots con datos reales enriquecidos
    console.log('📦 Creando spots del proyecto con información detallada...');
    const spotsCollection = collection(db, COLLECTION_NAME, 'project-data', 'spots');
    
    for (const spot of spotsFromXML) {
      // Obtener información detallada del data.xml si existe
      const detalleParc = parcelasDetalle[spot.name] || {};
      
      // Agregar información completa a cada spot
      const spotCompleto = {
        ...spot,
        descripcion: detalleParc.titulo || `Lote ${spot.numero} - Vista ${spot.vista}`,
        superficie: detalleParc.superficie || null,
        metrosOrilla: detalleParc.metrosOrilla || 0,
        precio: detalleParc.precio || 'Consultar precio a reservamartinpescador@gmail.com',
        estadoDetallado: detalleParc.estado || spot.estado,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      };
      
      await addDoc(spotsCollection, spotCompleto);
      console.log(`✓ Creado spot ${spot.numero}: ${detalleParc.titulo || spot.name}`);
    }

    // 5. Crear configuración inicial del proyecto (NUEVO documento)
    console.log('⚙️ Creando configuración del proyecto...');
    const configRef = doc(db, COLLECTION_NAME, 'project-config');
    // Usar setDoc en lugar de updateDoc para crear el documento
    await setDoc(configRef, {
      title: 'Reserva Martin Pescador',
      description: 'Tour virtual del proyecto inmobiliario Reserva Martin Pescador',
      settings: {
        enableMaps: false,
        enableGyro: true,
        enableThumbs: true,
        enableRadar: true
      },
      totalSpots: spotsFromXML.length,
      spotsDisponibles: spotsFromXML.filter(s => s.estado === 'disponible').length,
      spotsVendidos: spotsFromXML.filter(s => s.estado === 'vendido').length,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });

    // 6. Crear información de las escenas/vistas
    console.log('🎬 Creando información de escenas...');
    const scenesCollection = collection(db, COLLECTION_NAME, 'project-data', 'scenes');
    const scenesData = [
      { 
        name: 'scene_e1', 
        title: 'Vista Etapa 1', 
        vista: 1,
        description: 'Primera vista del proyecto - Sector consolidado',
        totalSpots: spotsFromXML.filter(s => s.vista === 1).length
      },
      { 
        name: 'scene_e2', 
        title: 'Vista Etapa 2', 
        vista: 2,
        description: 'Segunda vista del proyecto - Sector intermedio',
        totalSpots: spotsFromXML.filter(s => s.vista === 2).length
      },
      { 
        name: 'scene_e3', 
        title: 'Vista Etapa 3', 
        vista: 3,
        description: 'Tercera vista del proyecto - Nuevas oportunidades',
        totalSpots: spotsFromXML.filter(s => s.vista === 3).length
      },
      { 
        name: 'scene_e4', 
        title: 'Vista Etapa 4', 
        vista: 4,
        description: 'Cuarta vista del proyecto - Sector de desarrollo',
        totalSpots: spotsFromXML.filter(s => s.vista === 4).length
      }
    ];

    for (const scene of scenesData) {
      await addDoc(scenesCollection, {
        ...scene,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      });
    }

    console.log('✅ Proyecto inicializado exitosamente en Firestore');
    console.log(`📊 Total de spots creados: ${spotsFromXML.length}`);
    console.log(`🏠 Spots disponibles: ${spotsFromXML.filter(s => s.estado === 'disponible').length}`);
    console.log(`💰 Spots vendidos: ${spotsFromXML.filter(s => s.estado === 'vendido').length}`);
    
    return { 
      success: true, 
      totalSpots: spotsFromXML.length,
      available: spotsFromXML.filter(s => s.estado === 'disponible').length,
      sold: spotsFromXML.filter(s => s.estado === 'vendido').length
    };
  } catch (error) {
    console.error('❌ Error al inicializar datos:', error);
    throw error;
  }
};