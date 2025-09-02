const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cargas_trabajo'
};

async function debugUltimoRegistro() {
  console.log('🔍 DEBUGGEANDO ÚLTIMO REGISTRO');
  console.log('==============================');

  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida');

    // Obtener el último registro (ID 48 según la imagen)
    console.log('\n📋 Último registro (ID 48):');
    const [ultimoRegistro] = await connection.execute(
      'SELECT * FROM tiempos_procedimientos WHERE id = 48'
    );

    if (ultimoRegistro.length > 0) {
      const registro = ultimoRegistro[0];
      console.log('✅ Registro encontrado:');
      console.log(`   ID: ${registro.id}`);
      console.log(`   Procedimiento ID: ${registro.procedimiento_id}`);
      console.log(`   Empleo ID: ${registro.empleo_id}`);
      console.log(`   Usuario ID: ${registro.usuario_id}`);
      console.log(`   Tiempo horas: ${registro.tiempo_horas}`);
      console.log(`   Frecuencia mensual: ${registro.frecuencia_mensual}`);
      console.log(`   Fecha creación: ${registro.fecha_creacion}`);
    } else {
      console.log('❌ Registro ID 48 no encontrado');
    }

    // Verificar si hay duplicados para esta combinación específica
    console.log('\n📋 Verificando duplicados para la combinación del último registro:');
    const [duplicados] = await connection.execute(
      'SELECT id, usuario_id, tiempo_horas, fecha_creacion FROM tiempos_procedimientos WHERE procedimiento_id = 5 AND empleo_id = 2 ORDER BY fecha_creacion DESC'
    );

    console.log(`📊 Registros con procedimiento_id=5 y empleo_id=2: ${duplicados.length}`);
    duplicados.forEach((dup, index) => {
      console.log(`   ${index + 1}. ID: ${dup.id}, Usuario: ${dup.usuario_id}, Tiempo: ${dup.tiempo_horas}h, Fecha: ${dup.fecha_creacion}`);
    });

    // Verificar el índice único
    console.log('\n📋 Verificando índices únicos:');
    const [indices] = await connection.execute(
      'SHOW INDEX FROM tiempos_procedimientos WHERE Non_unique = 0'
    );

    console.log('📊 Índices únicos encontrados:');
    indices.forEach((idx, index) => {
      console.log(`   ${index + 1}. ${idx.Key_name} - Columnas: ${idx.Column_name}`);
    });

    // Verificar si hay conflictos con el índice único
    console.log('\n📋 Verificando conflictos con índice único:');
    const [conflictos] = await connection.execute(`
      SELECT 
        procedimiento_id, 
        empleo_id, 
        usuario_id,
        COUNT(*) as total
      FROM tiempos_procedimientos 
      GROUP BY procedimiento_id, empleo_id, usuario_id 
      HAVING COUNT(*) > 1
      ORDER BY total DESC
    `);

    if (conflictos.length > 0) {
      console.log('❌ CONFLICTOS ENCONTRADOS:');
      conflictos.forEach((conflicto, index) => {
        console.log(`   ${index + 1}. Procedimiento: ${conflicto.procedimiento_id}, Empleo: ${conflicto.empleo_id}, Usuario: ${conflicto.usuario_id}, Total: ${conflicto.total}`);
      });
    } else {
      console.log('✅ No hay conflictos con el índice único');
    }

    // Verificar todos los registros del usuario de tiempos
    console.log('\n📋 Todos los registros del usuario de tiempos:');
    const [registrosUsuario] = await connection.execute(`
      SELECT 
        id,
        procedimiento_id,
        empleo_id,
        tiempo_horas,
        frecuencia_mensual,
        fecha_creacion
      FROM tiempos_procedimientos 
      WHERE usuario_id = 'user_1755225276718'
      ORDER BY fecha_creacion DESC
    `);

    console.log(`📊 Total registros del usuario: ${registrosUsuario.length}`);
    registrosUsuario.forEach((reg, index) => {
      console.log(`   ${index + 1}. ID: ${reg.id}, P: ${reg.procedimiento_id}, E: ${reg.empleo_id}, T: ${reg.tiempo_horas}h, F: ${reg.frecuencia_mensual}/mes`);
    });

    // Verificar si hay algún problema con la validación
    console.log('\n📋 Verificando validación para el último registro:');
    const [validacion] = await connection.execute(
      'SELECT id FROM tiempos_procedimientos WHERE procedimiento_id = 5 AND empleo_id = 2 AND usuario_id = ? AND id != 48',
      ['user_1755225276718']
    );

    if (validacion.length > 0) {
      console.log('❌ PROBLEMA ENCONTRADO:');
      console.log('   El usuario ya tenía un registro con esta combinación antes del ID 48');
      validacion.forEach((val, index) => {
        console.log(`   ${index + 1}. ID existente: ${val.id}`);
      });
    } else {
      console.log('✅ No hay registros previos con esta combinación para este usuario');
    }

  } catch (error) {
    console.error('❌ Error durante el debug:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar el debug
debugUltimoRegistro().catch(console.error); 