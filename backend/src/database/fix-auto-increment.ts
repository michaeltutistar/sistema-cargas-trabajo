import { db } from './mysql';

async function fixAutoIncrement() {
  try {
    console.log('🔧 Agregando auto_increment a las columnas id...\n');

    // Limpiar datos existentes primero
    console.log('🧹 Limpiando datos existentes...');
    await db.query('DELETE FROM tiempos_procedimientos');
    await db.query('DELETE FROM procedimientos');
    await db.query('DELETE FROM actividades');
    await db.query('DELETE FROM procesos');
    await db.query('DELETE FROM dependencias');
    await db.query('DELETE FROM empleos');
    console.log('✅ Datos limpiados\n');

    // Modificar columnas para agregar auto_increment
    console.log('📝 Modificando columnas id...');
    
    try {
      await db.query('ALTER TABLE dependencias MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY');
      console.log('✅ dependencias.id modificado');
    } catch (e) {
      console.log('⚠️ dependencias.id ya tiene auto_increment');
    }

    try {
      await db.query('ALTER TABLE procesos MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY');
      console.log('✅ procesos.id modificado');
    } catch (e) {
      console.log('⚠️ procesos.id ya tiene auto_increment');
    }

    try {
      await db.query('ALTER TABLE actividades MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY');
      console.log('✅ actividades.id modificado');
    } catch (e) {
      console.log('⚠️ actividades.id ya tiene auto_increment');
    }

    try {
      await db.query('ALTER TABLE procedimientos MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY');
      console.log('✅ procedimientos.id modificado');
    } catch (e) {
      console.log('⚠️ procedimientos.id ya tiene auto_increment');
    }

    try {
      await db.query('ALTER TABLE empleos MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY');
      console.log('✅ empleos.id modificado');
    } catch (e) {
      console.log('⚠️ empleos.id ya tiene auto_increment');
    }

    console.log('\n✅ Auto_increment configurado correctamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en fix auto_increment:', error);
    process.exit(1);
  }
}

fixAutoIncrement(); 