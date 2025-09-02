const mysql = require('mysql2/promise');

async function monitorearGuardado() {
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
    console.log('👀 Monitoreando intentos de guardado...');
    console.log('📝 Ejecuta el frontend y intenta guardar un tiempo');
    console.log('🔍 Este script verificará los registros en tiempo real');

    // Función para verificar registros
    const verificarRegistros = async () => {
      const [registros] = await connection.execute(`
        SELECT 
          id, 
          procedimiento_id, 
          empleo_id, 
          estructura_id,
          usuario_id,
          fecha_creacion
        FROM tiempos_procedimientos 
        WHERE usuario_id = '1'
        ORDER BY fecha_creacion DESC
        LIMIT 10
      `);

      console.log(`\n📊 Registros actuales (${new Date().toLocaleTimeString()}):`);
      console.log(`Total: ${registros.length}`);
      
      if (registros.length > 0) {
        console.log('Últimos registros:');
        registros.slice(0, 3).forEach(reg => {
          console.log(`- ID: ${reg.id}, P: ${reg.procedimiento_id}, E: ${reg.empleo_id}, Estructura: ${reg.estructura_id || 'NULL'}, Fecha: ${reg.fecha_creacion}`);
        });
      }
    };

    // Verificar estado inicial
    await verificarRegistros();

    // Monitorear cada 5 segundos
    const intervalo = setInterval(async () => {
      try {
        await verificarRegistros();
      } catch (error) {
        console.error('❌ Error en monitoreo:', error);
      }
    }, 5000);

    // Detener después de 2 minutos
    setTimeout(() => {
      clearInterval(intervalo);
      console.log('\n⏰ Monitoreo terminado');
      connection.end();
    }, 120000);

  } catch (error) {
    console.error('❌ Error:', error);
    if (connection) {
      await connection.end();
    }
  }
}

monitorearGuardado(); 