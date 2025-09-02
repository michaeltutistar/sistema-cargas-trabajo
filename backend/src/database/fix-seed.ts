import { db } from './mysql';

async function fixAndSeed() {
  try {
    console.log('🔧 Arreglando estructura de tabla empleos...');

    // Limpiar datos existentes
    await db.query('DELETE FROM empleos');
    await db.query('ALTER TABLE empleos AUTO_INCREMENT = 1');
    console.log('✅ Datos de empleos limpiados');

    // Crear empleos básicos
    const empleos = [
      { codigo: 'DIR-001', nombre: 'Director General', nivel_jerarquico: 'DIRECTIVO', denominacion: 'Director General', grado: 24 },
      { codigo: 'PRO-001', nombre: 'Profesional Especializado', nivel_jerarquico: 'PROFESIONAL', denominacion: 'Profesional Especializado', grado: 16 },
      { codigo: 'TEC-001', nombre: 'Técnico Especializado', nivel_jerarquico: 'TECNICO', denominacion: 'Técnico Especializado', grado: 10 },
      { codigo: 'ASI-001', nombre: 'Asistente Administrativo', nivel_jerarquico: 'ASISTENCIAL', denominacion: 'Asistente Administrativo', grado: 6 }
    ];

    for (const empleo of empleos) {
      await db.query(`
        INSERT INTO empleos (codigo, nombre, nivel_jerarquico, denominacion, grado, activo)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [empleo.codigo, empleo.nombre, empleo.nivel_jerarquico, empleo.denominacion, empleo.grado, 1]);
      console.log(`✅ Empleo creado: ${empleo.nombre}`);
    }

    // Crear dependencia básica
    await db.query(`
      INSERT INTO dependencias (nombre, descripcion, activa)
      VALUES (?, ?, ?)
    `, ['Dirección General', 'Dependencia principal', 1]);
    console.log('✅ Dependencia creada: Dirección General');

    // Crear proceso básico
    await db.query(`
      INSERT INTO procesos (nombre, descripcion, dependencia_id, activo, orden)
      VALUES (?, ?, ?, ?, ?)
    `, ['Proceso Estratégico', 'Proceso de planificación estratégica', 1, 1, 1]);
    console.log('✅ Proceso creado: Proceso Estratégico');

    // Crear actividad básica
    await db.query(`
      INSERT INTO actividades (nombre, descripcion, proceso_id, activa, orden)
      VALUES (?, ?, ?, ?, ?)
    `, ['Planificación', 'Actividad de planificación estratégica', 1, 1, 1]);
    console.log('✅ Actividad creada: Planificación');

    // Crear procedimiento básico
    await db.query(`
      INSERT INTO procedimientos (nombre, descripcion, actividad_id, activo, nivel_jerarquico, orden)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Elaboración del Plan Estratégico', 'Procedimiento para elaborar el plan estratégico', 1, 1, 'PROFESIONAL', 1]);
    console.log('✅ Procedimiento creado: Elaboración del Plan Estratégico');

    console.log('✅ Fix y seed completado exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en fix y seed:', error);
    process.exit(1);
  }
}

fixAndSeed(); 