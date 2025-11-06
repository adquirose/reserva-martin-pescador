import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box } from '@mui/material'
import TourOverlay from '../TourOverlay'
import FichaLote from '../FichaLote'
import { registerKrpanoSpotLoader } from '../../services/krpanoSpotsService'
import { 
  mostrarFicha, 
  cerrarFicha, 
  selectFichaAbierta, 
  selectLoteSeleccionado 
} from '../../store/features/ficha/fichaSlice'

export const Krpano = () => {
    const krpanoContainerRef = useRef(null)
    const krpanoObj = useRef(null)
    const scriptLoadedRef = useRef(false)
    
    // Redux state y dispatch
    const dispatch = useDispatch()
    const fichaAbierta = useSelector(selectFichaAbierta)
    const loteSeleccionado = useSelector(selectLoteSeleccionado)

    // Función global para acceso desde el mapa (similar a mostrarFicha en fundo-refugia)
    useEffect(() => {
        window.toggleMapFromKrpano = (action) => {
            console.log('🎯 Acción recibida desde Krpano:', action)
            // Aquí podríamos manejar acciones específicas del mapa si fuera necesario
        }
        return () => { delete window.toggleMapFromKrpano }
    }, [])

    // Configurar Redux para ficha
    useEffect(() => {
        // Exponer store y acciones globalmente
        window.store = { dispatch };
        window.fichaActions = { mostrarFicha };
        
        // Manejar evento personalizado como fallback
        const handleMostrarFicha = (event) => {
            console.log('📋 Evento personalizado recibido:', event.detail);
            dispatch(mostrarFicha(event.detail));
        };

        window.addEventListener('mostrarFichaLote', handleMostrarFicha);
        
        return () => {
            window.removeEventListener('mostrarFichaLote', handleMostrarFicha);
            delete window.store;
            delete window.fichaActions;
        };
    }, [dispatch])

    // Cerrar ficha con tecla Escape
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && fichaAbierta) {
                dispatch(cerrarFicha());
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [fichaAbierta, dispatch])

    // Montar krpano al cargar el componente - EXACTO como en fundo-refugia
    useEffect(() => {
        if (!krpanoContainerRef.current) {
            console.error('krpanoContainerRef.current no existe');
            return;
        }
        krpanoContainerRef.current.innerHTML = '';
        
        // Verificar tamaño del contenedor
        setTimeout(() => {
            if (krpanoContainerRef.current) {
                const w = krpanoContainerRef.current.offsetWidth;
                const h = krpanoContainerRef.current.offsetHeight;
                if (w === 0 || h === 0) {
                    krpanoContainerRef.current.innerHTML = '<div style="color:red;padding:20px;">Error: El contenedor de krpano tiene tamaño 0x0. Revisa el CSS y el layout.</div>';
                }
            }
        }, 100);
        
        // Función para inicializar krpano - EXACTO como en fundo-refugia
        const initKrpano = () => {
            setTimeout(() => {
                if (window.embedpano && krpanoContainerRef.current) {
                    window.embedpano({
                        swf: '/krpano/tour.swf',
                        xml: '/krpano/tour.xml',
                        target: krpanoContainerRef.current,
                        html5: 'only',
                        width: '100%',
                        height: '100%',
                        passQueryParameters: true,
                        onready: (krpano_interface) => {
                            krpanoObj.current = krpano_interface
                            
                            // Exponer globalmente para acceso desde componentes
                            window.krpano = krpano_interface;
                            window.krpanoInstance = krpano_interface;
                            
                            // Registrar funciones de carga de spots
                            registerKrpanoSpotLoader();
                            
                            console.log('🎯 Krpano listo con servicio de spots');
                        }
                    })
                } else {
                    console.error('window.embedpano no está disponible')
                    if (krpanoContainerRef.current) {
                        krpanoContainerRef.current.innerHTML = '<div style="color:red;padding:20px;">Error: No se pudo inicializar krpano. Revisa la consola.</div>';
                    }
                }
            }, 50)
        }

        // Cargar script solo si no está cargado - EXACTO como en fundo-refugia
        if (!scriptLoadedRef.current) {
            scriptLoadedRef.current = true;
            const script = document.createElement('script');
            script.src = '/krpano/tour.js';
            script.onload = () => {
                initKrpano();
            };
            script.onerror = () => {
                console.error('No se pudo cargar /krpano/tour.js');
                scriptLoadedRef.current = false;
                if (krpanoContainerRef.current) {
                    krpanoContainerRef.current.innerHTML = '<div style="color:red;padding:20px;">Error: No se pudo cargar /krpano/tour.js</div>';
                }
            };
            document.head.appendChild(script);
        } else if (window.embedpano) {
            initKrpano();
        }

        return () => {
            if (krpanoObj.current && window.removepano) {
                window.removepano(krpanoObj.current.get('id'));
                krpanoObj.current = null;
            }
        }
    }, [])

    return (
        <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
            <div ref={krpanoContainerRef} style={{height:'100%',width:'100%'}}/>
            {/* Overlay de controles encima del tour */}
            <TourOverlay />
            {/* Ficha de lote */}
            <FichaLote 
                lote={loteSeleccionado}
                open={fichaAbierta}
                onClose={() => dispatch(cerrarFicha())}
            />
        </Box>
    )
}