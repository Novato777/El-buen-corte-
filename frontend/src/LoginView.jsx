import { useState } from 'react'
import {
  SunIcon,
  MoonIcon,
  CrownIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
  StoreIcon,
  ScaleIcon,
  UserCheckIcon,
  KeyIcon
} from './Icons'

// Componente de Login con selector de modo SuperAdmin / Sistema POS
// Optimizado para Mobile-First y PCs de bajos recursos
export default function LoginView({
  loginUsername, setLoginUsername,
  loginPassword, setLoginPassword,
  handleLogin,
  authLoading, authError, setAuthError,
  showPassword, setShowPassword,
  theme, toggleTheme
}) {
  const [loginMode, setLoginMode] = useState('regular') // 'regular' | 'superadmin'
  const [showLogin, setShowLogin] = useState(false)

  if (!showLogin) {
    return (
      <div className="auth-wrapper" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #451a03 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div style={{ zIndex: 1, textAlign: 'center', color: 'white', maxWidth: '600px', padding: '30px 20px', margin: 'auto' }}>
          <div style={{ fontSize: 'clamp(48px, 12vw, 64px)', marginBottom: '16px' }}>🥩</div>
          <h1 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>El Buen Corte</h1>
          <p style={{ fontSize: 'clamp(15px, 4vw, 18px)', color: '#cbd5e1', marginBottom: '32px', lineHeight: '1.6' }}>
            Bienvenido al Sistema de Gestión POS y Control Administrativo. 
            Administra tus ventas, inventario y usuarios desde una sola plataforma.
          </p>
          <button 
            onClick={() => setShowLogin(true)}
            className="btn btn-primary"
            style={{ 
              padding: '16px 36px', 
              fontSize: '17px', 
              borderRadius: '50px', 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
              border: 'none', 
              boxShadow: '0 10px 25px rgba(217,119,6,0.4)',
              cursor: 'pointer',
              fontWeight: '800',
              minHeight: '48px',
              width: '100%',
              maxWidth: '320px',
              margin: '0 auto'
            }}
          >
            Ingresar al Sistema
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrapper">
      {/* 🌓 Botón Flotante Modo Oscuro / Claro en Login */}
      <button
        type="button"
        className="theme-toggle-btn theme-toggle-floating"
        onClick={toggleTheme}
        title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        aria-label="Cambiar tema de color"
      >
        {theme === 'dark' ? (
          <>
            <SunIcon style={{ width: 16, height: 16, color: '#f59e0b' }} />
            <span>Modo Claro</span>
          </>
        ) : (
          <>
            <MoonIcon style={{ width: 16, height: 16, color: '#6366f1' }} />
            <span>Modo Oscuro</span>
          </>
        )}
      </button>

      <div className="auth-card">
        {/* Lado Izquierdo: Branding & Beneficios (oculto en móviles para ergonomía inmediata) */}
        <div className="auth-banner" style={{
          background: loginMode === 'superadmin' 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #78350f 100%)' 
            : undefined
        }}>
          <div className="auth-banner-overlay" />
          <div className="auth-brand">
            <div className="auth-brand-logo">{loginMode === 'superadmin' ? '👑' : '🥩'}</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em' }}>
                {loginMode === 'superadmin' ? 'Consola SuperAdmin' : 'El Buen Corte'}
              </div>
              <div style={{ fontSize: '11px', color: loginMode === 'superadmin' ? '#fbbf24' : '#fb7185', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {loginMode === 'superadmin' ? 'Portal de Gestión SaaS & Usuarios' : 'Sistema POS & Gestión PostgreSQL'}
              </div>
            </div>
          </div>

          <div className="auth-banner-content">
            <h2 className="auth-banner-title">
              {loginMode === 'superadmin' 
                ? 'Control Maestro y Administración Global' 
                : 'Control y Seguridad Total para tu Negocio'}
            </h2>
            <p className="auth-banner-desc">
              {loginMode === 'superadmin'
                ? 'Accede a la consola ejecutiva independiente para registrar clientes, activar/bloquear usuarios y restablecer contraseñas.'
                : 'Accede al sistema de gestión inteligente con encriptación JWT y persistencia en base de datos.'}
            </p>

            <div className="auth-feature-list">
              {loginMode === 'superadmin' ? (
                <>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><CrownIcon /></div>
                    <span>Módulo 100% independiente del sistema de tienda</span>
                  </div>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><UserCheckIcon /></div>
                    <span>Bloqueo y activación instantánea de cuentas</span>
                  </div>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><KeyIcon /></div>
                    <span>Recuperación y reseteo rápido de contraseñas</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><ShieldCheckIcon /></div>
                    <span>Autenticación BcryptJS & Encriptación JWT</span>
                  </div>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><StoreIcon /></div>
                    <span>Control de Arqueo, Caja y Aperturas de Turno</span>
                  </div>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><ScaleIcon /></div>
                    <span>Calculadora Inteligente de Desposte de Res</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#94a3b8' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
            Servidor PostgreSQL Conectado
          </div>
        </div>

        {/* Lado Derecho: Formulario de Login Móvil y Desktop */}
        <div className="auth-form-container">
          <div>
            {loginMode === 'superadmin' ? (
              <div style={{ marginBottom: '16px' }}>
                <span className="superadmin-hero-badge">
                  <CrownIcon style={{ width: 13, height: 13 }} /> ACCESO EXCLUSIVO SUPERADMIN
                </span>
                <h3 className="auth-form-title" style={{ marginTop: '8px' }}>Portal SuperAdmin</h3>
                <p className="auth-form-subtitle">Ingresa con tus credenciales maestras de propietario</p>
              </div>
            ) : (
              <div className="auth-form-header">
                <div style={{ display: 'inline-block', fontSize: '28px', marginBottom: '6px' }}>🥩</div>
                <h3 className="auth-form-title">Iniciar Sesión</h3>
                <p className="auth-form-subtitle">Ingresa tus credenciales autorizadas para acceder al sistema POS</p>
              </div>
            )}

            {authError && (
              <div className="auth-alert-error" role="alert">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e, loginMode)}>
              <div className="form-group">
                <label className="form-label">Nombre de Usuario (Nik)</label>
                <div className="input-with-icon">
                  <span className="input-icon-left"><MailIcon /></span>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    className="input-control input-control-padded"
                    placeholder={loginMode === 'superadmin' ? 'ej. superadmin' : 'ej. usuario123'}
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="input-with-icon">
                  <span className="input-icon-left"><LockIcon /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="input-control input-control-padded input-control-padded-right"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {loginMode === 'superadmin' ? (
                <button
                  type="submit"
                  className="btn"
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    minHeight: '48px'
                  }}
                  disabled={authLoading}
                >
                  <CrownIcon style={{ width: 16, height: 16 }} />
                  {authLoading ? 'Verificando credenciales...' : 'Acceder al Portal SuperAdmin'}
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '15px', minHeight: '48px', borderRadius: '10px' }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Verificando...' : 'Ingresar al Sistema POS'}
                </button>
              )}
            </form>

            {/* Alternador de Modo de Login Móvil Ergonómico */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              {loginMode === 'regular' ? (
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                    ¿Eres el propietario o Super Administrador?
                  </p>
                  <button
                    type="button"
                    className="login-mode-switch-btn btn-mode-to-superadmin"
                    onClick={() => {
                      setLoginMode('superadmin')
                      setLoginUsername('')
                      setLoginPassword('')
                      if (setAuthError) setAuthError('')
                    }}
                  >
                    <CrownIcon style={{ width: '15px', height: '15px', color: '#b45309' }} />
                    Ingresar como SuperAdmin (Portal Maestro)
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    className="login-mode-switch-btn btn-mode-to-regular"
                    onClick={() => {
                      setLoginMode('regular')
                      setLoginUsername('')
                      setLoginPassword('')
                      if (setAuthError) setAuthError('')
                    }}
                  >
                    ← Volver al Acceso Regular del Sistema POS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
