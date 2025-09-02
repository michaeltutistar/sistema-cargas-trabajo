const mysql = require('mysql2/promise');

async function probarSistemaCompleto() {
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

    // Estado inicial
    console.log('\n📊 Estado inicial:');
    const [registrosIniciales] = await connection.execute(`
      SELECT COUNT(*) as total FROM tiempos_procedimientos WHERE usuario_id = '1'
    `);
    console.log(`Total de registros del usuario 1: ${registrosIniciales[0].total}`);

    // Simular guardado con estructura
    console.log('\n🧪 Probando guardado CON estructura:');
    const datosConEstructura = {
      procedimientoId: '35',
      empleoId: '6',
      estructuraId: '13f455ee-4e8d-4b1d-bba8-20c32a79c86a', // Arbelaez
      frecuenciaMensual: 10,
      tiempoMinimo: 5,
      tiempoPromedio: 10,
      tiempoMaximo: 15,
      observaciones: 'Prueba con estructura'
    };

    console.log('Datos a insertar:', datosConEstructura);

    // Verificar si existe conflicto con estructura
    const queryConEstructura = `
      SELECT id FROM tiempos_procedimientos 
      WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ? AND estructura_id = ?
    `;
    
    const [conflictoConEstructura] = await connection.execute(queryConEstructura, [
      datosConEstructura.procedimientoId, 
      datosConEstructura.empleoId, 
      '1', 
      datosConEstructura.estructuraId
    ]);

    console.log('Conflicto con estructura:', conflictoConEstructura.length > 0 ? 'SÍ' : 'NO');

    if (conflictoConEstructura.length === 0) {
      // Insertar con estructura
      const tiempoCalculadoPERT = ((datosConEstructura.tiempoMinimo + 4 * datosConEstructura.tiempoPromedio + datosConEstructura.tiempoMaximo) / 6) * 1.07;
      
      const [resultado] = await connection.execute(`
        INSERT INTO tiempos_procedimientos (
          procedimiento_id, empleo_id, usuario_id, estructura_id,
          frecuencia_mensual, tiempo_horas, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        datosConEstructura.procedimientoId,
        datosConEstructura.empleoId,
        '1',
        datosConEstructura.estructuraId,
        datosConEstructura.frecuenciaMensual,
        tiempoCalculadoPERT,
        datosConEstructura.observaciones
      ]);

      console.log('✅ Registro con estructura insertado exitosamente');
      console.log('ID del nuevo registro:', resultado.insertId);
    }

    // Simular guardado SIN estructura (debería fallar si existe conflicto)
    console.log('\n🧪 Probando guardado SIN estructura:');
    const datosSinEstructura = {
      procedimientoId: '35',
      empleoId: '1',
      estructuraId: undefined,
      frecuenciaMensual: 5,
      tiempoMinimo: 2,
      tiempoPromedio: 5,
      tiempoMaximo: 8,
      observaciones: 'Prueba sin estructura'
    };

    console.log('Datos a insertar:', datosSinEstructura);

    // Verificar si existe conflicto sin estructura
    const querySinEstructura = `
      SELECT id FROM tiempos_procedimientos 
      WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ? AND estructura_id IS NULL
    `;
    
    const [conflictoSinEstructura] = await connection.execute(querySinEstructura, [
      datosSinEstructura.procedimientoId, 
      datosSinEstructura.empleoId, 
      '1'
    ]);

    console.log('Conflicto sin estructura:', conflictoSinEstructura.length > 0 ? 'SÍ' : 'NO');

    if (conflictoSinEstructura.length === 0) {
      // Insertar sin estructura
      const tiempoCalculadoPERT = ((datosSinEstructura.tiempoMinimo + 4 * datosSinEstructura.tiempoPromedio + datosSinEstructura.tiempoMaximo) / 6) * 1.07;
      
      const [resultado] = await connection.execute(`
        INSERT INTO tiempos_procedimientos (
          procedimiento_id, empleo_id, usuario_id, estructura_id,
          frecuencia_mensual, tiempo_horas, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        datosSinEstructura.procedimientoId,
        datosSinEstructura.empleoId,
        '1',
        null,
        datosSinEstructura.frecuenciaMensual,
        tiempoCalculadoPERT,
        datosSinEstructura.observaciones
      ]);

      console.log('✅ Registro sin estructura insertado exitosamente');
      console.log('ID del nuevo registro:', resultado.insertId);
    } else {
      console.log('❌ No se puede insertar: ya existe un registro con esta combinación sin estructura');
    }

    // Estado final
    console.log('\n📊 Estado final:');
    const [registrosFinales] = await connection.execute(`
      SELECT id, procedimiento_id, empleo_id, estructura_id, fecha_creacion
      FROM tiempos_procedimientos 
      WHERE usuario_id = '1'
      ORDER BY fecha_creacion DESC
      LIMIT 5
    `);

    console.log('Últimos registros:');
    registrosFinales.forEach(reg => {
      console.log(`- ID: ${reg.id}, P: ${reg.procedimiento_id}, E: ${reg.empleo_id}, Estructura: ${reg.estructura_id || 'NULL'}`);
    });

    console.log('\n🎉 Prueba completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

probarSistemaCompleto(); 