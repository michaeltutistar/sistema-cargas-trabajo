const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cargas_trabajo'
};

async function verificarCombinacionEspecifica() {
  console.log('🔍 VERIFICANDO COMBINACIÓN ESPECÍFICA');
  console.log('=====================================');

  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida');

    // Buscar el procedimiento "Definición de Metas SMART"
    console.log('\n📋 Buscando procedimiento "Definición de Metas SMART"...');
    const [procedimientos] = await connection.execute(
      'SELECT id, nombre, codigo FROM procedimientos WHERE nombre LIKE ? AND activo = 1',
      ['%Definición de Metas SMART%']
    );

    if (procedimientos.length === 0) {
      console.log('❌ Procedimiento "Definición de Metas SMART" no encontrado');
      return;
    }

    const procedimiento = procedimientos[0];
    console.log(`✅ Procedimiento encontrado: ${procedimiento.nombre} (ID: ${procedimiento.id})`);

    // Buscar el empleo "ASI002 - ASISTENCIAL"
    console.log('\n📋 Buscando empleo "ASI002 - ASISTENCIAL"...');
    const [empleos] = await connection.execute(
      'SELECT id, nombre, codigo, nivel_jerarquico FROM empleos WHERE (nombre LIKE ? OR codigo LIKE ?) AND activo = 1',
      ['%ASI002%', '%ASI002%']
    );

    if (empleos.length === 0) {
      console.log('❌ Empleo "ASI002 - ASISTENCIAL" no encontrado');
      return;
    }

    const empleo = empleos[0];
    console.log(`✅ Empleo encontrado: ${empleo.nombre} (ID: ${empleo.id}, Código: ${empleo.codigo})`);

    // Obtener el usuario de tiempos
    console.log('\n📋 Obteniendo usuario de tiempos...');
    const [usuarios] = await connection.execute(
      'SELECT id, nombre, apellido, email FROM usuarios WHERE email = ?',
      ['tiempos@cargas-trabajo.gov.co']
    );

    if (usuarios.length === 0) {
      console.log('❌ Usuario de tiempos no encontrado');
      return;
    }

    const usuario = usuarios[0];
    console.log(`✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido} (ID: ${usuario.id})`);

    // Verificar si existe esta combinación específica
    console.log('\n📋 Verificando combinación específica...');
    const [combinacionExiste] = await connection.execute(
      'SELECT id, tiempo_horas, frecuencia_mensual, fecha_creacion FROM tiempos_procedimientos WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ?',
      [procedimiento.id, empleo.id, usuario.id]
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
    console.log('\n📋 Verificando todas las combinaciones del usuario con este procedimiento...');
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
    `, [procedimiento.id, usuario.id]);

    if (combinacionesProcedimiento.length > 0) {
      console.log(`📊 El usuario ya tiene ${combinacionesProcedimiento.length} combinaciones con este procedimiento:`);
      combinacionesProcedimiento.forEach((combinacion, index) => {
        console.log(`   ${index + 1}. ${combinacion.empleo_nombre} (${combinacion.empleo_codigo})`);
        console.log(`      Tiempo: ${combinacion.tiempo_horas}h, Frecuencia: ${combinacion.frecuencia_mensual}/mes`);
      });
    } else {
      console.log('📊 El usuario no tiene combinaciones con este procedimiento');
    }

    // Verificar todas las combinaciones del usuario con este empleo
    console.log('\n📋 Verificando todas las combinaciones del usuario con este empleo...');
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
    `, [empleo.id, usuario.id]);

    if (combinacionesEmpleo.length > 0) {
      console.log(`📊 El usuario ya tiene ${combinacionesEmpleo.length} combinaciones con este empleo:`);
      combinacionesEmpleo.forEach((combinacion, index) => {
        console.log(`   ${index + 1}. ${combinacion.procedimiento_nombre} (${combinacion.procedimiento_codigo})`);
        console.log(`      Tiempo: ${combinacion.tiempo_horas}h, Frecuencia: ${combinacion.frecuencia_mensual}/mes`);
      });
    } else {
      console.log('📊 El usuario no tiene combinaciones con este empleo');
    }

    // Buscar combinaciones similares
    console.log('\n📋 Buscando combinaciones similares...');
    const [combinacionesSimilares] = await connection.execute(`
      SELECT 
        t.id,
        t.procedimiento_id,
        t.empleo_id,
        p.nombre as procedimiento_nombre,
        e.nombre as empleo_nombre,
        t.tiempo_horas,
        t.frecuencia_mensual,
        t.fecha_creacion
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.usuario_id = ? AND (p.nombre LIKE ? OR e.nombre LIKE ? OR e.codigo LIKE ?)
      ORDER BY t.fecha_creacion DESC
    `, [usuario.id, '%Metas%', '%ASI002%', '%ASI002%']);

    if (combinacionesSimilares.length > 0) {
      console.log(`📊 Combinaciones similares encontradas: ${combinacionesSimilares.length}`);
      combinacionesSimilares.forEach((combinacion, index) => {
        console.log(`   ${index + 1}. ${combinacion.procedimiento_nombre} + ${combinacion.empleo_nombre}`);
        console.log(`      Fecha: ${combinacion.fecha_creacion}`);
      });
    } else {
      console.log('📊 No se encontraron combinaciones similares');
    }

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
verificarCombinacionEspecifica().catch(console.error); 