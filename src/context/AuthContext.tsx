import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterCredentials, AuthError, GoogleAccount } from '../types/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { mapFirebaseAuthError } from '../utils/firebaseErrors';

interface StoredUserAccount {
  user: User;
  passwordHash: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseActive: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: AuthError }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: AuthError }>;
  loginWithGoogle: (account?: GoogleAccount) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_CURRENT_USER = 'aura_auth_current_user_v2';
const STORAGE_KEY_USERS_DB = 'aura_auth_users_db_v2';

// Pre-seeded starter accounts for demo testing
const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    user: {
      id: 'usr_demo_01',
      name: 'Alex Rivera',
      email: 'demo@aura.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'email',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    },
    passwordHash: '123456',
  },
];

// Helper: Convert Firebase User to App User format
const mapFirebaseUserToUser = (fbUser: FirebaseUser): User => {
  const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Usuario'),
    avatar: fbUser.photoURL || undefined,
    provider: isGoogle ? 'google' : 'email',
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    lastLoginAt: fbUser.metadata.lastSignInTime || new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth & listen to Firebase onAuthStateChanged
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured) {
      // Real Firebase Authentication Listener
      unsubscribe = onAuthStateChanged(
        auth,
        (fbUser) => {
          if (fbUser) {
            const user = mapFirebaseUserToUser(fbUser);
            setCurrentUser(user);
            localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
          } else {
            setCurrentUser(null);
            localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
            sessionStorage.removeItem(STORAGE_KEY_CURRENT_USER);
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn('Firebase onAuthStateChanged error:', error);
          loadLocalSession();
        }
      );
    } else {
      loadLocalSession();
    }

    return () => unsubscribe();
  }, []);

  const loadLocalSession = () => {
    try {
      const existingDb = localStorage.getItem(STORAGE_KEY_USERS_DB);
      if (!existingDb) {
        localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(DEFAULT_ACCOUNTS));
      }

      const savedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error al inicializar sesión:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsersDb = (): StoredUserAccount[] => {
    try {
      const db = localStorage.getItem(STORAGE_KEY_USERS_DB);
      return db ? JSON.parse(db) : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  };

  const saveUsersDb = (accounts: StoredUserAccount[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(accounts));
    } catch (e) {
      console.error('Error al guardar base de datos de usuarios:', e);
    }
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // 1. INICIAR SESIÓN (Firebase Email & Password)
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: AuthError }> => {
    const { email, password, rememberMe = true } = credentials;
    const cleanEmail = email.trim().toLowerCase();

    // Client Validations
    if (!cleanEmail) {
      return {
        success: false,
        error: { field: 'email', message: 'Por favor ingresa tu correo electrónico.' },
      };
    }

    if (!isValidEmail(cleanEmail)) {
      return {
        success: false,
        error: { field: 'email', message: 'El formato del correo electrónico no es válido (ejemplo: usuario@correo.com).' },
      };
    }

    if (!password) {
      return {
        success: false,
        error: { field: 'password', message: 'Por favor ingresa tu contraseña.' },
      };
    }

    // Try Firebase Authentication
    if (isFirebaseConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const appUser = mapFirebaseUserToUser(userCredential.user);
        setCurrentUser(appUser);
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(appUser));
        } else {
          sessionStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(appUser));
        }
        return { success: true };
      } catch (fbError: any) {
        return { success: false, error: mapFirebaseAuthError(fbError) };
      }
    }

    // Fallback: Local database authentication
    const db = getUsersDb();
    const account = db.find((acc) => acc.user.email.toLowerCase() === cleanEmail);

    if (!account) {
      return {
        success: false,
        error: {
          field: 'email',
          message: 'No existe ninguna cuenta registrada con este correo. Regístrate para comenzar.',
        },
      };
    }

    if (account.passwordHash !== password) {
      return {
        success: false,
        error: {
          field: 'password',
          message: 'Contraseña incorrecta. Por favor verifica tus credenciales.',
        },
      };
    }

    const updatedUser: User = {
      ...account.user,
      lastLoginAt: new Date().toISOString(),
    };

    const updatedDb = db.map((acc) =>
      acc.user.id === account.user.id ? { ...acc, user: updatedUser } : acc
    );
    saveUsersDb(updatedDb);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(updatedUser));
    }

    setCurrentUser(updatedUser);
    return { success: true };
  };

  // 2. REGISTRO (Firebase Create User With Email & Password)
  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: AuthError }> => {
    const { name, email, password, confirmPassword } = credentials;
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      return {
        success: false,
        error: { field: 'name', message: 'Por favor ingresa tu nombre completo.' },
      };
    }

    if (cleanName.length < 2) {
      return {
        success: false,
        error: { field: 'name', message: 'El nombre debe tener al menos 2 caracteres.' },
      };
    }

    if (!cleanEmail) {
      return {
        success: false,
        error: { field: 'email', message: 'Por favor ingresa tu correo electrónico.' },
      };
    }

    if (!isValidEmail(cleanEmail)) {
      return {
        success: false,
        error: { field: 'email', message: 'Ingresa una dirección de correo válida (ejemplo: usuario@correo.com).' },
      };
    }

    if (!password) {
      return {
        success: false,
        error: { field: 'password', message: 'Por favor ingresa una contraseña.' },
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: { field: 'password', message: 'La contraseña debe tener al menos 6 caracteres.' },
      };
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return {
        success: false,
        error: { field: 'confirmPassword', message: 'Las contraseñas no coinciden. Por favor verifícalas.' },
      };
    }

    // Try Firebase Registration
    if (isFirebaseConfigured) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(userCredential.user, {
          displayName: cleanName,
        });

        const appUser = mapFirebaseUserToUser(userCredential.user);
        appUser.name = cleanName;
        setCurrentUser(appUser);
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(appUser));
        return { success: true };
      } catch (fbError: any) {
        return { success: false, error: mapFirebaseAuthError(fbError) };
      }
    }

    // Fallback: Local registration
    const db = getUsersDb();
    const existing = db.find((acc) => acc.user.email.toLowerCase() === cleanEmail);

    if (existing) {
      return {
        success: false,
        error: {
          field: 'email',
          message: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.',
        },
      };
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      provider: 'email',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const newAccount: StoredUserAccount = {
      user: newUser,
      passwordHash: password,
    };

    saveUsersDb([...db, newAccount]);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
    setCurrentUser(newUser);

    return { success: true };
  };

  // 3. INICIAR SESIÓN CON GOOGLE (Firebase GoogleAuthProvider Popup)
  const loginWithGoogle = async (account?: GoogleAccount): Promise<{ success: boolean; error?: AuthError }> => {
    // If real Firebase keys are configured, use real Firebase Popup
    if (isFirebaseConfigured) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const appUser = mapFirebaseUserToUser(result.user);
        setCurrentUser(appUser);
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(appUser));
        return { success: true };
      } catch (fbError: any) {
        return { success: false, error: mapFirebaseAuthError(fbError) };
      }
    }

    // Fallback: Simulation/Dev mode
    try {
      const googleUser: GoogleAccount = account || {
        email: 'juan.perez@gmail.com',
        name: 'Juan Pérez',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };

      const cleanEmail = googleUser.email.trim().toLowerCase();
      const db = getUsersDb();
      const foundAccount = db.find((acc) => acc.user.email.toLowerCase() === cleanEmail);

      let userToLog: User;

      if (foundAccount) {
        userToLog = {
          ...foundAccount.user,
          name: googleUser.name || foundAccount.user.name,
          avatar: googleUser.avatar || foundAccount.user.avatar,
          provider: 'google',
          lastLoginAt: new Date().toISOString(),
        };

        const updatedDb = db.map((acc) =>
          acc.user.id === foundAccount.user.id ? { ...acc, user: userToLog } : acc
        );
        saveUsersDb(updatedDb);
      } else {
        userToLog = {
          id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: googleUser.name,
          email: cleanEmail,
          avatar: googleUser.avatar,
          provider: 'google',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        const newAccount: StoredUserAccount = {
          user: userToLog,
          passwordHash: 'google_oauth_token',
        };

        saveUsersDb([...db, newAccount]);
      }

      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userToLog));
      setCurrentUser(userToLog);

      return { success: true };
    } catch {
      return {
        success: false,
        error: {
          field: 'general',
          message: 'Ocurrió un error al autenticar con Google. Por favor inténtalo de nuevo.',
        },
      };
    }
  };

  // 4. CERRAR SESIÓN (Firebase SignOut)
  const logout = async () => {
    try {
      if (isFirebaseConfigured) {
        await firebaseSignOut(auth);
      }
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      sessionStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    } finally {
      setCurrentUser(null);
    }
  };

  // 5. ACTUALIZAR PERFIL DE USUARIO
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: updates.name || auth.currentUser.displayName,
          photoURL: updates.avatar || auth.currentUser.photoURL,
        });
      } catch (e) {
        console.error('Error actualizando perfil en Firebase:', e);
      }
    }

    const updatedUser: User = {
      ...currentUser,
      ...updates,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(updatedUser));

    const db = getUsersDb();
    const updatedDb = db.map((acc) =>
      acc.user.id === currentUser.id ? { ...acc, user: updatedUser } : acc
    );
    saveUsersDb(updatedDb);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        isFirebaseActive: isFirebaseConfigured,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
