const mysql = require('mysql2/promise');

async function verificarDependenciaEstructura() {
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

    const dependenciaId = 'faeff1cb-1bea-4a0f-becf-76323425c6f9';

    // Verificar si la dependencia existe en la tabla dependencias
    console.log('\n🔍 Verificando dependencia en tabla dependencias:');
    const [dependencia] = await connection.execute(`
      SELECT * FROM dependencias WHERE id = ?
    `, [dependenciaId]);

    if (dependencia.length > 0) {
      console.log('✅ Dependencia encontrada en tabla dependencias:');
      console.log(JSON.stringify(dependencia[0], null, 2));
    } else {
      console.log('❌ Dependencia NO encontrada en tabla dependencias');
    }

    // Verificar si la dependencia está en elementos_estructura
    console.log('\n🔍 Verificando dependencia en elementos_estructura:');
    const [elementoEstructura] = await connection.execute(`
      SELECT * FROM elementos_estructura WHERE elemento_id = ? AND tipo = 'dependencia'
    `, [dependenciaId]);

    if (elementoEstructura.length > 0) {
      console.log('✅ Dependencia encontrada en elementos_estructura:');
      console.log(JSON.stringify(elementoEstructura[0], null, 2));
    } else {
      console.log('❌ Dependencia NO encontrada en elementos_estructura');
    }

    // Verificar todas las dependencias activas
    console.log('\n🔍 Todas las dependencias activas:');
    const [dependenciasActivas] = await connection.execute(`
      SELECT id, nombre, activa FROM dependencias WHERE activa = 1
    `);

    console.log(`Total de dependencias activas: ${dependenciasActivas.length}`);
    dependenciasActivas.forEach(dep => {
      console.log(`- ID: ${dep.id}, Nombre: ${dep.nombre}, Activa: ${dep.activa}`);
    });

    // Verificar elementos de estructura de tipo dependencia
    console.log('\n🔍 Elementos de estructura tipo dependencia:');
    const [elementosDependencia] = await connection.execute(`
      SELECT ee.*, d.nombre as dependencia_nombre, d.activa as dependencia_activa
      FROM elementos_estructura ee
      LEFT JOIN dependencias d ON ee.elemento_id = d.id
      WHERE ee.tipo = 'dependencia'
      ORDER BY ee.fecha_creacion DESC
    `);

    console.log(`Total de elementos dependencia: ${elementosDependencia.length}`);
    elementosDependencia.forEach(elem => {
      console.log(`- ID: ${elem.id}, Elemento ID: ${elem.elemento_id}, Estructura: ${elem.estructura_id}, Nombre: ${elem.dependencia_nombre}, Activa: ${elem.dependencia_activa}`);
    });

    // Verificar la estructura específica
    console.log('\n🔍 Verificando estructuras disponibles:');
    const [estructuras] = await connection.execute(`
      SELECT id, nombre, activa FROM estructuras WHERE activa = 1
    `);

    console.log(`Total de estructuras activas: ${estructuras.length}`);
    estructuras.forEach(est => {
      console.log(`- ID: ${est.id}, Nombre: ${est.nombre}, Activa: ${est.activa}`);
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

verificarDependenciaEstructura(); 