const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cargas_trabajo'
};

async function ejemploNuevaEstructura() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');

    // Ejemplo 1: Crear un nuevo tiempo con distribución por niveles
    console.log('\n📝 Ejemplo 1: Crear tiempo con distribución por niveles');
    
    const nuevoTiempo = {
      procedimiento_id: 1,
      empleo_id: 2,
      usuario_id: '3b3a50f4-f5da-4de8-a800-859ceae8d9d6',
      estructura_id: null,
      frecuencia_mensual: 5.0,
      tiempo_minimo: 24.0,
      tiempo_promedio: 32.0,
      tiempo_maximo: 40.0,
      // Distribución de horas hombre por niveles (como en Excel)
      horas_directivo: 0,      // 0 horas para Directivo
      horas_asesor: 17.12,     // 17.12 horas para Asesor
      horas_profesional: 1.78, // 1.78 horas para Profesional
      horas_tecnico: 0,        // 0 horas para Técnico
      horas_asistencial: 0,    // 0 horas para Asistencial
      observaciones: 'Ejemplo basado en tabla Excel'
    };

    // Calcular tiempo estándar usando PERT
    const tiempoEstandar = (nuevoTiempo.tiempo_minimo + 4 * nuevoTiempo.tiempo_promedio + nuevoTiempo.tiempo_maximo) / 6;
    nuevoTiempo.tiempo_estandar = Math.round(tiempoEstandar * 10) / 10;

    // Multiplicar por frecuencia mensual para obtener horas hombre totales
    nuevoTiempo.horas_directivo *= nuevoTiempo.frecuencia_mensual;
    nuevoTiempo.horas_asesor *= nuevoTiempo.frecuencia_mensual;
    nuevoTiempo.horas_profesional *= nuevoTiempo.frecuencia_mensual;
    nuevoTiempo.horas_tecnico *= nuevoTiempo.frecuencia_mensual;
    nuevoTiempo.horas_asistencial *= nuevoTiempo.frecuencia_mensual;

    const [resultado] = await connection.execute(`
      INSERT INTO tiempos_procedimientos (
        procedimiento_id, empleo_id, usuario_id, estructura_id,
        frecuencia_mensual, tiempo_estandar,
        horas_directivo, horas_asesor, horas_profesional, horas_tecnico, horas_asistencial,
        observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nuevoTiempo.procedimiento_id, nuevoTiempo.empleo_id, nuevoTiempo.usuario_id, nuevoTiempo.estructura_id,
      nuevoTiempo.frecuencia_mensual, nuevoTiempo.tiempo_estandar,
      nuevoTiempo.horas_directivo, nuevoTiempo.horas_asesor, nuevoTiempo.horas_profesional, 
      nuevoTiempo.horas_tecnico, nuevoTiempo.horas_asistencial,
      nuevoTiempo.observaciones
    ]);

    console.log(`✅ Tiempo creado con ID: ${resultado.insertId}`);
    console.log(`   Tiempo estándar: ${nuevoTiempo.tiempo_estandar} horas`);
    console.log(`   Frecuencia mensual: ${nuevoTiempo.frecuencia_mensual}`);
    console.log(`   Horas hombre - Directivo: ${nuevoTiempo.horas_directivo}`);
    console.log(`   Horas hombre - Asesor: ${nuevoTiempo.horas_asesor}`);
    console.log(`   Horas hombre - Profesional: ${nuevoTiempo.horas_profesional}`);
    console.log(`   Horas hombre - Técnico: ${nuevoTiempo.horas_tecnico}`);
    console.log(`   Horas hombre - Asistencial: ${nuevoTiempo.horas_asistencial}`);

    // Ejemplo 2: Obtener totales por niveles de empleo
    console.log('\n📊 Ejemplo 2: Totales por niveles de empleo');
    
    const [totales] = await connection.execute(`
      SELECT 
        'DIRECTIVO' as nivel_jerarquico,
        SUM(horas_directivo) as total_horas
      FROM tiempos_procedimientos 
      WHERE activo = 1
      
      UNION ALL
      
      SELECT 
        'ASESOR' as nivel_jerarquico,
        SUM(horas_asesor) as total_horas
      FROM tiempos_procedimientos 
      WHERE activo = 1
      
      UNION ALL
      
      SELECT 
        'PROFESIONAL' as nivel_jerarquico,
        SUM(horas_profesional) as total_horas
      FROM tiempos_procedimientos 
      WHERE activo = 1
      
      UNION ALL
      
      SELECT 
        'TECNICO' as nivel_jerarquico,
        SUM(horas_tecnico) as total_horas
      FROM tiempos_procedimientos 
      WHERE activo = 1
      
      UNION ALL
      
      SELECT 
        'ASISTENCIAL' as nivel_jerarquico,
        SUM(horas_asistencial) as total_horas
      FROM tiempos_procedimientos 
      WHERE activo = 1
      
      ORDER BY 
        CASE nivel_jerarquico
          WHEN 'DIRECTIVO' THEN 1
          WHEN 'ASESOR' THEN 2
          WHEN 'PROFESIONAL' THEN 3
          WHEN 'TECNICO' THEN 4
          WHEN 'ASISTENCIAL' THEN 5
        END
    `);

    console.log('📈 Totales por niveles de empleo:');
    totales.forEach(row => {
      console.log(`   ${row.nivel_jerarquico}: ${Math.round(row.total_horas * 100) / 100} horas`);
    });

    // Ejemplo 3: Resumen por dependencia
    console.log('\n🏢 Ejemplo 3: Resumen por dependencia');
    
    const [resumen] = await connection.execute(`
      SELECT 
        d.nombre as dependencia_nombre,
        COUNT(DISTINCT t.procedimiento_id) as total_procedimientos,
        SUM(t.horas_directivo + t.horas_asesor + t.horas_profesional + t.horas_tecnico + t.horas_asistencial) as total_horas,
        SUM(t.horas_directivo) as horas_directivo,
        SUM(t.horas_asesor) as horas_asesor,
        SUM(t.horas_profesional) as horas_profesional,
        SUM(t.horas_tecnico) as horas_tecnico,
        SUM(t.horas_asistencial) as horas_asistencial
      FROM dependencias d
      INNER JOIN procesos p ON d.id = p.dependencia_id
      INNER JOIN actividades a ON p.id = a.proceso_id
      INNER JOIN procedimientos pr ON a.id = pr.actividad_id
      INNER JOIN tiempos_procedimientos t ON pr.id = t.procedimiento_id
      WHERE d.activa = 1 AND p.activo = 1 AND a.activa = 1 AND pr.activo = 1 AND t.activo = 1
      GROUP BY d.id, d.nombre
      ORDER BY total_horas DESC
    `);

    console.log('📋 Resumen por dependencia:');
    resumen.forEach(row => {
      console.log(`\n   ${row.dependencia_nombre}:`);
      console.log(`     Total procedimientos: ${row.total_procedimientos}`);
      console.log(`     Total horas: ${Math.round(row.total_horas * 100) / 100}`);
      console.log(`     - Directivo: ${Math.round(row.horas_directivo * 100) / 100}`);
      console.log(`     - Asesor: ${Math.round(row.horas_asesor * 100) / 100}`);
      console.log(`     - Profesional: ${Math.round(row.horas_profesional * 100) / 100}`);
      console.log(`     - Técnico: ${Math.round(row.horas_tecnico * 100) / 100}`);
      console.log(`     - Asistencial: ${Math.round(row.horas_asistencial * 100) / 100}`);
    });

    // Ejemplo 4: Vista completa de un procedimiento
    console.log('\n🔍 Ejemplo 4: Vista completa de procedimiento');
    
    const [procedimiento] = await connection.execute(`
      SELECT 
        t.id,
        p.nombre as procedimiento_nombre,
        e.nombre as empleo_denominacion,
        e.nivel_jerarquico,
        t.frecuencia_mensual,
        t.tiempo_estandar,
        t.horas_directivo,
        t.horas_asesor,
        t.horas_profesional,
        t.horas_tecnico,
        t.horas_asistencial,
        t.observaciones
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.activo = 1
      ORDER BY t.id DESC
      LIMIT 5
    `);

    console.log('📝 Últimos 5 registros:');
    procedimiento.forEach((row, index) => {
      console.log(`\n   ${index + 1}. ${row.procedimiento_nombre} (${row.empleo_denominacion})`);
      console.log(`      Frecuencia: ${row.frecuencia_mensual}/mes`);
      console.log(`      Tiempo estándar: ${row.tiempo_estandar} horas`);
      console.log(`      Horas hombre:`);
      console.log(`        - Directivo: ${row.horas_directivo}`);
      console.log(`        - Asesor: ${row.horas_asesor}`);
      console.log(`        - Profesional: ${row.horas_profesional}`);
      console.log(`        - Técnico: ${row.horas_tecnico}`);
      console.log(`        - Asistencial: ${row.horas_asistencial}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar el ejemplo
ejemploNuevaEstructura(); 