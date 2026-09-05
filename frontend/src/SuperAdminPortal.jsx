import { useState, useEffect } from 'react'
import {
  UsersIcon,
  UserCheckIcon,
  UserXIcon,
  UserIcon,
  CrownIcon,
  PlusIcon,
  RefreshIcon,
  LogOutIcon,
  SearchIcon,
  KeyIcon,
  PencilIcon,
  CopyIcon,
  CheckIcon,
  ClockIcon,
  InfoIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  SunIcon,
  MoonIcon
} from './Icons'

// ============================================================================
// PORTAL SUPERADMIN INDEPENDIENTE (PÁGINA EXCLUSIVA 100% FUERA DEL SISTEMA POS)
// Optimizado para Mobile First y Bajo Consumo de Recursos
// ============================================================================
export default function SuperAdminPortal({
  currentUser,
  handleLogout,
  API_BASE,
  getAuthHeaders,
  theme,
  toggleTheme
}) {
  const [usersList, setUsersList] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userActionSuccess, setUserActionSuccess] = useState('')
  const [userActionError, setUserActionError] = useState('')

  // Form states: Registrar Nuevo Consumidor / Usuario
  const [regModalOpen, setRegModalOpen] = useState(false)
  const [regNombre, setRegNombre] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRol, setRegRol] = useState('admin')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  // Filters & Search
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')

  // Modal: Editar Usuario
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [editUserId, setEditUserId] = useState(null)
  const [editUserNombre, setEditUserNombre] = useState('')
  const [editUserEmail, setEditUserEmail] = useState('')
  const [editUserUsername, setEditUserUsername] = useState('')
  const [editUserRol, setEditUserRol] = useState('admin')
  const [editUserActivo, setEditUserActivo] = useState(true)
  const [editUserLoading, setEditUserLoading] = useState(false)
  const [editUserError, setEditUserError] = useState('')

  // Modal: Restablecer / Recuperar Contraseña
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [infoUser, setInfoUser] = useState(null)
  const openInfoSuscripcion = (u) => {
    setInfoUser(u)
    setInfoModalOpen(true)
  }
  const [renovarModalOpen, setRenovarModalOpen] = useState(false)
  const [renovarUser, setRenovarUser] = useState(null)
  const [renovarMeses, setRenovarMeses] = useState('1')
  const [renovarLoading, setRenovarLoading] = useState(false)
  const [renovarError, setRenovarError] = useState('')
  const [resetUserId, setResetUserId] = useState(null)
  const [resetUserName, setResetUserName] = useState('')
  const [resetUserEmail, setResetUserEmail] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(true)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [copiedNotification, setCopiedNotification] = useState(false)

  // Generador de Contraseña Segura
  const generatePass = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
    let pass = ''
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pass
  }

  // Cargar lista de usuarios
  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const res = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error('Error al cargar lista de usuarios')
      const data = await res.json()
      setUsersList(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setUserActionError('No se pudo cargar la lista de usuarios desde PostgreSQL.')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const notifySuccess = (msg) => {
    setUserActionSuccess(msg)
    setUserActionError('')
    setTimeout(() => setUserActionSuccess(''), 5000)
  }

  const notifyError = (msg) => {
    setUserActionError(msg)
    setUserActionSuccess('')
    setTimeout(() => setUserActionError(''), 6000)
  }

  // Registrar nuevo usuario
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegLoading(true)
    setUserActionError('')
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          nombre: regNombre,
          email: regEmail,
          username: regUsername,
          password: regPassword,
          rol: regRol,
          activo: true
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrar usuario')
      notifySuccess(`¡Usuario "${data.user.nombre}" registrado exitosamente como ${data.user.rol.toUpperCase()}!`)
      setRegNombre('')
      setRegEmail('')
      setRegUsername('')
      setRegPassword('')
      setRegRol('admin')
      setShowRegPassword(false)
      setRegModalOpen(false)
      fetchUsers()
    } catch (err) {
      notifyError(err.message)
    } finally {
      setRegLoading(false)
    }
  }

  // Renovar suscripción SaaS
  const handleRenovarSuscripcion = (u) => {
    setRenovarUser(u)
    setRenovarMeses('1')
    setRenovarError('')
    setRenovarModalOpen(true)
  }

  const submitRenovarSuscripcion = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!renovarUser || isNaN(renovarMeses) || parseInt(renovarMeses, 10) <= 0) return
    
    setRenovarLoading(true)
    setRenovarError('')

    try {
      const months = parseInt(renovarMeses, 10)
      const hasPrevVenc = !!renovarUser.fecha_vencimiento
      const regDate = renovarUser.created_at ? new Date(renovarUser.created_at) : new Date()
      const baseDate = hasPrevVenc ? new Date(renovarUser.fecha_vencimiento) : regDate

      let targetDate = new Date(baseDate)
      targetDate.setMonth(targetDate.getMonth() + months)

      if (targetDate < new Date()) {
        targetDate = new Date()
        targetDate.setMonth(targetDate.getMonth() + months)
      }

      let res = await fetch(`${API_BASE}/users/${renovarUser.id}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          fecha_vencimiento: targetDate.toISOString(),
          meses: months,
          activo: true
        })
      })

      if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await fetch(`${API_BASE}/users/${renovarUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            nombre: renovarUser.nombre,
            fecha_vencimiento: targetDate.toISOString(),
            activo: true
          })
        })
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo renovar la suscripción')

      const updatedUser = data.user || {
        ...renovarUser,
        fecha_vencimiento: targetDate.toISOString(),
        activo: true
      }
      setUsersList(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u))

      notifySuccess(`¡Suscripción de "${renovarUser.nombre}" renovada con éxito hasta el ${targetDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}!`)
      setRenovarModalOpen(false)
      fetchUsers()
    } catch (err) {
      setRenovarError(err.message || 'Error al renovar la suscripción')
    } finally {
      setRenovarLoading(false)
    }
  }

  const handleToggleStatus = async (user) => {
    const actionText = user.activo ? 'bloquear y suspender el acceso de' : 'reactivar el acceso de'
    if (!window.confirm(`¿Estás seguro de que deseas ${actionText} a "${user.nombre}"?`)) return
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al alternar estado')
      notifySuccess(data.message)
      fetchUsers()
    } catch (err) {
      notifyError(err.message)
    }
  }

  // Abrir Modal de Restablecer / Recuperar Contraseña
  const openResetPasswordModal = (user) => {
    setResetUserId(user.id)
    setResetUserName(user.nombre)
    setResetUserEmail(user.email)
    const newPass = generatePass()
    setResetPassword(newPass)
    setShowResetPassword(true)
    setResetError('')
    setCopiedNotification(false)
    setResetModalOpen(true)
  }

  // Guardar nueva contraseña restablecida
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    if (!resetPassword || resetPassword.length < 6) {
      setResetError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setResetLoading(true)
    setResetError('')
    try {
      const res = await fetch(`${API_BASE}/users/${resetUserId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ password: resetPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al restablecer contraseña')
      setResetModalOpen(false)
      notifySuccess(`¡Contraseña restablecida con éxito para "${resetUserName}"! Nueva clave: ${resetPassword}`)
    } catch (err) {
      setResetError(err.message)
    } finally {
      setResetLoading(false)
    }
  }

  // Copiar contraseña generada al portapapeles
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(resetPassword)
    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 2500)
  }

  // Abrir Modal de Edición
  const openEditModal = (user) => {
    setEditUserId(user.id)
    setEditUserNombre(user.nombre)
    setEditUserEmail(user.email || '')
    setEditUserUsername(user.username || '')
    setEditUserRol(user.rol)
    setEditUserActivo(user.activo !== false)
    setEditUserError('')
    setEditUserModalOpen(true)
  }

  // Guardar Edición de Usuario
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault()
    setEditUserLoading(true)
    setEditUserError('')
    try {
      const res = await fetch(`${API_BASE}/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          nombre: editUserNombre,
          email: editUserEmail,
          username: editUserUsername,
          rol: editUserRol,
          activo: editUserActivo
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario')
      setEditUserModalOpen(false)
      notifySuccess(`¡Usuario "${data.user.nombre}" actualizado correctamente!`)
      fetchUsers()
    } catch (err) {
      setEditUserError(err.message)
    } finally {
      setEditUserLoading(false)
    }
  }

  // Eliminar Usuario
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ ¿ELIMINAR DEFINITIVAMENTE al usuario "${user.nombre}" (${user.email})?\nEsta acción no se puede deshacer.`)) {
      return
    }
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario')
      notifySuccess(`Usuario "${user.nombre}" eliminado del sistema.`)
      fetchUsers()
    } catch (err) {
      notifyError(err.message)
    }
  }

  // Filtrar Usuarios
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = !userSearchQuery ||
      user.nombre?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(userSearchQuery.toLowerCase())

    const matchesRole = userRoleFilter === 'all' || user.rol === userRoleFilter

    let matchesStatus = true
    if (userStatusFilter === 'active') matchesStatus = user.activo !== false
    if (userStatusFilter === 'blocked') matchesStatus = user.activo === false

    return matchesSearch && matchesRole && matchesStatus
  })

  // Contadores KPI
  const countTotal = usersList.length
  const countActive = usersList.filter(u => u.activo !== false).length
  const countBlocked = usersList.filter(u => u.activo === false).length
  const countConsumers = usersList.filter(u => u.rol === 'consumidor').length
  const countStaff = usersList.filter(u => u.rol === 'admin' || u.rol === 'cajero').length

  return (
    <div className="superadmin-standalone-wrapper animate-fade-in">
      {/* Cabecera Exclusiva SuperAdmin */}
      <header className="superadmin-standalone-header">
        <div className="superadmin-standalone-brand">
          <div className="superadmin-standalone-logo">👑</div>
          <div className="superadmin-standalone-title-block">
            <div className="superadmin-standalone-title">
              El Buen Corte <span className="superadmin-pill-tag">CONSOLA MASTER</span>
            </div>
            <div className="superadmin-standalone-subtitle">
              Portal Ejecutivo de Administración y Gestión SaaS
            </div>
          </div>
        </div>

        <div className="superadmin-standalone-actions">
          {/* 🌓 Botón Modo Oscuro / Claro en SuperAdmin */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? (
              <>
                <SunIcon style={{ width: 15, height: 15, color: '#f59e0b' }} />
                <span>Claro</span>
              </>
            ) : (
              <>
                <MoonIcon style={{ width: 15, height: 15, color: '#6366f1' }} />
                <span>Oscuro</span>
              </>
            )}
          </button>

          {/* Perfil del SuperAdmin */}
          <div className="superadmin-header-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', borderRadius: '12px' }}>
            <div className="user-avatar-circle avatar-superadmin" style={{ width: 32, height: 32, fontSize: 12 }}>
              👑
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="profile-name" style={{ fontSize: '13px', fontWeight: '800', lineHeight: 1.1 }}>
                {currentUser?.nombre || 'Super Administrador'}
              </div>
              <div className="profile-email" style={{ fontSize: '11px' }}>
                {currentUser?.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchUsers}
            disabled={usersLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            title="Refrescar usuarios"
          >
            <RefreshIcon className={usersLoading ? 'animate-spin' : ''} style={{ width: 15, height: 15 }} />
            <span className="btn-text-desktop">Refrescar</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', color: '#ef4444' }}
            title="Cerrar Sesión"
          >
            <LogOutIcon style={{ width: 15, height: 15 }} />
            <span className="btn-text-desktop">Salir</span>
          </button>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="superadmin-standalone-container">
        {/* Banner Hero */}
        <div className="superadmin-hero-banner">
          <div className="superadmin-hero-content">
            <span className="superadmin-hero-badge">
              <CrownIcon style={{ width: 13, height: 13 }} /> CONTROL GLOBAL DE USUARIOS & CONSUMIDORES
            </span>
            <h1 className="superadmin-hero-title">Centro de Gestión de Plataforma</h1>
            <p className="superadmin-hero-desc">
              Administra todas las cuentas de consumidores, administradores y cajeros. Da de alta nuevos usuarios con generador de claves seguras, bloquea o activa accesos en 1 clic y gestiona suscripciones SaaS.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => setRegModalOpen(true)}
              style={{ padding: '12px 24px', fontSize: '15px', minHeight: '46px' }}
            >
              <PlusIcon style={{ width: 18, height: 18 }} />
              Nuevo Consumidor / Usuario
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {userActionSuccess && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '14px 20px',
            borderRadius: '14px',
            marginBottom: '20px',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
          }}>
            <CheckIcon style={{ width: 20, height: 20, color: '#059669', flexShrink: 0 }} />
            <span>{userActionSuccess}</span>
          </div>
        )}

        {userActionError && (
          <div className="auth-alert-error" style={{ marginBottom: '20px', padding: '14px 20px', fontSize: '14px' }}>
            ⚠️ {userActionError}
          </div>
        )}

        {/* Tarjetas KPI de Estado de Usuarios */}
        <div className="superadmin-kpis">
          <div className="superadmin-kpi-card">
            <div className="superadmin-kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <UsersIcon />
            </div>
            <div>
              <div className="superadmin-kpi-val">{countTotal}</div>
              <div className="superadmin-kpi-title">Total Cuentas Registradas</div>
            </div>
          </div>

          <div className="superadmin-kpi-card">
            <div className="superadmin-kpi-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <UserCheckIcon />
            </div>
            <div>
              <div className="superadmin-kpi-val" style={{ color: '#059669' }}>{countActive}</div>
              <div className="superadmin-kpi-title">Usuarios Activos</div>
            </div>
          </div>

          <div className="superadmin-kpi-card">
            <div className="superadmin-kpi-icon-wrapper" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <UserXIcon />
            </div>
            <div>
              <div className="superadmin-kpi-val" style={{ color: countBlocked > 0 ? '#dc2626' : '#64748b' }}>{countBlocked}</div>
              <div className="superadmin-kpi-title">Usuarios Bloqueados</div>
            </div>
          </div>

          <div className="superadmin-kpi-card">
            <div className="superadmin-kpi-icon-wrapper" style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}>
              <UserIcon />
            </div>
            <div>
              <div className="superadmin-kpi-val">{countConsumers}</div>
              <div className="superadmin-kpi-title">Consumidores ({countStaff} Operadores)</div>
            </div>
          </div>
        </div>

        {/* Directorio de Usuarios y Control */}
        <div style={{ width: '100%' }}>
          <div className="card" style={{ borderRadius: '18px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', margin: 0 }}>
                <UsersIcon style={{ width: 18, height: 18, color: '#4f46e5' }} /> Directorio y Control de Usuarios ({filteredUsers.length})
              </div>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => setRegModalOpen(true)}
                style={{ padding: '8px 16px', fontSize: '13px', minHeight: '38px' }}
              >
                <PlusIcon style={{ width: 14, height: 14 }} /> Nuevo
              </button>
            </div>

            <div className="card-body" style={{ padding: '18px' }}>
              {/* Barra de Búsqueda y Filtros */}
              <div className="superadmin-toolbar">
                <div className="superadmin-search-box">
                  <span className="search-icon"><SearchIcon /></span>
                  <input
                    type="search"
                    name="admin_user_search_filter"
                    id="admin_user_search_filter"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    className="superadmin-search-input"
                    placeholder="Buscar por nombre, usuario o email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>

                <div className="superadmin-filter-group">
                  <select
                    className="input-control"
                    style={{ width: 'auto', minWidth: '150px', padding: '8px 12px' }}
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="all">🔍 Todos los Roles</option>
                    <option value="consumidor">👥 Consumidores</option>
                    <option value="cajero">🛒 Cajeros</option>
                    <option value="admin">🏢 Administradores</option>
                    <option value="superadmin">👑 SuperAdmins</option>
                  </select>

                  <select
                    className="input-control"
                    style={{ width: 'auto', minWidth: '150px', padding: '8px 12px' }}
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                  >
                    <option value="all">⚡ Todos los Estados</option>
                    <option value="active">🟢 Solo Activos</option>
                    <option value="blocked">🔴 Solo Bloqueados</option>
                  </select>
                </div>
              </div>

              {/* Contenido de Usuarios: Tabla en Desktop, Tarjetas en Mobile */}
              {usersLoading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
                  <RefreshIcon className="animate-spin" style={{ width: 28, height: 28, margin: '0 auto 10px' }} />
                  Cargando directorio de usuarios...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
                  No se encontraron usuarios con los criterios de búsqueda seleccionados.
                </div>
              ) : (
                <>
                  {/* 🖥️ 1. VISTA DE ESCRITORIO: TABLA COMPLETA */}
                  <div className="superadmin-table-container">
                    <table className="superadmin-data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Usuario / Consumidor</th>
                          <th>Rol</th>
                          <th>Sede / Tenant</th>
                          <th>Estado</th>
                          <th>Registro</th>
                          <th style={{ textAlign: 'center' }}>Vencimiento</th>
                          <th style={{ textAlign: 'right' }}>Acciones Maestras</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => {
                          const isCurrent = u.id === currentUser?.id
                          const isBlocked = u.activo === false

                          let roleBadge = 'role-badge-consumidor'
                          let roleIcon = '👥'
                          let roleText = 'Consumidor'
                          let avatarClass = 'avatar-consumidor'

                          if (u.rol === 'superadmin') {
                            roleBadge = 'role-badge-superadmin'
                            roleIcon = '👑'
                            roleText = 'SuperAdmin'
                            avatarClass = 'avatar-superadmin'
                          } else if (u.rol === 'admin') {
                            roleBadge = 'role-badge-admin'
                            roleIcon = '🏢'
                            roleText = 'Administrador'
                            avatarClass = 'avatar-admin'
                          } else if (u.rol === 'cajero') {
                            roleBadge = 'role-badge-cajero'
                            roleIcon = '🛒'
                            roleText = 'Cajero'
                            avatarClass = 'avatar-cajero'
                          }

                          return (
                            <tr key={u.id} style={{ opacity: isBlocked ? 0.75 : 1, backgroundColor: isBlocked ? '#fffafa' : undefined }}>
                              <td style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
                                #{u.id}
                              </td>

                              <td>
                                <div className="superadmin-user-cell">
                                  <div className={`user-avatar-circle ${avatarClass}`} style={{ width: 42, height: 42, fontSize: 16 }}>
                                    {u.rol === 'superadmin' ? '👑' : (u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U')}
                                  </div>
                                  <div className="superadmin-user-info">
                                    <div className="superadmin-user-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {u.nombre}
                                      {isCurrent && (
                                        <span className="superadmin-pill-tag">
                                          TÚ
                                        </span>
                                      )}
                                    </div>
                                    <div className="superadmin-user-email">
                                      {u.email || `@${u.username}`}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span className={`role-badge ${roleBadge}`}>
                                  <span>{roleIcon}</span> {roleText}
                                </span>
                              </td>

                              <td>
                                <span className="superadmin-tenant-pill" style={{ 
                                  fontSize: '11px', 
                                  fontWeight: '700', 
                                  padding: '3px 9px', 
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  {u.rol === 'superadmin' ? '👑 Global' : (u.tenant_id ? `🏢 Sede #${u.tenant_id}` : '—')}
                                </span>
                              </td>

                              <td>
                                {isBlocked ? (
                                  <span className="status-pill status-pill-blocked" title="El usuario no puede iniciar sesión">
                                    <span className="status-dot-blocked" /> Bloqueado
                                  </span>
                                ) : (
                                  <span className="status-pill status-pill-active" title="Cuenta activa">
                                    <span className="status-dot-active" /> Activo
                                  </span>
                                )}
                              </td>

                              <td style={{ fontSize: '12px', color: '#64748b' }}>
                                {u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Reciente'}
                              </td>

                              {/* Celda Vencimiento con botones de Renovar e Información */}
                              <td style={{ textAlign: 'center', minWidth: '180px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                  <div style={{ textAlign: 'left', minWidth: '85px' }}>
                                    {u.fecha_vencimiento ? (
                                      <div>
                                        <div style={{
                                          fontSize: '12px',
                                          fontWeight: '700',
                                          color: new Date(u.fecha_vencimiento) < new Date() ? '#ef4444' : '#059669',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}>
                                          {new Date(u.fecha_vencimiento) < new Date() ? '⚠️' : '✅'}
                                          {new Date(u.fecha_vencimiento).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>
                                          {(() => {
                                            const diff = Math.ceil((new Date(u.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                            return diff > 0 ? `${diff}d restantes` : (diff === 0 ? 'Vence hoy' : `Expiró hace ${Math.abs(diff)}d`);
                                          })()}
                                        </div>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px', fontWeight: '600' }}>
                                        Sin asignar
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      type="button"
                                      className="superadmin-action-btn"
                                      title="Renovar Suscripción"
                                      onClick={() => handleRenovarSuscripcion(u)}
                                      style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}
                                    >
                                      <ClockIcon style={{ width: 16, height: 16, color: '#2563eb' }} />
                                    </button>

                                    <button
                                      type="button"
                                      className="superadmin-action-btn"
                                      title="Información y Días Restantes"
                                      onClick={() => openInfoSuscripcion(u)}
                                      style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}
                                    >
                                      <InfoIcon style={{ width: 16, height: 16, color: '#16a34a' }} />
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {/* Celda de Acciones Maestras */}
                              <td style={{ textAlign: 'right' }}>
                                <div className="superadmin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                                  <button
                                    type="button"
                                    className="superadmin-action-btn"
                                    title="Recuperar / Restablecer Contraseña"
                                    onClick={() => openResetPasswordModal(u)}
                                    style={{ background: '#fef3c7', borderColor: '#fde68a' }}
                                  >
                                    <KeyIcon style={{ width: 16, height: 16, color: '#d97706' }} />
                                  </button>

                                  <button
                                    type="button"
                                    className="superadmin-action-btn"
                                    title="Editar Usuario"
                                    onClick={() => openEditModal(u)}
                                    style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}
                                  >
                                    <PencilIcon style={{ width: 16, height: 16, color: '#2563eb' }} />
                                  </button>

                                  <button
                                    type="button"
                                    className="superadmin-action-btn"
                                    title={isBlocked ? "Reactivar acceso al sistema" : "Bloquear acceso (Suspender)"}
                                    onClick={() => handleToggleStatus(u)}
                                    disabled={isCurrent}
                                    style={isCurrent ? { opacity: 0.5, cursor: 'not-allowed' } : (isBlocked ? { background: '#f0fdf4', borderColor: '#bbf7d0' } : { background: '#fef2f2', borderColor: '#fecaca' })}
                                  >
                                    {isBlocked ? (
                                      <UserCheckIcon style={{ width: 16, height: 16, color: '#059669' }} />
                                    ) : (
                                      <UserXIcon style={{ width: 16, height: 16, color: '#dc2626' }} />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    className="superadmin-action-btn"
                                    title="Eliminar Cuenta Definitivamente"
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={isCurrent}
                                    style={isCurrent ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                  >
                                    <TrashIcon style={{ width: 16, height: 16, color: isCurrent ? '#94a3b8' : '#ef4444' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 📱 2. VISTA MÓVIL: TARJETAS TÁCTILES ERGONÓMICAS */}
                  <div className="superadmin-users-mobile-list">
                    {filteredUsers.map(u => {
                      const isCurrent = u.id === currentUser?.id
                      const isBlocked = u.activo === false

                      let roleBadge = 'role-badge-consumidor'
                      let roleIcon = '👥'
                      let roleText = 'Consumidor'
                      let avatarClass = 'avatar-consumidor'

                      if (u.rol === 'superadmin') {
                        roleBadge = 'role-badge-superadmin'
                        roleIcon = '👑'
                        roleText = 'SuperAdmin'
                        avatarClass = 'avatar-superadmin'
                      } else if (u.rol === 'admin') {
                        roleBadge = 'role-badge-admin'
                        roleIcon = '🏢'
                        roleText = 'Administrador'
                        avatarClass = 'avatar-admin'
                      } else if (u.rol === 'cajero') {
                        roleBadge = 'role-badge-cajero'
                        roleIcon = '🛒'
                        roleText = 'Cajero'
                        avatarClass = 'avatar-cajero'
                      }

                      const diffDays = u.fecha_vencimiento ? Math.ceil((new Date(u.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

                      return (
                        <div key={u.id} className={`superadmin-user-card-mobile ${isBlocked ? 'is-blocked' : ''}`}>
                          <div className="user-card-mobile-top">
                            <div className={`user-avatar-circle ${avatarClass}`} style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0 }}>
                              {u.rol === 'superadmin' ? '👑' : (u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U')}
                            </div>
                            <div className="user-card-mobile-details">
                              <div className="user-card-mobile-name">
                                {u.nombre}
                                {isCurrent && <span className="superadmin-pill-tag">TÚ</span>}
                              </div>
                              <div className="user-card-mobile-meta">
                                {u.email || `@${u.username}`}
                              </div>
                              <div className="user-card-mobile-pills">
                                <span className={`role-badge ${roleBadge}`} style={{ fontSize: '10px', padding: '2px 7px' }}>
                                  <span>{roleIcon}</span> {roleText}
                                </span>
                                <span className="superadmin-tenant-pill" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                  {u.rol === 'superadmin' ? '👑 Global' : (u.tenant_id ? `🏢 Sede #${u.tenant_id}` : '—')}
                                </span>
                                {isBlocked ? (
                                  <span className="status-pill status-pill-blocked" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                    <span className="status-dot-blocked" /> Bloqueado
                                  </span>
                                ) : (
                                  <span className="status-pill status-pill-active" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                    <span className="status-dot-active" /> Activo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Fila de Suscripción SaaS */}
                          <div className="user-card-mobile-sub">
                            <div className="sub-info-text">
                              <span className="sub-label">Suscripción SaaS:</span>
                              {u.fecha_vencimiento ? (
                                <span className="sub-status" style={{ color: diffDays <= 0 ? '#ef4444' : '#059669' }}>
                                  {diffDays <= 0 ? `⚠️ Expirada (${Math.abs(diffDays)}d)` : `✅ ${diffDays}d restantes`}
                                </span>
                              ) : (
                                <span className="sub-status text-muted">Sin límite</span>
                              )}
                            </div>
                            <div className="sub-actions-quick">
                              <button
                                type="button"
                                className="superadmin-action-btn"
                                title="Renovar Suscripción"
                                onClick={() => handleRenovarSuscripcion(u)}
                                style={{ background: '#eff6ff', borderColor: '#bfdbfe', minHeight: '38px', minWidth: '38px' }}
                              >
                                <ClockIcon style={{ width: 17, height: 17, color: '#2563eb' }} />
                              </button>
                              <button
                                type="button"
                                className="superadmin-action-btn"
                                title="Detalles de Suscripción"
                                onClick={() => openInfoSuscripcion(u)}
                                style={{ background: '#f0fdf4', borderColor: '#bbf7d0', minHeight: '38px', minWidth: '38px' }}
                              >
                                <InfoIcon style={{ width: 17, height: 17, color: '#16a34a' }} />
                              </button>
                            </div>
                          </div>

                          {/* Botones de Acción Táctiles Móviles */}
                          <div className="user-card-mobile-actions">
                            <button
                              type="button"
                              className="user-card-action-btn"
                              onClick={() => openResetPasswordModal(u)}
                              title="Restablecer Clave"
                            >
                              <KeyIcon style={{ width: 15, height: 15, color: '#d97706' }} />
                              <span>Clave</span>
                            </button>
                            <button
                              type="button"
                              className="user-card-action-btn"
                              onClick={() => openEditModal(u)}
                              title="Editar Usuario"
                            >
                              <PencilIcon style={{ width: 15, height: 15, color: '#2563eb' }} />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              className="user-card-action-btn"
                              onClick={() => handleToggleStatus(u)}
                              disabled={isCurrent}
                              title={isBlocked ? "Reactivar acceso" : "Suspender acceso"}
                            >
                              {isBlocked ? (
                                <>
                                  <UserCheckIcon style={{ width: 15, height: 15, color: '#059669' }} />
                                  <span>Activar</span>
                                </>
                              ) : (
                                <>
                                  <UserXIcon style={{ width: 15, height: 15, color: '#dc2626' }} />
                                  <span>Pausar</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="user-card-action-btn btn-danger-action"
                              onClick={() => handleDeleteUser(u)}
                              disabled={isCurrent}
                              title="Eliminar Cuenta"
                            >
                              <TrashIcon style={{ width: 15, height: 15, color: isCurrent ? '#94a3b8' : '#ef4444' }} />
                              <span>Borrar</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================================================================= */}
      {/* MODAL: REGISTRAR NUEVO CONSUMIDOR / USUARIO */}
      {/* ================================================================= */}
      {regModalOpen && (
        <div className="superadmin-modal-backdrop" onClick={() => setRegModalOpen(false)}>
          <div className="superadmin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <div className="superadmin-modal-title">
                <PlusIcon style={{ width: 18, height: 18, color: '#f59e0b' }} />
                Registrar Nuevo Consumidor / Usuario
              </div>
              <button
                type="button"
                className="superadmin-modal-close"
                onClick={() => setRegModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="superadmin-modal-body">
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                  Crea credenciales para que los consumidores o el personal del negocio puedan utilizar el sistema.
                </p>

                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="Ej. Distribuciones Carnes del Valle"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre de Usuario (Nik)</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="ej. carniceria1"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    className="input-control"
                    placeholder="cliente@dominio.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Contraseña Inicial</label>
                    <button
                      type="button"
                      className="superadmin-btn-generate"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#fde68a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = '#fef3c7'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      onClick={() => {
                        const p = generatePass()
                        setRegPassword(p)
                        setShowRegPassword(true)
                      }}
                    >
                      🎲 Generar Segura
                    </button>
                  </div>
                  <div className="input-with-icon">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="input-control input-control-padded-right"
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Rol del Usuario</label>
                  <select
                    className="input-control"
                    value={regRol}
                    onChange={(e) => setRegRol(e.target.value)}
                  >
                    <option value="admin">🏢 Administrador (Gestión de Tienda e Inventario)</option>
                    <option value="superadmin">👑 Super Administrador (Control Total)</option>
                  </select>
                </div>
              </div>

              <div className="superadmin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRegModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={regLoading}
                >
                  {regLoading ? 'Registrando...' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: RENOVAR SUSCRIPCIÓN SAAS */}
      {/* ================================================================= */}
      {renovarModalOpen && renovarUser && (
        <div className="superadmin-modal-backdrop" onClick={() => setRenovarModalOpen(false)}>
          <div className="superadmin-modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <div className="superadmin-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                  color: '#2563eb'
                }}>
                  <ClockIcon style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Renovar Suscripción SaaS</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '400' }}>Control de tiempo de vigencia de cuenta</div>
                </div>
              </div>
              <button 
                type="button" 
                className="superadmin-modal-close" 
                onClick={() => setRenovarModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitRenovarSuscripcion}>
              <div className="superadmin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="superadmin-user-summary-card" style={{
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div className="user-avatar-circle avatar-admin" style={{ width: 44, height: 44, fontSize: 16 }}>
                    {renovarUser.nombre ? renovarUser.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="user-title" style={{ fontSize: '15px', fontWeight: '700' }}>{renovarUser.nombre}</div>
                    <div className="user-subtitle" style={{ fontSize: '12.5px' }}>{renovarUser.email || `@${renovarUser.username}`}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="status-pill status-pill-active" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      {renovarUser.rol?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {renovarError && (
                  <div className="auth-alert-error" style={{ padding: '12px 16px', fontSize: '13px' }}>
                    ⚠️ {renovarError}
                  </div>
                )}

                <div>
                  <label className="form-label" style={{ fontWeight: '700', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Período a Contratar / Renovar</span>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                      {renovarMeses} {parseInt(renovarMeses, 10) === 1 ? 'mes seleccionado' : 'meses seleccionados'}
                    </span>
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { label: '1 Mes', val: '1', badge: 'Básico' },
                      { label: '3 Meses', val: '3', badge: 'Popular' },
                      { label: '6 Meses', val: '6', badge: 'Semestral' },
                      { label: '12 Meses', val: '12', badge: '1 Año' }
                    ].map(plan => {
                      const isSel = String(renovarMeses) === plan.val;
                      return (
                        <button
                          key={plan.val}
                          type="button"
                          onClick={() => setRenovarMeses(plan.val)}
                          className={`renovar-preset-btn ${isSel ? 'active' : ''}`}
                          style={{
                            padding: '10px 6px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                            fontWeight: isSel ? '700' : '600'
                          }}
                        >
                          <span style={{ fontSize: '13px' }}>{plan.label}</span>
                          <span className={`renovar-preset-badge ${isSel ? 'active' : ''}`} style={{
                            fontSize: '9.5px',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}>
                            {plan.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>O ingresa meses personalizados:</span>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      className="input-control"
                      value={renovarMeses}
                      onChange={(e) => setRenovarMeses(e.target.value)}
                      style={{ width: '90px', padding: '6px 10px', fontSize: '13px', textAlign: 'center' }}
                    />
                  </div>
                </div>

                {(() => {
                  const m = parseInt(renovarMeses, 10) || 1;
                  const hasPrevVenc = !!renovarUser.fecha_vencimiento;
                  const regDate = renovarUser.created_at ? new Date(renovarUser.created_at) : new Date();
                  const baseDate = hasPrevVenc ? new Date(renovarUser.fecha_vencimiento) : regDate;
                  
                  let calcDate = new Date(baseDate);
                  calcDate.setMonth(calcDate.getMonth() + m);

                  if (calcDate < new Date()) {
                    calcDate = new Date();
                    calcDate.setMonth(calcDate.getMonth() + m);
                  }

                  return (
                    <div className="superadmin-calc-details-card" style={{
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#166534' }}>
                        <span>📅 Fecha de Registro:</span>
                        <strong style={{ color: '#14532d' }}>
                          {regDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#166534' }}>
                        <span>⏳ Base de conteo:</span>
                        <strong>
                          {hasPrevVenc 
                            ? `Desde vencimiento anterior (${new Date(renovarUser.fecha_vencimiento).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })})`
                            : `Desde registro (${regDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })})`
                          }
                        </strong>
                      </div>

                      <div style={{
                        marginTop: '4px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #86efac',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#14532d' }}>
                          🚀 Nueva Fecha de Vencimiento:
                        </span>
                        <span className="superadmin-calc-date-pill" style={{
                          fontSize: '14px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '8px'
                        }}>
                          {calcDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="superadmin-modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRenovarModalOpen(false)}
                  disabled={renovarLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={renovarLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', borderColor: '#2563eb' }}
                >
                  <ClockIcon style={{ width: 16, height: 16 }} />
                  {renovarLoading ? 'Guardando...' : 'Confirmar Suscripción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: INFORMACIÓN Y ESTADO DE SUSCRIPCIÓN */}
      {/* ================================================================= */}
      {infoModalOpen && infoUser && (
        <div className="superadmin-modal-backdrop" onClick={() => setInfoModalOpen(false)}>
          <div className="superadmin-modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <div className="superadmin-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                  color: '#16a34a'
                }}>
                  <InfoIcon style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Información de Suscripción</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '400' }}>Detalles de vigencia y estado SaaS</div>
                </div>
              </div>
              <button 
                type="button" 
                className="superadmin-modal-close" 
                onClick={() => setInfoModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="superadmin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="superadmin-user-summary-card" style={{
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div className="user-avatar-circle avatar-admin" style={{ width: 44, height: 44, fontSize: 16 }}>
                  {infoUser.nombre ? infoUser.nombre.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="user-title" style={{ fontSize: '15px', fontWeight: '700' }}>{infoUser.nombre}</div>
                  <div className="user-subtitle" style={{ fontSize: '12.5px' }}>{infoUser.email || `@${infoUser.username}`}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-pill ${infoUser.activo !== false ? 'status-pill-active' : 'status-pill-blocked'}`} style={{ fontSize: '11px' }}>
                    {infoUser.activo !== false ? '🟢 Activo' : '🔴 Bloqueado'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="superadmin-info-metric-card" style={{
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="superadmin-info-icon-box" style={{ padding: '7px', borderRadius: '8px' }}>
                      📅
                    </div>
                    <div>
                      <div className="metric-title" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Fecha de Registro</div>
                      <div className="metric-val" style={{ fontSize: '13.5px', fontWeight: '700' }}>
                        {infoUser.created_at
                          ? new Date(infoUser.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Reciente'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ingreso inicial</span>
                </div>

                <div className="superadmin-info-metric-card" style={{
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="superadmin-info-icon-box blue" style={{ padding: '7px', borderRadius: '8px' }}>
                      💳
                    </div>
                    <div>
                      <div className="metric-title" style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Próximo Vencimiento</div>
                      <div style={{
                        fontSize: '13.5px',
                        fontWeight: '700',
                        color: infoUser.fecha_vencimiento
                          ? (new Date(infoUser.fecha_vencimiento) < new Date() ? '#ef4444' : '#10b981')
                          : '#64748b'
                      }}>
                        {infoUser.fecha_vencimiento
                          ? new Date(infoUser.fecha_vencimiento).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Sin fecha asignada'}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: infoUser.fecha_vencimiento && new Date(infoUser.fecha_vencimiento) < new Date() ? '#ef4444' : '#10b981'
                  }}>
                    {infoUser.fecha_vencimiento ? (new Date(infoUser.fecha_vencimiento) < new Date() ? 'Expirada' : 'Vigente') : 'Ilimitada'}
                  </span>
                </div>

                {(() => {
                  if (!infoUser.fecha_vencimiento) {
                    return (
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#e2e8f0', padding: '7px', borderRadius: '8px', color: '#475569' }}>
                            ⏳
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Tiempo Restante</div>
                            <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#475569' }}>Acceso continuo sin vencimiento</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', color: '#475569', fontWeight: '600' }}>Sin Límite</span>
                      </div>
                    );
                  }

                  const diffDays = Math.ceil((new Date(infoUser.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  const isExpired = diffDays <= 0;

                  return (
                    <div style={{
                      background: isExpired ? '#fef2f2' : '#f0fdf4',
                      border: `1px solid ${isExpired ? '#fecaca' : '#bbf7d0'}`,
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: isExpired ? '#fee2e2' : '#dcfce7', padding: '7px', borderRadius: '8px', color: isExpired ? '#dc2626' : '#16a34a' }}>
                          ⏳
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: isExpired ? '#991b1b' : '#166534', fontWeight: '600', textTransform: 'uppercase' }}>
                            {isExpired ? 'Estado del Plan' : 'Días Restantes'}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: isExpired ? '#b91c1c' : '#15803d' }}>
                            {isExpired
                              ? `Suscripción Expirada (hace ${Math.abs(diffDays)} días)`
                              : (diffDays === 1 ? '¡Último día de suscripción!' : `${diffDays} Días Disponibles`)}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: '700',
                        padding: '3px 9px',
                        borderRadius: '8px',
                        background: isExpired ? '#fee2e2' : '#dcfce7',
                        color: isExpired ? '#dc2626' : '#16a34a'
                      }}>
                        {isExpired ? '⚠️ Suspendido' : '🟢 Al Día'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="superadmin-modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setInfoModalOpen(false)}
              >
                Cerrar
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  setInfoModalOpen(false);
                  handleRenovarSuscripcion(infoUser);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', borderColor: '#2563eb' }}
              >
                <ClockIcon style={{ width: 16, height: 16 }} />
                Renovar Suscripción Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: RECUPERAR / RESTABLECER CONTRASEÑA */}
      {/* ================================================================= */}
      {resetModalOpen && (
        <div className="superadmin-modal-backdrop" onClick={() => setResetModalOpen(false)}>
          <div className="superadmin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <div className="superadmin-modal-title">
                <KeyIcon style={{ width: 18, height: 18, color: '#f59e0b' }} />
                Recuperar Contraseña de Usuario
              </div>
              <button
                type="button"
                className="superadmin-modal-close"
                onClick={() => setResetModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="superadmin-modal-body">
                <div className="superadmin-user-summary-card" style={{ padding: '14px 16px', borderRadius: '12px', marginBottom: '18px' }}>
                  <div className="user-title" style={{ fontSize: '14px', fontWeight: '800' }}>{resetUserName}</div>
                  <div className="user-subtitle" style={{ fontSize: '12.5px' }}>{resetUserEmail}</div>
                </div>

                {resetError && (
                  <div className="auth-alert-error" style={{ marginBottom: '16px' }}>
                    ⚠️ {resetError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Nueva Contraseña Asignada</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '6px' }}
                        onClick={() => {
                          const p = generatePass()
                          setResetPassword(p)
                        }}
                      >
                        🎲 Generar Otra
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '6px', color: copiedNotification ? '#059669' : undefined }}
                        onClick={handleCopyPassword}
                      >
                        <CopyIcon style={{ width: 12, height: 12, marginRight: 4 }} />
                        {copiedNotification ? '¡Copiada!' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  <div className="input-with-icon">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="input-control input-control-padded-right"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      tabIndex={-1}
                    >
                      {showResetPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', marginBottom: 0, lineHeight: 1.4 }}>
                    Puedes copiar esta contraseña y enviársela directamente a tu cliente por WhatsApp o correo. Al guardar, quedará inmediatamente activa.
                  </p>
                </div>
              </div>

              <div className="superadmin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setResetModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Guardando...' : 'Asignar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: EDITAR USUARIO */}
      {/* ================================================================= */}
      {editUserModalOpen && (
        <div className="superadmin-modal-backdrop" onClick={() => setEditUserModalOpen(false)}>
          <div className="superadmin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <div className="superadmin-modal-title">
                <PencilIcon style={{ width: 18, height: 18, color: '#f59e0b' }} />
                Editar Usuario #{editUserId}
              </div>
              <button
                type="button"
                className="superadmin-modal-close"
                onClick={() => setEditUserModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit}>
              <div className="superadmin-modal-body">
                {editUserError && (
                  <div className="auth-alert-error" style={{ marginBottom: '16px' }}>
                    ⚠️ {editUserError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    value={editUserNombre}
                    onChange={(e) => setEditUserNombre(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre de Usuario (Nik)</label>
                  <input
                    type="text"
                    className="input-control"
                    value={editUserUsername}
                    onChange={(e) => setEditUserUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    className="input-control"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rol de Acceso</label>
                  <select
                    className="input-control"
                    value={editUserRol}
                    onChange={(e) => setEditUserRol(e.target.value)}
                  >
                    <option value="consumidor">👥 Consumidor / Cliente</option>
                    <option value="cajero">🛒 Cajero (Operador)</option>
                    <option value="admin">🏢 Administrador (Gestión de Tienda)</option>
                    <option value="superadmin">👑 Super Administrador (Control Total)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Estado de la Cuenta</label>
                  <select
                    className="input-control"
                    value={editUserActivo ? 'true' : 'false'}
                    onChange={(e) => setEditUserActivo(e.target.value === 'true')}
                  >
                    <option value="true">🟢 Activo (Puede ingresar al sistema)</option>
                    <option value="false">🔴 Bloqueado (Acceso suspendido)</option>
                  </select>
                </div>
              </div>

              <div className="superadmin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditUserModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editUserLoading}
                >
                  {editUserLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
