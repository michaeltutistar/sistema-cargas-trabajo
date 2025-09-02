const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cargas_trabajo'
};

async function verificarDatosBasicos() {
  console.log('🔍 VERIFICANDO DATOS BÁSICOS');
  console.log('============================');

  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida');

    // Verificar procedimientos
    console.log('\n📋 Procedimientos disponibles:');
    const [procedimientos] = await connection.execute(
      'SELECT id, nombre FROM procedimientos WHERE activo = 1 ORDER BY nombre LIMIT 10'
    );
    console.log(`📊 Total procedimientos: ${procedimientos.length}`);
    procedimientos.forEach((proc, index) => {
      console.log(`   ${index + 1}. ${proc.nombre} (ID: ${proc.id})`);
    });

    // Verificar empleos
    console.log('\n📋 Empleos disponibles:');
    const [empleos] = await connection.execute(
      'SELECT id, nombre, codigo FROM empleos WHERE activo = 1 ORDER BY nombre LIMIT 10'
    );
    console.log(`📊 Total empleos: ${empleos.length}`);
    empleos.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.nombre} (${emp.codigo}) - ID: ${emp.id}`);
    });

    // Verificar usuario de tiempos
    console.log('\n📋 Usuario de tiempos:');
    const [usuarios] = await connection.execute(
      'SELECT id, nombre, apellido, email FROM usuarios WHERE email = ?',
      ['tiempos@cargas-trabajo.gov.co']
    );
    
    if (usuarios.length > 0) {
      const usuario = usuarios[0];
      console.log(`✅ Usuario: ${usuario.nombre} ${usuario.apellido} (ID: ${usuario.id})`);
      
      // Verificar tiempos del usuario
      const [tiempos] = await connection.execute(
        'SELECT COUNT(*) as total FROM tiempos_procedimientos WHERE usuario_id = ?',
        [usuario.id]
      );
      console.log(`📊 Tiempos registrados: ${tiempos[0].total}`);
    } else {
      console.log('❌ Usuario de tiempos no encontrado');
    }

    // Buscar específicamente "Definición de Metas SMART"
    console.log('\n📋 Buscando "Definición de Metas SMART":');
    const [metasSmart] = await connection.execute(
      'SELECT id, nombre FROM procedimientos WHERE nombre LIKE ? AND activo = 1',
      ['%Metas%']
    );
    
    if (metasSmart.length > 0) {
      console.log('✅ Procedimientos con "Metas" encontrados:');
      metasSmart.forEach((proc, index) => {
        console.log(`   ${index + 1}. ${proc.nombre} (ID: ${proc.id})`);
      });
    } else {
      console.log('❌ No se encontraron procedimientos con "Metas"');
    }

    // Buscar específicamente "ASI002"
    console.log('\n📋 Buscando "ASI002":');
    const [asi002] = await connection.execute(
      'SELECT id, nombre, codigo FROM empleos WHERE (nombre LIKE ? OR codigo LIKE ?) AND activo = 1',
      ['%ASI002%', '%ASI002%']
    );
    
    if (asi002.length > 0) {
      console.log('✅ Empleos con "ASI002" encontrados:');
      asi002.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.nombre} (${emp.codigo}) - ID: ${emp.id}`);
      });
    } else {
      console.log('❌ No se encontraron empleos con "ASI002"');
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
verificarDatosBasicos().catch(console.error); 