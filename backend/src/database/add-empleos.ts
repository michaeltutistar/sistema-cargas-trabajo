import { db } from './mysql';

async function addEmpleos() {
  try {
    console.log('📝 Agregando empleos faltantes...\n');

    // Verificar empleos existentes
    const [existingEmpleos] = await db.query('SELECT * FROM empleos');
    console.log(`📋 Empleos existentes: ${(existingEmpleos as any[]).length}`);
    
    if ((existingEmpleos as any[]).length > 0) {
      console.log('Empleos actuales:');
      (existingEmpleos as any[]).forEach(emp => {
        console.log(`   - ID: ${emp.id}, Nombre: ${emp.nombre}, Nivel: ${emp.nivel_jerarquico}`);
      });
    }

    // Empleos a agregar (incluyendo Contratista)
    const empleos = [
      { codigo: 'DIR-001', nombre: 'Director General', nivel_jerarquico: 'DIRECTIVO', denominacion: 'Director General', grado: 24 },
      { codigo: 'PRO-001', nombre: 'Profesional Especializado', nivel_jerarquico: 'PROFESIONAL', denominacion: 'Profesional Especializado', grado: 16 },
      { codigo: 'TEC-001', nombre: 'Técnico Especializado', nivel_jerarquico: 'TECNICO', denominacion: 'Técnico Especializado', grado: 10 },
      { codigo: 'ASI-001', nombre: 'Asistente Administrativo', nivel_jerarquico: 'ASISTENCIAL', denominacion: 'Asistente Administrativo', grado: 6 },
      { codigo: 'CON-001', nombre: 'Contratista', nivel_jerarquico: 'CONTRATISTA', denominacion: 'Contratista', grado: 0 }
    ];

    console.log('\n📝 Insertando empleos...');
    for (const empleo of empleos) {
      try {
        const [result] = await db.query(`
          INSERT INTO empleos (codigo, nombre, nivel_jerarquico, denominacion, grado, activo)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [empleo.codigo, empleo.nombre, empleo.nivel_jerarquico, empleo.denominacion, empleo.grado, 1]);
        
        console.log(`✅ Empleo creado: ${empleo.nombre} con ID: ${(result as any).insertId}`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Empleo ya existe: ${empleo.nombre}`);
        } else {
          console.error(`❌ Error creando empleo ${empleo.nombre}:`, error.message);
        }
      }
    }

    // Verificar empleos finales
    const [finalEmpleos] = await db.query('SELECT * FROM empleos ORDER BY id');
    console.log('\n📋 Empleos finales:');
    (finalEmpleos as any[]).forEach(emp => {
      console.log(`   - ID: ${emp.id}, Nombre: ${emp.nombre}, Nivel: ${emp.nivel_jerarquico}`);
    });

    console.log('\n✅ Script completado');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en add empleos:', error);
    process.exit(1);
  }
}

addEmpleos(); 