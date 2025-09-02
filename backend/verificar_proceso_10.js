const mysql = require('mysql2/promise');

async function verificarProceso10() {
  let connection;
  
  try {
    // Configuración de la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cargas_trabajo'
    });

    console.log('🔍 VERIFICANDO PROCESO CON ID 10');
    console.log('================================');
    console.log('✅ Conexión a MySQL establecida\n');

    // Verificar el proceso con ID 10
    const [rows] = await connection.execute(`
      SELECT * FROM procesos WHERE id = 10
    `);

    console.log('🔍 Buscando proceso con ID: 10');
    
    if (rows.length === 0) {
      console.log('❌ No se encontró el proceso con ID 10');
    } else {
      console.log('✅ Proceso encontrado:');
      const proc = rows[0];
      console.log(`   - ID: ${proc.id}`);
      console.log(`   - Nombre: "${proc.nombre}"`);
      console.log(`   - Dependencia ID: ${proc.dependencia_id}`);
      console.log(`   - Activo: ${proc.activo}`);
      console.log(`   - Orden: ${proc.orden}`);
      
      // Verificar si está activo
      if (proc.activo === 1) {
        console.log('✅ El proceso está activo');
      } else {
        console.log('❌ El proceso NO está activo');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

verificarProceso10(); 