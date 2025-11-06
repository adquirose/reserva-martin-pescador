// Nuevo servicio de Firestore con estructura optimizada
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db, PROJECT_PATH, LOTES_COLLECTION } from '../config/firebase.js';
import { parseDetailedDataXML, getKrpanoCoordinates } from './xmlParser.js';

// ===== SERVICIOS PARA LOTES =====

/**
 * Obtener todos los lotes del proyecto Martin Pescador
 */
export const getAllLotes = async () => {
  try {
    const lotesCollection = collection(db, PROJECT_PATH, LOTES_COLLECTION);
    const lotesSnapshot = await getDocs(lotesCollection);
    const lotes = lotesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return lotes;
  } catch (error) {
    console.error('Error al obtener lotes:', error);
    throw error;
  }
};

/**
 * Obtener un lote específico por ID
 */
export const getLoteById = async (loteId) => {
  try {
    const loteRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, loteId);
    const loteSnap = await getDoc(loteRef);
    
    if (loteSnap.exists()) {
      return {
        id: loteSnap.id,
        ...loteSnap.data()
      };
    } else {
      throw new Error('Lote no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener lote:', error);
    throw error;
  }
};

/**
 * Obtener lotes por estado
 */
export const getLotesByEstado = async (estado) => {
  try {
    const lotesCollection = collection(db, PROJECT_PATH, LOTES_COLLECTION);
    const q = query(lotesCollection, where('estado', '==', estado));
    const lotesSnapshot = await getDocs(q);
    const lotes = lotesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return lotes;
  } catch (error) {
    console.error('Error al obtener lotes por estado:', error);
    throw error;
  }
};

/**
 * Crear un nuevo lote
 */
export const createLote = async (loteData) => {
  try {
    const lotesCollection = collection(db, PROJECT_PATH, LOTES_COLLECTION);
    const docRef = await addDoc(lotesCollection, {
      ...loteData,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear lote:', error);
    throw error;
  }
};

/**
 * Actualizar un lote existente
 */
export const updateLote = async (loteId, loteData) => {
  try {
    const loteRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, loteId);
    await updateDoc(loteRef, {
      ...loteData,
      fechaActualizacion: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar lote:', error);
    throw error;
  }
};

/**
 * Eliminar un lote
 */
export const deleteLote = async (loteId) => {
  try {
    const loteRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, loteId);
    await deleteDoc(loteRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar lote:', error);
    throw error;
  }
};

/**
 * Inicializar datos del proyecto con nueva estructura usando datos reales del XML
 */
export const initializeProjectDataNew = async () => {
  try {
    console.log('🚀 Inicializando proyecto Martin Pescador con nueva estructura...');

    // Parsear datos detallados del XML
    const datosXML = await parseDetailedDataXML();
    const coordenadasKrpano = getKrpanoCoordinates();

    // Combinar datos XML con coordenadas Krpano (múltiples vistas por lote)
    const lotesData = Object.keys(coordenadasKrpano).map(fichaName => {
      const datosLote = datosXML[fichaName] || {};
      const coordenadasArray = coordenadasKrpano[fichaName]; // Array de vistas
      
      // Crear objeto krpano con múltiples vistas
      const krpanoData = {
        html: datosLote.html || datosLote.numero
      };
      
      // Agregar cada vista con sus coordenadas
      coordenadasArray.forEach(coord => {
        krpanoData[`vista${coord.vista}`] = {
          ath: coord.ath,
          atv: coord.atv
        };
      });
      
      // Determinar vista principal (primera en la lista)
      const vistaPrincipal = coordenadasArray[0]?.vista || 1;
      
      return {
        numero: datosLote.numero || fichaName.replace('ficha', ''),
        estado: datosLote.estado || 'disponible',
        etapa: datosLote.etapa || 1,
        html: datosLote.html || datosLote.numero,
        superficieTransito: datosLote.superficieTransito || 200,
        superficieTotal: datosLote.superficieTotal || 5000,
        superficieLote: datosLote.superficieLote || 4800,
        metrosDeOrilla: Math.floor(Math.random() * 20) + 15, // Temporal
        precio: datosLote.precio || 'Consultar',
        vistaPrincipal: vistaPrincipal, // Nueva propiedad
        totalVistas: coordenadasArray.length, // Nueva propiedad
        krpano: krpanoData
      };
    });

    // Datos manuales como fallback (los comentamos por ahora)
    /*const lotesData = [
      // VISTA 1
      { 
        numero: '1', 
        estado: 'vendido', 
        etapa: 1,
        superficieTransito: 215,
        superficieTotal: 5000,
        superficieLote: 4785,
        metrosDeOrilla: 25,
        precio: 'VENDIDO',
        krpano: { 
          html: '1',
          vista1: { ath: '28.916', atv: '35.798' } 
        }
      },
      { 
        numero: '2', 
        estado: 'vendido', 
        superficie: 1100, 
        metrosDeOrilla: 22,
        precio: 'VENDIDO',
        krpano: { vista1: { ath: '27.125', atv: '55.297' } }
      },
      { 
        numero: '3', 
        estado: 'vendido', 
        superficie: 980, 
        metrosDeOrilla: 18,
        precio: 'VENDIDO',
        krpano: { vista1: { ath: '-120.248', atv: '68.913' } }
      },
      { 
        numero: '4', 
        estado: 'vendido', 
        superficie: 1050, 
        metrosDeOrilla: 20,
        precio: 'VENDIDO',
        krpano: { vista1: { ath: '-135.452', atv: '33.403' } }
      },
      { 
        numero: '5', 
        estado: 'vendido', 
        superficie: 1150, 
        metrosDeOrilla: 24,
        precio: 'VENDIDO',
        krpano: { vista1: { ath: '-137.427', atv: '22.095' } }
      },
      { 
        numero: '6', 
        estado: 'vendido', 
        superficie: 1300, 
        metrosDeOrilla: 28,
        precio: 'VENDIDO',
        krpano: { vista1: { ath: '-137.531', atv: '14.409' } }
      },
      { 
        numero: '23', 
        estado: 'vendido', 
        superficie: 900, 
        metrosDeOrilla: 15,
        precio: 'VENDIDO',
        krpano: { vista1: { ath: '-14.599', atv: '20.573' } }
      },
      { 
        numero: '24', 
        estado: 'vendido', 
        superficie: 950, 
        metrosDeOrilla: 17,
        precio: 'VENDIDO',
        krpano: { vista1: { ath: '-50.823', atv: '26.752' } }
      },
      { 
        numero: '25', 
        estado: 'vendido', 
        superficie: 1000, 
        metrosDeOrilla: 19,
        precio: 'VENDIDO',
        krpano: { vista1: { ath: '-106.888', atv: '12.256' } }
      },

      // VISTA 2
      { 
        numero: '26', 
        estado: 'vendido', 
        superficie: 1250, 
        metrosDeOrilla: 26,
        precio: 'VENDIDO',
        krpano: { vista2: { ath: '-129.902', atv: '47.102' } }
      },
      { 
        numero: '27', 
        estado: 'vendido', 
        superficie: 1180, 
        metrosDeOrilla: 23,
        precio: 'VENDIDO',
        krpano: { vista2: { ath: '-163.899', atv: '33.271' } }
      },
      { 
        numero: '7', 
        estado: 'vendido', 
        superficie: 1400, 
        metrosDeOrilla: 30,
        precio: 'VENDIDO',
        krpano: { vista2: { ath: '40.358', atv: '72.961' } }
      },
      { 
        numero: '8', 
        estado: 'vendido', 
        superficie: 1350, 
        metrosDeOrilla: 29,
        precio: 'VENDIDO',
        krpano: { vista2: { ath: '85.018', atv: '73.506' } }
      },
      { 
        numero: '9', 
        estado: 'vendido', 
        superficie: 1200, 
        metrosDeOrilla: 25,
        precio: 'VENDIDO',
        krpano: { vista2: { ath: '119.940', atv: '68.194' } }
      },
      { 
        numero: '10', 
        estado: 'vendido', 
        superficie: 1100, 
        metrosDeOrilla: 22,
        precio: 'VENDIDO',
        krpano: { vista2: { ath: '140.277', atv: '57.559' } }
      },
      { 
        numero: '11', 
        estado: 'vendido', 
        superficie: 1050, 
        metrosDeOrilla: 21,
        precio: 'VENDIDO',
        krpano: { vista2: { ath: '146.658', atv: '47.294' } }
      },

      // VISTA 3 - DISPONIBLES
      { 
        numero: '28', 
        estado: 'disponible', 
        superficie: 1500, 
        metrosDeOrilla: 35,
        precio: 'USD 85,000',
        krpano: { vista3: { ath: '-13.371', atv: '52.450' } }
      },
      { 
        numero: '29', 
        estado: 'disponible', 
        superficie: 1450, 
        metrosDeOrilla: 32,
        precio: 'USD 82,000',
        krpano: { vista3: { ath: '-75.930', atv: '36.938' } }
      },
      { 
        numero: '12', 
        estado: 'disponible', 
        superficie: 1300, 
        metrosDeOrilla: 28,
        precio: 'USD 75,000',
        krpano: { vista3: { ath: '96.040', atv: '67.228' } }
      },
      { 
        numero: '13', 
        estado: 'disponible', 
        superficie: 1250, 
        metrosDeOrilla: 26,
        precio: 'USD 72,000',
        krpano: { vista3: { ath: '143.409', atv: '79.303' } }
      },
      { 
        numero: '14', 
        estado: 'disponible', 
        superficie: 1200, 
        metrosDeOrilla: 24,
        precio: 'USD 68,000',
        krpano: { vista3: { ath: '-136.213', atv: '71.415' } }
      },
      { 
        numero: '15', 
        estado: 'disponible', 
        superficie: 1150, 
        metrosDeOrilla: 23,
        precio: 'USD 65,000',
        krpano: { vista3: { ath: '-123.802', atv: '55.109' } }
      },
      { 
        numero: '16', 
        estado: 'disponible', 
        superficie: 1100, 
        metrosDeOrilla: 22,
        precio: 'USD 62,000',
        krpano: { vista3: { ath: '-121.778', atv: '44.420' } }
      },

      // VISTA 4 - DISPONIBLES
      { 
        numero: '30', 
        estado: 'disponible', 
        superficie: 1600, 
        metrosDeOrilla: 38,
        precio: 'USD 92,000',
        krpano: { vista4: { ath: '45.844', atv: '34.744' } }
      },
      { 
        numero: '31', 
        estado: 'disponible', 
        superficie: 1550, 
        metrosDeOrilla: 36,
        precio: 'USD 89,000',
        krpano: { vista4: { ath: '-11.168', atv: '52.328' } }
      },
      { 
        numero: '17', 
        estado: 'disponible', 
        superficie: 1400, 
        metrosDeOrilla: 30,
        precio: 'USD 78,000',
        krpano: { vista4: { ath: '89.381', atv: '32.071' } }
      },
      { 
        numero: '18', 
        estado: 'disponible', 
        superficie: 1350, 
        metrosDeOrilla: 28,
        precio: 'USD 75,500',
        krpano: { vista4: { ath: '90.637', atv: '38.446' } }
      },
      { 
        numero: '19', 
        estado: 'disponible', 
        superficie: 1300, 
        metrosDeOrilla: 27,
        precio: 'USD 73,000',
        krpano: { vista4: { ath: '96.059', atv: '44.452' } }
      },
      { 
        numero: '20', 
        estado: 'disponible', 
        superficie: 1250, 
        metrosDeOrilla: 25,
        precio: 'USD 70,000',
        krpano: { vista4: { ath: '105.982', atv: '53.599' } }
      },
      { 
        numero: '21', 
        estado: 'disponible', 
        superficie: 1200, 
        metrosDeOrilla: 24,
        precio: 'USD 67,000',
        krpano: { vista4: { ath: '121.651', atv: '65.161' } }
      },
      { 
        numero: '22', 
        estado: 'disponible', 
        superficie: 1150, 
        metrosDeOrilla: 23,
        precio: 'USD 64,000',
        krpano: { vista4: { ath: '155.722', atv: '73.411' } }
      }
    ];*/

    // Crear cada lote en la nueva estructura
    for (const loteData of lotesData) {
      const loteRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, `lote-${loteData.numero}`);
      await setDoc(loteRef, {
        ...loteData,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      });
      console.log(`✓ Lote ${loteData.numero} creado en nueva estructura`);
    }

    // Crear información general del proyecto
    const projectInfoRef = doc(db, PROJECT_PATH);
    await setDoc(projectInfoRef, {
      nombre: 'Reserva Martin Pescador',
      descripcion: 'Proyecto inmobiliario con lotes con vista al lago',
      totalLotes: lotesData.length,
      lotesDisponibles: lotesData.filter(l => l.estado === 'disponible').length,
      lotesVendidos: lotesData.filter(l => l.estado === 'vendido').length,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });

    console.log('✅ Proyecto inicializado con nueva estructura');
    return {
      success: true,
      totalLotes: lotesData.length,
      disponibles: lotesData.filter(l => l.estado === 'disponible').length,
      vendidos: lotesData.filter(l => l.estado === 'vendido').length
    };
  } catch (error) {
    console.error('❌ Error al inicializar con nueva estructura:', error);
    throw error;
  }
};

/**
 * Obtener lotes que aparecen en múltiples vistas
 */
export const getLotesMultipleVistas = async () => {
  try {
    const lotesCollection = collection(db, PROJECT_PATH, LOTES_COLLECTION);
    const q = query(lotesCollection, where('totalVistas', '>', 1));
    const lotesSnapshot = await getDocs(q);
    const lotes = lotesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return lotes;
  } catch (error) {
    console.error('Error al obtener lotes con múltiples vistas:', error);
    throw error;
  }
};

/**
 * Obtener lotes por vista específica
 */
export const getLotesByVista = async (numeroVista) => {
  try {
    const allLotes = await getAllLotes();
    return allLotes.filter(lote => {
      const krpano = lote.krpano || {};
      return Object.keys(krpano).some(key => 
        key === `vista${numeroVista}` && krpano[key].ath && krpano[key].atv
      );
    });
  } catch (error) {
    console.error(`Error al obtener lotes de vista ${numeroVista}:`, error);
    throw error;
  }
};

export default {
  getAllLotes,
  getLoteById,
  getLotesByEstado,
  getLotesMultipleVistas,
  getLotesByVista,
  createLote,
  updateLote,
  initializeProjectDataNew
};