import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon 
} from '@mui/icons-material';
import { loginStart, loginSuccess, loginFailure } from '../store/features/auth/authSlice';
import { authService } from '../services/authService';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      dispatch(loginFailure('Por favor complete todos los campos'));
      return;
    }

    dispatch(loginStart());
    
    const result = await authService.login(formData.email, formData.password);
    
    if (result.success) {
      dispatch(loginSuccess(result.user));
    } else {
      dispatch(loginFailure(result.error));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        padding: 2
      }}
    >
      {loading ? (
        // Loading spinner centrado
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress size={60} sx={{ color: 'white' }} />
        </Box>
      ) : (
        // Formulario de login
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 3
          }}
        >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Administración
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Martín Pescador
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            disabled={loading}
            autoComplete="email"
            autoFocus
          />

          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            disabled={loading}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              borderRadius: 2
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <Typography variant="body2" color="text.secondary" align="center">
          Acceso restringido a administradores
        </Typography>
      </Paper>
      )}
    </Box>
  );
};

export default AdminLogin;