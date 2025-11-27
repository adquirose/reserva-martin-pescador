import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography } from '@mui/material'
import TourOverlay from '../TourOverlay'
import FichaLote from '../FichaLote'
import LoadingScreen from '../LoadingScreen'
import { registerKrpanoSpotLoader } from '../../services/krpanoSpotsService'
import { 
  mostrarFicha, 
  cerrarFicha, 
  selectFichaAbierta, 
  selectLoteSeleccionado 
} from '../../store/features/ficha/fichaSlice'
import grupoMartinPescadorLogo from '../../assets/grupo-martinpescador.png'

export const Krpano = () => {
    const krpanoContainerRef = useRef(null)
    const krpanoObj = useRef(null)
    const scriptLoadedRef = useRef(false)
    const [isLoading, setIsLoading] = useState(true)
    const [loadingMessage, setLoadingMessage] = useState('Iniciando tour virtual...')
    const [hideProjectLogo, setHideProjectLogo] = useState(false)
    
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

    // Escuchar cambios en el estado del mapa para ocultar/mostrar el logo
    useEffect(() => {
        const handleMapStateChange = (event) => {
            const { state } = event.detail;
            // Ocultar logo cuando el mapa está visible (maximizado) o minimizado
            setHideProjectLogo(state === 'visible' || state === 'minimized');
        };

        window.addEventListener('krpano-map-state-change', handleMapStateChange);
        return () => window.removeEventListener('krpano-map-state-change', handleMapStateChange);
    }, [])

    // Montar krpano al cargar el componente - EXACTO como en fundo-refugia
    useEffect(() => {
        setLoadingMessage('Cargando recursos del tour...');
        
        if (!krpanoContainerRef.current) {
            console.error('krpanoContainerRef.current no existe');
            setIsLoading(false);
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
                    setIsLoading(false);
                }
            }
        }, 100);
        
        // Función para inicializar krpano - EXACTO como en fundo-refugia
        const initKrpano = () => {
            setLoadingMessage('Inicializando tour virtual...');
            
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
                            
                            // Registrar funciones de carga de spots (legacy)
                            registerKrpanoSpotLoader();
                            
                            setLoadingMessage('Cargando spots...');
                            
                            // ⭐ NUEVO: Inicializar sistema simple de spots
                            setTimeout(async () => {
                                try {
                                    const { inicializarSpotsSimple } = await import('../../services/simpleSpotsLoader.js');
                                    const resultado = await inicializarSpotsSimple();
                                    console.log('🎯 Sistema simple de spots inicializado:', resultado);
                                    
                                    // Ocultar loading cuando todo esté listo
                                    setIsLoading(false);
                                } catch (error) {
                                    console.error('❌ Error inicializando spots simples:', error);
                                    setIsLoading(false);
                                }
                            }, 1000); // Delay para asegurar que krpano esté completamente listo
                            
                            console.log('🎯 Krpano listo con servicio de spots');
                        }
                    })
                } else {
                    console.error('window.embedpano no está disponible')
                    if (krpanoContainerRef.current) {
                        krpanoContainerRef.current.innerHTML = '<div style="color:red;padding:20px;">Error: No se pudo inicializar krpano. Revisa la consola.</div>';
                    }
                    setIsLoading(false);
                }
            }, 50)
        }

        // Cargar script solo si no está cargado - EXACTO como en fundo-refugia
        if (!scriptLoadedRef.current) {
            scriptLoadedRef.current = true;
            setLoadingMessage('Cargando librerías de krpano...');
            
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
                setIsLoading(false);
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
            
            {/* Loading overlay mientras se carga el tour */}
            {isLoading && (
                <LoadingScreen 
                    message={loadingMessage}
                    fullScreen={false}
                />
            )}
            
            {/* Overlay de controles encima del tour */}
            <TourOverlay />
            
            {/* Footer con logo del proyecto */}
            {!isLoading && !hideProjectLogo && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: { xs: 10, sm: 20 },
                        right: { xs: 10, sm: 20 },
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 2 },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        padding: { xs: '8px 12px', sm: '12px 20px' },
                        borderRadius: { xs: '16px', sm: '25px' },
                        zIndex: 500, // Menor que el mapa de Krpano
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s ease',
                        opacity: hideProjectLogo ? 0 : 1,
                        transform: hideProjectLogo ? 'scale(0.8)' : 'scale(1)'
                    }}
                >
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: '#ffffff', 
                            fontSize: { xs: '12px', sm: '14px' },
                            fontWeight: 500,
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                            display: { xs: 'none', sm: 'block' } // Ocultar texto en móvil
                        }}
                    >
                        Un proyecto de
                    </Typography>
                    <img 
                        src={grupoMartinPescadorLogo} 
                        alt="Grupo Martín Pescador"
                        style={{
                            height: 'clamp(24px, 4vw, 36px)', // Responsive: 24px en móvil, hasta 36px en desktop
                            width: 'auto',
                            filter: 'brightness(1.2) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))'
                        }}
                    />
                </Box>
            )}
            
            {/* Ficha de lote */}
            <FichaLote 
                lote={loteSeleccionado}
                open={fichaAbierta}
                onClose={() => dispatch(cerrarFicha())}
            />
        </Box>
    )
}