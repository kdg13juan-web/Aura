import type { AuthError } from '../types/auth';

/**
 * Traduce los códigos de error de Firebase Authentication a mensajes claros y amigables en español.
 */
export function mapFirebaseAuthError(error: any): AuthError {
  const code = error?.code || '';
  const message = error?.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return {
        field: 'email',
        code,
        message: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.',
      };

    case 'auth/invalid-email':
      return {
        field: 'email',
        code,
        message: 'La dirección de correo electrónico no es válida (ejemplo: usuario@correo.com).',
      };

    case 'auth/user-disabled':
      return {
        field: 'email',
        code,
        message: 'Esta cuenta ha sido inhabilitada. Contacta al administrador.',
      };

    case 'auth/user-not-found':
      return {
        field: 'email',
        code,
        message: 'No existe ninguna cuenta registrada con este correo. Regístrate para comenzar.',
      };

    case 'auth/wrong-password':
      return {
        field: 'password',
        code,
        message: 'Contraseña incorrecta. Por favor verifica tus credenciales.',
      };

    case 'auth/invalid-credential':
      return {
        field: 'general',
        code,
        message: 'El correo electrónico o la contraseña ingresada son incorrectos.',
      };

    case 'auth/weak-password':
      return {
        field: 'password',
        code,
        message: 'La contraseña es muy débil. Debe tener al menos 6 caracteres.',
      };

    case 'auth/popup-closed-by-user':
      return {
        field: 'general',
        code,
        message: 'La ventana de autenticación con Google fue cerrada antes de completar el inicio de sesión.',
      };

    case 'auth/popup-blocked':
      return {
        field: 'general',
        code,
        message: 'El navegador bloqueó la ventana emergente de Google. Habilita los popups para este sitio.',
      };

    case 'auth/account-exists-with-different-credential':
      return {
        field: 'email',
        code,
        message: 'Ya existe una cuenta registrada con este correo usando otro método de acceso.',
      };

    case 'auth/too-many-requests':
      return {
        field: 'general',
        code,
        message: 'Demasiados intentos fallidos consecutivos. Por seguridad, espera unos minutos e inténtalo de nuevo.',
      };

    case 'auth/network-request-failed':
      return {
        field: 'general',
        code,
        message: 'Error de red o conexión. Por favor verifica tu conexión a internet.',
      };

    case 'auth/cancelled-popup-request':
      return {
        field: 'general',
        code,
        message: 'Se canceló la solicitud de autenticación emergente.',
      };

    case 'auth/operation-not-allowed':
      return {
        field: 'general',
        code,
        message: 'Este método de autenticación no está habilitado en Firebase Console (Authentication > Sign-in method).',
      };

    default:
      return {
        field: 'general',
        code,
        message: message || 'Ocurrió un error inesperado al procesar la autenticación.',
      };
  }
}

export function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
    'auth/invalid-email': 'El email no es válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-not-found': 'No existe una cuenta con ese email.',
    'auth/wrong-password': 'La contraseña es incorrecta.',
    'auth/invalid-credential': 'Email o contraseña incorrectos.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intentá más tarde.',
    'auth/popup-closed-by-user': 'Cerraste el popup antes de completar el inicio de sesión.',
    'auth/cancelled-popup-request': 'Se canceló el inicio de sesión con Google.',
    'auth/network-request-failed': 'Error de red. Verificá tu conexión a internet.',
  }

  return messages[code] ?? 'Ocurrió un error inesperado. Intentá de nuevo.'
}
