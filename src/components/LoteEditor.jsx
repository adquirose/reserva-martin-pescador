import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, PROJECT_PATH, LOTES_COLLECTION } from '../config/firebase';
import LoteImageUploader from './LoteImageUploader';

const LoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const dispatch = useDispatch(); // Para futuras actualizaciones de Redux
  const { spots: lotes } = useSelector((state) => state.firestore);
  
  const [loteData, setLoteData] = useState(null);
  const [loadingLote, setLoadingLote] = useState(true);
  const [formData, setFormData] = useState({
    estado: 'disponible',
    precio: '',
    superficie: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Obtener lote desde Redux o Firebase
  const lote = lotes?.[id] || loteData;

  // Cargar lote si no está en Redux
  useEffect(() => {
    const cargarLote = async () => {
      if (lotes?.[id]) {
        // Ya está en Redux
        setLoadingLote(false);
        return;
      }

      try {
        setLoadingLote(true);
        const loteRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, id);
        const loteSnap = await getDoc(loteRef);
        
        if (loteSnap.exists()) {
          setLoteData({ id: loteSnap.id, ...loteSnap.data() });
        } else {
          setError(`Lote ${id} no encontrado`);
        }
      } catch (err) {
        console.error('Error cargando lote:', err);
        setError('Error cargando datos del lote');
      } finally {
        setLoadingLote(false);
      }
    };

    cargarLote();
  }, [id, lotes]);

  useEffect(() => {
    if (lote) {
      setFormData({
        estado: lote.estado || 'disponible',
        precio: lote.precio || '',
        superficie: lote.superficie || ''
      });
    }
  }, [lote]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validaciones básicas
      if (formData.precio && isNaN(parseFloat(formData.precio))) {
        throw new Error('El precio debe ser un número válido');
      }

      if (formData.superficie && isNaN(parseFloat(formData.superficie))) {
        throw new Error('La superficie debe ser un número válido');
      }

      // Preparar datos para Firebase - Solo campos editables
      const updateData = {
        estado: formData.estado
      };

      // Solo incluir precio si tiene valor
      if (formData.precio) {
        updateData.precio = parseFloat(formData.precio);
      }

      // Solo incluir superficie si tiene valor
      if (formData.superficie) {
        updateData.superficie = parseFloat(formData.superficie);
      }

      // Actualizar en Firebase con la ruta correcta
      const loteRef = doc(db, PROJECT_PATH, LOTES_COLLECTION, id);
      await updateDoc(loteRef, updateData);

      setSuccess('Lote actualizado correctamente');
      
      // Recargar datos en Redux si es necesario
      // dispatch(cargarLotes());
      
    } catch (err) {
      setError(err.message || 'Error al actualizar el lote');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  if (loadingLote) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando datos del lote...</Typography>
      </Box>
    );
  }

  if (!lote) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          Lote {id} no encontrado
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Volver al Admin
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      height: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Editar Lote {lote?.numero || id}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Contenido con scroll */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        maxWidth: 800, 
        mx: 'auto', 
        p: 3, 
        width: '100%'
      }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Información del Lote
          </Typography>
          
          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Número del Lote - SOLO LECTURA */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Número del Lote"
                  value={lote?.numero || id}
                  disabled
                  variant="filled"
                  helperText="El número no se puede modificar"
                />
              </Grid>

              {/* Estado */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={formData.estado}
                    label="Estado"
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <MenuItem value="disponible">Disponible</MenuItem>
                    <MenuItem value="reservado">Reservado</MenuItem>
                    <MenuItem value="vendido">Vendido</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Precio */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Precio (UF)"
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleInputChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">UF</InputAdornment>,
                  }}
                  helperText="Opcional - Dejar vacío si no está definido"
                />
              </Grid>

              {/* Superficie */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Superficie (m²)"
                  name="superficie"
                  type="number"
                  value={formData.superficie}
                  onChange={handleInputChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                  }}
                  helperText="Opcional"
                />
              </Grid>

              {/* Descripción */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  multiline
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  disabled={loading}
                  helperText="Información adicional sobre el lote"
                />
              </Grid>

              {/* Botones */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Gestor de imágenes con Cloudinary */}
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
            📸 Gestión de Imágenes del Lote
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sube imágenes hasta 5MB. Se optimizarán automáticamente a 200KB máximo.
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <LoteImageUploader 
            loteId={id}
            currentImages={lote?.imagenes || []}
            onImagesUpdated={(images) => {
              console.log('Imágenes actualizadas:', images);
              // Actualizar estado local si es necesario
              setSuccess('Imágenes actualizadas correctamente');
              setError('');
            }}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default LoteEditor;