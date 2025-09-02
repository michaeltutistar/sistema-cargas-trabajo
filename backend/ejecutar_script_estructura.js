const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'agregar_estructura_id_tiempos.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Contenido del script SQL:');
    console.log(sqlContent);
    
    // Dividir el script en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('Verificar') && !cmd.startsWith('Mostrar'));

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