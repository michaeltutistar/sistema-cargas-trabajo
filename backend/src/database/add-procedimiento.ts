import { db } from './mysql';

async function addProcedimiento() {
  try {
    console.log('📝 Agregando procedimiento básico...');

    // Verificar si ya existe una dependencia
    const [deps] = await db.query('SELECT id FROM dependencias LIMIT 1');
    let dependenciaId = 1;
    
    if ((deps as any[]).length === 0) {
      // Crear dependencia si no existe
      const [result] = await db.query(`
        INSERT INTO dependencias (nombre, descripcion, activa)
        VALUES (?, ?, ?)
      `, ['Dirección General', 'Dependencia principal', 1]);
      dependenciaId = (result as any).insertId;
      console.log('✅ Dependencia creada con ID:', dependenciaId);
    } else {
      dependenciaId = (deps as any[])[0].id;
      console.log('ℹ️ Usando dependencia existente con ID:', dependenciaId);
    }

    // Verificar si ya existe un proceso
    const [procs] = await db.query('SELECT id FROM procesos LIMIT 1');
    let procesoId = 1;
    
    if ((procs as any[]).length === 0) {
      // Crear proceso si no existe
      const [result] = await db.query(`
        INSERT INTO procesos (nombre, descripcion, dependencia_id, activo, orden)
        VALUES (?, ?, ?, ?, ?)
      `, ['Proceso Estratégico', 'Proceso de planificación estratégica', dependenciaId, 1, 1]);
      procesoId = (result as any).insertId;
      console.log('✅ Proceso creado con ID:', procesoId);
    } else {
      procesoId = (procs as any[])[0].id;
      console.log('ℹ️ Usando proceso existente con ID:', procesoId);
    }

    // Verificar si ya existe una actividad
    const [acts] = await db.query('SELECT id FROM actividades LIMIT 1');
    let actividadId = 1;
    
    if ((acts as any[]).length === 0) {
      // Crear actividad si no existe
      const [result] = await db.query(`
        INSERT INTO actividades (nombre, descripcion, proceso_id, activa, orden)
        VALUES (?, ?, ?, ?, ?)
      `, ['Planificación', 'Actividad de planificación estratégica', procesoId, 1, 1]);
      actividadId = (result as any).insertId;
      console.log('✅ Actividad creada con ID:', actividadId);
    } else {
      actividadId = (acts as any[])[0].id;
      console.log('ℹ️ Usando actividad existente con ID:', actividadId);
    }

    // Verificar si ya existe un procedimiento
    const [procedimientos] = await db.query('SELECT id FROM procedimientos LIMIT 1');
    
    if ((procedimientos as any[]).length === 0) {
      // Crear procedimiento si no existe
      await db.query(`
        INSERT INTO procedimientos (nombre, descripcion, actividad_id, activo, nivel_jerarquico, orden)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['Elaboración del Plan Estratégico', 'Procedimiento para elaborar el plan estratégico', actividadId, 1, 'PROFESIONAL', 1]);
      console.log('✅ Procedimiento creado: Elaboración del Plan Estratégico');
    } else {
      console.log('ℹ️ Procedimiento ya existe');
    }

    console.log('✅ Script completado');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addProcedimiento(); 