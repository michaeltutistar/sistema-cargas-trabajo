import { db } from './mysql';

async function fixTables() {
  try {
    console.log('🔧 Corrigiendo estructura de tablas...\n');

    // Verificar y corregir la estructura de la tabla dependencias
    console.log('📝 Verificando tabla dependencias...');
    const [depsStructure] = await db.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cargas_trabajo' AND TABLE_NAME = 'dependencias'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Estructura actual de dependencias:');
    (depsStructure as any[]).forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE} ${col.COLUMN_DEFAULT} ${col.EXTRA}`);
    });

    // Verificar si la columna id tiene auto_increment
    const idColumn = (depsStructure as any[]).find(col => col.COLUMN_NAME === 'id');
    if (idColumn && !idColumn.EXTRA.includes('auto_increment')) {
      console.log('⚠️ La columna id no tiene auto_increment, corrigiendo...');
      
      // Recrear la tabla con auto_increment correcto
      await db.query('DROP TABLE IF EXISTS dependencias');
      await db.query(`
        CREATE TABLE dependencias (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre TEXT NOT NULL,
          descripcion TEXT DEFAULT NULL,
          activa TINYINT DEFAULT 1,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      console.log('✅ Tabla dependencias recreada con auto_increment');
    }

    // Verificar tabla procesos
    console.log('\n📝 Verificando tabla procesos...');
    const [procsStructure] = await db.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cargas_trabajo' AND TABLE_NAME = 'procesos'
      ORDER BY ORDINAL_POSITION
    `);
    
    const procIdColumn = (procsStructure as any[]).find(col => col.COLUMN_NAME === 'id');
    if (procIdColumn && !procIdColumn.EXTRA.includes('auto_increment')) {
      console.log('⚠️ La columna id de procesos no tiene auto_increment, corrigiendo...');
      
      await db.query('DROP TABLE IF EXISTS procesos');
      await db.query(`
        CREATE TABLE procesos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre TEXT NOT NULL,
          descripcion TEXT DEFAULT NULL,
          dependencia_id INT DEFAULT NULL,
          activo TINYINT DEFAULT 1,
          orden INT DEFAULT 0,
          FOREIGN KEY (dependencia_id) REFERENCES dependencias(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      console.log('✅ Tabla procesos recreada con auto_increment');
    }

    // Verificar tabla actividades
    console.log('\n📝 Verificando tabla actividades...');
    const [actsStructure] = await db.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cargas_trabajo' AND TABLE_NAME = 'actividades'
      ORDER BY ORDINAL_POSITION
    `);
    
    const actIdColumn = (actsStructure as any[]).find(col => col.COLUMN_NAME === 'id');
    if (actIdColumn && !actIdColumn.EXTRA.includes('auto_increment')) {
      console.log('⚠️ La columna id de actividades no tiene auto_increment, corrigiendo...');
      
      await db.query('DROP TABLE IF EXISTS actividades');
      await db.query(`
        CREATE TABLE actividades (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre TEXT NOT NULL,
          descripcion TEXT DEFAULT NULL,
          proceso_id INT DEFAULT NULL,
          activa TINYINT DEFAULT 1,
          orden INT DEFAULT 0,
          FOREIGN KEY (proceso_id) REFERENCES procesos(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      console.log('✅ Tabla actividades recreada con auto_increment');
    }

    // Verificar tabla procedimientos
    console.log('\n📝 Verificando tabla procedimientos...');
    const [procedimientosStructure] = await db.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cargas_trabajo' AND TABLE_NAME = 'procedimientos'
      ORDER BY ORDINAL_POSITION
    `);
    
    const procIdColumn2 = (procedimientosStructure as any[]).find(col => col.COLUMN_NAME === 'id');
    if (procIdColumn2 && !procIdColumn2.EXTRA.includes('auto_increment')) {
      console.log('⚠️ La columna id de procedimientos no tiene auto_increment, corrigiendo...');
      
      await db.query('DROP TABLE IF EXISTS procedimientos');
      await db.query(`
        CREATE TABLE procedimientos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre TEXT NOT NULL,
          descripcion TEXT DEFAULT NULL,
          actividad_id INT DEFAULT NULL,
          activo TINYINT DEFAULT 1,
          nivel_jerarquico VARCHAR(50) DEFAULT NULL,
          orden INT DEFAULT 0,
          FOREIGN KEY (actividad_id) REFERENCES actividades(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      console.log('✅ Tabla procedimientos recreada con auto_increment');
    }

    // Verificar tabla empleos
    console.log('\n📝 Verificando tabla empleos...');
    const [empleosStructure] = await db.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'cargas_trabajo' AND TABLE_NAME = 'empleos'
      ORDER BY ORDINAL_POSITION
    `);
    
    const empIdColumn = (empleosStructure as any[]).find(col => col.COLUMN_NAME === 'id');
    if (empIdColumn && !empIdColumn.EXTRA.includes('auto_increment')) {
      console.log('⚠️ La columna id de empleos no tiene auto_increment, corrigiendo...');
      
      await db.query('DROP TABLE IF EXISTS empleos');
      await db.query(`
        CREATE TABLE empleos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          codigo VARCHAR(50) DEFAULT NULL,
          nombre TEXT NOT NULL,
          nivel_jerarquico VARCHAR(50) DEFAULT NULL,
          denominacion TEXT DEFAULT NULL,
          grado INT DEFAULT NULL,
          activo TINYINT DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
      console.log('✅ Tabla empleos recreada con auto_increment');
    }

    console.log('\n✅ Verificación de tablas completada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en fix tables:', error);
    process.exit(1);
  }
}

fixTables(); 