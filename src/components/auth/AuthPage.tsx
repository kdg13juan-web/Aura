import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthModal } from './GoogleAuthModal';
import type { GoogleAccount, AuthError } from '../../types/auth';
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  ShieldCheck,
  CheckSquare,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';
import './Auth.css';

export const AuthPage: React.FC = () => {
  const { login, register, loginWithGoogle, isFirebaseActive } = useAuth();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<AuthError | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [shake, setShake] = useState(false);

  // Google Sign-In Handler (Direct Firebase Popup when configured)
  const handleGoogleClick = async () => {
    soundManager.playPop();
    if (isFirebaseActive) {
      setIsSubmitting(true);
      try {
        const result = await loginWithGoogle();
        if (result.success) {
          soundManager.playSuccess();
        } else if (result.error) {
          triggerErrorShake(result.error);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 25, label: 'Débil', color: '#ef4444' };
    if (score === 2 || score === 3) return { score: 60, label: 'Media', color: '#f59e0b' };
    if (score === 4) return { score: 85, label: 'Segura', color: '#10b981' };
    return { score: 100, label: 'Excelente', color: '#6366f1' };
  };

  const pwdStrength = calculatePasswordStrength(password);

  const triggerErrorShake = (err: AuthError) => {
    setFormError(err);
    setShake(true);
    soundManager.playPop();
    setTimeout(() => setShake(false), 600);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    // Client-side quick checks
    if (authMode === 'register') {
      if (!name.trim()) {
        triggerErrorShake({ field: 'name', message: 'Por favor ingresa tu nombre completo.' });
        return;
      }
    }

    if (!email.trim()) {
      triggerErrorShake({ field: 'email', message: 'Por favor ingresa tu correo electrónico.' });
      return;
    }

    if (!password) {
      triggerErrorShake({ field: 'password', message: 'Por favor ingresa tu contraseña.' });
      return;
    }

    if (authMode === 'register' && password.length < 6) {
      triggerErrorShake({
        field: 'password',
        message: 'La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    if (authMode === 'register' && password !== confirmPassword) {
      triggerErrorShake({
        field: 'confirmPassword',
        message: 'Las contraseñas no coinciden. Por favor verifícalas.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const result = await login({ email, password, rememberMe });
        if (!result.success && result.error) {
          triggerErrorShake(result.error);
        } else {
          soundManager.playSuccess();
        }
      } else {
        const result = await register({ name, email, password, confirmPassword });
        if (!result.success && result.error) {
          triggerErrorShake(result.error);
        } else {
          soundManager.playChime();
          setSuccessMsg('¡Cuenta creada exitosamente! Bienvenido a Aura Agenda.');
        }
      }
    } catch {
      triggerErrorShake({
        field: 'general',
        message: 'Ocurrió un error inesperado al procesar la solicitud.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Auth selection
  const handleSelectGoogleAccount = async (account: GoogleAccount) => {
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle(account);
      if (result.success) {
        soundManager.playSuccess();
        setIsGoogleModalOpen(false);
      } else if (result.error) {
        triggerErrorShake(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Login
  const handleQuickDemo = async () => {
    setIsSubmitting(true);
    setFormError(null);
    setEmail('demo@aura.io');
    setPassword('123456');

    try {
      const result = await login({
        email: 'demo@aura.io',
        password: '123456',
        rememberMe: true,
      });
      if (result.success) {
        soundManager.playSuccess();
      } else if (result.error) {
        triggerErrorShake(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Dynamic Background Glows */}
      <div className="auth-background-mesh">
        <div className="glow-blob glow-blob-1" />
        <div className="glow-blob glow-blob-2" />
        <div className="glow-blob glow-blob-3" />
      </div>

      <div className="auth-content-container">
        {/* Left / Info Showcase Column */}
        <div className="auth-hero-card glass-panel">
          <div className="auth-hero-brand">
            <div className="brand-icon-wrapper large">
              <Sparkles className="brand-icon" size={28} />
            </div>
            <div className="brand-text">
              <span className="brand-name hero-title">Aura</span>
              <span className="brand-badge hero-badge">Agenda</span>
            </div>
          </div>

          <h1 className="auth-hero-headline">
            Organiza tu día con claridad, potencia tu productividad.
          </h1>

          <p className="auth-hero-description">
            Tu espacio privado para planificar eventos, gestionar tareas inteligentes, notas enriquecidas y contactos. Todo en una interfaz ultra rápida y elegante.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="feature-icon-box bg-purple">
                <ShieldCheck size={20} />
              </div>
              <div className="feature-text">
                <strong>Privacidad Total</strong>
                <p>Tus datos y tareas se mantienen protegidos bajo tu cuenta.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="feature-icon-box bg-indigo">
                <CheckSquare size={20} />
              </div>
              <div className="feature-text">
                <strong>Tareas & Hábitos Inteligentes</strong>
                <p>Control de subtareas, prioridades dinámicas y rachas activas.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="feature-icon-box bg-sky">
                <CalendarCheck size={20} />
              </div>
              <div className="feature-text">
                <strong>Calendario Sincronizado</strong>
                <p>Vistas de mes, semana y lista con recordatorios automáticos.</p>
              </div>
            </div>
          </div>

          <div className="auth-demo-shortcut-card">
            <div className="demo-shortcut-info">
              <div className="demo-badge">
                <Zap size={14} />
                <span>Acceso Rápido</span>
              </div>
              <span>¿Quieres probar la aplicación de inmediato sin registrarte?</span>
            </div>
            <button
              type="button"
              className="btn-demo-quick"
              onClick={handleQuickDemo}
              disabled={isSubmitting}
            >
              <span>Entrar como Demo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right / Authentication Form Card */}
        <div className={`auth-form-card glass-panel ${shake ? 'shake-animation' : ''}`}>
          {/* Tabs Switcher */}
          <div className="auth-tabs-header">
            <button
              className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setFormError(null);
                soundManager.playPop();
              }}
              type="button"
            >
              Iniciar Sesión
            </button>
            <button
              className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setFormError(null);
                soundManager.playPop();
              }}
              type="button"
            >
              Crear Cuenta
            </button>
          </div>

          <div className="auth-form-body">
            <div className="auth-form-title-group">
              <h2 className="auth-form-title">
                {authMode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}
              </h2>
              <p className="auth-form-subtitle">
                {authMode === 'login'
                  ? 'Ingresa tus credenciales para acceder a tu agenda protegida.'
                  : 'Empieza a planificar tu vida con estilo y productividad.'}
              </p>
            </div>

            {/* Error Notification Banner */}
            {formError && (
              <div className="auth-error-banner animate-fade" role="alert">
                <AlertCircle size={18} className="error-banner-icon" />
                <div className="error-banner-content">
                  <span className="error-banner-text">{formError.message}</span>
                </div>
              </div>
            )}

            {/* Success Notification Banner */}
            {successMsg && (
              <div className="auth-success-banner animate-fade" role="status">
                <CheckCircle2 size={18} className="success-banner-icon" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Google OAuth Quick Button */}
            <button
              type="button"
              className="google-oauth-btn"
              onClick={handleGoogleClick}
              disabled={isSubmitting}
            >
              <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {authMode === 'login'
                  ? 'Continuar con Google'
                  : 'Registrarse con Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>o utiliza tu correo</span>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="auth-fields-form" noValidate>
              {/* Full Name field (Register only) */}
              {authMode === 'register' && (
                <div className="form-group animate-fade">
                  <label className="form-label" htmlFor="register-name">
                    Nombre Completo
                  </label>
                  <div
                    className={`input-icon-wrapper ${
                      formError?.field === 'name' ? 'input-has-error' : ''
                    }`}
                  >
                    <UserIcon size={18} className="input-field-icon" />
                    <input
                      id="register-name"
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formError?.field === 'name') setFormError(null);
                      }}
                      className="form-input"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">
                  Correo Electrónico
                </label>
                <div
                  className={`input-icon-wrapper ${
                    formError?.field === 'email' ? 'input-has-error' : ''
                  }`}
                >
                  <Mail size={18} className="input-field-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="tu.correo@ejemplo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formError?.field === 'email') setFormError(null);
                    }}
                    className="form-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="form-group">
                <div className="label-with-action">
                  <label className="form-label" htmlFor="auth-password">
                    Contraseña
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      className="form-link-btn"
                      onClick={() => {
                        alert(
                          'Para la cuenta demo utiliza:\nCorreo: demo@aura.io\nContraseña: 123456\n\nTambién puedes crear cualquier cuenta nueva desde la pestaña "Crear Cuenta".'
                        );
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>

                <div
                  className={`input-icon-wrapper ${
                    formError?.field === 'password' ? 'input-has-error' : ''
                  }`}
                >
                  <Lock size={18} className="input-field-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={authMode === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formError?.field === 'password') setFormError(null);
                    }}
                    className="form-input password-input"
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Password Strength Meter for Registration */}
                {authMode === 'register' && password && (
                  <div className="password-strength-container animate-fade">
                    <div className="strength-bar-track">
                      <div
                        className="strength-bar-fill"
                        style={{
                          width: `${pwdStrength.score}%`,
                          backgroundColor: pwdStrength.color,
                        }}
                      />
                    </div>
                    <div className="strength-info">
                      <span className="strength-label">Seguridad de la contraseña:</span>
                      <strong style={{ color: pwdStrength.color }}>{pwdStrength.label}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password field (Register only) */}
              {authMode === 'register' && (
                <div className="form-group animate-fade">
                  <label className="form-label" htmlFor="register-confirm-password">
                    Confirmar Contraseña
                  </label>
                  <div
                    className={`input-icon-wrapper ${
                      formError?.field === 'confirmPassword' ? 'input-has-error' : ''
                    }`}
                  >
                    <Lock size={18} className="input-field-icon" />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (formError?.field === 'confirmPassword') setFormError(null);
                      }}
                      className="form-input password-input"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={
                        showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'
                      }
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember me Checkbox (Login only) */}
              {authMode === 'login' && (
                <div className="form-options-row">
                  <label className="checkbox-custom-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="checkbox-custom-input"
                    />
                    <span className="checkbox-text">Recordar mi sesión en este dispositivo</span>
                  </label>
                </div>
              )}

              {/* Submit Action Button */}
              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="btn-loading-text">
                    <span className="spinner-mini" /> Procesando...
                  </span>
                ) : (
                  <span>
                    {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </span>
                )}
              </button>
            </form>

            {/* Bottom Switcher */}
            <div className="auth-footer-prompt">
              {authMode === 'login' ? (
                <p>
                  ¿No tienes una cuenta?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setAuthMode('register');
                      setFormError(null);
                      soundManager.playPop();
                    }}
                  >
                    Regístrate aquí
                  </button>
                </p>
              ) : (
                <p>
                  ¿Ya tienes una cuenta?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => {
                      setAuthMode('login');
                      setFormError(null);
                      soundManager.playPop();
                    }}
                  >
                    Inicia sesión
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google OAuth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        isLoading={isSubmitting}
      />
    </div>
  );
};
