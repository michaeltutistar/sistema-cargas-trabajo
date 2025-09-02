import { db } from './mysql';

async function checkEmpleos() {
  try {
    console.log('🔍 Verificando empleos en detalle...\n');

    // Verificar estructura de empleos
    console.log('📝 Estructura de empleos:');
    const [empleosStructure] = await db.query(`
      DESCRIBE empleos
    `);
    
    (empleosStructure as any[]).forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
    });

    // Verificar empleos existentes
    console.log('\n📋 Empleos existentes:');
    const [empleos] = await db.query(`
      SELECT * FROM empleos ORDER BY id
    `);
    
    (empleos as any[]).forEach(emp => {
      console.log(`   - ID: ${emp.id}, Nombre: ${emp.nombre}, Nivel: ${emp.nivel_jerarquico}, Activo: ${emp.activo}`);
    });

    // Verificar si hay empleos activos
    console.log('\n📊 Empleos activos:');
    const [empleosActivos] = await db.query(`
      SELECT COUNT(*) as total FROM empleos WHERE activo = 1
    `);
    console.log(`   Total empleos activos: ${(empleosActivos as any[])[0]?.total || 0}`);

    console.log('\n✅ Verificación de empleos completada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error verificando empleos:', error);
    process.exit(1);
  }
}

checkEmpleos(); 