const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'cargas_trabajo'
};

async function verificarCombinacionesUsuario() {
  console.log('🔍 VERIFICANDO COMBINACIONES DEL USUARIO DE TIEMPOS');
  console.log('==================================================');

  let connection;
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida');

    // Obtener el usuario de tiempos
    console.log('\n📋 Obteniendo usuario de tiempos...');
    const [usuarios] = await connection.execute(
      'SELECT id, nombre, apellido, email, rol FROM usuarios WHERE email = ?',
      ['tiempos@cargas-trabajo.gov.co']
    );

    if (usuarios.length === 0) {
      console.log('❌ Usuario de tiempos no encontrado');
      return;
    }

    const usuario = usuarios[0];
    console.log(`✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido} (${usuario.email})`);
    console.log(`   ID: ${usuario.id}`);

    // Obtener todas las combinaciones del usuario
    console.log('\n📋 Combinaciones registradas por el usuario:');
    const [combinaciones] = await connection.execute(`
      SELECT 
        t.id,
        t.procedimiento_id,
        t.empleo_id,
        t.tiempo_horas,
        t.frecuencia_mensual,
        t.observaciones,
        t.fecha_creacion,
        p.nombre as procedimiento_nombre,
        e.nombre as empleo_nombre
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.usuario_id = ?
      ORDER BY t.fecha_creacion DESC
    `, [usuario.id]);

    if (combinaciones.length === 0) {
      console.log('📊 El usuario no tiene combinaciones registradas');
    } else {
      console.log(`📊 Total de combinaciones: ${combinaciones.length}`);
      
      combinaciones.forEach((combinacion, index) => {
        console.log(`\n   ${index + 1}. Combinación ID: ${combinacion.id}`);
        console.log(`      Procedimiento: ${combinacion.procedimiento_nombre} (ID: ${combinacion.procedimiento_id})`);
        console.log(`      Empleo: ${combinacion.empleo_nombre} (ID: ${combinacion.empleo_id})`);
        console.log(`      Tiempo: ${combinacion.tiempo_horas} horas`);
        console.log(`      Frecuencia: ${combinacion.frecuencia_mensual} veces/mes`);
        console.log(`      Observaciones: ${combinacion.observaciones || 'Sin observaciones'}`);
        console.log(`      Fecha: ${combinacion.fecha_creacion}`);
      });
    }

    // Obtener todas las combinaciones disponibles (procedimientos y empleos)
    console.log('\n📋 Combinaciones disponibles para registrar:');
    const [procedimientos] = await connection.execute(
      'SELECT id, nombre FROM procedimientos WHERE activo = 1 ORDER BY nombre'
    );

    const [empleos] = await connection.execute(
      'SELECT id, nombre FROM empleos WHERE activo = 1 ORDER BY nombre'
    );

    console.log(`📊 Procedimientos disponibles: ${procedimientos.length}`);
    console.log(`📊 Empleos disponibles: ${empleos.length}`);

    // Mostrar algunas combinaciones disponibles
    console.log('\n📋 Ejemplos de combinaciones disponibles:');
    let contador = 0;
    for (let i = 0; i < Math.min(procedimientos.length, 3); i++) {
      for (let j = 0; j < Math.min(empleos.length, 3); j++) {
        const procedimiento = procedimientos[i];
        const empleo = empleos[j];
        
        // Verificar si esta combinación ya existe para el usuario
        const [existe] = await connection.execute(
          'SELECT id FROM tiempos_procedimientos WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ?',
          [procedimiento.id, empleo.id, usuario.id]
        );

        const estado = existe.length > 0 ? '❌ YA REGISTRADA' : '✅ DISPONIBLE';
        
        console.log(`   ${contador + 1}. ${estado} - ${procedimiento.nombre} + ${empleo.nombre}`);
        contador++;
        
        if (contador >= 10) break; // Limitar a 10 ejemplos
      }
      if (contador >= 10) break;
    }

    // Buscar combinaciones disponibles específicamente
    console.log('\n📋 Combinaciones realmente disponibles (no registradas):');
    const combinacionesDisponibles = [];
    
    for (const procedimiento of procedimientos) {
      for (const empleo of empleos) {
        const [existe] = await connection.execute(
          'SELECT id FROM tiempos_procedimientos WHERE procedimiento_id = ? AND empleo_id = ? AND usuario_id = ?',
          [procedimiento.id, empleo.id, usuario.id]
        );

        if (existe.length === 0) {
          combinacionesDisponibles.push({
            procedimiento: procedimiento,
            empleo: empleo
          });
        }
      }
    }

    console.log(`📊 Combinaciones disponibles: ${combinacionesDisponibles.length}`);
    
    // Mostrar las primeras 5 combinaciones disponibles
    combinacionesDisponibles.slice(0, 5).forEach((combinacion, index) => {
      console.log(`   ${index + 1}. ${combinacion.procedimiento.nombre} + ${combinacion.empleo.nombre}`);
    });

    if (combinacionesDisponibles.length === 0) {
      console.log('❌ No hay combinaciones disponibles. El usuario ya registró todas las combinaciones posibles.');
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión a MySQL cerrada');
    }
  }
}

// Ejecutar la verificación
verificarCombinacionesUsuario().catch(console.error); 