#!/usr/bin/env node

/**
 * SERVIDOR INTEGRADO PARA PRODUCCIÓN
 * Sistema de Gestión de Cargas de Trabajo
 * 
 * Servidor único que sirve tanto el backend API como el frontend React
 * Soluciona el problema "Failed to fetch" en producción
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

console.log('🚀 Iniciando Servidor Integrado de Producción...');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = 'cargas_trabajo_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend React desde /dist
const distPath = path.join(__dirname, 'dist');
console.log(`📂 Sirviendo archivos estáticos desde: ${distPath}`);
app.use(express.static(distPath));

// ============================================================================
// DATOS EN MEMORIA (SIMULANDO BASE DE DATOS)
// ============================================================================

// Usuarios
const usuarios = [
  {
    id: 1,
    email: 'admin@admin.com',
    password: '$2b$12$AwB/wei9P9BkFTIYLYkLo.H5WqoB0CgYdjvmrIfsWbdWDWcaUmmJW', // MDAsociety369
    nombre: 'Administrador',
    apellido: 'Sistema',
    cargo: 'Administrador General',
    dependencia_id: 1,
    empleo_id: 1,
    activo: true
  }
];

// Dependencias
const dependencias = [
  { id: 1, codigo: 'DG', nombre: 'Dirección General', descripcion: 'Dirección General de la organización', activa: true },
  { id: 2, codigo: 'CI', nombre: 'Control Interno', descripcion: 'Oficina de Control Interno', activa: true },
  { id: 3, codigo: 'OP', nombre: 'Oficina de Planeación', descripcion: 'Oficina de Planeación Institucional', activa: true },
  { id: 4, codigo: 'OJ', nombre: 'Oficina Jurídica', descripcion: 'Oficina Asesora Jurídica', activa: true },
  { id: 5, codigo: 'SG', nombre: 'Secretaría General', descripcion: 'Secretaría General', activa: true },
  { id: 6, codigo: 'SO', nombre: 'Subdirección de Operaciones', descripcion: 'Subdirección de Operaciones', activa: true }
];

// Empleos
const empleos = [
  { id: 1, codigo: 'DIR', nombre: 'Directivo', nivel_jerarquico: 'Directivo', grado: 1, descripcion: 'Cargo directivo' },
  { id: 2, codigo: 'ASE', nombre: 'Asesor', nivel_jerarquico: 'Asesor', grado: 2, descripcion: 'Cargo asesor' },
  { id: 3, codigo: 'PRO', nombre: 'Profesional', nivel_jerarquico: 'Profesional', grado: 3, descripcion: 'Cargo profesional' },
  { id: 4, codigo: 'TEC', nombre: 'Técnico', nivel_jerarquico: 'Técnico', grado: 4, descripcion: 'Cargo técnico' },
  { id: 5, codigo: 'ASI', nombre: 'Asistencial', nivel_jerarquico: 'Asistencial', grado: 5, descripcion: 'Cargo asistencial' }
];

// Procesos
const procesos = [
  { id: 1, dependencia_id: 1, codigo: 'GEST', nombre: 'Gestión Estratégica', descripcion: 'Proceso de gestión estratégica' },
  { id: 2, dependencia_id: 2, codigo: 'CTRL', nombre: 'Control y Evaluación', descripcion: 'Proceso de control interno' },
  { id: 3, dependencia_id: 3, codigo: 'PLAN', nombre: 'Planeación', descripcion: 'Proceso de planeación institucional' },
  { id: 4, dependencia_id: 4, codigo: 'JURI', nombre: 'Asesoría Jurídica', descripcion: 'Proceso de asesoría jurídica' },
  { id: 5, dependencia_id: 5, codigo: 'ADMI', nombre: 'Gestión Administrativa', descripcion: 'Proceso de gestión administrativa' },
  { id: 6, dependencia_id: 6, codigo: 'OPER', nombre: 'Operaciones', descripcion: 'Proceso operativo principal' }
];

// Actividades
const actividades = [
  { id: 1, proceso_id: 1, codigo: 'GEST01', nombre: 'Planeación Estratégica', descripcion: 'Actividad de planeación estratégica' },
  { id: 2, proceso_id: 2, codigo: 'CTRL01', nombre: 'Auditoría Interna', descripcion: 'Actividad de auditoría interna' },
  { id: 3, proceso_id: 3, codigo: 'PLAN01', nombre: 'Formulación de Planes', descripcion: 'Actividad de formulación de planes' },
  { id: 4, proceso_id: 4, codigo: 'JURI01', nombre: 'Conceptos Jurídicos', descripcion: 'Actividad de conceptos jurídicos' },
  { id: 5, proceso_id: 5, codigo: 'ADMI01', nombre: 'Gestión Documental', descripcion: 'Actividad de gestión documental' },
  { id: 6, proceso_id: 6, codigo: 'OPER01', nombre: 'Ejecución Operativa', descripcion: 'Actividad de ejecución operativa' }
];

// Procedimientos (muestra de los 82 reales)
const procedimientos = [
  {
    id: 1, actividad_id: 1, codigo: 'PROC001', nombre: 'Elaboración Plan Estratégico',
    descripcion: 'Procedimiento para elaborar el plan estratégico institucional',
    empleo_id: 2, frecuencia_anual: 1, requisitos: 'Análisis situacional, benchmarking'
  },
  {
    id: 2, actividad_id: 1, codigo: 'PROC002', nombre: 'Seguimiento Objetivos Estratégicos',
    descripcion: 'Procedimiento para hacer seguimiento a los objetivos estratégicos',
    empleo_id: 3, frecuencia_anual: 12, requisitos: 'Indicadores, sistemas de información'
  },
  {
    id: 3, actividad_id: 2, codigo: 'PROC003', nombre: 'Auditoría de Procesos',
    descripcion: 'Procedimiento para realizar auditoría de procesos organizacionales',
    empleo_id: 3, frecuencia_anual: 4, requisitos: 'Normativa de auditoría, plan anual'
  },
  {
    id: 4, actividad_id: 3, codigo: 'PROC004', nombre: 'Formulación Presupuesto',
    descripcion: 'Procedimiento para formular el presupuesto anual',
    empleo_id: 2, frecuencia_anual: 1, requisitos: 'Marco fiscal, directrices gobierno'
  },
  {
    id: 5, actividad_id: 4, codigo: 'PROC005', nombre: 'Revisión Contratos',
    descripcion: 'Procedimiento para revisión jurídica de contratos',
    empleo_id: 3, frecuencia_anual: 50, requisitos: 'Normativa contractual, jurisprudencia'
  }
];

// Tiempos de procedimientos
const tiemposProcedimientos = [
  {
    id: 1, procedimiento_id: 1, empleo_id: 2, usuario_id: 1,
    frecuencia_mes: 0.08, tiempo_min: 20, tiempo_prom: 25, tiempo_max: 30,
    tiempo_estandar: 25.58, total_horas_mes: 2.05, fecha_registro: '2024-06-06',
    observaciones: 'Proceso complejo que requiere análisis detallado'
  },
  {
    id: 2, procedimiento_id: 2, empleo_id: 3, usuario_id: 1,
    frecuencia_mes: 1, tiempo_min: 2, tiempo_prom: 3, tiempo_max: 4,
    tiempo_estandar: 3.11, total_horas_mes: 3.11, fecha_registro: '2024-06-06',
    observaciones: 'Seguimiento mensual rutinario'
  },
  {
    id: 3, procedimiento_id: 3, empleo_id: 3, usuario_id: 1,
    frecuencia_mes: 0.33, tiempo_min: 16, tiempo_prom: 20, tiempo_max: 24,
    tiempo_estandar: 20.49, total_horas_mes: 6.76, fecha_registro: '2024-06-06',
    observaciones: 'Auditoría trimestral con documentación extensa'
  }
];

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

// ============================================================================
// RUTAS DE LA API
// ============================================================================

// Salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de Cargas de Trabajo funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Para demo, aceptamos MDAsociety369 directamente
    const passwordValido = password === 'MDAsociety369' || await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

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

app.get('/api/auth/profile', verificarToken, (req, res) => {
  const usuario = usuarios.find(u => u.id === req.usuario.id);
  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.json({
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    cargo: usuario.cargo
  });
});

// ============================================================================
// DEPENDENCIAS
// ============================================================================

app.get('/api/dependencias', verificarToken, (req, res) => {
  res.json(dependencias.filter(d => d.activa));
});

app.get('/api/dependencias/:id', verificarToken, (req, res) => {
  const id = parseInt(req.params.id);
  const dependencia = dependencias.find(d => d.id === id && d.activa);
  
  if (!dependencia) {
    return res.status(404).json({ error: 'Dependencia no encontrada' });
  }
  
  res.json(dependencia);
});

// ============================================================================
// PROCESOS
// ============================================================================

app.get('/api/procesos', verificarToken, (req, res) => {
  const { dependencia_id } = req.query;
  let result = procesos;
  
  if (dependencia_id) {
    result = result.filter(p => p.dependencia_id === parseInt(dependencia_id));
  }
  
  res.json(result);
});

// ============================================================================
// ACTIVIDADES
// ============================================================================

app.get('/api/actividades', verificarToken, (req, res) => {
  const { proceso_id } = req.query;
  let result = actividades;
  
  if (proceso_id) {
    result = result.filter(a => a.proceso_id === parseInt(proceso_id));
  }
  
  res.json(result);
});

// ============================================================================
// PROCEDIMIENTOS
// ============================================================================

app.get('/api/procedimientos', verificarToken, (req, res) => {
  const { actividad_id, dependencia_id } = req.query;
  let result = procedimientos;
  
  if (actividad_id) {
    result = result.filter(p => p.actividad_id === parseInt(actividad_id));
  }
  
  // Si se filtra por dependencia, necesitamos hacer join con actividades y procesos
  if (dependencia_id) {
    const procesosFiltered = procesos.filter(p => p.dependencia_id === parseInt(dependencia_id));
    const actividadesFiltered = actividades.filter(a => 
      procesosFiltered.some(p => p.id === a.proceso_id)
    );
    result = result.filter(p => 
      actividadesFiltered.some(a => a.id === p.actividad_id)
    );
  }
  
  res.json(result);
});

app.get('/api/procedimientos/:id', verificarToken, (req, res) => {
  const id = parseInt(req.params.id);
  const procedimiento = procedimientos.find(p => p.id === id);
  
  if (!procedimiento) {
    return res.status(404).json({ error: 'Procedimiento no encontrado' });
  }
  
  res.json(procedimiento);
});

// Tiempos de procedimientos
app.get('/api/procedimientos/tiempos', verificarToken, (req, res) => {
  res.json(tiemposProcedimientos);
});

app.post('/api/procedimientos/tiempos', verificarToken, (req, res) => {
  try {
    const { procedimiento_id, empleo_id, frecuencia_mes, tiempo_min, tiempo_prom, tiempo_max, observaciones } = req.body;
    
    // Validaciones
    if (tiempo_min > tiempo_prom || tiempo_prom > tiempo_max) {
      return res.status(400).json({ error: 'Los tiempos deben cumplir: mínimo ≤ promedio ≤ máximo' });
    }
    
    // Calcular tiempo estándar PERT
    const tiempo_estandar = calcularTiempoEstandarPERT(tiempo_min, tiempo_prom, tiempo_max);
    const total_horas_mes = frecuencia_mes * tiempo_estandar;
    
    const nuevoTiempo = {
      id: tiemposProcedimientos.length + 1,
      procedimiento_id: parseInt(procedimiento_id),
      empleo_id: parseInt(empleo_id),
      usuario_id: req.usuario.id,
      frecuencia_mes: parseFloat(frecuencia_mes),
      tiempo_min: parseFloat(tiempo_min),
      tiempo_prom: parseFloat(tiempo_prom),
      tiempo_max: parseFloat(tiempo_max),
      tiempo_estandar: parseFloat(tiempo_estandar.toFixed(2)),
      total_horas_mes: parseFloat(total_horas_mes.toFixed(2)),
      fecha_registro: new Date().toISOString().split('T')[0],
      observaciones: observaciones || ''
    };
    
    tiemposProcedimientos.push(nuevoTiempo);
    
    res.status(201).json(nuevoTiempo);
  } catch (error) {
    console.error('Error al guardar tiempo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// EMPLEOS
// ============================================================================

app.get('/api/empleos', verificarToken, (req, res) => {
  res.json(empleos);
});

// ============================================================================
// CARGAS DE TRABAJO Y ANÁLISIS
// ============================================================================

app.get('/api/cargas/estadisticas', verificarToken, (req, res) => {
  try {
    // Estadísticas generales
    const totalDependencias = dependencias.filter(d => d.activa).length;
    const totalProcedimientos = procedimientos.length;
    const totalTiempos = tiemposProcedimientos.length;
    const totalHorasEstandar = tiemposProcedimientos.reduce((sum, t) => sum + t.total_horas_mes, 0);
    
    // Por dependencia
    const porDependencia = dependencias.filter(d => d.activa).map(dep => {
      const procesosDepend = procesos.filter(p => p.dependencia_id === dep.id);
      const actividadesDepend = actividades.filter(a => 
        procesosDepend.some(p => p.id === a.proceso_id)
      );
      const procedimientosDepend = procedimientos.filter(p => 
        actividadesDepend.some(a => a.id === p.actividad_id)
      );
      const tiemposDepend = tiemposProcedimientos.filter(t => 
        procedimientosDepend.some(p => p.id === t.procedimiento_id)
      );
      const horasDepend = tiemposDepend.reduce((sum, t) => sum + t.total_horas_mes, 0);
      
      return {
        dependencia: dep.nombre,
        procedimientos: procedimientosDepend.length,
        tiempos_registrados: tiemposDepend.length,
        horas_mes: parseFloat(horasDepend.toFixed(2))
      };
    });
    
    // Por nivel jerárquico
    const porNivel = empleos.map(emp => {
      const tiemposNivel = tiemposProcedimientos.filter(t => t.empleo_id === emp.id);
      const horasNivel = tiemposNivel.reduce((sum, t) => sum + t.total_horas_mes, 0);
      
      return {
        nivel: emp.nivel_jerarquico,
        tiempos_registrados: tiemposNivel.length,
        horas_mes: parseFloat(horasNivel.toFixed(2))
      };
    });
    
    res.json({
      generales: {
        dependencias: totalDependencias,
        procedimientos: totalProcedimientos,
        tiempos_registrados: totalTiempos,
        horas_estandar_total: parseFloat(totalHorasEstandar.toFixed(2))
      },
      por_dependencia: porDependencia,
      por_nivel: porNivel
    });
  } catch (error) {
    console.error('Error en estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/cargas/analisis', verificarToken, (req, res) => {
  try {
    // Análisis consolidado simplificado
    const analisis = {
      resumen: {
        total_procedimientos: procedimientos.length,
        procedimientos_con_tiempos: tiemposProcedimientos.length,
        total_horas_mes: tiemposProcedimientos.reduce((sum, t) => sum + t.total_horas_mes, 0),
        promedio_tiempo_estandar: tiemposProcedimientos.length > 0 
          ? tiemposProcedimientos.reduce((sum, t) => sum + t.tiempo_estandar, 0) / tiemposProcedimientos.length 
          : 0
      },
      por_dependencia: dependencias.filter(d => d.activa).map(dep => ({
        dependencia: dep.nombre,
        codigo: dep.codigo,
        procedimientos_totales: procedimientos.filter(p => {
          const actividad = actividades.find(a => a.id === p.actividad_id);
          const proceso = actividad ? procesos.find(pr => pr.id === actividad.proceso_id) : null;
          return proceso && proceso.dependencia_id === dep.id;
        }).length,
        tiempos_registrados: 0,
        horas_mes: 0
      }))
    };
    
    res.json(analisis);
  } catch (error) {
    console.error('Error en análisis:', error);
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
  console.log('🔐 Credenciales de acceso:');
  console.log('   📧 Email: admin@admin.com');
  console.log('   🔑 Password: MDAsociety369');
  console.log('');
  console.log('📊 Datos disponibles:');
  console.log(`   🏢 Dependencias: ${dependencias.length}`);
  console.log(`   📋 Procedimientos: ${procedimientos.length}`);
  console.log(`   ⏱️ Tiempos registrados: ${tiemposProcedimientos.length}`);
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
