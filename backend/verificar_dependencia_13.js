const mysql = require('mysql2/promise');

async function verificarDependencia13() {
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

    // Verificar la dependencia con ID 13
    console.log('\n🔍 Verificando dependencia con ID 13:');
    const [dependencia13] = await connection.execute(`
      SELECT * FROM dependencias WHERE id = 13
    `);

    if (dependencia13.length > 0) {
      console.log('✅ Dependencia 13 encontrada:');
      console.log(JSON.stringify(dependencia13[0], null, 2));
    } else {
      console.log('❌ Dependencia 13 NO encontrada');
    }

    // Verificar si está activa
    const [dependenciaActiva] = await connection.execute(`
      SELECT * FROM dependencias WHERE id = 13 AND activa = 1
    `);

    if (dependenciaActiva.length > 0) {
      console.log('✅ Dependencia 13 está activa');
    } else {
      console.log('❌ Dependencia 13 NO está activa');
    }

    // Simular la creación de un proceso
    console.log('\n🧪 Simulando creación de proceso para dependencia 13:');
    const datosProceso = {
      nombre: 'Proceso1',
      dependenciaId: '13',
      orden: 1
    };

    console.log('Datos del proceso:', datosProceso);

    // Verificar si la dependencia existe (como lo hace el backend)
    const [dependenciaExiste] = await connection.execute(`
      SELECT id FROM dependencias WHERE id = ? AND activa = 1
    `, [datosProceso.dependenciaId]);

    console.log('Dependencia existe:', dependenciaExiste.length > 0 ? 'SÍ' : 'NO');

    if (dependenciaExiste.length > 0) {
      console.log('✅ La dependencia existe y está activa, se puede crear el proceso');
    } else {
      console.log('❌ La dependencia no existe o no está activa');
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

verificarDependencia13(); 