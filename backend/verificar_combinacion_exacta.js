const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cargas_trabajo'
};

async function verificarCombinacionExacta() {
  console.log('🔍 VERIFICANDO COMBINACIÓN EXACTA');
  console.log('==================================');

  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida');

    // Datos específicos de la combinación
    const procedimientoId = 5; // "Definición de Metas SMART"
    const empleoId = 13;       // "Recepcionista (ASI002)"

    console.log('\n📋 Verificando combinación específica:');
    console.log(`   Procedimiento ID: ${procedimientoId} (Definición de Metas SMART)`);
    console.log(`   Empleo ID: ${empleoId} (Recepcionista - ASI002)`);

    // Obtener el usuario de tiempos
    const [usuarios] = await connection.execute(
      'SELECT id, nombre, apellido, email FROM usuarios WHERE email = ?',
      ['tiempos@cargas-trabajo.gov.co']
    );

    if (usuarios.length === 0) {
      console.log('❌ Usuario de tiempos no encontrado');
      return;
    }

    const usuario = usuarios[0];
    console.log(`   Usuario ID: ${usuario.id} (${usuario.nombre} ${usuario.apellido})`);

    // Verificar si existe esta combinación específica
    console.log('\n📋 Verificando si existe la combinación...');
    const [combinacionExiste] = await connection.execute(
      'SELECT id, tiempo_horas, frecuencia_mensual, fecha_creacion FROM tiempos_procedimientos WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ?',
      [procedimientoId, empleoId, usuario.id]
    );

    if (combinacionExiste.length > 0) {
      console.log('❌ COMBINACIÓN YA EXISTE');
      console.log('📊 Detalles del registro existente:');
      combinacionExiste.forEach((registro, index) => {
        console.log(`   ${index + 1}. ID: ${registro.id}`);
        console.log(`      Tiempo: ${registro.tiempo_horas} horas`);
        console.log(`      Frecuencia: ${registro.frecuencia_mensual} veces/mes`);
        console.log(`      Fecha creación: ${registro.fecha_creacion}`);
      });
    } else {
      console.log('✅ Combinación NO existe - debería permitir crear');
    }

    // Verificar todas las combinaciones del usuario con este procedimiento
    console.log('\n📋 Todas las combinaciones del usuario con "Definición de Metas SMART":');
    const [combinacionesProcedimiento] = await connection.execute(`
      SELECT 
        t.id,
        t.empleo_id,
        e.nombre as empleo_nombre,
        e.codigo as empleo_codigo,
        t.tiempo_horas,
        t.frecuencia_mensual,
        t.fecha_creacion
      FROM tiempos_procedimientos t
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.procedimiento_id = ? AND t.usuario_id = ?
      ORDER BY t.fecha_creacion DESC
    `, [procedimientoId, usuario.id]);

    if (combinacionesProcedimiento.length > 0) {
      console.log(`📊 El usuario ya tiene ${combinacionesProcedimiento.length} combinaciones con este procedimiento:`);
      combinacionesProcedimiento.forEach((combinacion, index) => {
        console.log(`   ${index + 1}. ${combinacion.empleo_nombre} (${combinacion.empleo_codigo})`);
        console.log(`      Tiempo: ${combinacion.tiempo_horas}h, Frecuencia: ${combinacion.frecuencia_mensual}/mes`);
        console.log(`      Fecha: ${combinacion.fecha_creacion}`);
      });
    } else {
      console.log('📊 El usuario no tiene combinaciones con este procedimiento');
    }

    // Verificar todas las combinaciones del usuario con este empleo
    console.log('\n📋 Todas las combinaciones del usuario con "Recepcionista (ASI002)":');
    const [combinacionesEmpleo] = await connection.execute(`
      SELECT 
        t.id,
        t.procedimiento_id,
        p.nombre as procedimiento_nombre,
        p.codigo as procedimiento_codigo,
        t.tiempo_horas,
        t.frecuencia_mensual,
        t.fecha_creacion
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      WHERE t.empleo_id = ? AND t.usuario_id = ?
      ORDER BY t.fecha_creacion DESC
    `, [empleoId, usuario.id]);

    if (combinacionesEmpleo.length > 0) {
      console.log(`📊 El usuario ya tiene ${combinacionesEmpleo.length} combinaciones con este empleo:`);
      combinacionesEmpleo.forEach((combinacion, index) => {
        console.log(`   ${index + 1}. ${combinacion.procedimiento_nombre} (${combinacion.procedimiento_codigo})`);
        console.log(`      Tiempo: ${combinacion.tiempo_horas}h, Frecuencia: ${combinacion.frecuencia_mensual}/mes`);
        console.log(`      Fecha: ${combinacion.fecha_creacion}`);
      });
    } else {
      console.log('📊 El usuario no tiene combinaciones con este empleo');
    }

    // Mostrar todas las combinaciones del usuario
    console.log('\n📋 Todas las combinaciones del usuario de tiempos:');
    const [todasCombinaciones] = await connection.execute(`
      SELECT 
        t.id,
        t.procedimiento_id,
        t.empleo_id,
        p.nombre as procedimiento_nombre,
        e.nombre as empleo_nombre,
        e.codigo as empleo_codigo,
        t.tiempo_horas,
        t.frecuencia_mensual,
        t.fecha_creacion
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.usuario_id = ?
      ORDER BY t.fecha_creacion DESC
    `, [usuario.id]);

    console.log(`📊 Total de combinaciones del usuario: ${todasCombinaciones.length}`);
    todasCombinaciones.forEach((combinacion, index) => {
      console.log(`   ${index + 1}. ${combinacion.procedimiento_nombre} + ${combinacion.empleo_nombre} (${combinacion.empleo_codigo})`);
      console.log(`      Tiempo: ${combinacion.tiempo_horas}h, Frecuencia: ${combinacion.frecuencia_mensual}/mes`);
    });

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la verificación
verificarCombinacionExacta().catch(console.error); 