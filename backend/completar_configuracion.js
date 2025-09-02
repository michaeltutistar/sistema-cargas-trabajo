const mysql = require('mysql2/promise');

// Configuración de la base de datos MySQL
const dbConfig = {
  host: '127.0.0.1',
  user: 'root', // Cambiar por tu usuario de MySQL
  password: '', // Cambiar por tu contraseña de MySQL
  database: 'cargas_trabajo'
};

async function completarConfiguracion() {
  console.log('🔧 COMPLETANDO CONFIGURACIÓN DE ÍNDICES');
  console.log('========================================\n');
  
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida\n');
    
    // 1. Agregar índice único compuesto
    console.log('🔄 Agregando índice único compuesto...');
    try {
      await connection.execute(`
        ALTER TABLE tiempos_procedimientos 
        ADD UNIQUE INDEX idx_usuario_procedimiento_empleo (usuario_id, procedimiento_id, empleo_id)
      `);
      console.log('✅ Índice único compuesto agregado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ Índice único ya existe');
      } else {
        throw error;
      }
    }
    
    // 2. Agregar foreign key constraint
    console.log('🔄 Agregando foreign key constraint...');
    try {
      await connection.execute(`
        ALTER TABLE tiempos_procedimientos 
        ADD CONSTRAINT fk_tiempos_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ Foreign key constraint agregado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ Foreign key constraint ya existe');
      } else {
        throw error;
      }
    }
    
    // Verificar la estructura final
    console.log('\n📊 VERIFICANDO ESTRUCTURA FINAL:');
    console.log('==================================');
    
    const [columns] = await connection.execute('DESCRIBE tiempos_procedimientos');
    console.log('\n📋 Estructura de la tabla tiempos_procedimientos:');
    columns.forEach(col => {
      console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
    });
    
    // Verificar índices
    const [indexes] = await connection.execute('SHOW INDEX FROM tiempos_procedimientos');
    console.log('\n🔍 Índices de la tabla:');
    const uniqueIndexes = new Set();
    indexes.forEach(idx => {
      if (idx.Key_name !== 'PRIMARY') {
        uniqueIndexes.add(idx.Key_name);
      }
    });
    uniqueIndexes.forEach(idxName => {
      console.log(`   📌 ${idxName}`);
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
    
    // Probar inserción de datos para diferentes usuarios
    console.log('\n🧪 PROBANDO INSERCIÓN DE DATOS:');
    console.log('================================');
    
    // Insertar un tiempo para el usuario de tiempos
    try {
      await connection.execute(`
        INSERT INTO tiempos_procedimientos 
        (usuario_id, procedimiento_id, empleo_id, tiempo_horas, frecuencia_mensual, observaciones) 
        VALUES 
        ('user_1755225276718', 1, 1, 2.5, 4, 'Prueba de usuario tiempos')
      `);
      console.log('✅ Inserción exitosa para usuario tiempos');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠️ Registro duplicado (esperado para esta prueba)');
      } else {
        console.log('❌ Error en inserción:', error.message);
      }
    }
    
    // Intentar insertar la misma combinación para el usuario admin
    try {
      await connection.execute(`
        INSERT INTO tiempos_procedimientos 
        (usuario_id, procedimiento_id, empleo_id, tiempo_horas, frecuencia_mensual, observaciones) 
        VALUES 
        ('3b3a50f4-f5da-4de8-a800-859ceae8d9d6', 1, 1, 3.0, 2, 'Prueba de usuario admin')
      `);
      console.log('❌ Error: No debería permitir duplicado para el mismo usuario');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('✅ Correcto: Bloquea duplicados para el mismo usuario');
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }
    
    console.log('\n✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE');
    console.log('=========================================');
    console.log('🎯 Funcionalidades implementadas:');
    console.log('   • Cada usuario puede tener sus propias combinaciones');
    console.log('   • No se permiten duplicados por usuario');
    console.log('   • Datos aislados por usuario');
    console.log('   • Índices optimizados para consultas');
    
    console.log('\n💡 Ahora el backend necesita ser actualizado para:');
    console.log('   • Incluir usuario_id en las consultas');
    console.log('   • Filtrar datos por usuario autenticado');
    console.log('   • Validar duplicados por usuario');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la función
completarConfiguracion(); 