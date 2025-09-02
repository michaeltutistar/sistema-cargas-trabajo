import { db } from './mysql';

async function fixIds() {
  try {
    console.log('🔧 Corrigiendo IDs en la base de datos...\n');

    // Limpiar todas las tablas
    console.log('🧹 Limpiando tablas...');
    await db.query('DELETE FROM tiempos_procedimientos');
    await db.query('DELETE FROM procedimientos');
    await db.query('DELETE FROM actividades');
    await db.query('DELETE FROM procesos');
    await db.query('DELETE FROM dependencias');
    await db.query('DELETE FROM empleos');
    
    // Resetear auto-increment
    await db.query('ALTER TABLE dependencias AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE procesos AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE actividades AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE procedimientos AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE empleos AUTO_INCREMENT = 1');
    
    console.log('✅ Tablas limpiadas y auto-increment reseteado\n');

    // Crear dependencia
    console.log('📝 Creando dependencia...');
    const [depResult] = await db.query(`
      INSERT INTO dependencias (nombre, descripcion, activa)
      VALUES (?, ?, ?)
    `, ['Dirección General', 'Dependencia principal', 1]);
    const dependenciaId = (depResult as any).insertId;
    console.log(`✅ Dependencia creada con ID: ${dependenciaId}`);

    // Crear proceso
    console.log('📝 Creando proceso...');
    const [procResult] = await db.query(`
      INSERT INTO procesos (nombre, descripcion, dependencia_id, activo, orden)
      VALUES (?, ?, ?, ?, ?)
    `, ['Proceso Estratégico', 'Proceso de planificación estratégica', dependenciaId, 1, 1]);
    const procesoId = (procResult as any).insertId;
    console.log(`✅ Proceso creado con ID: ${procesoId}`);

    // Crear actividad
    console.log('📝 Creando actividad...');
    const [actResult] = await db.query(`
      INSERT INTO actividades (nombre, descripcion, proceso_id, activa, orden)
      VALUES (?, ?, ?, ?, ?)
    `, ['Planificación', 'Actividad de planificación estratégica', procesoId, 1, 1]);
    const actividadId = (actResult as any).insertId;
    console.log(`✅ Actividad creada con ID: ${actividadId}`);

    // Crear procedimiento
    console.log('📝 Creando procedimiento...');
    const [procedimientoResult] = await db.query(`
      INSERT INTO procedimientos (nombre, descripcion, actividad_id, activo, nivel_jerarquico, orden)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Elaboración del Plan Estratégico', 'Procedimiento para elaborar el plan estratégico', actividadId, 1, 'PROFESIONAL', 1]);
    const procedimientoId = (procedimientoResult as any).insertId;
    console.log(`✅ Procedimiento creado con ID: ${procedimientoId}`);

    // Crear empleos básicos
    console.log('📝 Creando empleos...');
    const empleos = [
      { codigo: 'DIR-001', nombre: 'Director General', nivel_jerarquico: 'DIRECTIVO', denominacion: 'Director General', grado: 24 },
      { codigo: 'PRO-001', nombre: 'Profesional Especializado', nivel_jerarquico: 'PROFESIONAL', denominacion: 'Profesional Especializado', grado: 16 },
      { codigo: 'TEC-001', nombre: 'Técnico Especializado', nivel_jerarquico: 'TECNICO', denominacion: 'Técnico Especializado', grado: 10 },
      { codigo: 'ASI-001', nombre: 'Asistente Administrativo', nivel_jerarquico: 'ASISTENCIAL', denominacion: 'Asistente Administrativo', grado: 6 }
    ];

    for (const empleo of empleos) {
      const [empResult] = await db.query(`
        INSERT INTO empleos (codigo, nombre, nivel_jerarquico, denominacion, grado, activo)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [empleo.codigo, empleo.nombre, empleo.nivel_jerarquico, empleo.denominacion, empleo.grado, 1]);
      console.log(`✅ Empleo creado: ${empleo.nombre} con ID: ${(empResult as any).insertId}`);
    }

    console.log('\n✅ Script completado exitosamente');
    console.log('📋 Resumen de IDs creados:');
    console.log(`   Dependencia: ${dependenciaId}`);
    console.log(`   Proceso: ${procesoId}`);
    console.log(`   Actividad: ${actividadId}`);
    console.log(`   Procedimiento: ${procedimientoId}`);
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en fix IDs:', error);
    process.exit(1);
  }
}

fixIds(); 