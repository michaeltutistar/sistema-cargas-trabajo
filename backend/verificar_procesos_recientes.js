const mysql = require('mysql2/promise');

async function verificarProcesosRecientes() {
  let connection;
  
  try {
    // Configuración de la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cargas_trabajo'
    });

    console.log('🔍 VERIFICANDO PROCESOS RECIENTES');
    console.log('==================================');
    console.log('✅ Conexión a MySQL establecida\n');

    // Verificar los últimos 5 procesos
    const [rows] = await connection.execute(`
      SELECT id, nombre, dependencia_id, activo, orden 
      FROM procesos 
      ORDER BY id DESC 
      LIMIT 5
    `);

    console.log('📋 Últimos 5 procesos:');
    rows.forEach(proc => {
      console.log(`   - ID: ${proc.id}, Nombre: "${proc.nombre}", Dependencia: ${proc.dependencia_id}, Activo: ${proc.activo}, Orden: ${proc.orden}`);
    });

    // Verificar elementos de estructura
    const [elementos] = await connection.execute(`
      SELECT id, estructura_id, tipo, elemento_id, padre_id, orden 
      FROM elementos_estructura 
      WHERE tipo = 'proceso' 
      ORDER BY id DESC 
      LIMIT 5
    `);

    console.log('\n📋 Últimos 5 elementos de estructura (procesos):');
    elementos.forEach(elem => {
      console.log(`   - ID: ${elem.id}, Estructura: ${elem.estructura_id}, Tipo: ${elem.tipo}, ElementoID: ${elem.elemento_id}, PadreID: ${elem.padre_id}, Orden: ${elem.orden}`);
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

verificarProcesosRecientes(); 