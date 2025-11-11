import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../store/features/auth/authSlice';
import { authService } from '../services/authService';
import AdminLogin from './AdminLogin';
import LoadingScreen from './LoadingScreen';

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado
        dispatch(loginSuccess({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        }));
      } else {
        // Usuario no autenticado
        dispatch(logout());
      }
      
      // Marcar que la inicialización ha terminado
      if (initializing) {
        setTimeout(() => {
          setInitializing(false);
        }, 800); // Pequeño delay para una transición suave
      }
    });

    return () => unsubscribe();
  }, [dispatch, initializing]);

  // Mostrar loading durante la inicialización o verificación de autenticación
  if (initializing || loading) {
    return (
      <LoadingScreen 
        message="Verificando autenticación..."
        fullScreen={true}
      />
    );
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <AdminLogin />;
  }

  // Usuario autenticado, mostrar contenido protegido
  return children;
};

export default PrivateRoute;