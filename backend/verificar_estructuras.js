const mysql = require('mysql2/promise');

async function verificarEstructuras() {
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

    // Verificar si la tabla estructuras existe
    console.log('\n🔍 Verificando tabla estructuras...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'estructuras'");
    
    if (tables.length === 0) {
      console.log('❌ La tabla estructuras NO existe');
      return;
    }
    
    console.log('✅ La tabla estructuras existe');

    // Verificar la estructura de la tabla estructuras
    console.log('\n🔍 Estructura de la tabla estructuras:');
    const [columns] = await connection.execute('DESCRIBE estructuras');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });

    // Verificar si hay datos en la tabla
    console.log('\n🔍 Verificando datos en estructuras:');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM estructuras');
    console.log(`Total de estructuras: ${rows[0].count}`);

    if (rows[0].count > 0) {
      const [sampleData] = await connection.execute('SELECT * FROM estructuras LIMIT 3');
      console.log('Muestra de datos:');
      sampleData.forEach(row => {
        console.log(`- ID: ${row.id}, Nombre: ${row.nombre}`);
      });
    }

    // Verificar la estructura actual de tiempos_procedimientos
    console.log('\n🔍 Estructura actual de tiempos_procedimientos:');
    const [tiemposColumns] = await connection.execute('DESCRIBE tiempos_procedimientos');
    tiemposColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

verificarEstructuras(); 