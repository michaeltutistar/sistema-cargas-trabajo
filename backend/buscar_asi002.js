const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cargas_trabajo'
};

async function buscarASI002() {
  console.log('🔍 BUSCANDO EMPLEO ASI002');
  console.log('==========================');

  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida');

    // Buscar todos los empleos que contengan "ASI"
    console.log('\n📋 Buscando empleos con "ASI":');
    const [empleosASI] = await connection.execute(
      'SELECT id, nombre, codigo, nivel_jerarquico FROM empleos WHERE (nombre LIKE ? OR codigo LIKE ?) AND activo = 1 ORDER BY codigo',
      ['%ASI%', '%ASI%']
    );
    
    console.log(`📊 Empleos con "ASI" encontrados: ${empleosASI.length}`);
    empleosASI.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.nombre} (${emp.codigo}) - ID: ${emp.id} - Nivel: ${emp.nivel_jerarquico}`);
    });

    // Buscar específicamente "ASI002"
    console.log('\n📋 Buscando específicamente "ASI002":');
    const [asi002] = await connection.execute(
      'SELECT id, nombre, codigo, nivel_jerarquico FROM empleos WHERE codigo = ? AND activo = 1',
      ['ASI002']
    );
    
    if (asi002.length > 0) {
      console.log('✅ ASI002 encontrado:');
      asi002.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.nombre} (${emp.codigo}) - ID: ${emp.id} - Nivel: ${emp.nivel_jerarquico}`);
      });
    } else {
      console.log('❌ ASI002 no encontrado');
    }

    // Buscar empleos asistenciales
    console.log('\n📋 Buscando empleos asistenciales:');
    const [asistenciales] = await connection.execute(
      'SELECT id, nombre, codigo, nivel_jerarquico FROM empleos WHERE nivel_jerarquico = ? AND activo = 1 ORDER BY codigo',
      ['ASISTENCIAL']
    );
    
    console.log(`📊 Empleos asistenciales encontrados: ${asistenciales.length}`);
    asistenciales.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.nombre} (${emp.codigo}) - ID: ${emp.id}`);
    });

    // Verificar si el usuario de tiempos ya tiene alguna combinación con el procedimiento "Definición de Metas SMART"
    console.log('\n📋 Verificando combinaciones del usuario con "Definición de Metas SMART":');
    const [usuarios] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      ['tiempos@cargas-trabajo.gov.co']
    );
    
    if (usuarios.length > 0) {
      const usuarioId = usuarios[0].id;
      const [combinaciones] = await connection.execute(`
        SELECT 
          t.id,
          t.empleo_id,
          e.nombre as empleo_nombre,
          e.codigo as empleo_codigo,
          t.tiempo_horas,
          t.frecuencia_mensual
        FROM tiempos_procedimientos t
        INNER JOIN empleos e ON t.empleo_id = e.id
        WHERE t.procedimiento_id = 5 AND t.usuario_id = ?
        ORDER BY t.fecha_creacion DESC
      `, [usuarioId]);
      
      if (combinaciones.length > 0) {
        console.log(`📊 El usuario ya tiene ${combinaciones.length} combinaciones con "Definición de Metas SMART":`);
        combinaciones.forEach((combinacion, index) => {
          console.log(`   ${index + 1}. ${combinacion.empleo_nombre} (${combinacion.empleo_codigo})`);
          console.log(`      Tiempo: ${combinacion.tiempo_horas}h, Frecuencia: ${combinacion.frecuencia_mensual}/mes`);
        });
      } else {
        console.log('📊 El usuario no tiene combinaciones con "Definición de Metas SMART"');
      }
    }

  } catch (error) {
    console.error('❌ Error durante la búsqueda:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la búsqueda
buscarASI002().catch(console.error); 