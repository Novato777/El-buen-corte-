import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'el_buen_corte_super_secret_jwt_key_2026';

// Configuración de Cloudinary para almacenamiento multimedia
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware para verificar JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token de seguridad no proporcionado.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Sesión expirada o token inválido.' });
    req.user = user;
    next();
  });
};

// Inicializar la tabla de usuarios en PostgreSQL si no existe
const initAuthDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL DEFAULT 'admin',
        activo BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;
    `);

    // 1. Asegurar usuario Super Administrador por defecto
    const superCheck = await pool.query(
      "SELECT id FROM usuarios WHERE LOWER(email) = 'superadmin@elbuencorte.com' OR rol = 'superadmin'"
    );
    if (superCheck.rows.length === 0) {
      const superPasswordHash = await bcrypt.hash('superadmin123', 10);
      await pool.query(
        `INSERT INTO usuarios (nombre, email, username, password, rol) VALUES ($1, $2, $3, $4, $5)`,
        ['Super Administrador Master', 'superadmin@elbuencorte.com', 'superadmin', superPasswordHash, 'superadmin']
      );
      console.log('👑 Super Administrador creado exitosamente: superadmin@elbuencorte.com / superadmin123');
    }

    // 2. Crear usuario admin por defecto si no existe
    const adminCheck = await pool.query(
      "SELECT id FROM usuarios WHERE LOWER(email) = 'admin@elbuencorte.com'"
    );
    if (adminCheck.rows.length === 0) {
      const defaultPasswordHash = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)`,
        ['Administrador El Buen Corte', 'admin@elbuencorte.com', defaultPasswordHash, 'admin']
      );
      console.log('👤 Usuario Administrador por defecto preparado: admin@elbuencorte.com / admin123');
    }
  } catch (err) {
    console.error('⚠️ Error al inicializar tabla de usuarios:', err.message);
  }
};

// Helper para formato de moneda COP en notificaciones y mensajes
const formatCOP = (val) => {
  return Number(val || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Inicializar la tabla de notificaciones en PostgreSQL
const initNotificationsDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL DEFAULT 'pedido_nuevo',
        titulo VARCHAR(150) NOT NULL,
        mensaje TEXT NOT NULL,
        leida BOOLEAN NOT NULL DEFAULT false,
        referencia_id VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('🔔 Tabla de notificaciones lista en PostgreSQL.');
  } catch (err) {
    console.error('⚠️ Error al inicializar tabla de notificaciones:', err.message);
  }
};

initAuthDb();
initNotificationsDb();

// Datos de Perfil por Defecto (como fallback)
const DEFAULT_PROFILE = {
  general: {
    nombre: 'El Buen Corte',
    nombreComercial: '',
    razonSocial: 'El Buen Corte S.A.S.',
    tipoNegocio: 'Carnicería',
    tipoNegocioOtro: '',
    descripcion: 'Carnicería premium especializada en cortes finos de res, cerdo y embutidos artesanales.',
    anoCreacion: '2024',
    estado: 'Activo'
  },
  identidad: { logo: '', portada: '' },
  contacto: {
    telefonoPrincipal: '+57 322 206 7870',
    telefonoSecundario: '',
    whatsapp: '+57 322 206 7870',
    email: 'cardozobrayan334@gmail.com',
    sitioWeb: 'https://elbuencorte.com'
  },
  ubicacion: {
    pais: 'Colombia',
    departamento: 'Cundinamarca',
    ciudad: 'Bogotá',
    direccion: 'Calle 80 #15-20',
    codigoPostal: '110111',
    latitud: '',
    longitud: ''
  },
  redes: [
    { id: '1', plataforma: 'Facebook', usuario: 'El Buen Corte', url: 'https://facebook.com/elbuencorte' },
    { id: '2', plataforma: 'Instagram', usuario: '@elbuencorte', url: 'https://instagram.com/elbuencorte' }
  ],
  horarios: {
    'Lunes': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Martes': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Miércoles': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Jueves': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Viernes': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Sábado': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Domingo': { abierto: false, apertura: '09:00', cierre: '14:00' }
  },
  financiero: {
    moneda: 'COP',
    simbolo: '$',
    nit: '901.234.567-8',
    responsable: 'Brayan Cardozo'
  },
  adicional: {
    mision: 'Proveer los mejores cortes de carne con altos estándares de higiene y servicio excepcional.',
    vision: 'Ser la carnicería líder y de confianza preferida por los hogares y restaurantes de la región.',
    servicios: ['Venta de carnes', 'Servicio a domicilio', 'Cortes personalizados', 'Empaque al vacío']
  }
};

// ============================================================================
//  RUTAS DE LA API
// ============================================================================

// --- General Status ---
app.get('/', (req, res) => {
  res.json({
    message: '¡API de El Buen Corte activa y conectada a PostgreSQL!',
    status: 'online',
    timestamp: new Date()
  });
});

// --- Middleware Global de Protección API ---
app.use('/api', (req, res, next) => {
  // Permitir acceso público al login y a las rutas de la tienda virtual pública
  if (req.path === '/auth/login' || req.path.startsWith('/public')) {
    return next();
  }
  // Exigir token para todo lo demás (rutas privadas de administración y POS)
  return authenticateToken(req, res, next);
});

// --- Subida de Imágenes a Cloudinary (Productos, Logos, Portadas) ---
app.post('/api/upload', authenticateToken, async (req, res) => {
  try {
    const { image, folder = 'el_buen_corte' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen.' });
    }

    // Si Cloudinary no está configurado en variables de entorno, devolver fallback base64
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return res.json({ url: image, secure_url: image });
    }

    const uploadRes = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: 'image'
    });

    res.json({
      url: uploadRes.secure_url,
      secure_url: uploadRes.secure_url,
      public_id: uploadRes.public_id
    });
  } catch (err) {
    console.error('Error al subir imagen a Cloudinary:', err);
    res.status(500).json({ error: 'Error al procesar la imagen: ' + err.message });
  }
});

// Login de Usuario
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Debes proporcionar correo electrónico y contraseña.' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE LOWER(username) = LOWER($1) OR (email IS NOT NULL AND LOWER(email) = LOWER($1))',
      [username.trim()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas. El usuario no está registrado.' });
    }

    const user = rows[0];

    // Verificar si el usuario está bloqueado o suspendido
    if (user.activo === false) {
      return res.status(403).json({ error: 'Tu cuenta ha sido suspendida o bloqueada por el Super Administrador. Contacta a soporte.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas. Contraseña inválida.' });
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, username: user.username, rol: user.rol, activo: user.activo },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '¡Inicio de sesión exitoso!',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        username: user.username,
        rol: user.rol,
        activo: user.activo
      }
    });
  } catch (err) {
    console.error('Error en /api/auth/login:', err);
    res.status(500).json({ error: 'Error interno en el servidor de autenticación.' });
  }
});

// --- GESTIÓN DE USUARIOS (SuperAdmin & Admin) ---

const isUserAdminOrSuper = (rol) => rol === 'admin' || rol === 'superadmin';

// Obtener todos los usuarios
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (!isUserAdminOrSuper(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores y superadmin pueden ver usuarios.' });
    }
    const { rows } = await pool.query('SELECT id, nombre, email, username, rol, activo, created_at FROM usuarios ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
  }
});

// Crear nuevo usuario (Registro Privado por SuperAdmin/Admin)
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (!isUserAdminOrSuper(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores y superadmin pueden crear usuarios.' });
    }

    const { nombre, email, username, password, rol = 'admin', activo = true } = req.body;

    if (!nombre || !username || !password) {
      return res.status(400).json({ error: 'Todos los campos obligatorios (nombre, Nik, contraseña) son requeridos.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener un mínimo de 6 caracteres.' });
    }

    // Solo superadmin puede crear otros superadmin
    if (rol === 'superadmin' && req.user.rol !== 'superadmin') {
      return res.status(403).json({ error: 'Solo un Super Administrador puede crear otros usuarios con rol SuperAdmin.' });
    }
    
    const existing = await pool.query('SELECT id FROM usuarios WHERE LOWER(username) = LOWER($1)', [username.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Este correo electrónico ya se encuentra registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, username, password, rol, activo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, email, username, rol, activo, created_at`,
      [nombre.trim(), email ? email.trim().toLowerCase() : null, username.trim().toLowerCase(), hashedPassword, rol, activo !== false]
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente.',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error en creación de usuario:', err);
    res.status(500).json({ error: 'Error interno al registrar usuario: ' + err.message + ' ' + err.stack });
  }
});

// Actualizar usuario existente
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (!isUserAdminOrSuper(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores y superadmin pueden editar usuarios.' });
    }

    const { id } = req.params;
    const { nombre, email, username, password, rol, activo } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido.' });
    }

    // Verificar si el usuario a editar existe
    const targetUser = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Si el usuario actual no es superadmin, no puede editar a un superadmin ni asignarse/asignar superadmin
    if (req.user.rol !== 'superadmin') {
      if (targetUser.rows[0].rol === 'superadmin' || rol === 'superadmin') {
        return res.status(403).json({ error: 'Solo un Super Administrador puede modificar o asignar cuentas de SuperAdmin.' });
      }
    }

    // Verificar colisión de username con otros usuarios si se provee
    if (username && username.trim()) {
      const usernameCheck = await pool.query('SELECT id FROM usuarios WHERE LOWER(username) = LOWER($1) AND id != $2', [username.trim().toLowerCase(), id]);
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Este nombre de usuario ya está en uso por otra cuenta.' });
      }
    }

    // Verificar colisión de email con otros usuarios si se provee
    if (email && email.trim()) {
      const emailCheck = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1) AND id != $2', [email.trim().toLowerCase(), id]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Este correo electrónico ya está en uso por otro usuario.' });
      }
    }

    const newActivo = activo !== undefined ? activo : targetUser.rows[0].activo;
    const finalUsername = username ? username.trim().toLowerCase() : targetUser.rows[0].username;
    const finalEmail = email ? email.trim().toLowerCase() : targetUser.rows[0].email;
    const finalRol = rol || targetUser.rows[0].rol;

    let queryText = '';
    let queryParams = [];

    if (password && password.trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      queryText = `UPDATE usuarios SET nombre = $1, email = $2, username = $3, rol = $4, activo = $5, password = $6 WHERE id = $7 RETURNING id, nombre, email, username, rol, activo, created_at`;
      queryParams = [nombre.trim(), finalEmail, finalUsername, finalRol, newActivo, hashedPassword, id];
    } else {
      queryText = `UPDATE usuarios SET nombre = $1, email = $2, username = $3, rol = $4, activo = $5 WHERE id = $6 RETURNING id, nombre, email, username, rol, activo, created_at`;
      queryParams = [nombre.trim(), finalEmail, finalUsername, finalRol, newActivo, id];
    }

    const result = await pool.query(queryText, queryParams);
    res.json({
      message: 'Usuario actualizado exitosamente.',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error interno al actualizar usuario.' });
  }
});

// Bloquear / Activar usuario en 1 clic (Solo SuperAdmin)
app.patch('/api/users/:id/toggle-status', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'superadmin') {
      return res.status(403).json({ error: 'Solo el Super Administrador puede bloquear o activar usuarios.' });
    }

    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes bloquear tu propia cuenta activa de SuperAdmin.' });
    }

    const userCheck = await pool.query('SELECT id, rol, activo, nombre FROM usuarios WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const current = userCheck.rows[0];

    // Evitar bloquear al último superadmin activo
    if (current.rol === 'superadmin' && current.activo) {
      const superCount = await pool.query("SELECT COUNT(*) FROM usuarios WHERE rol = 'superadmin' AND activo = true");
      if (parseInt(superCount.rows[0].count) <= 1) {
        return res.status(400).json({ error: 'No puedes bloquear al único Super Administrador activo del sistema.' });
      }
    }

    const newStatus = !current.activo;
    const result = await pool.query(
      'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, nombre, email, username, rol, activo, created_at',
      [newStatus, id]
    );

    res.json({
      message: `Usuario ${current.nombre} ${newStatus ? 'activado' : 'bloqueado'} exitosamente.`,
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error al cambiar estado de usuario:', err);
    res.status(500).json({ error: 'Error interno al cambiar estado de usuario.' });
  }
});

// Restablecer / Recuperar contraseña de un usuario (Solo SuperAdmin)
app.post('/api/users/:id/reset-password', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'superadmin') {
      return res.status(403).json({ error: 'Solo el Super Administrador puede restablecer contraseñas de usuarios.' });
    }

    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener un mínimo de 6 caracteres.' });
    }

    const userCheck = await pool.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hashedPassword, id]);

    res.json({
      message: `Contraseña para el usuario "${userCheck.rows[0].nombre}" restablecida con éxito.`,
      success: true
    });
  } catch (err) {
    console.error('Error al restablecer contraseña:', err);
    res.status(500).json({ error: 'Error interno al restablecer la contraseña.' });
  }
});

// Eliminar usuario
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (!isUserAdminOrSuper(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores y superadmin pueden eliminar usuarios.' });
    }

    const { id } = req.params;
    
    // Evitar que un usuario se elimine a sí mismo
    if (parseInt(id) === req.user.id) {
       return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta activa de sesión.' });
    }

    const userCheck = await pool.query('SELECT rol FROM usuarios WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'El usuario no existe o ya fue eliminado.' });
    }

    // Proteger contra eliminación del último superadmin
    if (userCheck.rows[0].rol === 'superadmin') {
      const superCount = await pool.query("SELECT COUNT(*) FROM usuarios WHERE rol = 'superadmin'");
      if (parseInt(superCount.rows[0].count) <= 1) {
        return res.status(400).json({ error: 'No puedes eliminar al único Super Administrador del sistema.' });
      }
      if (req.user.rol !== 'superadmin') {
        return res.status(403).json({ error: 'Solo un Super Administrador puede eliminar a otro Super Administrador.' });
      }
    }

    // Evitar eliminar al último admin
    if (userCheck.rows[0].rol === 'admin') {
      const adminCount = await pool.query("SELECT COUNT(*) FROM usuarios WHERE rol = 'admin'");
      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res.status(400).json({ error: 'No puedes eliminar al único administrador de tienda del sistema.' });
      }
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ success: true, message: 'Usuario eliminado exitosamente.' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error interno al eliminar usuario.' });
  }
});

// Verificar token de sesión activa
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nombre, email, username, rol, activo, created_at FROM usuarios WHERE id = $1', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Error en /api/auth/me:', err);
    res.status(500).json({ error: 'Error al verificar token de sesión.' });
  }
});

// --- Business Profile ---
app.get('/api/business-profile', authenticateToken, async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM business_profile ORDER BY updated_at DESC, id DESC LIMIT 1');
    if (result.rowCount === 0 || !result.rows[0].general || Object.keys(result.rows[0].general).length === 0) {
      return res.json(DEFAULT_PROFILE);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ error: 'Error al obtener el perfil de negocio' });
  }
});

app.post('/api/business-profile', authenticateToken, async (req, res) => {
  try {
    const { general, identidad, contacto, ubicacion, redes, horarios, financiero, adicional } = req.body;
    
    const existing = await pool.query('SELECT id FROM business_profile ORDER BY updated_at DESC, id DESC LIMIT 1');
    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE business_profile
         SET general = $1, identidad = $2, contacto = $3, ubicacion = $4, redes = $5, horarios = $6, financiero = $7, adicional = $8, updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *`,
        [
          JSON.stringify(general || {}),
          JSON.stringify(identidad || {}),
          JSON.stringify(contacto || {}),
          JSON.stringify(ubicacion || {}),
          JSON.stringify(redes || []),
          JSON.stringify(horarios || {}),
          JSON.stringify(financiero || {}),
          JSON.stringify(adicional || {}),
          existing.rows[0].id
        ]
      );
    } else {
      result = await pool.query(
        `INSERT INTO business_profile (general, identidad, contacto, ubicacion, redes, horarios, financiero, adicional, tenant_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          JSON.stringify(general || {}),
          JSON.stringify(identidad || {}),
          JSON.stringify(contacto || {}),
          JSON.stringify(ubicacion || {}),
          JSON.stringify(redes || []),
          JSON.stringify(horarios || {}),
          JSON.stringify(financiero || {}),
          JSON.stringify(adicional || {}),
          req.user.id
        ]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar perfil:', err);
    res.status(500).json({ error: 'Error al actualizar el perfil de negocio' });
  }
});

// ============================================================================
// 🛒 RUTAS PÚBLICAS DE TIENDA VIRTUAL (Sin autenticación requerida)
// ============================================================================

// Obtener catálogo público de productos
app.get('/api/public/productos', async (req, res) => {
  try {
    const { tenantId } = req.query;
    let query = 'SELECT * FROM inventario';
    let params = [];

    if (tenantId) {
      query += ' WHERE tenant_id = $1';
      params.push(tenantId);
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    const items = result.rows.map(r => ({
      id: r.id,
      nombre: r.nombre,
      categoria: r.categoria,
      descripcion: r.descripcion,
      foto: r.foto,
      precioVenta: Number(r.precio_venta),
      stock: Number(r.stock),
      limiteMin: Number(r.limite_min),
      tenantId: r.tenant_id
    }));
    res.json(items);
  } catch (err) {
    console.error('Error al obtener productos públicos de la tienda:', err);
    res.status(500).json({ error: 'Error al obtener catálogo' });
  }
});

// Obtener perfil público del negocio
app.get('/api/public/perfil', async (req, res) => {
  try {
    const { tenantId } = req.query;
    let query = 'SELECT * FROM business_profile';
    let params = [];

    if (tenantId) {
      query += ' WHERE tenant_id = $1';
      params.push(tenantId);
    }
    query += ' ORDER BY updated_at DESC, id DESC LIMIT 1';

    const result = await pool.query(query, params);
    if (result.rows.length === 0 || !result.rows[0].general || Object.keys(result.rows[0].general).length === 0) {
      return res.json({
        general: {
          nombre: 'El Buen Corte',
          tipoNegocio: 'Carnicería Gourmet',
          descripcion: 'Carnicería premium especializada en cortes finos de res, cerdo y pollo de primera calidad.',
          eslogan: 'Cortes Selectos de Calidad Garantizada'
        },
        identidad: {
          logo: '',
          portada: ''
        },
        contacto: {
          telefonoPrincipal: '+57 322 206 7870',
          whatsapp: '+57 322 206 7870',
          email: 'contacto@elbuencorte.com'
        },
        ubicacion: {
          ciudad: 'Bogotá',
          direccion: 'Calle 80 # 15-20',
          departamento: 'Cundinamarca',
          pais: 'Colombia'
        },
        redes: [
          { id: '1', plataforma: 'Facebook', usuario: 'El Buen Corte', url: 'https://facebook.com/elbuencorte' },
          { id: '2', plataforma: 'Instagram', usuario: '@elbuencorte', url: 'https://instagram.com/elbuencorte' }
        ],
        horarios: {
          'Lunes': { abierto: true, apertura: '07:00', cierre: '19:00' },
          'Martes': { abierto: true, apertura: '07:00', cierre: '19:00' },
          'Miércoles': { abierto: true, apertura: '07:00', cierre: '19:00' },
          'Jueves': { abierto: true, apertura: '07:00', cierre: '19:00' },
          'Viernes': { abierto: true, apertura: '07:00', cierre: '19:00' },
          'Sábado': { abierto: true, apertura: '07:00', cierre: '19:00' },
          'Domingo': { abierto: true, apertura: '08:00', cierre: '15:00' }
        },
        adicional: {
          mision: 'Proveer los mejores cortes de carne con altos estándares de higiene y servicio excepcional.',
          servicios: ['Venta de carnes frescas', 'Cortes personalizados', 'Servicio a domicilio', 'Empaque al vacío']
        }
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener perfil público:', err);
    res.status(500).json({ error: 'Error al obtener datos del negocio' });
  }
});

// Crear pedido público desde la tienda virtual
app.post('/api/public/pedidos', async (req, res) => {
  try {
    const { cliente, telefono, direccion, metodoPago, notas, items, tenantId } = req.body;
    
    if (!cliente || !items || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para el pedido.' });
    }

    // Determinar tenant (usar tenant provisto o primer admin en BD)
    let targetTenantId = tenantId;
    if (!targetTenantId) {
      const firstProd = await pool.query('SELECT tenant_id FROM inventario WHERE id = $1', [items[0].productoId]);
      if (firstProd.rows.length > 0 && firstProd.rows[0].tenant_id) {
        targetTenantId = firstProd.rows[0].tenant_id;
      } else {
        const anyAdmin = await pool.query("SELECT id FROM usuarios WHERE rol IN ('admin', 'superadmin') ORDER BY id ASC LIMIT 1");
        targetTenantId = anyAdmin.rows[0]?.id || 10;
      }
    }

    const countResult = await pool.query('SELECT count(*) FROM pedidos');
    const orderId = `PED-${100 + Number(countResult.rows[0].count) + 1}`;
    const dateStr = new Date().toLocaleDateString('es-CO');

    const orderItems = [];
    let total = 0;

    for (const oi of items) {
      const findResult = await pool.query('SELECT * FROM inventario WHERE id = $1', [oi.productoId]);
      if (findResult.rows.length === 0) {
        return res.status(404).json({ error: `El producto con ID ${oi.productoId} no existe.` });
      }
      
      const prod = findResult.rows[0];
      const cantidadVal = Number(oi.cantidad);
      const precioVal = Number(prod.precio_venta);
      
      if (Number(prod.stock) < cantidadVal) {
        return res.status(400).json({ error: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock} kg.` });
      }

      // Descontar del inventario de forma atómica
      const nuevoStock = Math.max(0, Number(prod.stock) - cantidadVal);
      await pool.query('UPDATE inventario SET stock = $1 WHERE id = $2', [nuevoStock, oi.productoId]);

      orderItems.push({
        productoId: oi.productoId,
        nombre: prod.nombre,
        cantidad: cantidadVal,
        precio: precioVal
      });
      total += cantidadVal * precioVal;
    }

    const clienteDisplay = telefono ? `${cliente} (Tel: ${telefono})` : cliente;

    // 1. Insertar el pedido principal con estado Pendiente
    await pool.query(
      `INSERT INTO pedidos (id, cliente, total, estado, fecha, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, clienteDisplay, total, 'Pendiente', dateStr, targetTenantId]
    );

    // 2. Insertar cada ítem del pedido
    for (const item of orderItems) {
      await pool.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, nombre, cantidad, precio)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.productoId, item.nombre, item.cantidad, item.precio]
      );
    }

    // 3. Crear automáticamente notificación para la campana del Dashboard
    const notifMsg = `Has recibido un nuevo pedido (#${orderId}) de ${cliente} por ${formatCOP(total)}. Revisa los pedidos pendientes para gestionarlo.`;
    await pool.query(
      `INSERT INTO notificaciones (tipo, titulo, mensaje, leida, referencia_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'pedido_nuevo',
        'Nuevo pedido recibido',
        notifMsg,
        false,
        orderId,
        JSON.stringify({ orderId, cliente, total, fecha: dateStr, telefono, direccion, items: orderItems })
      ]
    );

    res.status(201).json({
      id: orderId,
      cliente,
      telefono,
      direccion,
      metodoPago,
      notas,
      items: orderItems,
      total,
      estado: 'Pendiente',
      fecha: dateStr
    });
  } catch (err) {
    console.error('Error al crear pedido público:', err);
    res.status(500).json({ error: 'Error al procesar el pedido en la tienda pública: ' + err.message });
  }
});

// ============================================================================
// 🔔 SISTEMA DE NOTIFICACIONES
// ============================================================================

// Obtener lista de notificaciones recientes
app.get('/api/notificaciones', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notificaciones ORDER BY created_at DESC LIMIT 50');
    const notifs = result.rows.map(r => ({
      id: r.id,
      tipo: r.tipo,
      titulo: r.titulo,
      mensaje: r.mensaje,
      leida: r.leida,
      referenciaId: r.referencia_id,
      metadata: r.metadata,
      createdAt: r.created_at
    }));
    res.json(notifs);
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// Marcar notificación individual como leída
app.patch('/api/notificaciones/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notificaciones SET leida = true WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error al marcar notificación como leída:', err);
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
});

// Marcar todas las notificaciones como leídas
app.patch('/api/notificaciones/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE notificaciones SET leida = true WHERE leida = false');
    res.json({ success: true, message: 'Todas las notificaciones fueron marcadas como leídas' });
  } catch (err) {
    console.error('Error al marcar todas las notificaciones:', err);
    res.status(500).json({ error: 'Error al actualizar notificaciones' });
  }
});

// Eliminar una notificación
app.delete('/api/notificaciones/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notificaciones WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error al eliminar notificación:', err);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
});

// ============================================================================
// 📦 GESTIÓN DE INVENTARIO Y MERMAS
// ============================================================================

app.get('/api/inventario', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventario ORDER BY created_at DESC');
    const items = result.rows.map(r => ({
      id: r.id,
      nombre: r.nombre,
      categoria: r.categoria,
      descripcion: r.descripcion,
      foto: r.foto,
      precioVenta: Number(r.precio_venta),
      stock: Number(r.stock),
      limiteMin: Number(r.limite_min),
      tenantId: r.tenant_id
    }));
    res.json(items);
  } catch (err) {
    console.error('Error al obtener inventario:', err);
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
});

// Crear producto en el inventario
app.post('/api/inventario', authenticateToken, async (req, res) => {
  try {
    const { nombre, stock, precioVenta, limiteMin, categoria, descripcion, foto } = req.body;
    
    if (!nombre || !precioVenta || !categoria) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, precioVenta, categoria)' });
    }

    // Obtener ID numérico máximo
    const maxResult = await pool.query('SELECT id FROM inventario');
    const ids = maxResult.rows.map(r => Number(r.id)).filter(n => !isNaN(n));
    const nuevoId = String(ids.length > 0 ? Math.max(...ids) + 1 : 1);
    
    const result = await pool.query(
      `INSERT INTO inventario (id, nombre, categoria, descripcion, foto, precio_venta, stock, limite_min, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nuevoId,
        nombre,
        categoria,
        descripcion || '',
        foto || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=300',
        Number(precioVenta),
        Number(stock) || 0,
        Number(limiteMin) || 0,
        req.user.id
      ]
    );

    const r = result.rows[0];
    res.json({
      id: r.id,
      nombre: r.nombre,
      categoria: r.categoria,
      descripcion: r.descripcion,
      foto: r.foto,
      precioVenta: Number(r.precio_venta),
      stock: Number(r.stock),
      limiteMin: Number(r.limite_min)
    });
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

// Eliminar producto de inventario
app.delete('/api/inventario/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const findResult = await pool.query('SELECT * FROM inventario WHERE id = $1', [id]);
    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    await pool.query('DELETE FROM inventario WHERE id = $1', [id]);
    res.json({ success: true, eliminado: findResult.rows[0] });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Abastecer stock de un producto
app.post('/api/inventario/abastecer', authenticateToken, async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;
    const findResult = await pool.query('SELECT * FROM inventario WHERE id = $1', [productoId]);
    
    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const prod = findResult.rows[0];
    const peso = Number(cantidad);
    const nuevoStock = Number(prod.stock) + peso;
    
    await pool.query('UPDATE inventario SET stock = $1 WHERE id = $2', [nuevoStock, productoId]);

    // Registrar egreso estimado en contabilidad (70% del valor de venta como costo de compra)
    const costoEstimado = Math.round(Number(prod.precio_venta) * 0.7 * peso);
    
    const countTrx = await pool.query('SELECT count(*) FROM transacciones');
    const trxId = `TRX-${100 + Number(countTrx.rows[0].count) + 1}`;
    const nowStr = new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'});

    const insertTrx = await pool.query(
      `INSERT INTO transacciones (id, tipo, descripcion, monto, fecha, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [trxId, 'Egreso', `Abastecimiento: +${peso}kg ${prod.nombre}`, costoEstimado, nowStr, req.user.id]
    );

    res.json({
      producto: {
        id: prod.id,
        nombre: prod.nombre,
        categoria: prod.categoria,
        descripcion: prod.descripcion,
        foto: prod.foto,
        precioVenta: Number(prod.precio_venta),
        stock: nuevoStock,
        limiteMin: Number(prod.limite_min)
      },
      transaccion: {
        id: insertTrx.rows[0].id,
        tipo: insertTrx.rows[0].tipo,
        descripcion: insertTrx.rows[0].descripcion,
        monto: Number(insertTrx.rows[0].monto),
        fecha: insertTrx.rows[0].fecha
      }
    });
  } catch (err) {
    console.error('Error al abastecer:', err);
    res.status(500).json({ error: 'Error al abastecer el producto' });
  }
});

// Registrar merma de un producto
app.post('/api/inventario/mermas', authenticateToken, async (req, res) => {
  try {
    const { productoId, peso, motivo } = req.body;
    const findResult = await pool.query('SELECT * FROM inventario WHERE id = $1', [productoId]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const prod = findResult.rows[0];
    const pesoMerma = Number(peso);
    const nuevoStock = Math.max(0, Number(prod.stock) - pesoMerma);
    
    await pool.query('UPDATE inventario SET stock = $1 WHERE id = $2', [nuevoStock, productoId]);

    const countMermas = await pool.query('SELECT count(*) FROM mermas');
    const mermaId = `M-${Number(countMermas.rows[0].count) + 1}`;
    const dateStr = new Date().toLocaleDateString('es-CO');

    const insertMerma = await pool.query(
      `INSERT INTO mermas (id, producto_nombre, peso, motivo, fecha, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [mermaId, prod.nombre, pesoMerma, motivo || 'Descarte estándar', dateStr, req.user.id]
    );

    const m = insertMerma.rows[0];
    res.json({
      producto: {
        id: prod.id,
        nombre: prod.nombre,
        categoria: prod.categoria,
        descripcion: prod.descripcion,
        foto: prod.foto,
        precioVenta: Number(prod.precio_venta),
        stock: nuevoStock,
        limiteMin: Number(prod.limite_min)
      },
      merma: {
        id: m.id,
        productoNombre: m.producto_nombre,
        peso: Number(m.peso),
        motivo: m.motivo,
        fecha: m.fecha
      }
    });
  } catch (err) {
    console.error('Error al registrar merma:', err);
    res.status(500).json({ error: 'Error al registrar merma' });
  }
});

// Obtener historial de mermas
app.get('/api/mermas', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mermas ORDER BY created_at DESC');
    res.json(result.rows.map(m => ({
      id: m.id,
      productoNombre: m.producto_nombre,
      peso: Number(m.peso),
      motivo: m.motivo,
      fecha: m.fecha
    })));
  } catch (err) {
    console.error('Error al obtener mermas:', err);
    res.status(500).json({ error: 'Error al obtener mermas' });
  }
});

// ============================================================================
// 📋 GESTIÓN DE PEDIDOS
// ============================================================================

app.get('/api/pedidos', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos ORDER BY created_at DESC');
    const orders = [];
    
    for (const r of result.rows) {
      const itemsResult = await pool.query('SELECT * FROM pedido_items WHERE pedido_id = $1', [r.id]);
      orders.push({
        id: r.id,
        cliente: r.cliente,
        total: Number(r.total),
        estado: r.estado,
        fecha: r.fecha,
        items: itemsResult.rows.map(item => ({
          productoId: item.producto_id,
          nombre: item.nombre,
          cantidad: Number(item.cantidad),
          precio: Number(item.precio)
        }))
      });
    }
    res.json(orders);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Crear pedido desde el panel de administración
app.post('/api/pedidos', authenticateToken, async (req, res) => {
  try {
    const { cliente, items } = req.body;
    
    if (!cliente || !items || items.length === 0) {
      return res.status(400).json({ error: 'Datos de pedido incompletos' });
    }

    const countResult = await pool.query('SELECT count(*) FROM pedidos');
    const orderId = `PED-${100 + Number(countResult.rows[0].count) + 1}`;
    const dateStr = new Date().toLocaleDateString('es-CO');

    const orderItems = [];
    let total = 0;

    for (const oi of items) {
      const findResult = await pool.query('SELECT * FROM inventario WHERE id = $1', [oi.productoId]);
      if (findResult.rows.length === 0) {
        return res.status(404).json({ error: `Producto ${oi.productoId} no existe` });
      }
      
      const prod = findResult.rows[0];
      const cantidadVal = Number(oi.cantidad);
      const precioVal = Number(prod.precio_venta);
      
      // Descontar del inventario
      const nuevoStock = Math.max(0, Number(prod.stock) - cantidadVal);
      await pool.query('UPDATE inventario SET stock = $1 WHERE id = $2', [nuevoStock, oi.productoId]);

      orderItems.push({
        productoId: oi.productoId,
        nombre: prod.nombre,
        cantidad: cantidadVal,
        precio: precioVal
      });
      total += cantidadVal * precioVal;
    }

    // Insertar el pedido principal
    await pool.query(
      `INSERT INTO pedidos (id, cliente, total, estado, fecha, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, cliente, total, 'Pendiente', dateStr, req.user.id]
    );

    // Insertar cada ítem del pedido
    for (const item of orderItems) {
      await pool.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, nombre, cantidad, precio)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.productoId, item.nombre, item.cantidad, item.precio]
      );
    }

    // Insertar notificación
    const notifMsg = `Nuevo pedido (#${orderId}) registrado internamente para ${cliente} por ${formatCOP(total)}.`;
    await pool.query(
      `INSERT INTO notificaciones (tipo, titulo, mensaje, leida, referencia_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'pedido_nuevo',
        'Nuevo pedido registrado',
        notifMsg,
        false,
        orderId,
        JSON.stringify({ orderId, cliente, total, fecha: dateStr, items: orderItems })
      ]
    );

    res.status(201).json({
      id: orderId,
      cliente,
      items: orderItems,
      total,
      estado: 'Pendiente',
      fecha: dateStr
    });
  } catch (err) {
    console.error('Error al crear pedido:', err);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// Cambiar estado de pedido (Entregado / Cancelado)
app.patch('/api/pedidos/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, metodoPago } = req.body; // 'Entregado' o 'Cancelado'
    
    const findResult = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const p = findResult.rows[0];

    if (p.estado !== 'Pendiente') {
      return res.status(400).json({ error: 'El pedido ya no está pendiente' });
    }

    await pool.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);

    const itemsResult = await pool.query('SELECT * FROM pedido_items WHERE pedido_id = $1', [id]);
    const orderItems = itemsResult.rows.map(item => ({
      productoId: item.producto_id,
      nombre: item.nombre,
      cantidad: Number(item.cantidad),
      precio: Number(item.precio)
    }));

    const fullPedido = {
      id: p.id,
      cliente: p.cliente,
      total: Number(p.total),
      estado: estado,
      fecha: p.fecha,
      items: orderItems
    };

    if (estado === 'Entregado') {
      // Registrar ingreso en contabilidad
      const countTrx = await pool.query('SELECT count(*) FROM transacciones');
      const trxId = `TRX-${100 + Number(countTrx.rows[0].count) + 1}`;
      const nowStr = new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'});

      const insertTrx = await pool.query(
        `INSERT INTO transacciones (id, tipo, descripcion, monto, metodo_pago, fecha, tenant_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [trxId, 'Ingreso', `Venta de ${p.cliente} (${p.id})`, Number(p.total), metodoPago || 'Efectivo', nowStr, req.user.id]
      );
      
      return res.json({ pedido: fullPedido, transaccion: insertTrx.rows[0] });
    } 
    
    if (estado === 'Cancelado') {
      // Devolver stock al inventario
      for (const item of orderItems) {
        const prodResult = await pool.query('SELECT stock FROM inventario WHERE id = $1', [item.productoId]);
        if (prodResult.rows.length > 0) {
          const nuevoStock = Number(prodResult.rows[0].stock) + item.cantidad;
          await pool.query('UPDATE inventario SET stock = $1 WHERE id = $2', [nuevoStock, item.productoId]);
        }
      }
      return res.json({ pedido: fullPedido });
    }

    res.status(400).json({ error: 'Estado inválido' });
  } catch (err) {
    console.error('Error al cambiar estado de pedido:', err);
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
  }
});

// ============================================================================
// 🥩 CALCULADORA RES (SIMULACIONES)
// ============================================================================

app.get('/api/simulaciones', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM simulaciones ORDER BY created_at DESC');
    res.json(result.rows.map(s => ({
      id: s.id,
      fecha: s.fecha,
      pesoPie: Number(s.peso_pie),
      costoTotal: Number(s.costo_total),
      carneKg: Number(s.carne_kg),
      realCostoKg: Number(s.real_costo_kg)
    })));
  } catch (err) {
    console.error('Error al obtener simulaciones:', err);
    res.status(500).json({ error: 'Error al obtener simulaciones' });
  }
});

app.post('/api/simulaciones', authenticateToken, async (req, res) => {
  try {
    const { pesoPie, costoTotal, carneKg, realCostoKg } = req.body;
    const dateStr = new Date().toLocaleDateString('es-CO');

    const result = await pool.query(
      `INSERT INTO simulaciones (fecha, peso_pie, costo_total, carne_kg, real_costo_kg, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [dateStr, Number(pesoPie), Number(costoTotal), Number(carneKg), Number(realCostoKg), req.user.id]
    );

    const s = result.rows[0];
    res.json({
      id: s.id,
      fecha: s.fecha,
      pesoPie: Number(s.peso_pie),
      costoTotal: Number(s.costo_total),
      carneKg: Number(s.carne_kg),
      realCostoKg: Number(s.real_costo_kg)
    });
  } catch (err) {
    console.error('Error al crear simulación:', err);
    res.status(500).json({ error: 'Error al guardar la simulación' });
  }
});

app.delete('/api/simulaciones/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM simulaciones WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar simulación:', err);
    res.status(500).json({ error: 'Error al eliminar la simulación' });
  }
});

// ============================================================================
// 💰 CONTABILIDAD (TRANSACCIONES)
// ============================================================================

app.get('/api/transacciones', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transacciones ORDER BY created_at DESC');
    res.json(result.rows.map(t => ({
      id: t.id,
      tipo: t.tipo,
      descripcion: t.descripcion,
      monto: Number(t.monto),
      metodoPago: t.metodo_pago,
      fecha: t.fecha
    })));
  } catch (err) {
    console.error('Error al obtener transacciones:', err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

app.post('/api/transacciones/ingreso', authenticateToken, async (req, res) => {
  try {
    const { descripcion, monto, metodoPago } = req.body;
    
    if (!descripcion || !monto || !metodoPago) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (descripcion, monto, metodoPago)' });
    }

    const countTrx = await pool.query('SELECT count(*) FROM transacciones');
    const trxId = `TRX-${100 + Number(countTrx.rows[0].count) + 1}`;
    const nowStr = new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'});

    const result = await pool.query(
      `INSERT INTO transacciones (id, tipo, descripcion, monto, metodo_pago, fecha, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [trxId, 'Ingreso', descripcion, Number(monto), metodoPago, nowStr, req.user.id]
    );

    const t = result.rows[0];
    res.json({
      id: t.id,
      tipo: t.tipo,
      descripcion: t.descripcion,
      monto: Number(t.monto),
      metodoPago: t.metodo_pago,
      fecha: t.fecha
    });
  } catch (err) {
    console.error('Error al registrar ingreso:', err);
    res.status(500).json({ error: 'Error al registrar ingreso' });
  }
});

app.post('/api/transacciones/egreso', authenticateToken, async (req, res) => {
  try {
    const { descripcion, monto, metodoPago } = req.body;
    
    if (!descripcion || !monto) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const countTrx = await pool.query('SELECT count(*) FROM transacciones');
    const trxId = `TRX-${100 + Number(countTrx.rows[0].count) + 1}`;
    const nowStr = new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'});

    const result = await pool.query(
      `INSERT INTO transacciones (id, tipo, descripcion, monto, metodo_pago, fecha, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [trxId, 'Egreso', descripcion, Number(monto), metodoPago || 'Efectivo', nowStr, req.user.id]
    );

    const t = result.rows[0];
    res.json({
      id: t.id,
      tipo: t.tipo,
      descripcion: t.descripcion,
      monto: Number(t.monto),
      metodoPago: t.metodo_pago,
      fecha: t.fecha
    });
  } catch (err) {
    console.error('Error al registrar egreso:', err);
    res.status(500).json({ error: 'Error al registrar egreso' });
  }
});

// --- Arranque del Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

