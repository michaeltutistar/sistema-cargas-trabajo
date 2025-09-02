const mysql = require('mysql2/promise');

async function verificarRegistro55() {
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

    // Verificar el registro 55 específicamente
    console.log('\n🔍 Verificando registro ID 55:');
    const [registro55] = await connection.execute(`
      SELECT * FROM tiempos_procedimientos WHERE id = 55
    `);

    if (registro55.length > 0) {
      console.log('📊 Registro 55 encontrado:');
      console.log(JSON.stringify(registro55[0], null, 2));
    } else {
      console.log('❌ Registro 55 no encontrado');
    }

    // Verificar todos los registros con procedimiento 35 y empleo 1
    console.log('\n🔍 Todos los registros con procedimiento 35 y empleo 1:');
    const [registros351] = await connection.execute(`
      SELECT * FROM tiempos_procedimientos 
      WHERE procedimiento_id = 35 AND empleo_id = 1
      ORDER BY fecha_creacion DESC
    `);

    console.log(`Total encontrados: ${registros351.length}`);
    registros351.forEach(reg => {
      console.log(`- ID: ${reg.id}, Usuario: ${reg.usuario_id}, Estructura: ${reg.estructura_id || 'NULL'}, Fecha: ${reg.fecha_creacion}`);
    });

    // Verificar todos los registros del usuario 1
    console.log('\n🔍 Todos los registros del usuario 1:');
    const [registrosUsuario1] = await connection.execute(`
      SELECT id, procedimiento_id, empleo_id, estructura_id, fecha_creacion
      FROM tiempos_procedimientos 
      WHERE usuario_id = '1'
      ORDER BY fecha_creacion DESC
    `);

    console.log(`Total del usuario 1: ${registrosUsuario1.length}`);
    registrosUsuario1.forEach(reg => {
      console.log(`- ID: ${reg.id}, P: ${reg.procedimiento_id}, E: ${reg.empleo_id}, Estructura: ${reg.estructura_id || 'NULL'}`);
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

verificarRegistro55(); 