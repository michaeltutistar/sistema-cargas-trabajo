const mysql = require('mysql2/promise');

// Configuración de la base de datos MySQL
const dbConfig = {
  host: '127.0.0.1',
  user: 'root', // Cambiar por tu usuario de MySQL
  password: '', // Cambiar por tu contraseña de MySQL
  database: 'cargas_trabajo'
};

async function agregarUsuarioId() {
  console.log('🔧 AGREGANDO COLUMNA USUARIO_ID');
  console.log('================================\n');
  
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida\n');
    
    // 1. Agregar la columna usuario_id
    console.log('🔄 Agregando columna usuario_id...');
    await connection.execute(`
      ALTER TABLE tiempos_procedimientos 
      ADD COLUMN usuario_id varchar(36) DEFAULT NULL AFTER empleo_id
    `);
    console.log('✅ Columna usuario_id agregada');
    
    // 2. Asignar registros existentes al usuario admin
    console.log('🔄 Asignando registros existentes al usuario admin...');
    await connection.execute(`
      UPDATE tiempos_procedimientos 
      SET usuario_id = '3b3a50f4-f5da-4de8-a800-859ceae8d9d6' 
      WHERE usuario_id IS NULL
    `);
    console.log('✅ Registros existentes asignados');
    
    // 3. Hacer la columna NOT NULL
    console.log('🔄 Haciendo columna usuario_id NOT NULL...');
    await connection.execute(`
      ALTER TABLE tiempos_procedimientos 
      MODIFY COLUMN usuario_id varchar(36) NOT NULL
    `);
    console.log('✅ Columna usuario_id ahora es NOT NULL');
    
    // 4. Agregar índice para usuario_id
    console.log('🔄 Agregando índice para usuario_id...');
    await connection.execute(`
      ALTER TABLE tiempos_procedimientos 
      ADD INDEX idx_usuario_id (usuario_id)
    `);
    console.log('✅ Índice para usuario_id agregado');
    
    // 5. Agregar índice único compuesto
    console.log('🔄 Agregando índice único compuesto...');
    await connection.execute(`
      ALTER TABLE tiempos_procedimientos 
      ADD UNIQUE INDEX idx_usuario_procedimiento_empleo (usuario_id, procedimiento_id, empleo_id)
    `);
    console.log('✅ Índice único compuesto agregado');
    
    // 6. Agregar foreign key constraint
    console.log('🔄 Agregando foreign key constraint...');
    await connection.execute(`
      ALTER TABLE tiempos_procedimientos 
      ADD CONSTRAINT fk_tiempos_usuario 
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('✅ Foreign key constraint agregado');
    
    // Verificar la estructura final
    console.log('\n📊 VERIFICANDO ESTRUCTURA FINAL:');
    console.log('==================================');
    
    const [columns] = await connection.execute('DESCRIBE tiempos_procedimientos');
    console.log('\n📋 Estructura de la tabla tiempos_procedimientos:');
    columns.forEach(col => {
      console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
    });
    
    // Verificar registros por usuario
    const [userCounts] = await connection.execute(`
      SELECT u.nombre, u.email, COUNT(t.id) as total_tiempos 
      FROM usuarios u 
      LEFT JOIN tiempos_procedimientos t ON u.id = t.usuario_id 
      GROUP BY u.id, u.nombre, u.email
    `);
    
    console.log('\n👥 Registros por usuario:');
    userCounts.forEach(user => {
      console.log(`   👤 ${user.nombre} (${user.email}): ${user.total_tiempos} tiempos`);
    });
    
    console.log('\n✅ MODIFICACIÓN COMPLETADA EXITOSAMENTE');
    console.log('=======================================');
    console.log('🎯 Ahora cada usuario puede tener sus propias combinaciones de:');
    console.log('   • Procedimiento + Empleo');
    console.log('   • Sin conflictos entre usuarios');
    console.log('   • Datos aislados por usuario');
    
  } catch (error) {
    console.error('❌ Error durante la modificación:', error.message);
    
    if (error.code === 'ER_DUP_KEYNAME') {
      console.log('⚠️ Índice ya existe, continuando...');
    } else if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ Columna ya existe, continuando...');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solución: Verifica las credenciales de MySQL');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la función
agregarUsuarioId(); 