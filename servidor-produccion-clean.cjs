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
      frecuenciaMensual, 
      tiempoMinimo, 
      tiempoPromedio, 
      tiempoMaximo, 
      observaciones 
    } = req.body;
    
    console.log('Datos recibidos para crear tiempo:', req.body);
    
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
    
    res.status(201).json({ success: true, data: nuevoTiempo[0] });
  } catch (error) {
    console.error('Error al guardar tiempo:', error);
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
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO estructuras (nombre, descripcion, usuario_creador_id) VALUES (?, ?, ?)',
      [nombre, descripcion || '', req.usuario.id]
    );
    
    const [nuevaEstructura] = await pool.query(
      'SELECT * FROM estructuras WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: nuevaEstructura[0] });
  } catch (error) {
    console.error('Error al crear estructura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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
       INNER JOIN elementos_estructura ee ON d.id = ee.referencia_id
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

