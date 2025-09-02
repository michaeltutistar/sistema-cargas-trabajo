const mysql = require('mysql2/promise');

async function verificarEstructura() {
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

    // Verificar estructura de la tabla dependencias
    console.log('\n📋 Estructura actual de la tabla dependencias:');
    const [columns] = await connection.execute('DESCRIBE dependencias');
    
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
    });

    // Verificar si existe la columna fecha_actualizacion
    const tieneFechaActualizacion = columns.some(col => col.Field === 'fecha_actualizacion');
    console.log(`\n🔍 ¿Tiene fecha_actualizacion? ${tieneFechaActualizacion ? '✅ SÍ' : '❌ NO'}`);

    if (!tieneFechaActualizacion) {
      console.log('\n🔧 Agregando columna fecha_actualizacion...');
      await connection.execute(`
        ALTER TABLE dependencias 
        ADD COLUMN fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
        AFTER fecha_creacion
      `);
      console.log('✅ Columna fecha_actualizacion agregada');
      
      // Verificar nuevamente
      const [newColumns] = await connection.execute('DESCRIBE dependencias');
      console.log('\n📋 Nueva estructura de la tabla dependencias:');
      newColumns.forEach(col => {
        console.log(`   ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

verificarEstructura(); 