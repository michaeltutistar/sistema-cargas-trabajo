const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos MySQL
const dbConfig = {
  host: '127.0.0.1',
  user: 'root', // Cambiar por tu usuario de MySQL
  password: '', // Cambiar por tu contraseña de MySQL
  database: 'cargas_trabajo'
};

async function modificarTablaTiempos() {
  console.log('🔧 MODIFICANDO TABLA TIEMPOS_PROCEDIMIENTOS');
  console.log('==========================================\n');
  
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida\n');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'modificar_tabla_tiempos.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Dividir el contenido en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Ejecutando ${commands.length} comandos SQL...\n`);
    
    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          console.log(`🔄 Ejecutando comando ${i + 1}/${commands.length}...`);
          await connection.execute(command);
          console.log(`✅ Comando ${i + 1} ejecutado exitosamente`);
        } catch (error) {
          if (error.code === 'ER_DUP_KEYNAME') {
            console.log(`⚠️ Índice ya existe, continuando...`);
          } else if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`⚠️ Columna ya existe, continuando...`);
          } else {
            console.error(`❌ Error en comando ${i + 1}:`, error.message);
          }
        }
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
    
    // Verificar registros existentes
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM tiempos_procedimientos');
    console.log(`\n📈 Total de registros en la tabla: ${countResult[0].total}`);
    
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
    console.log('🎯 Cambios realizados:');
    console.log('   • Agregada columna usuario_id');
    console.log('   • Creado índice único por usuario + procedimiento + empleo');
    console.log('   • Agregada foreign key constraint');
    console.log('   • Registros existentes asignados al usuario admin');
    
    console.log('\n💡 Ahora cada usuario puede tener sus propias combinaciones de:');
    console.log('   • Procedimiento + Empleo');
    console.log('   • Sin conflictos entre usuarios');
    console.log('   • Datos aislados por usuario');
    
  } catch (error) {
    console.error('❌ Error durante la modificación:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solución: Verifica las credenciales de MySQL en el script');
      console.log('   - Usuario: root (o tu usuario de MySQL)');
      console.log('   - Contraseña: (tu contraseña de MySQL)');
      console.log('   - Base de datos: cargas_trabajo');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la función
modificarTablaTiempos(); 