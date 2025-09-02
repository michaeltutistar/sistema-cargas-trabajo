const mysql = require('mysql2/promise');

async function simularFrontend() {
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

    // Simular los datos que está enviando el frontend
    const datosSimulados = {
      procedimientoId: '35',
      empleoId: '6',
      estructuraId: '13f455ee-4e8d-4b1d-bba8-20c32a79c86a', // Estructura Arbelaez
      frecuenciaMensual: 10,
      tiempoMinimo: 5,
      tiempoPromedio: 10,
      tiempoMaximo: 15,
      observaciones: 'Prueba con estructura'
    };

    console.log('📊 Datos simulados del frontend:');
    console.log(datosSimulados);

    const usuarioId = '1';

    // Verificar si existe la combinación con estructura_id
    console.log('\n🔍 Verificando combinación existente...');
    const queryConEstructura = `
      SELECT id FROM tiempos_procedimientos 
      WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ? AND estructura_id = ?
    `;
    
    const [resultadoConEstructura] = await connection.execute(queryConEstructura, [
      datosSimulados.procedimientoId, 
      datosSimulados.empleoId, 
      usuarioId, 
      datosSimulados.estructuraId
    ]);

    console.log('📊 Resultado con estructura_id:');
    console.log('Registros encontrados:', resultadoConEstructura.length);
    console.log('Datos:', resultadoConEstructura);

    if (resultadoConEstructura.length > 0) {
      console.log('❌ Ya existe un registro con esta combinación en esta estructura');
      return;
    }

    // Verificar si existe la combinación sin estructura_id (compatibilidad hacia atrás)
    console.log('\n🔍 Verificando combinación sin estructura_id...');
    const querySinEstructura = `
      SELECT id FROM tiempos_procedimientos 
      WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ? AND estructura_id IS NULL
    `;
    
    const [resultadoSinEstructura] = await connection.execute(querySinEstructura, [
      datosSimulados.procedimientoId, 
      datosSimulados.empleoId, 
      usuarioId
    ]);

    console.log('📊 Resultado sin estructura_id:');
    console.log('Registros encontrados:', resultadoSinEstructura.length);
    console.log('Datos:', resultadoSinEstructura);

    if (resultadoSinEstructura.length > 0) {
      console.log('❌ Ya existe un registro con esta combinación sin estructura');
      return;
    }

    // Si no hay conflictos, proceder a insertar
    console.log('\n✅ No hay conflictos, procediendo a insertar...');
    
    const tiempoCalculadoPERT = ((datosSimulados.tiempoMinimo + 4 * datosSimulados.tiempoPromedio + datosSimulados.tiempoMaximo) / 6) * 1.07;
    
    const [resultado] = await connection.execute(`
      INSERT INTO tiempos_procedimientos (
        procedimiento_id, 
        empleo_id, 
        usuario_id,
        estructura_id,
        frecuencia_mensual, 
        tiempo_horas, 
        observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      datosSimulados.procedimientoId,
      datosSimulados.empleoId,
      usuarioId,
      datosSimulados.estructuraId,
      datosSimulados.frecuenciaMensual,
      tiempoCalculadoPERT,
      datosSimulados.observaciones
    ]);

    console.log('✅ Registro insertado exitosamente');
    console.log('ID del nuevo registro:', resultado.insertId);

    // Verificar el registro insertado
    const [registroInsertado] = await connection.execute(`
      SELECT * FROM tiempos_procedimientos WHERE id = ?
    `, [resultado.insertId]);

    console.log('\n📊 Registro insertado:');
    console.log(registroInsertado[0]);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

simularFrontend(); 