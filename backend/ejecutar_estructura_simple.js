const mysql = require('mysql2/promise');

async function ejecutarScript() {
  let connection;
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    
    // Configuración de la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cargas_trabajo'
    });

    console.log('✅ Conexión establecida');

    // Comandos SQL a ejecutar
    const commands = [
      "ALTER TABLE `tiempos_procedimientos` ADD COLUMN `estructura_id` varchar(36) DEFAULT NULL AFTER `empleo_id`",
      "ALTER TABLE `tiempos_procedimientos` ADD INDEX `idx_estructura_id` (`estructura_id`)",
      "ALTER TABLE `tiempos_procedimientos` ADD UNIQUE INDEX `idx_estructura_usuario_procedimiento_empleo` (`estructura_id`, `usuario_id`, `procedimiento_id`, `empleo_id`)",
      "ALTER TABLE `tiempos_procedimientos` ADD CONSTRAINT `fk_tiempos_estructura` FOREIGN KEY (`estructura_id`) REFERENCES `estructuras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE"
    ];

    console.log(`🔧 Ejecutando ${commands.length} comandos...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`\n📝 Ejecutando comando ${i + 1}/${commands.length}:`);
      console.log(command);
      
      try {
        await connection.execute(command);
        console.log(`✅ Comando ${i + 1} ejecutado exitosamente`);
      } catch (error) {
        console.log(`❌ Error en comando ${i + 1}:`, error.message);
        
        // Si es un error de columna ya existe, continuar
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️ La columna ya existe, continuando...');
        } else if (error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️ El índice ya existe, continuando...');
        } else if (error.code === 'ER_DUP_KEY') {
          console.log('⚠️ La constraint ya existe, continuando...');
        } else {
          throw error;
        }
      }
    }

    // Verificar que la columna se agregó correctamente
    console.log('\n🔍 Verificando que la columna estructura_id existe...');
    const [columns] = await connection.execute('DESCRIBE tiempos_procedimientos');
    
    const estructuraColumn = columns.find(col => col.Field === 'estructura_id');
    if (estructuraColumn) {
      console.log('✅ Columna estructura_id encontrada:');
      console.log(estructuraColumn);
    } else {
      console.log('❌ Columna estructura_id NO encontrada');
    }

    // Verificar índices
    console.log('\n🔍 Verificando índices...');
    const [indexes] = await connection.execute('SHOW INDEX FROM tiempos_procedimientos');
    console.log('Índices encontrados:');
    indexes.forEach(index => {
      console.log(`- ${index.Key_name}: ${index.Column_name}`);
    });

    console.log('\n🎉 Script ejecutado completamente');

  } catch (error) {
    console.error('❌ Error ejecutando script:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

ejecutarScript(); 