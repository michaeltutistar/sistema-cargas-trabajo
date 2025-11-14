// Intentar cargar .env desde diferentes ubicaciones
const path = require('path');
const fs = require('fs');

// Buscar archivo .env
let envPath = path.join(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  envPath = path.join(__dirname, '../../../.env');
}
if (!fs.existsSync(envPath)) {
  envPath = '/var/www/sistema-cargas-trabajo/.env';
}

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(`📄 Cargando .env desde: ${envPath}`);
} else {
  console.log('⚠️ No se encontró archivo .env, usando variables de entorno del sistema');
}

const mysql = require('mysql2/promise');

(async () => {
  try {
    // Usar variables de entorno o valores por defecto (igual que servidor-produccion-clean.cjs)
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'cargas_user',
      password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
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

    console.log('🔍 Verificando tiempos de la estructura INDUMIL...\n');

    // 1. Buscar el ID de la estructura INDUMIL
    const [estructuras] = await pool.query(
      "SELECT id, nombre FROM estructuras WHERE nombre LIKE '%INDUMIL%' AND activa = 1"
    );
    
    if (estructuras.length === 0) {
      console.log('❌ No se encontró la estructura INDUMIL');
      process.exit(1);
    }

    const estructuraId = estructuras[0].id;
    console.log(`✅ Estructura encontrada: ${estructuras[0].nombre} (ID: ${estructuraId})\n`);

    // 2. Contar total de tiempos activos en la estructura
    const [totalTiempos] = await pool.query(
      'SELECT COUNT(*) as total FROM tiempos_procedimientos WHERE estructura_id = ? AND activo = 1',
      [estructuraId]
    );
    console.log(`📊 Total de tiempos activos en la estructura: ${totalTiempos[0].total}\n`);

    // 3. Contar tiempos con proceso directo que tiene dependencia
    const [tiemposConProcesoDependencia] = await pool.query(
      `SELECT COUNT(DISTINCT tp.id) as total
       FROM tiempos_procedimientos tp
       INNER JOIN procesos p ON tp.proceso_id = p.id
       WHERE tp.estructura_id = ? 
       AND tp.activo = 1
       AND p.dependencia_id IS NOT NULL`,
      [estructuraId]
    );
    console.log(`📊 Tiempos con proceso directo que tiene dependencia: ${tiemposConProcesoDependencia[0].total}`);

    // 4. Contar tiempos con proceso de fallback que tiene dependencia
    const [tiemposConProcesoFallback] = await pool.query(
      `SELECT COUNT(DISTINCT tp.id) as total
       FROM tiempos_procedimientos tp
       INNER JOIN procedimientos pr ON tp.procedimiento_id = pr.id
       LEFT JOIN actividades ac ON pr.actividad_id = ac.id
       LEFT JOIN procesos p ON ac.proceso_id = p.id
       WHERE tp.estructura_id = ?
       AND tp.activo = 1
       AND tp.proceso_id IS NULL
       AND p.id IS NOT NULL
       AND p.dependencia_id IS NOT NULL`,
      [estructuraId]
    );
    console.log(`📊 Tiempos con proceso de fallback que tiene dependencia: ${tiemposConProcesoFallback[0].total}`);

    // 5. Contar tiempos SIN proceso con dependencia (ni directo ni fallback)
    const [tiemposSinDependencia] = await pool.query(
      `SELECT COUNT(DISTINCT tp.id) as total
       FROM tiempos_procedimientos tp
       LEFT JOIN procesos p_directo ON tp.proceso_id = p_directo.id
       LEFT JOIN procedimientos pr ON tp.procedimiento_id = pr.id
       LEFT JOIN actividades ac ON pr.actividad_id = ac.id
       LEFT JOIN procesos p_fallback ON ac.proceso_id = p_fallback.id
       WHERE tp.estructura_id = ?
       AND tp.activo = 1
       AND NOT (
         (tp.proceso_id IS NOT NULL AND p_directo.id IS NOT NULL AND p_directo.dependencia_id IS NOT NULL)
         OR
         (p_fallback.id IS NOT NULL AND p_fallback.dependencia_id IS NOT NULL)
       )`,
      [estructuraId]
    );
    console.log(`📊 Tiempos SIN proceso con dependencia: ${tiemposSinDependencia[0].total}\n`);

    // 6. Verificar distribución por dependencia
    console.log('📊 Distribución de tiempos por dependencia:');
    const [distribucion] = await pool.query(
      `SELECT 
        COALESCE(p_directo.dependencia_id, p_fallback.dependencia_id) as dependencia_id,
        d.nombre as dependencia_nombre,
        COUNT(DISTINCT tp.id) as total_tiempos
       FROM tiempos_procedimientos tp
       LEFT JOIN procesos p_directo ON tp.proceso_id = p_directo.id
       LEFT JOIN procedimientos pr ON tp.procedimiento_id = pr.id
       LEFT JOIN actividades ac ON pr.actividad_id = ac.id
       LEFT JOIN procesos p_fallback ON ac.proceso_id = p_fallback.id
       LEFT JOIN dependencias d ON COALESCE(p_directo.dependencia_id, p_fallback.dependencia_id) = d.id
       WHERE tp.estructura_id = ?
       AND tp.activo = 1
       AND (p_directo.dependencia_id IS NOT NULL OR p_fallback.dependencia_id IS NOT NULL)
       GROUP BY dependencia_id, dependencia_nombre
       ORDER BY total_tiempos DESC`,
      [estructuraId]
    );
    
    distribucion.forEach((row) => {
      console.log(`   - ${row.dependencia_nombre || 'Sin nombre'} (ID: ${row.dependencia_id}): ${row.total_tiempos} tiempos`);
    });

    // 7. Verificar procesos únicos
    console.log('\n📊 Procesos únicos en la estructura:');
    const [procesos] = await pool.query(
      `SELECT DISTINCT
        COALESCE(p_directo.id, p_fallback.id) as proceso_id,
        COALESCE(p_directo.nombre, p_fallback.nombre) as proceso_nombre,
        COALESCE(p_directo.dependencia_id, p_fallback.dependencia_id) as dependencia_id,
        d.nombre as dependencia_nombre,
        COUNT(DISTINCT tp.id) as total_tiempos
       FROM tiempos_procedimientos tp
       LEFT JOIN procesos p_directo ON tp.proceso_id = p_directo.id
       LEFT JOIN procedimientos pr ON tp.procedimiento_id = pr.id
       LEFT JOIN actividades ac ON pr.actividad_id = ac.id
       LEFT JOIN procesos p_fallback ON ac.proceso_id = p_fallback.id
       LEFT JOIN dependencias d ON COALESCE(p_directo.dependencia_id, p_fallback.dependencia_id) = d.id
       WHERE tp.estructura_id = ?
       AND tp.activo = 1
       AND (p_directo.id IS NOT NULL OR p_fallback.id IS NOT NULL)
       GROUP BY proceso_id, proceso_nombre, dependencia_id, dependencia_nombre
       ORDER BY dependencia_nombre, proceso_nombre`,
      [estructuraId]
    );
    
    procesos.forEach((row) => {
      console.log(`   - ${row.proceso_nombre} (Dependencia: ${row.dependencia_nombre || 'Sin dependencia'}): ${row.total_tiempos} tiempos`);
    });

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

