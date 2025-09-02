const mysql = require('mysql2/promise');

// Configuración de la base de datos MySQL
const dbConfig = {
  host: '127.0.0.1',
  user: 'root', // Cambiar por tu usuario de MySQL
  password: '', // Cambiar por tu contraseña de MySQL
  database: 'cargas_trabajo'
};

async function limpiarDuplicados() {
  console.log('🧹 LIMPIANDO REGISTROS DUPLICADOS');
  console.log('==================================\n');
  
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida\n');
    
    // Verificar registros duplicados
    console.log('🔍 Verificando registros duplicados...');
    const [duplicates] = await connection.execute(`
      SELECT usuario_id, procedimiento_id, empleo_id, COUNT(*) as count
      FROM tiempos_procedimientos 
      GROUP BY usuario_id, procedimiento_id, empleo_id 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.length === 0) {
      console.log('✅ No hay registros duplicados');
    } else {
      console.log(`⚠️ Encontrados ${duplicates.length} grupos de duplicados:`);
      duplicates.forEach(dup => {
        console.log(`   Usuario: ${dup.usuario_id}, Procedimiento: ${dup.procedimiento_id}, Empleo: ${dup.empleo_id} - ${dup.count} registros`);
      });
      
      // Eliminar duplicados manteniendo solo el más reciente
      console.log('\n🔄 Eliminando duplicados (manteniendo el más reciente)...');
      
      for (const dup of duplicates) {
        const [records] = await connection.execute(`
          SELECT id, fecha_creacion 
          FROM tiempos_procedimientos 
          WHERE usuario_id = ? AND procedimiento_id = ? AND empleo_id = ?
          ORDER BY fecha_creacion DESC
        `, [dup.usuario_id, dup.procedimiento_id, dup.empleo_id]);
        
        // Mantener el primer registro (más reciente) y eliminar los demás
        const idsToDelete = records.slice(1).map(r => r.id);
        
        if (idsToDelete.length > 0) {
          await connection.execute(`
            DELETE FROM tiempos_procedimientos 
            WHERE id IN (${idsToDelete.map(() => '?').join(',')})
          `, idsToDelete);
          
          console.log(`   ✅ Eliminados ${idsToDelete.length} duplicados para usuario ${dup.usuario_id}, procedimiento ${dup.procedimiento_id}, empleo ${dup.empleo_id}`);
        }
      }
    }
    
    // Verificar estructura actual
    console.log('\n📊 VERIFICANDO ESTRUCTURA ACTUAL:');
    console.log('==================================');
    
    const [columns] = await connection.execute('DESCRIBE tiempos_procedimientos');
    console.log('\n📋 Estructura de la tabla tiempos_procedimientos:');
    columns.forEach(col => {
      console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
    });
    
    // Verificar total de registros
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM tiempos_procedimientos');
    console.log(`\n📈 Total de registros después de limpieza: ${countResult[0].total}`);
    
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
    
    console.log('\n✅ LIMPIEZA COMPLETADA');
    console.log('======================');
    console.log('🎯 Ahora puedes ejecutar el script para agregar el índice único');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la función
limpiarDuplicados(); 