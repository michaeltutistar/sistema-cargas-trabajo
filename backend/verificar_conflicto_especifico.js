const mysql = require('mysql2/promise');

async function verificarConflicto() {
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

    // Verificar todos los registros para el usuario 1
    console.log('\n🔍 Todos los registros del usuario 1:');
    const [registrosUsuario] = await connection.execute(`
      SELECT 
        id, 
        procedimiento_id, 
        empleo_id, 
        estructura_id,
        fecha_creacion,
        tiempo_horas
      FROM tiempos_procedimientos 
      WHERE usuario_id = '1'
      ORDER BY fecha_creacion DESC
    `);

    console.log(`Total de registros: ${registrosUsuario.length}`);
    registrosUsuario.forEach(reg => {
      console.log(`- ID: ${reg.id}, Procedimiento: ${reg.procedimiento_id}, Empleo: ${reg.empleo_id}, Estructura: ${reg.estructura_id || 'NULL'}, Fecha: ${reg.fecha_creacion}`);
    });

    // Verificar específicamente el procedimiento 35 y empleo 6
    console.log('\n🔍 Registros específicos para procedimiento 35 y empleo 6:');
    const [registrosEspecificos] = await connection.execute(`
      SELECT 
        id, 
        procedimiento_id, 
        empleo_id, 
        estructura_id,
        usuario_id,
        fecha_creacion
      FROM tiempos_procedimientos 
      WHERE procedimiento_id = 35 AND empleo_id = 6
      ORDER BY fecha_creacion DESC
    `);

    console.log(`Registros encontrados: ${registrosEspecificos.length}`);
    registrosEspecificos.forEach(reg => {
      console.log(`- ID: ${reg.id}, Usuario: ${reg.usuario_id}, Estructura: ${reg.estructura_id || 'NULL'}, Fecha: ${reg.fecha_creacion}`);
    });

    // Verificar registros por estructura
    console.log('\n🔍 Registros agrupados por estructura:');
    const [registrosPorEstructura] = await connection.execute(`
      SELECT 
        estructura_id,
        COUNT(*) as total,
        GROUP_CONCAT(CONCAT('P:', procedimiento_id, '-E:', empleo_id) ORDER BY fecha_creacion DESC) as combinaciones
      FROM tiempos_procedimientos 
      WHERE usuario_id = '1'
      GROUP BY estructura_id
      ORDER BY estructura_id
    `);

    registrosPorEstructura.forEach(reg => {
      console.log(`- Estructura: ${reg.estructura_id || 'NULL'}, Total: ${reg.total}, Combinaciones: ${reg.combinaciones}`);
    });

    // Verificar si hay duplicados exactos
    console.log('\n🔍 Verificando duplicados exactos:');
    const [duplicados] = await connection.execute(`
      SELECT 
        procedimiento_id,
        empleo_id,
        estructura_id,
        COUNT(*) as total
      FROM tiempos_procedimientos 
      WHERE usuario_id = '1'
      GROUP BY procedimiento_id, empleo_id, estructura_id
      HAVING COUNT(*) > 1
    `);

    if (duplicados.length > 0) {
      console.log('⚠️ Duplicados encontrados:');
      duplicados.forEach(dup => {
        console.log(`- Procedimiento: ${dup.procedimiento_id}, Empleo: ${dup.empleo_id}, Estructura: ${dup.estructura_id || 'NULL'}, Total: ${dup.total}`);
      });
    } else {
      console.log('✅ No hay duplicados exactos');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

verificarConflicto(); 