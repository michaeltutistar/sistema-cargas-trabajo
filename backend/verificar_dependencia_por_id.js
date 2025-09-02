const mysql = require('mysql2/promise');

async function verificarDependenciaPorId() {
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

    // El ID que se está usando es un UUID, pero las dependencias tienen IDs numéricos
    const dependenciaIdUUID = 'faeff1cb-1bea-4a0f-becf-76323425c6f9';

    // Verificar si existe en elementos_estructura
    console.log('\n🔍 Verificando en elementos_estructura:');
    const [elementoEstructura] = await connection.execute(`
      SELECT * FROM elementos_estructura 
      WHERE elemento_id = ? AND tipo = 'dependencia'
    `, [dependenciaIdUUID]);

    if (elementoEstructura.length > 0) {
      console.log('✅ Encontrado en elementos_estructura:');
      console.log(JSON.stringify(elementoEstructura[0], null, 2));
    } else {
      console.log('❌ NO encontrado en elementos_estructura');
    }

    // Verificar si existe en dependencias (buscando por ID numérico)
    console.log('\n🔍 Verificando en tabla dependencias (buscando por ID numérico):');
    const [dependencias] = await connection.execute(`
      SELECT * FROM dependencias 
      WHERE id = ? AND activa = 1
    `, [dependenciaIdUUID]);

    if (dependencias.length > 0) {
      console.log('✅ Encontrado en dependencias:');
      console.log(JSON.stringify(dependencias[0], null, 2));
    } else {
      console.log('❌ NO encontrado en dependencias');
    }

    // Verificar todas las dependencias para ver si hay alguna con ese nombre
    console.log('\n🔍 Verificando todas las dependencias:');
    const [todasDependencias] = await connection.execute(`
      SELECT id, nombre, activa, fecha_creacion 
      FROM dependencias 
      ORDER BY fecha_creacion DESC
    `);

    console.log(`Total de dependencias: ${todasDependencias.length}`);
    todasDependencias.forEach(dep => {
      console.log(`- ID: ${dep.id}, Nombre: ${dep.nombre}, Activa: ${dep.activa}, Fecha: ${dep.fecha_creacion}`);
    });

    // Verificar elementos de estructura de tipo dependencia
    console.log('\n🔍 Verificando elementos de estructura tipo dependencia:');
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

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

verificarDependenciaPorId(); 