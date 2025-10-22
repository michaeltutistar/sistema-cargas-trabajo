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
        apellido: usuario.apellido
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
        cargo: usuario.cargo
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
      'SELECT id, email, nombre, apellido, cargo FROM usuarios WHERE id = ? AND activo = TRUE',
      [req.usuario.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
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
    res.json(empleos);
  } catch (error) {
    console.error('Error al obtener empleos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// CARGAS DE TRABAJO Y ANÁLISIS
// ============================================================================

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
// FRONTEND - SPA ROUTING
// ============================================================================

// Para todas las rutas no-API, servir index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
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

