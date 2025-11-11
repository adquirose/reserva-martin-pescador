import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../config/firebase';

class AuthService {
  constructor() {
    this.auth = auth;
  }

  // Login con email y contraseña
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Crear usuario (solo para setup inicial)
  async createUser(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Observar cambios de autenticación
  onAuthStateChange(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Usuario actual
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Mensajes de error en español
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/too-many-requests': 'Demasiados intentos. Intente más tarde',
      'auth/network-request-failed': 'Error de conexión',
      'auth/email-already-in-use': 'Este email ya está en uso',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres'
    };
    
    return errorMessages[errorCode] || 'Error de autenticación';
  }
}

export const authService = new AuthService();