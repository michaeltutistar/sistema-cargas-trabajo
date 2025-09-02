import { db } from './mysql';

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de tablas...\n');

    // Verificar estructura de tiempos_procedimientos
    console.log('📝 Estructura de tiempos_procedimientos:');
    const [tiemposStructure] = await db.query(`
      DESCRIBE tiempos_procedimientos
    `);
    
    (tiemposStructure as any[]).forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
    });

    // Verificar estructura de procedimientos
    console.log('\n📝 Estructura de procedimientos:');
    const [procedimientosStructure] = await db.query(`
      DESCRIBE procedimientos
    `);
    
    (procedimientosStructure as any[]).forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
    });

    // Verificar estructura de actividades
    console.log('\n📝 Estructura de actividades:');
    const [actividadesStructure] = await db.query(`
      DESCRIBE actividades
    `);
    
    (actividadesStructure as any[]).forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
    });

    // Verificar estructura de procesos
    console.log('\n📝 Estructura de procesos:');
    const [procesosStructure] = await db.query(`
      DESCRIBE procesos
    `);
    
    (procesosStructure as any[]).forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
    });

    // Verificar estructura de dependencias
    console.log('\n📝 Estructura de dependencias:');
    const [dependenciasStructure] = await db.query(`
      DESCRIBE dependencias
    `);
    
    (dependenciasStructure as any[]).forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
    });

    console.log('\n✅ Verificación de estructura completada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
    process.exit(1);
  }
}

checkTableStructure(); 