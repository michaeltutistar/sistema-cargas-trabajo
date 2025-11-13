 /**
 * SERVIDOR INTEGRADO PARA PRODUCCION
 * Sistema de Gestion de Cargas de Trabajo
 * 
 * Servidor unico que sirve tanto el backend API como el frontend React
 * Soluciona el problema "Failed to fetch" en produccion
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config({ path: '.env' });

console.log('🚀 Iniciando Servidor Integrado de Producción con MySQL...');
console.log('📂 Sirviendo archivos estáticos desde:', path.join(__dirname, 'dist'));

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'cargas_trabajo_secret_key_2024_produccion';

// Configuración de MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'cargas_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'cargas_trabajo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('🔧 Configuración MySQL:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Probar conexión
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
  }
})();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend React desde /dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

// Función para calcular tiempo estándar PERT
function calcularTiempoEstandarPERT(tmin, tprom, tmax) {
  return ((tmin + 4 * tprom + tmax) / 6) * 1.07;
}

// Middleware de autenticación
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip} - UserAgent: ${req.get('User-Agent')}`);
  next();
});

// ============================================================================
// RUTAS DE LA API
// ============================================================================

// Salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de Cargas de Trabajo funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'MySQL'
  });
});

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

app.post('/api/auth/login', async (req, res) => {
  console.log('🔍 Validación body:', req.body);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario en la base de datos
    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = usuarios[0];

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol || 'usuario'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol || 'usuario',
        activo: usuario.activo,
        fechaCreacion: usuario.fecha_creacion,
        fechaActualizacion: usuario.fecha_actualizacion
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/profile', verificarToken, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, email, nombre, apellido, rol, activo, fecha_creacion, fecha_actualizacion FROM usuarios WHERE id = ? AND activo = TRUE',
      [req.usuario.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];
    res.json({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol || 'usuario',
      activo: usuario.activo,
      fechaCreacion: usuario.fecha_creacion,
      fechaActualizacion: usuario.fecha_actualizacion
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// GESTIÓN DE USUARIOS (solo admin)
// ============================================================================

// Middleware para verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

// Obtener lista de usuarios con paginación
app.get('/api/usuarios', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 100;
    const offset = (pagina - 1) * limite;
    
    // Filtros opcionales
    const { busqueda, rol, estado } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (busqueda) {
      whereConditions.push('(nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)');
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (rol && rol !== 'todos') {
      whereConditions.push('rol = ?');
      params.push(rol);
    }
    
    if (estado && estado !== 'todos') {
      whereConditions.push('activo = ?');
      params.push(estado === 'activo' ? 1 : 0);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Contar total de usuarios
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM usuarios ${whereClause}`,
      params
    );
    
    // Obtener usuarios paginados
    const [usuarios] = await pool.query(
      `SELECT id, email, nombre, apellido, rol, activo, fecha_creacion, fecha_actualizacion 
       FROM usuarios 
       ${whereClause}
       ORDER BY fecha_creacion DESC
       LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );
    
    res.json({
      datos: {
        usuarios: usuarios,
        total: total,
        pagina: pagina,
        limite: limite,
        totalPaginas: Math.ceil(total / limite)
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo usuario
app.post('/api/usuarios', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { email, password, nombre, apellido, rol } = req.body;
    
    // Validaciones
    if (!email || !password || !nombre || !apellido || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Verificar si el email ya existe
    const [[existente]] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (existente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generar UUID
    const userId = crypto.randomUUID();
    
    // Insertar usuario
    await pool.query(
      `INSERT INTO usuarios (id, email, password, nombre, apellido, rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [userId, email, passwordHash, nombre, apellido, rol]
    );
    
    // Obtener el usuario creado
    const [usuarios] = await pool.query(
      'SELECT id, email, nombre, apellido, rol, activo, fecha_creacion, fecha_actualizacion FROM usuarios WHERE id = ?',
      [userId]
    );
    
    res.status(201).json({ success: true, data: usuarios[0] });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar usuario
app.put('/api/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nombre, apellido, rol, activo } = req.body;
    
    // Validaciones
    if (!email || !nombre || !apellido || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos excepto la contraseña' });
    }
    
    // Verificar si el email ya existe en otro usuario
    const [[existente]] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, id]
    );
    
    if (existente) {
      return res.status(400).json({ error: 'El email ya está registrado en otro usuario' });
    }
    
    // Actualizar usuario
    await pool.query(
      `UPDATE usuarios 
       SET email = ?, nombre = ?, apellido = ?, rol = ?, activo = ?
       WHERE id = ?`,
      [email, nombre, apellido, rol, activo !== undefined ? activo : 1, id]
    );
    
    // Obtener el usuario actualizado
    const [usuarios] = await pool.query(
      'SELECT id, email, nombre, apellido, rol, activo, fecha_creacion, fecha_actualizacion FROM usuarios WHERE id = ?',
      [id]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, data: usuarios[0] });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar contraseña de usuario
app.put('/api/usuarios/:id/password', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Actualizar contraseña
    await pool.query(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [passwordHash, id]
    );
    
    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar usuario (soft delete)
app.delete('/api/usuarios/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir eliminar al usuario actual
    if (id === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }
    
    // Desactivar usuario (soft delete)
    await pool.query(
      'UPDATE usuarios SET activo = 0 WHERE id = ?',
      [id]
    );
    
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Estadísticas de usuarios
app.get('/api/usuarios/stats/estadisticas', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [[{ totalUsuarios }]] = await pool.query('SELECT COUNT(*) as totalUsuarios FROM usuarios WHERE activo = 1');
    const [[{ totalInactivos }]] = await pool.query('SELECT COUNT(*) as totalInactivos FROM usuarios WHERE activo = 0');
    
    const [porRol] = await pool.query(`
      SELECT rol, COUNT(*) as cantidad 
      FROM usuarios 
      WHERE activo = 1 
      GROUP BY rol
    `);
    
    res.json({
      totalUsuarios,
      totalInactivos,
      porRol
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// DEPENDENCIAS
// ============================================================================

app.get('/api/dependencias', verificarToken, async (req, res) => {
  try {
    const [dependencias] = await pool.query(
      'SELECT * FROM dependencias WHERE activa = TRUE ORDER BY nombre'
    );
    res.json(dependencias);
  } catch (error) {
    console.error('Error al obtener dependencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/dependencias/:id', verificarToken, async (req, res) => {
  try {
    const [dependencias] = await pool.query(
      'SELECT * FROM dependencias WHERE id = ? AND activa = TRUE',
      [req.params.id]
    );
    
    if (dependencias.length === 0) {
      return res.status(404).json({ error: 'Dependencia no encontrada' });
    }
    
    res.json(dependencias[0]);
  } catch (error) {
    console.error('Error al obtener dependencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/dependencias', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO dependencias (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || '']
    );
    
    const [nuevaDependencia] = await pool.query(
      'SELECT * FROM dependencias WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: nuevaDependencia[0] });
  } catch (error) {
    console.error('Error al crear dependencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/dependencias/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    await pool.query(
      'UPDATE dependencias SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion, req.params.id]
    );
    
    const [dependencia] = await pool.query(
      'SELECT * FROM dependencias WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true, data: dependencia[0] });
  } catch (error) {
    console.error('Error al actualizar dependencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// PROCESOS
// ============================================================================

app.get('/api/procesos', verificarToken, async (req, res) => {
  try {
    const { dependencia_id } = req.query;
    let query = 'SELECT * FROM procesos WHERE 1=1';
    const params = [];
    
    if (dependencia_id) {
      query += ' AND dependencia_id = ?';
      params.push(dependencia_id);
    }
    
    query += ' ORDER BY nombre';
    
    const [procesos] = await pool.query(query, params);
    res.json(procesos);
  } catch (error) {
    console.error('Error al obtener procesos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/procesos', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, dependenciaId, orden } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO procesos (nombre, descripcion, dependencia_id, orden) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || '', dependenciaId, orden || 0]
    );
    
    const [nuevoProceso] = await pool.query(
      'SELECT * FROM procesos WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: nuevoProceso[0] });
  } catch (error) {
    console.error('Error al crear proceso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/procesos/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, dependenciaId } = req.body;
    
    await pool.query(
      'UPDATE procesos SET nombre = ?, descripcion = ?, dependencia_id = ? WHERE id = ?',
      [nombre, descripcion, dependenciaId, req.params.id]
    );
    
    const [proceso] = await pool.query(
      'SELECT * FROM procesos WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true, data: proceso[0] });
  } catch (error) {
    console.error('Error al actualizar proceso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// ACTIVIDADES
// ============================================================================

app.get('/api/actividades', verificarToken, async (req, res) => {
  try {
    const { proceso_id } = req.query;
    let query = 'SELECT * FROM actividades WHERE 1=1';
    const params = [];
    
    if (proceso_id) {
      query += ' AND proceso_id = ?';
      params.push(proceso_id);
    }
    
    query += ' ORDER BY nombre';
    
    const [actividades] = await pool.query(query, params);
    res.json(actividades);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/actividades', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, procesoId, orden } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO actividades (nombre, descripcion, proceso_id, orden) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || '', procesoId, orden || 0]
    );
    
    const [nuevaActividad] = await pool.query(
      'SELECT * FROM actividades WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: nuevaActividad[0] });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/actividades/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, procesoId } = req.body;
    
    await pool.query(
      'UPDATE actividades SET nombre = ?, descripcion = ?, proceso_id = ? WHERE id = ?',
      [nombre, descripcion, procesoId, req.params.id]
    );
    
    const [actividad] = await pool.query(
      'SELECT * FROM actividades WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true, data: actividad[0] });
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// PROCEDIMIENTOS
// ============================================================================

app.get('/api/procedimientos', verificarToken, async (req, res) => {
  try {
    const { actividad_id, dependencia_id } = req.query;
    let query = 'SELECT p.* FROM procedimientos p';
    const params = [];
    
    if (dependencia_id) {
      query += ' INNER JOIN actividades a ON p.actividad_id = a.id';
      query += ' INNER JOIN procesos pr ON a.proceso_id = pr.id';
      query += ' WHERE pr.dependencia_id = ?';
      params.push(dependencia_id);
    } else if (actividad_id) {
      query += ' WHERE p.actividad_id = ?';
      params.push(actividad_id);
    }
    
    query += ' ORDER BY p.nombre';
    
    const [procedimientos] = await pool.query(query, params);
    res.json(procedimientos);
  } catch (error) {
    console.error('Error al obtener procedimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/procedimientos/:id', verificarToken, async (req, res) => {
  try {
    const [procedimientos] = await pool.query(
      'SELECT * FROM procedimientos WHERE id = ?',
      [req.params.id]
    );
    
    if (procedimientos.length === 0) {
      return res.status(404).json({ error: 'Procedimiento no encontrado' });
    }
    
    res.json(procedimientos[0]);
  } catch (error) {
    console.error('Error al obtener procedimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/procedimientos', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, actividadId, orden } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO procedimientos (nombre, descripcion, actividad_id, orden) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || '', actividadId, orden || 0]
    );
    
    const [nuevoProcedimiento] = await pool.query(
      'SELECT * FROM procedimientos WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: nuevoProcedimiento[0] });
  } catch (error) {
    console.error('Error al crear procedimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/procedimientos/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion, actividadId } = req.body;
    
    await pool.query(
      'UPDATE procedimientos SET nombre = ?, descripcion = ?, actividad_id = ? WHERE id = ?',
      [nombre, descripcion, actividadId, req.params.id]
    );
    
    const [procedimiento] = await pool.query(
      'SELECT * FROM procedimientos WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true, data: procedimiento[0] });
  } catch (error) {
    console.error('Error al actualizar procedimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Tiempos de procedimientos
app.get('/api/procedimientos/tiempos', verificarToken, async (req, res) => {
  try {
    const [tiempos] = await pool.query(
      'SELECT * FROM tiempos_procedimientos ORDER BY fecha_registro DESC'
    );
    res.json(tiempos);
  } catch (error) {
    console.error('Error al obtener tiempos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/procedimientos/tiempos', verificarToken, async (req, res) => {
  try {
    const { procedimiento_id, empleo_id, frecuencia_mes, tiempo_min, tiempo_prom, tiempo_max, observaciones } = req.body;
    
    // Validaciones
    if (tiempo_min > tiempo_prom || tiempo_prom > tiempo_max) {
      return res.status(400).json({ error: 'Los tiempos deben cumplir: mínimo ≤ promedio ≤ máximo' });
    }
    
    // Calcular tiempo estándar PERT
    const tiempo_estandar = calcularTiempoEstandarPERT(tiempo_min, tiempo_prom, tiempo_max);
    const total_horas_mes = frecuencia_mes * tiempo_estandar;
    
    const [result] = await pool.query(
      `INSERT INTO tiempos_procedimientos 
       (procedimiento_id, empleo_id, usuario_id, frecuencia_mes, tiempo_min, tiempo_prom, tiempo_max, 
        tiempo_estandar, total_horas_mes, fecha_registro, observaciones) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
      [procedimiento_id, empleo_id, req.usuario.id, frecuencia_mes, tiempo_min, tiempo_prom, tiempo_max, 
       tiempo_estandar.toFixed(2), total_horas_mes.toFixed(2), observaciones || '']
    );
    
    const [nuevoTiempo] = await pool.query(
      'SELECT * FROM tiempos_procedimientos WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(nuevoTiempo[0]);
  } catch (error) {
    console.error('Error al guardar tiempo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// EMPLEOS
// ============================================================================

app.get('/api/empleos', verificarToken, async (req, res) => {
  try {
    const [empleos] = await pool.query('SELECT * FROM empleos ORDER BY grado');
    res.json({ success: true, data: empleos });
  } catch (error) {
    console.error('Error al obtener empleos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/empleos/nivel/:nivel', verificarToken, async (req, res) => {
  try {
    const [empleos] = await pool.query(
      'SELECT * FROM empleos WHERE nivel_jerarquico = ? ORDER BY grado',
      [req.params.nivel]
    );
    console.log(`Empleos encontrados para nivel ${req.params.nivel}:`, empleos.length);
    res.json({ success: true, data: empleos });
  } catch (error) {
    console.error('Error al obtener empleos por nivel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/empleos/:id', verificarToken, async (req, res) => {
  try {
    const [empleos] = await pool.query(
      'SELECT * FROM empleos WHERE id = ?',
      [req.params.id]
    );
    
    if (empleos.length === 0) {
      return res.status(404).json({ error: 'Empleo no encontrado' });
    }
    
    res.json({ success: true, data: empleos[0] });
  } catch (error) {
    console.error('Error al obtener empleo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// CARGAS DE TRABAJO Y ANÁLISIS
// ============================================================================

// Endpoint para obtener tiempos de procedimientos
app.get('/api/cargas/tiempos', verificarToken, async (req, res) => {
  try {
    const { procedimientoId, empleoId } = req.query;
    let query = 'SELECT * FROM tiempos_procedimientos WHERE 1=1';
    const params = [];
    
    if (procedimientoId) {
      query += ' AND procedimiento_id = ?';
      params.push(procedimientoId);
    }
    
    if (empleoId) {
      query += ' AND empleo_id = ?';
      params.push(empleoId);
    }
    
    query += ' ORDER BY fecha_registro DESC';
    
    const [tiempos] = await pool.query(query, params);
    res.json({ success: true, data: tiempos });
  } catch (error) {
    console.error('Error al obtener tiempos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para crear tiempo de procedimiento
app.post('/api/cargas/tiempos', verificarToken, async (req, res) => {
  try {
    const { 
      procedimientoId, 
      empleoId, 
      estructuraId,
      procesoId,
      actividadId,
      grado,
      frecuenciaMensual, 
      tiempoMinimo, 
      tiempoPromedio, 
      tiempoMaximo, 
      observaciones 
    } = req.body;
    
    console.log('Datos recibidos para crear tiempo:', req.body);
    console.log('Grado recibido:', grado, 'tipo:', typeof grado);
    
    // Validaciones
    if (!procedimientoId || !empleoId) {
      return res.status(400).json({ error: 'procedimientoId y empleoId son requeridos' });
    }
    
    if (tiempoMinimo > tiempoPromedio || tiempoPromedio > tiempoMaximo) {
      return res.status(400).json({ error: 'Los tiempos deben cumplir: mínimo ≤ promedio ≤ máximo' });
    }
    
    // Calcular tiempo estándar PERT
    const tiempoEstandar = calcularTiempoEstandarPERT(tiempoMinimo, tiempoPromedio, tiempoMaximo);
    const totalHoras = frecuenciaMensual * tiempoEstandar;
    
    // Obtener el nivel jerárquico del empleo para saber en qué columna guardar las horas
    const [empleos] = await pool.query('SELECT nivel_jerarquico FROM empleos WHERE id = ?', [empleoId]);
    const nivelJerarquico = empleos.length > 0 ? empleos[0].nivel_jerarquico : null;
    
    // Determinar en qué columna guardar las horas según el nivel
    const columnasHoras = {
      'DIRECTIVO': 'horas_directivo',
      'ASESOR': 'horas_asesor',
      'PROFESIONAL': 'horas_profesional',
      'TECNICO': 'horas_tecnico',
      'ASISTENCIAL': 'horas_asistencial',
      'CONTRATISTA': 'horas_contratista',
      'TRABAJADOR_OFICIAL': 'horas_trabajador_oficial'
    };
    
    const columnaHoras = columnasHoras[nivelJerarquico] || 'horas_profesional';
    
    // Convertir grado a número si existe (puede venir como string del frontend)
    let gradoNumerico = null;
    if (grado !== undefined && grado !== null && grado !== '') {
      gradoNumerico = Number(grado);
      if (isNaN(gradoNumerico)) {
        console.warn('Grado no es un número válido, guardando como NULL:', grado);
        gradoNumerico = null;
      }
    }
    
    console.log('Grado a guardar:', gradoNumerico, 'tipo:', typeof gradoNumerico);
    
    const [result] = await pool.query(
      `INSERT INTO tiempos_procedimientos 
       (procedimiento_id, empleo_id, usuario_id, estructura_id, proceso_id, actividad_id, grado, frecuencia_mensual, tiempo_minimo, tiempo_promedio, tiempo_maximo, 
        tiempo_estandar, ${columnaHoras}, observaciones) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        procedimientoId, 
        empleoId, 
        req.usuario.id,
        estructuraId || null,
        procesoId || null,
        actividadId || null,
        gradoNumerico,
        frecuenciaMensual, 
        tiempoMinimo, 
        tiempoPromedio, 
        tiempoMaximo, 
        tiempoEstandar.toFixed(3), 
        totalHoras.toFixed(3), 
        observaciones || ''
      ]
    );
    
    console.log('Tiempo creado con ID:', result.insertId);
    
    const [nuevoTiempo] = await pool.query(
      'SELECT * FROM tiempos_procedimientos WHERE id = ?',
      [result.insertId]
    );
    
    console.log('Tiempo creado - grado guardado:', nuevoTiempo[0]?.grado);
    
    res.status(201).json({ success: true, data: nuevoTiempo[0] });
  } catch (error) {
    console.error('Error al guardar tiempo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para finalizar registro de múltiples tiempos
app.post('/api/cargas/tiempos/finalizar-registro', verificarToken, async (req, res) => {
  try {
    const { tiempos } = req.body;
    
    if (!tiempos || !Array.isArray(tiempos)) {
      return res.status(400).json({ error: 'Se requiere un array de tiempos' });
    }
    
    console.log(`Finalizando registro de ${tiempos.length} tiempos`);
    
    const tiemposProcesados = [];
    const erroresDetalle = [];
    
    for (let i = 0; i < tiempos.length; i++) {
      try {
        const tiempo = tiempos[i];
        const { 
          procedimientoId, 
          empleoId, 
          estructuraId,
          frecuenciaMensual, 
          tiempoMinimo, 
          tiempoPromedio, 
          tiempoMaximo, 
          observaciones 
        } = tiempo;
        
        // Validaciones
        if (!procedimientoId || !empleoId) {
          erroresDetalle.push({
            indice: i,
            error: 'procedimientoId y empleoId son requeridos',
            datos: tiempo
          });
          continue;
        }
        
        if (tiempoMinimo > tiempoPromedio || tiempoPromedio > tiempoMaximo) {
          erroresDetalle.push({
            indice: i,
            error: 'Los tiempos deben cumplir: mínimo ≤ promedio ≤ máximo',
            datos: tiempo
          });
          continue;
        }
        
        // Calcular tiempo estándar PERT
        const tiempoEstandar = calcularTiempoEstandarPERT(tiempoMinimo, tiempoPromedio, tiempoMaximo);
        const totalHoras = frecuenciaMensual * tiempoEstandar;
        
        // Obtener el nivel jerárquico del empleo
        const [empleos] = await pool.query('SELECT nivel_jerarquico FROM empleos WHERE id = ?', [empleoId]);
        const nivelJerarquico = empleos.length > 0 ? empleos[0].nivel_jerarquico : null;
        
        const columnasHoras = {
          'DIRECTIVO': 'horas_directivo',
          'ASESOR': 'horas_asesor',
          'PROFESIONAL': 'horas_profesional',
          'TECNICO': 'horas_tecnico',
          'ASISTENCIAL': 'horas_asistencial',
          'CONTRATISTA': 'horas_contratista',
          'TRABAJADOR_OFICIAL': 'horas_trabajador_oficial'
        };
        
        const columnaHoras = columnasHoras[nivelJerarquico] || 'horas_profesional';
        
        const [result] = await pool.query(
          `INSERT INTO tiempos_procedimientos 
           (procedimiento_id, empleo_id, usuario_id, frecuencia_mensual, tiempo_minimo, tiempo_promedio, tiempo_maximo, 
            tiempo_estandar, ${columnaHoras}, observaciones, estructura_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            procedimientoId, 
            empleoId, 
            req.usuario.id, 
            frecuenciaMensual, 
            tiempoMinimo, 
            tiempoPromedio, 
            tiempoMaximo, 
            tiempoEstandar.toFixed(3), 
            totalHoras.toFixed(3), 
            observaciones || '',
            estructuraId || null
          ]
        );
        
        const [nuevoTiempo] = await pool.query(
          'SELECT * FROM tiempos_procedimientos WHERE id = ?',
          [result.insertId]
        );
        
        tiemposProcesados.push(nuevoTiempo[0]);
      } catch (error) {
        console.error(`Error procesando tiempo ${i}:`, error);
        erroresDetalle.push({
          indice: i,
          error: error.message,
          datos: tiempos[i]
        });
      }
    }
    
    res.status(201).json({ 
      success: true, 
      data: {
        totalProcesados: tiempos.length,
        exitosos: tiemposProcesados.length,
        errores: erroresDetalle.length,
        tiemposProcesados: tiemposProcesados,
        erroresDetalle: erroresDetalle
      }
    });
  } catch (error) {
    console.error('Error al finalizar registro de tiempos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener totales por niveles jerárquicos para una dependencia
app.get('/api/cargas/tiempos/totales-por-niveles/:dependenciaId', verificarToken, async (req, res) => {
  try {
    const { dependenciaId } = req.params;
    
    console.log('Obteniendo totales por niveles para dependencia:', dependenciaId);
    
    // Query que suma las horas de cada nivel jerárquico para la dependencia
    // Usa proceso_id directo de tiempos_procedimientos
    const [totales] = await pool.query(
      `SELECT 
        'DIRECTIVO' as nivel_jerarquico,
        COALESCE(SUM(tp.horas_directivo), 0) as total_horas
      FROM tiempos_procedimientos tp
      INNER JOIN procesos p ON tp.proceso_id = p.id
      WHERE p.dependencia_id = ? AND tp.activo = 1
      
      UNION ALL
      
      SELECT 
        'ASESOR' as nivel_jerarquico,
        COALESCE(SUM(tp.horas_asesor), 0) as total_horas
      FROM tiempos_procedimientos tp
      INNER JOIN procesos p ON tp.proceso_id = p.id
      WHERE p.dependencia_id = ? AND tp.activo = 1
      
      UNION ALL
      
      SELECT 
        'PROFESIONAL' as nivel_jerarquico,
        COALESCE(SUM(tp.horas_profesional), 0) as total_horas
      FROM tiempos_procedimientos tp
      INNER JOIN procesos p ON tp.proceso_id = p.id
      WHERE p.dependencia_id = ? AND tp.activo = 1
      
      UNION ALL
      
      SELECT 
        'TECNICO' as nivel_jerarquico,
        COALESCE(SUM(tp.horas_tecnico), 0) as total_horas
      FROM tiempos_procedimientos tp
      INNER JOIN procesos p ON tp.proceso_id = p.id
      WHERE p.dependencia_id = ? AND tp.activo = 1
      
      UNION ALL
      
      SELECT 
        'ASISTENCIAL' as nivel_jerarquico,
        COALESCE(SUM(tp.horas_asistencial), 0) as total_horas
      FROM tiempos_procedimientos tp
      INNER JOIN procesos p ON tp.proceso_id = p.id
      WHERE p.dependencia_id = ? AND tp.activo = 1
      
      UNION ALL
      
      SELECT 
        'CONTRATISTA' as nivel_jerarquico,
        COALESCE(SUM(tp.horas_contratista), 0) as total_horas
      FROM tiempos_procedimientos tp
      INNER JOIN procesos p ON tp.proceso_id = p.id
      WHERE p.dependencia_id = ? AND tp.activo = 1
      
      UNION ALL
      
      SELECT 
        'TRABAJADOR_OFICIAL' as nivel_jerarquico,
        COALESCE(SUM(tp.horas_trabajador_oficial), 0) as total_horas
      FROM tiempos_procedimientos tp
      INNER JOIN procesos p ON tp.proceso_id = p.id
      WHERE p.dependencia_id = ? AND tp.activo = 1`,
      [dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId]
    );
    
    console.log('Totales por niveles encontrados:', totales.length);
    
    res.json({ success: true, data: totales });
  } catch (error) {
    console.error('Error al obtener totales por niveles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener procedimientos con tiempos por dependencia
app.get('/api/cargas/tiempos/procedimientos-por-dependencia/:dependenciaId', verificarToken, async (req, res) => {
  try {
    const { dependenciaId } = req.params;
    
    console.log('Obteniendo procedimientos con tiempos para dependencia:', dependenciaId);
    
    // Primero obtener la estructura_id de la dependencia
    const [dependenciaInfo] = await pool.query(`
      SELECT ee.estructura_id
      FROM dependencias d
      INNER JOIN elementos_estructura ee ON d.id = ee.elemento_id
      WHERE d.id = ? AND ee.tipo = 'dependencia'
      LIMIT 1
    `, [dependenciaId]);

    if (!dependenciaInfo || dependenciaInfo.length === 0) {
      console.log(`No se encontró información de estructura para dependencia ${dependenciaId}`);
      return res.json({ success: true, data: [] });
    }

    const estructuraId = dependenciaInfo[0].estructura_id;
    console.log(`Estructura ID para dependencia ${dependenciaId}: ${estructuraId}`);
    
    // Buscar procedimientos que tengan tiempos registrados y estén asociados a la dependencia y estructura
    // Usamos GROUP BY tp.id para evitar duplicados causados por múltiples JOINs
    const [procedimientos] = await pool.query(
      `SELECT 
        tp.id as tiempo_id,
        pr.id,
        pr.nombre,
        pr.descripcion,
        tp.frecuencia_mensual,
        tp.tiempo_estandar,
        tp.tiempo_minimo,
        tp.tiempo_promedio,
        tp.tiempo_maximo,
        tp.horas_directivo,
        tp.horas_asesor,
        tp.horas_profesional,
        tp.horas_tecnico,
        tp.horas_asistencial,
        COALESCE(tp.grado, e.grado, NULL) as grado,
        tp.horas_contratista,
        tp.horas_trabajador_oficial,
        tp.observaciones,
        -- Usar proceso directo si existe y pertenece a la dependencia, sino usar fallback
        CASE 
          WHEN tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id = ? THEN tp.proceso_id
          WHEN pr_fallback.id IS NOT NULL AND pr_fallback.dependencia_id = ? THEN pr_fallback.id
          -- Si el proceso directo existe pero pertenece a otra dependencia, usar el proceso directo de todas formas
          WHEN tp.proceso_id IS NOT NULL AND p.id IS NOT NULL THEN tp.proceso_id
          ELSE NULL
        END as proceso_id,
        CASE 
          WHEN tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id = ? THEN p.nombre
          WHEN pr_fallback.id IS NOT NULL AND pr_fallback.dependencia_id = ? THEN pr_fallback.nombre
          -- Si el proceso directo existe pero pertenece a otra dependencia, usar el proceso directo de todas formas
          WHEN tp.proceso_id IS NOT NULL AND p.id IS NOT NULL THEN p.nombre
          ELSE NULL
        END as proceso_nombre,
        CASE 
          WHEN tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id = ? THEN p.descripcion
          WHEN pr_fallback.id IS NOT NULL AND pr_fallback.dependencia_id = ? THEN pr_fallback.descripcion
          -- Si el proceso directo existe pero pertenece a otra dependencia, usar el proceso directo de todas formas
          WHEN tp.proceso_id IS NOT NULL AND p.id IS NOT NULL THEN p.descripcion
          ELSE NULL
        END as proceso_descripcion,
        -- Usar actividad directa si existe y su proceso pertenece a la dependencia, sino usar fallback
        CASE 
          WHEN tp.actividad_id IS NOT NULL AND tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id = ? THEN tp.actividad_id
          WHEN ac_fallback.id IS NOT NULL AND pr_fallback.dependencia_id = ? THEN ac_fallback.id
          -- Si la actividad directa existe pero su proceso pertenece a otra dependencia, usar la actividad directa de todas formas
          WHEN tp.actividad_id IS NOT NULL AND ac.id IS NOT NULL THEN tp.actividad_id
          ELSE NULL
        END as actividad_id,
        CASE 
          WHEN tp.actividad_id IS NOT NULL AND tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id = ? THEN ac.nombre
          WHEN ac_fallback.id IS NOT NULL AND pr_fallback.dependencia_id = ? THEN ac_fallback.nombre
          -- Si la actividad directa existe pero su proceso pertenece a otra dependencia, usar la actividad directa de todas formas
          WHEN tp.actividad_id IS NOT NULL AND ac.id IS NOT NULL THEN ac.nombre
          ELSE NULL
        END as actividad_nombre,
        CASE 
          WHEN tp.actividad_id IS NOT NULL AND tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id = ? THEN ac.descripcion
          WHEN ac_fallback.id IS NOT NULL AND pr_fallback.dependencia_id = ? THEN ac_fallback.descripcion
          -- Si la actividad directa existe pero su proceso pertenece a otra dependencia, usar la actividad directa de todas formas
          WHEN tp.actividad_id IS NOT NULL AND ac.id IS NOT NULL THEN ac.descripcion
          ELSE NULL
        END as actividad_descripcion,
        COALESCE(MAX(CONCAT(u.nombre, ' ', u.apellido)), MAX(u.email)) as usuario_registra,
        DATE_FORMAT(MAX(tp.fecha_creacion), '%Y-%m-%d') as fecha_registro
      FROM tiempos_procedimientos tp
      INNER JOIN procedimientos pr ON tp.procedimiento_id = pr.id
      LEFT JOIN empleos e ON tp.empleo_id = e.id
      LEFT JOIN procesos p ON tp.proceso_id = p.id
      LEFT JOIN actividades ac ON tp.actividad_id = ac.id
      LEFT JOIN actividades ac_fallback ON pr.actividad_id = ac_fallback.id
      LEFT JOIN procesos pr_fallback ON ac_fallback.proceso_id = pr_fallback.id
      LEFT JOIN usuarios u ON tp.usuario_id = u.id
      WHERE tp.activo = 1 
        AND tp.estructura_id = ?
        -- Verificar que el procedimiento esté en la estructura (usando EXISTS en lugar de JOIN para evitar duplicados)
        AND EXISTS (
          SELECT 1 FROM elementos_estructura ee_proc 
          WHERE ee_proc.elemento_id = pr.id 
          AND ee_proc.tipo = 'procedimiento'
          AND ee_proc.estructura_id = ?
        )
        AND (
          -- Filtrar por dependencia: el proceso directo debe pertenecer a la dependencia seleccionada
          (tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id = ?)
          OR 
          -- O usar el proceso de la actividad de fallback si pertenece a la dependencia
          (pr_fallback.id IS NOT NULL AND pr_fallback.dependencia_id = ?)
          -- Si el proceso directo existe pero pertenece a otra dependencia, aún así incluirlo
          -- para que aparezca en el reporte con su proceso/actividad correcto
          OR (tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id != ?)
        )
      GROUP BY tp.id, pr.id, pr.nombre, pr.descripcion, tp.frecuencia_mensual, 
               tp.tiempo_estandar, tp.tiempo_minimo, tp.tiempo_promedio, tp.tiempo_maximo,
               tp.horas_directivo, tp.horas_asesor, tp.horas_profesional, tp.horas_tecnico,
               tp.horas_asistencial, tp.grado, e.grado, tp.horas_contratista, 
               tp.horas_trabajador_oficial, tp.observaciones, tp.proceso_id, tp.actividad_id,
               p.dependencia_id, p.nombre, p.descripcion, ac.nombre, ac.descripcion,
               pr_fallback.id, pr_fallback.nombre, pr_fallback.descripcion,
               ac_fallback.id, ac_fallback.nombre, ac_fallback.descripcion
      ORDER BY 
        CASE 
          WHEN tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id = ? THEN p.nombre
          WHEN pr_fallback.id IS NOT NULL AND pr_fallback.dependencia_id = ? THEN pr_fallback.nombre
          WHEN tp.proceso_id IS NOT NULL AND p.id IS NOT NULL THEN p.nombre
          ELSE ''
        END,
        CASE 
          WHEN tp.actividad_id IS NOT NULL AND tp.proceso_id IS NOT NULL AND p.id IS NOT NULL AND p.dependencia_id = ? THEN ac.nombre
          WHEN ac_fallback.id IS NOT NULL AND pr_fallback.dependencia_id = ? THEN ac_fallback.nombre
          WHEN tp.actividad_id IS NOT NULL AND ac.id IS NOT NULL THEN ac.nombre
          ELSE ''
        END,
        pr.nombre`,
      [dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, estructuraId, estructuraId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId, dependenciaId]
    );
    
    console.log('Procedimientos encontrados:', procedimientos.length);
    
    res.json({ success: true, data: procedimientos });
  } catch (error) {
    console.error('Error al obtener procedimientos por dependencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener procedimientos con tiempos sin proceso/actividad por estructura
// Estos tiempos no tienen dependencia asignada y solo aparecen cuando se consulta "todas las dependencias"
app.get('/api/cargas/tiempos/procedimientos-sin-dependencia/:estructuraId', verificarToken, async (req, res) => {
  try {
    const { estructuraId } = req.params;
    
    console.log('Obteniendo procedimientos sin dependencia asignada para estructura:', estructuraId);
    
    const [procedimientos] = await pool.query(
      `SELECT 
        tp.id as tiempo_id,
        pr.id,
        pr.nombre,
        pr.descripcion,
        tp.frecuencia_mensual,
        tp.tiempo_estandar,
        tp.tiempo_minimo,
        tp.tiempo_promedio,
        tp.tiempo_maximo,
        tp.horas_directivo,
        tp.horas_asesor,
        tp.horas_profesional,
        tp.horas_tecnico,
        tp.horas_asistencial,
        COALESCE(tp.grado, e.grado, NULL) as grado,
        tp.horas_contratista,
        tp.horas_trabajador_oficial,
        tp.observaciones,
        tp.proceso_id,
        NULL as proceso_nombre,
        NULL as proceso_descripcion,
        tp.actividad_id,
        NULL as actividad_nombre,
        NULL as actividad_descripcion,
        COALESCE(CONCAT(u.nombre, ' ', u.apellido), u.email) as usuario_registra,
        DATE_FORMAT(tp.fecha_creacion, '%Y-%m-%d') as fecha_registro
      FROM tiempos_procedimientos tp
      INNER JOIN procedimientos pr ON tp.procedimiento_id = pr.id
      LEFT JOIN empleos e ON tp.empleo_id = e.id
      LEFT JOIN usuarios u ON tp.usuario_id = u.id
      LEFT JOIN procesos p ON tp.proceso_id = p.id
      LEFT JOIN actividades ac_fallback ON pr.actividad_id = ac_fallback.id
      LEFT JOIN procesos pr_fallback ON ac_fallback.proceso_id = pr_fallback.id
      WHERE tp.activo = 1 
        AND tp.estructura_id = ?
        -- Tiempos que no tienen proceso/actividad asignado y no tienen dependencia asociada
        AND tp.proceso_id IS NULL
        AND (
          -- O no tienen actividad de fallback
          ac_fallback.id IS NULL
          -- O la actividad de fallback no tiene proceso con dependencia
          OR pr_fallback.dependencia_id IS NULL
        )
        -- Verificar que el procedimiento esté en la estructura
        AND EXISTS (
          SELECT 1 FROM elementos_estructura ee_proc 
          WHERE ee_proc.elemento_id = pr.id 
          AND ee_proc.tipo = 'procedimiento'
          AND ee_proc.estructura_id = ?
        )
      GROUP BY tp.id
      ORDER BY pr.nombre`,
      [estructuraId, estructuraId]
    );
    
    console.log('Procedimientos sin dependencia encontrados:', procedimientos.length);
    
    res.json({ success: true, data: procedimientos });
  } catch (error) {
    console.error('Error al obtener procedimientos sin dependencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/cargas/estadisticas', verificarToken, async (req, res) => {
  try {
    // Estadísticas generales
    const [[{ totalDependencias }]] = await pool.query('SELECT COUNT(*) as totalDependencias FROM dependencias WHERE activa = TRUE');
    const [[{ totalProcedimientos }]] = await pool.query('SELECT COUNT(*) as totalProcedimientos FROM procedimientos');
    const [[{ totalTiempos }]] = await pool.query('SELECT COUNT(*) as totalTiempos FROM tiempos_procedimientos');
    const [[{ totalHoras }]] = await pool.query('SELECT COALESCE(SUM(total_horas_mes), 0) as totalHoras FROM tiempos_procedimientos');
    
    res.json({
      generales: {
        dependencias: totalDependencias,
        procedimientos: totalProcedimientos,
        tiempos_registrados: totalTiempos,
        horas_estandar_total: parseFloat(totalHoras || 0)
      }
    });
  } catch (error) {
    console.error('Error en estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// ESTRUCTURAS
// ============================================================================

// Listar estructuras activas
app.get('/api/estructura', verificarToken, async (req, res) => {
  try {
    const [estructuras] = await pool.query(
      'SELECT * FROM estructuras WHERE activa = TRUE ORDER BY fecha_creacion DESC'
    );
    res.json({ success: true, data: estructuras });
  } catch (error) {
    console.error('Error al listar estructuras:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estructura por ID
app.get('/api/estructura/:id', verificarToken, async (req, res) => {
  try {
    const [estructuras] = await pool.query(
      'SELECT * FROM estructuras WHERE id = ?',
      [req.params.id]
    );
    
    if (estructuras.length === 0) {
      return res.status(404).json({ error: 'Estructura no encontrada' });
    }
    
    res.json({ success: true, data: estructuras[0] });
  } catch (error) {
    console.error('Error al obtener estructura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear estructura
app.post('/api/estructura', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const usuarioId = req.usuario?.id;
    
    console.log('📝 Crear estructura - Datos recibidos:', { nombre, descripcion, usuarioId });
    
    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la estructura es requerido' });
    }
    
    // Verificar si ya existe una estructura con ese nombre
    try {
      const [estructurasExistentes] = await pool.query(
        'SELECT * FROM estructuras WHERE nombre = ?',
        [nombre]
      );
      
      if (estructurasExistentes.length > 0) {
        return res.status(400).json({ error: 'Ya existe una estructura con ese nombre' });
      }
    } catch (error) {
      console.error('Error verificando estructura existente:', error);
      // Continuar si hay error en la verificación (puede ser que la tabla no exista aún)
    }
    
    // Generar UUID para el id
    const estructuraId = crypto.randomUUID();
    
    console.log('📝 EstructuraModel.crearEstructura - Datos:', { 
      id: estructuraId, 
      nombre, 
      descripcion, 
      usuarioCreadorId: usuarioId 
    });
    
    const [result] = await pool.query(
      'INSERT INTO estructuras (id, nombre, descripcion, usuario_creador_id) VALUES (?, ?, ?, ?)',
      [estructuraId, nombre, descripcion || null, usuarioId]
    );
    
    console.log('✅ Estructura insertada correctamente, resultado:', result);
    
    const [nuevaEstructura] = await pool.query(
      'SELECT * FROM estructuras WHERE id = ?',
      [estructuraId]
    );
    
    if (nuevaEstructura.length === 0) {
      throw new Error('Error al crear la estructura: no se pudo recuperar después de la inserción');
    }
    
    res.status(201).json({ success: true, data: nuevaEstructura[0] });
  } catch (error) {
    console.error('❌ Error creando estructura:', error);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error code:', error?.code);
    console.error('❌ Error errno:', error?.errno);
    console.error('❌ Error sqlMessage:', error?.sqlMessage);
    console.error('❌ Error sql:', error?.sql);
    
    // Devolver mensaje de error más descriptivo (formato compatible con frontend)
    const mensajeError = error?.sqlMessage || error?.message || 'Error interno del servidor';
    res.status(500).json({ 
      error: true,
      mensaje: `Error al crear la estructura: ${mensajeError}`,
      codigo: 500,
      detalles: {
        sqlMessage: error?.sqlMessage,
        message: error?.message,
        code: error?.code,
        sql: error?.sql
      }
    });
  }
});

// Actualizar estructura
app.put('/api/estructura/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    await pool.query(
      'UPDATE estructuras SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion, req.params.id]
    );
    
    const [estructura] = await pool.query(
      'SELECT * FROM estructuras WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true, data: estructura[0] });
  } catch (error) {
    console.error('Error al actualizar estructura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Desactivar estructura
app.delete('/api/estructura/:id/desactivar', verificarToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE estructuras SET activa = FALSE WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Estructura desactivada' });
  } catch (error) {
    console.error('Error al desactivar estructura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Activar estructura
app.put('/api/estructura/:id/activar', verificarToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE estructuras SET activa = TRUE WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Estructura activada' });
  } catch (error) {
    console.error('Error al activar estructura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estructura completa con elementos
app.get('/api/estructura/:id/completa', verificarToken, async (req, res) => {
  try {
    const [estructura] = await pool.query(
      'SELECT * FROM estructuras WHERE id = ?',
      [req.params.id]
    );
    
    if (estructura.length === 0) {
      return res.status(404).json({ error: 'Estructura no encontrada' });
    }
    
    // Obtener todos los elementos con sus datos completos usando UNION
    const [elementos] = await pool.query(
      `
      (SELECT ee.id, ee.estructura_id as estructuraId, ee.tipo, ee.elemento_id as elementoId, 
              ee.padre_id as padreId, ee.orden, ee.activo, ee.fecha_creacion as fechaCreacion, 
              ee.fecha_actualizacion as fechaActualizacion,
              d.nombre as nombreReal, d.descripcion, d.activa
       FROM elementos_estructura ee
       LEFT JOIN dependencias d ON ee.elemento_id = d.id AND ee.tipo = 'dependencia'
       WHERE ee.estructura_id = ? AND ee.tipo = 'dependencia')
      UNION ALL
      (SELECT ee.id, ee.estructura_id as estructuraId, ee.tipo, ee.elemento_id as elementoId,
              ee.padre_id as padreId, ee.orden, ee.activo, ee.fecha_creacion as fechaCreacion,
              ee.fecha_actualizacion as fechaActualizacion,
              p.nombre as nombreReal, p.descripcion, p.activo as activa
       FROM elementos_estructura ee
       LEFT JOIN procesos p ON ee.elemento_id = p.id AND ee.tipo = 'proceso'
       WHERE ee.estructura_id = ? AND ee.tipo = 'proceso')
      UNION ALL
      (SELECT ee.id, ee.estructura_id as estructuraId, ee.tipo, ee.elemento_id as elementoId,
              ee.padre_id as padreId, ee.orden, ee.activo, ee.fecha_creacion as fechaCreacion,
              ee.fecha_actualizacion as fechaActualizacion,
              a.nombre as nombreReal, a.descripcion, a.activa
       FROM elementos_estructura ee
       LEFT JOIN actividades a ON ee.elemento_id = a.id AND ee.tipo = 'actividad'
       WHERE ee.estructura_id = ? AND ee.tipo = 'actividad')
      UNION ALL
      (SELECT ee.id, ee.estructura_id as estructuraId, ee.tipo, ee.elemento_id as elementoId,
              ee.padre_id as padreId, ee.orden, ee.activo, ee.fecha_creacion as fechaCreacion,
              ee.fecha_actualizacion as fechaActualizacion,
              pr.nombre as nombreReal, pr.descripcion, pr.activo as activa
       FROM elementos_estructura ee
       LEFT JOIN procedimientos pr ON ee.elemento_id = pr.id AND ee.tipo = 'procedimiento'
       WHERE ee.estructura_id = ? AND ee.tipo = 'procedimiento')
      ORDER BY tipo, orden
      `,
      [req.params.id, req.params.id, req.params.id, req.params.id]
    );
    
    res.json({
      success: true,
      data: {
        ...estructura[0],
        elementos: elementos
      }
    });
  } catch (error) {
    console.error('Error al obtener estructura completa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar elemento a estructura
app.post('/api/estructura/elemento', verificarToken, async (req, res) => {
  try {
    const { estructuraId, tipo, elementoId, padreId, orden } = req.body;
    
    if (!estructuraId || !tipo || !elementoId) {
      return res.status(400).json({ error: 'estructuraId, tipo y elementoId son requeridos' });
    }
    
    // Generar UUID para el id
    const crypto = require('crypto');
    const nuevoId = crypto.randomUUID();
    
    await pool.query(
      'INSERT INTO elementos_estructura (id, estructura_id, tipo, elemento_id, padre_id, orden) VALUES (?, ?, ?, ?, ?, ?)',
      [nuevoId, estructuraId, tipo, elementoId, padreId || null, orden || 0]
    );
    
    const [elemento] = await pool.query(
      'SELECT * FROM elementos_estructura WHERE id = ?',
      [nuevoId]
    );
    
    res.status(201).json({ success: true, data: elemento[0] });
  } catch (error) {
    console.error('Error al agregar elemento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar elemento de estructura
app.delete('/api/estructura/elemento/:id', verificarToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM elementos_estructura WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Elemento eliminado' });
  } catch (error) {
    console.error('Error al eliminar elemento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener elementos por tipo con datos completos
app.get('/api/estructura/:id/elementos/:tipo', verificarToken, async (req, res) => {
  try {
    const { id, tipo } = req.params;
    let query = '';
    
    switch(tipo) {
      case 'dependencia':
        query = `
          SELECT ee.*, d.nombre, d.descripcion, d.activa
          FROM elementos_estructura ee
          LEFT JOIN dependencias d ON ee.referencia_id = d.id
          WHERE ee.estructura_id = ? AND ee.tipo = ?
          ORDER BY ee.orden
        `;
        break;
      case 'proceso':
        query = `
          SELECT ee.*, p.nombre, p.descripcion, p.dependencia_id, p.activo
          FROM elementos_estructura ee
          LEFT JOIN procesos p ON ee.referencia_id = p.id
          WHERE ee.estructura_id = ? AND ee.tipo = ?
          ORDER BY ee.orden
        `;
        break;
      case 'actividad':
        query = `
          SELECT ee.*, a.nombre, a.descripcion, a.proceso_id, a.activa
          FROM elementos_estructura ee
          LEFT JOIN actividades a ON ee.referencia_id = a.id
          WHERE ee.estructura_id = ? AND ee.tipo = ?
          ORDER BY ee.orden
        `;
        break;
      case 'procedimiento':
        query = `
          SELECT ee.*, pr.nombre, pr.descripcion, pr.actividad_id, pr.activo
          FROM elementos_estructura ee
          LEFT JOIN procedimientos pr ON ee.referencia_id = pr.id
          WHERE ee.estructura_id = ? AND ee.tipo = ?
          ORDER BY ee.orden
        `;
        break;
      default:
        query = `
          SELECT * FROM elementos_estructura
          WHERE estructura_id = ? AND tipo = ?
          ORDER BY orden
        `;
    }
    
    const [elementos] = await pool.query(query, [id, tipo]);
    res.json({ success: true, data: elementos });
  } catch (error) {
    console.error('Error al obtener elementos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener dependencias por estructura
app.get('/api/estructura/:id/dependencias', verificarToken, async (req, res) => {
  try {
    const [dependencias] = await pool.query(
      `SELECT d.* FROM dependencias d
       INNER JOIN elementos_estructura ee ON d.id = ee.elemento_id
       WHERE ee.estructura_id = ? AND ee.tipo = 'dependencia'
       ORDER BY ee.orden`,
      [req.params.id]
    );
    res.json({ success: true, data: dependencias });
  } catch (error) {
    console.error('Error al obtener dependencias por estructura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// FRONTEND - SPA ROUTING
// ============================================================================

// Para todas las rutas no-API, servir index.html (SPA routing)
app.use((req, res, next) => {
  // Si la ruta no es de API, servir el index.html del SPA
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🎉 ===============================================');
  console.log('🚀 SERVIDOR INTEGRADO DE PRODUCCIÓN INICIADO');
  console.log('🎉 ===============================================');
  console.log('');
  console.log(`📡 Servidor corriendo en puerto: ${PORT}`);
  console.log(`🌐 URL local: http://localhost:${PORT}`);
  console.log(`📂 Archivos estáticos: ${distPath}`);
  console.log('');
  console.log('🔑 Credenciales de acceso:');
  console.log('   📧 Email: admin@admin.com');
  console.log('   🔑 Password: MDAsociety369');
  console.log('');
  console.log('📊 Datos disponibles:');
  console.log('   🏢 Dependencias: 6');
  console.log('   📋 Procedimientos: 5');
  console.log('   ⏱️ Tiempos registrados: 3');
  console.log('');
  console.log('🛡️ APIs disponibles en /api/*');
  console.log('🎨 Frontend React disponible en /*');
  console.log('');
  console.log('✅ Sistema completamente funcional!');
  console.log('===============================================');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

