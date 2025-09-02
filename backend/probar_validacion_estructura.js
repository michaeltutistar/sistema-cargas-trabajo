const mysql = require('mysql2/promise');

async function probarValidacion() {
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

    // Datos de prueba
    const procedimientoId = '35';
    const empleoId = '6';
    const usuarioId = '1';
    const estructuraId = '13f455ee-4e8d-4b1d-bba8-20c32a79c86a'; // ID de la estructura Arbelaez

    console.log('\n🔍 Probando validación con estructura_id...');
    console.log('Procedimiento ID:', procedimientoId);
    console.log('Empleo ID:', empleoId);
    console.log('Usuario ID:', usuarioId);
    console.log('Estructura ID:', estructuraId);

    // Verificar si existe la combinación con estructura_id
    const queryConEstructura = `
      SELECT id FROM tiempos_procedimientos 
      WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ? AND estructura_id = ?
    `;
    
    const [resultadoConEstructura] = await connection.execute(queryConEstructura, [
      procedimientoId, empleoId, usuarioId, estructuraId
    ]);

    console.log('\n📊 Resultado con estructura_id:');
    console.log('Registros encontrados:', resultadoConEstructura.length);
    console.log('Datos:', resultadoConEstructura);

    // Verificar si existe la combinación sin estructura_id (compatibilidad hacia atrás)
    const querySinEstructura = `
      SELECT id FROM tiempos_procedimientos 
      WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ? AND estructura_id IS NULL
    `;
    
    const [resultadoSinEstructura] = await connection.execute(querySinEstructura, [
      procedimientoId, empleoId, usuarioId
    ]);

    console.log('\n📊 Resultado sin estructura_id:');
    console.log('Registros encontrados:', resultadoSinEstructura.length);
    console.log('Datos:', resultadoSinEstructura);

    // Verificar todos los registros para este usuario
    const queryTodos = `
      SELECT id, procedimiento_id, empleo_id, estructura_id, fecha_creacion 
      FROM tiempos_procedimientos 
      WHERE usuario_id = ?
      ORDER BY fecha_creacion DESC
    `;
    
    const [todosLosRegistros] = await connection.execute(queryTodos, [usuarioId]);

    console.log('\n📊 Todos los registros del usuario:');
    console.log('Total de registros:', todosLosRegistros.length);
    todosLosRegistros.forEach(reg => {
      console.log(`- ID: ${reg.id}, Procedimiento: ${reg.procedimiento_id}, Empleo: ${reg.empleo_id}, Estructura: ${reg.estructura_id || 'NULL'}`);
    });

    // Verificar la estructura de la tabla
    console.log('\n🔍 Estructura actual de tiempos_procedimientos:');
    const [columns] = await connection.execute('DESCRIBE tiempos_procedimientos');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
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

probarValidacion(); 