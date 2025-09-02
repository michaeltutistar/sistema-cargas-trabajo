const mysql = require('mysql2/promise');

async function limpiarRegistroPrueba() {
  let connection;
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cargas_trabajo'
    });

    console.log('✅ Conexión establecida');

    // Eliminar el registro de prueba (ID 54)
    console.log('\n🗑️ Eliminando registro de prueba...');
    const [resultado] = await connection.execute(`
      DELETE FROM tiempos_procedimientos WHERE id = 54
    `);

    console.log('✅ Registro eliminado');

    // Verificar que se eliminó
    const [verificacion] = await connection.execute(`
      SELECT COUNT(*) as total FROM tiempos_procedimientos WHERE id = 54
    `);

    if (verificacion[0].total === 0) {
      console.log('✅ Confirmado: el registro ya no existe');
    } else {
      console.log('❌ Error: el registro aún existe');
    }

    // Mostrar el total de registros actuales
    const [totalRegistros] = await connection.execute(`
      SELECT COUNT(*) as total FROM tiempos_procedimientos WHERE usuario_id = '1'
    `);

    console.log(`📊 Total de registros del usuario 1: ${totalRegistros[0].total}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

limpiarRegistroPrueba(); 