const mysql = require('mysql2/promise');

async function verificarElementoEstructura() {
  let connection;
  
  try {
    // Configuración de la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cargas_trabajo'
    });

    console.log('🔍 VERIFICANDO ELEMENTO DE ESTRUCTURA');
    console.log('=====================================');
    console.log('✅ Conexión a MySQL establecida\n');

    const elementoId = '79c03057-26b6-40d5-a2a1-3ec7ec3ceb53';

    // Verificar el elemento de estructura específico
    const [rows] = await connection.execute(`
      SELECT * FROM elementos_estructura WHERE id = ?
    `, [elementoId]);

    console.log(`🔍 Buscando elemento de estructura con ID: ${elementoId}`);
    
    if (rows.length === 0) {
      console.log('❌ No se encontró el elemento de estructura');
    } else {
      console.log('✅ Elemento de estructura encontrado:');
      const elem = rows[0];
      console.log(`   - ID: ${elem.id}`);
      console.log(`   - Estructura ID: ${elem.estructura_id}`);
      console.log(`   - Tipo: ${elem.tipo}`);
      console.log(`   - Elemento ID: ${elem.elemento_id}`);
      console.log(`   - Padre ID: ${elem.padre_id}`);
      console.log(`   - Orden: ${elem.orden}`);
      console.log(`   - Activo: ${elem.activo}`);
      
      // Verificar si el elemento_id existe en la tabla correspondiente
      if (elem.tipo === 'proceso') {
        const [procesos] = await connection.execute(`
          SELECT id, nombre FROM procesos WHERE id = ?
        `, [elem.elemento_id]);
        
        if (procesos.length === 0) {
          console.log(`❌ El proceso con ID ${elem.elemento_id} NO existe en la tabla procesos`);
        } else {
          console.log(`✅ El proceso con ID ${elem.elemento_id} existe: "${procesos[0].nombre}"`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

verificarElementoEstructura(); 