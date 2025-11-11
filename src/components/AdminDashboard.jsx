import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  FormControl,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  ExitToApp as ExitToAppIcon,
  AccountCircle,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { logout } from '../store/features/auth/authSlice';
import { fetchAllSpots } from '../store/features/firestore/firestoreSlice';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { spots: lotes, loading, error } = useSelector((state) => state.firestore);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [editingLote, setEditingLote] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  // Ordenar lotes por número de forma ascendente
  const sortedLotes = lotes ? [...lotes].sort((a, b) => {
    const numA = parseInt(a.numero) || 0;
    const numB = parseInt(b.numero) || 0;
    return numA - numB;
  }) : [];

  useEffect(() => {
    if (!user) {
      return;
    }
    
    dispatch(fetchAllSpots());
  }, [dispatch, user]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    // El PrivateRoute se encargará de mostrar el login automáticamente
  };

  const handleEditLote = (lote) => {
    setEditingLote(lote.id);
    setEditData({
      numero: lote.numero || '',
      estado: lote.estado || 'disponible',
      precio: lote.precio || '',
      superficie: lote.superficie || '',
      etapa: extraerEtapaDesdeKrpano(lote)
    });
  };

  const handleCancelEdit = () => {
    setEditingLote(null);
    setEditData({});
  };

  const handleNavigateToEditor = (loteId) => {
    navigate(`/admin/lote/${loteId}`);
  };

  const handleSaveLote = async (loteId) => {
    setSaving(true);
    try {
      const updateData = {
        numero: editData.numero,
        estado: editData.estado
      };

      // Solo agregar campos numéricos si tienen valor
      if (editData.precio) {
        updateData.precio = parseFloat(editData.precio);
      }
      if (editData.superficie) {
        updateData.superficie = parseFloat(editData.superficie);
      }
      if (editData.etapa) {
        updateData.etapa = parseInt(editData.etapa);
      }

      const PROJECT_PATH = 'proyectos/martin-pescador';
      const loteRef = doc(db, PROJECT_PATH, 'lotes', loteId);
      await updateDoc(loteRef, updateData);

      // Recargar datos
      dispatch(fetchAllSpots());
      setEditingLote(null);
      setEditData({});
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para extraer etapa desde la vista de krpano
  const extraerEtapaDesdeKrpano = (lote) => {
    if (lote.etapa) {
      return lote.etapa; // Si ya tiene etapa directa, usarla
    }
    
    // Extraer desde krpano.vista
    if (lote.krpano) {
      const vistas = Object.keys(lote.krpano);
      if (vistas.length > 0) {
        const primeraVista = vistas[0]; // Ej: 'vista1', 'vista2', etc.
        const numeroVista = primeraVista.replace('vista', '');
        return parseInt(numeroVista) || 1;
      }
    }
    
    return 1; // Default
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Container>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Administración de Lotes - Martin Pescador
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Bienvenido, {user?.email}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ExitToAppIcon sx={{ mr: 1 }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography 
            variant={{ xs: 'h5', sm: 'h4' }} 
            component="h1" 
            gutterBottom
            sx={{ textAlign: { xs: 'center', sm: 'left' } }}
          >
            Lista de Lotes
          </Typography>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error: {error}
          </Typography>
        )}

        <TableContainer 
          component={Paper} 
          sx={{ 
            height: 'calc(100vh - 250px)',  // Usar el máximo alto disponible menos header y padding
            overflow: 'auto',               // Scroll automático
            backgroundColor: '#f8f9fa'      // Fondo gris suave
          }}
        >
          <Table sx={{ minWidth: { xs: 500, sm: 650 } }} aria-label="tabla de lotes" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e9ecef' }}>
                <TableCell sx={{ fontWeight: 'bold', minWidth: { xs: 60, sm: 80 } }}>Número</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: { xs: 100, sm: 120 } }}>Estado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: { xs: 80, sm: 100 } }}>📸 Imágenes</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: { xs: 60, sm: 80 } }}>Etapa</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: { xs: 100, sm: 120 } }}>Precio (UF)</TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 'bold', 
                    minWidth: { xs: 120, sm: 150 },
                    display: { xs: 'none', md: 'table-cell' } // Ocultar en mobile
                  }}
                >
                  Superficie (m²)
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: 'bold', 
                    minWidth: { xs: 120, sm: 150 },
                    verticalAlign: 'middle',
                    textAlign: 'center'
                  }}
                >
                  Acciones (✏️ Rápido / 📸 Completo)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedLotes.map((lote, index) => (
                <TableRow
                  key={lote.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                    '&:hover': {
                      backgroundColor: '#e3f2fd'
                    }
                  }}
                >
                  {/* Número del Lote */}
                  <TableCell component="th" scope="row">
                    <Typography variant="h6" color="primary">
                      {lote.numero}
                    </Typography>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    {editingLote === lote.id ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={editData.estado || 'disponible'}
                          onChange={(e) => handleInputChange('estado', e.target.value)}
                        >
                          <MenuItem value="disponible">Disponible</MenuItem>
                          <MenuItem value="reservado">Reservado</MenuItem>
                          <MenuItem value="vendido">Vendido</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={(lote.estado || 'disponible').charAt(0).toUpperCase() + (lote.estado || 'disponible').slice(1).toLowerCase()}
                        size="small"
                        variant="filled"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          // Colores exactos según especificación
                          ...(lote.estado === 'disponible' && { 
                            backgroundColor: '#ffffff', 
                            color: '#000000',
                            border: '1px solid #e0e0e0' 
                          }),
                          ...(lote.estado === 'reservado' && { 
                            backgroundColor: '#2196f3', 
                            color: '#ffffff' 
                          }),
                          ...(lote.estado === 'vendido' && { 
                            backgroundColor: '#f44336', 
                            color: '#ffffff' 
                          })
                        }}
                      />
                    )}
                  </TableCell>

                  {/* Indicador de Imágenes */}
                  <TableCell align="center">
                    {lote.imagenes && lote.imagenes.length > 0 ? (
                      <Chip
                        icon={<ImageIcon />}
                        label={`${lote.imagenes.length}`}
                        color="success"
                        size="small"
                        variant="filled"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    ) : (
                      <Chip
                        label="Sin fotos"
                        color="default"
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          opacity: 0.6
                        }}
                      />
                    )}
                  </TableCell>

                  {/* Etapa */}
                  <TableCell align="center">
                    {editingLote === lote.id ? (
                      <TextField
                        value={editData.etapa || 1}
                        onChange={(e) => handleInputChange('etapa', e.target.value)}
                        variant="outlined"
                        size="small"
                        type="number"
                        fullWidth
                        inputProps={{ min: 1, max: 4 }}
                      />
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: '#666',
                          backgroundColor: '#f5f5f5',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}
                      >
                        {extraerEtapaDesdeKrpano(lote)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Precio */}
                  <TableCell align="right">
                    {editingLote === lote.id ? (
                      <TextField
                        value={editData.precio || ''}
                        onChange={(e) => handleInputChange('precio', e.target.value)}
                        variant="outlined"
                        size="small"
                        type="number"
                        fullWidth
                        label="Precio en UF"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">UF</InputAdornment>
                        }}
                      />
                    ) : (
                      lote.precio ? `UF ${typeof lote.precio === 'number' ? lote.precio.toLocaleString('es-CL') : lote.precio}` : 'N/A'
                    )}
                  </TableCell>

                  {/* Superficie */}
                  <TableCell 
                    align="right"
                    sx={{ display: { xs: 'none', md: 'table-cell' } }} // Ocultar en mobile
                  >
                    {editingLote === lote.id ? (
                      <TextField
                        value={editData.superficie || ''}
                        onChange={(e) => handleInputChange('superficie', e.target.value)}
                        variant="outlined"
                        size="small"
                        type="number"
                        fullWidth
                        InputProps={{
                          endAdornment: <InputAdornment position="end">m²</InputAdornment>
                        }}
                      />
                    ) : (
                      lote.superficie ? `${lote.superficie.toLocaleString('es-ES')} m²` : 'N/A'
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell 
                    align="center"
                    sx={{ 
                      verticalAlign: 'middle',
                      minWidth: { xs: 120, sm: 150 }
                    }}
                  >
                    {editingLote === lote.id ? (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleSaveLote(lote.id)}
                          disabled={saving}
                          size="small"
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          size="small"
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditLote(lote)}
                          size="small"
                          title="Edición rápida"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleNavigateToEditor(lote.id)}
                          size="small"
                          title="Editor completo (con imágenes)"
                        >
                          <ImageIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {(!lotes || lotes.length === 0) && !loading && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No hay lotes disponibles
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
