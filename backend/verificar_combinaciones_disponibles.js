const mysql = require('mysql2/promise');

async function verificarCombinacionesDisponibles() {
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

    // Verificar todas las estructuras disponibles
    console.log('\n🏗️ Estructuras disponibles:');
    const [estructuras] = await connection.execute('SELECT id, nombre FROM estructuras WHERE activa = 1');
    estructuras.forEach(est => {
      console.log(`- ID: ${est.id}, Nombre: ${est.nombre}`);
    });

    // Verificar todos los registros del usuario 1
    console.log('\n📊 Registros existentes del usuario 1:');
    const [registros] = await connection.execute(`
      SELECT 
        id, 
        procedimiento_id, 
        empleo_id, 
        estructura_id,
        fecha_creacion
      FROM tiempos_procedimientos 
      WHERE usuario_id = '1'
      ORDER BY fecha_creacion DESC
    `);

    console.log(`Total de registros: ${registros.length}`);
    registros.forEach(reg => {
      console.log(`- ID: ${reg.id}, Procedimiento: ${reg.procedimiento_id}, Empleo: ${reg.empleo_id}, Estructura: ${reg.estructura_id || 'NULL'}`);
    });

    // Mostrar combinaciones por estructura
    console.log('\n📋 Combinaciones por estructura:');
    const [combinacionesPorEstructura] = await connection.execute(`
      SELECT 
        estructura_id,
        GROUP_CONCAT(DISTINCT CONCAT('P:', procedimiento_id, '-E:', empleo_id) ORDER BY procedimiento_id, empleo_id) as combinaciones
      FROM tiempos_procedimientos 
      WHERE usuario_id = '1'
      GROUP BY estructura_id
      ORDER BY estructura_id
    `);

    combinacionesPorEstructura.forEach(combo => {
      const estructuraNombre = estructuras.find(e => e.id === combo.estructura_id)?.nombre || 'Sin estructura';
      console.log(`- Estructura: ${estructuraNombre} (${combo.estructura_id || 'NULL'})`);
      console.log(`  Combinaciones: ${combo.combinaciones}`);
    });

    // Mostrar sugerencias de combinaciones disponibles
    console.log('\n💡 Sugerencias para nuevas combinaciones:');
    console.log('Para la estructura Arbelaez (13f455ee-4e8d-4b1d-bba8-20c32a79c86a):');
    
    // Obtener combinaciones existentes para Arbelaez
    const [combinacionesArbelaez] = await connection.execute(`
      SELECT procedimiento_id, empleo_id
      FROM tiempos_procedimientos 
      WHERE usuario_id = '1' AND estructura_id = '13f455ee-4e8d-4b1d-bba8-20c32a79c86a'
    `);

    if (combinacionesArbelaez.length === 0) {
      console.log('✅ No hay registros en esta estructura. Puedes usar cualquier combinación.');
    } else {
      console.log('Combinaciones existentes:');
      combinacionesArbelaez.forEach(combo => {
        console.log(`  - Procedimiento ${combo.procedimiento_id} + Empleo ${combo.empleo_id}`);
      });
      console.log('\n💡 Sugerencias:');
      console.log('  - Usa un procedimiento diferente (no 35)');
      console.log('  - Usa un empleo diferente (no 6)');
      console.log('  - O usa la misma combinación en una estructura diferente');
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

verificarCombinacionesDisponibles(); 