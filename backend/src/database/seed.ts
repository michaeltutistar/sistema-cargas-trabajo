import { db } from './mysql';
import { 
  usuarioModel, 
  dependenciaModel, 
  procesoModel, 
  actividadModel, 
  procedimientoModel, 
  empleoModel, 
  tiempoProcedimientoModel 
} from '../models';
import { NivelJerarquico } from '../types';

/**
 * Script de seed para poblar la base de datos con datos iniciales
 */
async function ejecutarSeed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Verificar conexión a base de datos
    await db.query('SELECT 1');

    // Crear usuario administrador por defecto
    await crearUsuarioAdmin();

    // Crear datos de ejemplo
    await crearDatosEjemplo();

    console.log('✅ Seed completado exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  }
}

/**
 * Crear usuario administrador por defecto
 */
async function crearUsuarioAdmin() {
  try {
    console.log('👤 Creando usuario administrador...');

    // Verificar si ya existe un admin
    const adminExistente = await usuarioModel.buscarPorEmail('admin@cargas-trabajo.gov.co');
    
    if (adminExistente) {
      console.log('ℹ️ Usuario administrador ya existe');
      return;
    }

    // Crear usuario admin
    const admin = await usuarioModel.crearUsuario({
      email: 'admin@cargas-trabajo.gov.co',
      password: 'Admin123!',
      nombre: 'Administrador',
      apellido: 'Sistema',
      rol: 'admin'
    });

    console.log(`✅ Usuario administrador creado: ${admin.email}`);

    // Crear usuarios de ejemplo
    const usuariosEjemplo = [
      {
        email: 'analista@cargas-trabajo.gov.co',
        password: 'Usuario123!',
        nombre: 'María',
        apellido: 'Rodríguez',
        rol: 'usuario' as const
      },
      {
        email: 'consultor@cargas-trabajo.gov.co',
        password: 'Consulta123!',
        nombre: 'Juan',
        apellido: 'García',
        rol: 'consulta' as const
      }
    ];

    for (const userData of usuariosEjemplo) {
      const existeUsuario = await usuarioModel.buscarPorEmail(userData.email);
      if (!existeUsuario) {
        await usuarioModel.crearUsuario(userData);
        console.log(`✅ Usuario creado: ${userData.email}`);
      }
    }

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
    throw error;
  }
}

/**
 * Crear datos de ejemplo basados en el análisis Excel
 */
async function crearDatosEjemplo() {
  try {
    console.log('📊 Creando datos de ejemplo...');

    // Crear empleos por nivel jerárquico
    await crearEmpleos();

    // Crear dependencia de ejemplo
    const dependencia = await crearDependenciaEjemplo();

    // Crear procesos de ejemplo
    const procesos = await crearProcesosEjemplo(dependencia.id);

    // Crear actividades de ejemplo
    const actividades = await crearActividadesEjemplo(procesos);

    // Crear procedimientos de ejemplo
    const procedimientos = await crearProcedimientosEjemplo(actividades);

    // Crear tiempos de ejemplo
    await crearTiemposEjemplo(procedimientos);

    console.log('✅ Datos de ejemplo creados exitosamente');

  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
    throw error;
  }
}

/**
 * Crear empleos por nivel jerárquico
 */
async function crearEmpleos() {
  console.log('💼 Creando empleos...');
  
  // Limpiar tabla empleos primero
  await db.query('DELETE FROM empleos');
  await db.query('ALTER TABLE empleos AUTO_INCREMENT = 1');

  const empleos = [
    // Nivel Directivo
    { nivel: NivelJerarquico.DIRECTIVO, denominacion: 'Director General', codigo: 'DIR-001', grado: 24 },
    { nivel: NivelJerarquico.DIRECTIVO, denominacion: 'Subdirector', codigo: 'DIR-002', grado: 22 },
    
    // Nivel Asesor
    { nivel: NivelJerarquico.ASESOR, denominacion: 'Asesor Principal', codigo: 'ASE-001', grado: 20 },
    { nivel: NivelJerarquico.ASESOR, denominacion: 'Asesor Especializado', codigo: 'ASE-002', grado: 18 },
    
    // Nivel Profesional
    { nivel: NivelJerarquico.PROFESIONAL, denominacion: 'Profesional Especializado', codigo: 'PRO-001', grado: 16 },
    { nivel: NivelJerarquico.PROFESIONAL, denominacion: 'Profesional Universitario', codigo: 'PRO-002', grado: 14 },
    { nivel: NivelJerarquico.PROFESIONAL, denominacion: 'Profesional Junior', codigo: 'PRO-003', grado: 12 },
    
    // Nivel Técnico
    { nivel: NivelJerarquico.TECNICO, denominacion: 'Técnico Especializado', codigo: 'TEC-001', grado: 10 },
    { nivel: NivelJerarquico.TECNICO, denominacion: 'Técnico Operativo', codigo: 'TEC-002', grado: 8 },
    
    // Nivel Asistencial
    { nivel: NivelJerarquico.ASISTENCIAL, denominacion: 'Asistente Administrativo', codigo: 'ASI-001', grado: 6 },
    { nivel: NivelJerarquico.ASISTENCIAL, denominacion: 'Auxiliar Administrativo', codigo: 'ASI-002', grado: 4 }
  ];

  for (const empleoData of empleos) {
    const existeEmpleo = await empleoModel.buscarPorCodigo(empleoData.codigo);
    if (!existeEmpleo) {
      await empleoModel.crearEmpleo({
        nivelJerarquico: empleoData.nivel,
        denominacion: empleoData.denominacion,
        codigo: empleoData.codigo,
        grado: empleoData.grado
      });
      console.log(`✅ Empleo creado: ${empleoData.denominacion}`);
    }
  }
}

/**
 * Crear dependencia de ejemplo
 */
async function crearDependenciaEjemplo() {
  console.log('🏢 Creando dependencia de ejemplo...');

  const dependenciaData = {
    nombre: 'Dirección General',
    codigo: 'DG-001',
    descripcion: 'Dependencia principal encargada de la dirección y coordinación general de la entidad'
  };

  let dependencia = await dependenciaModel.buscarPorCodigo(dependenciaData.codigo);
  
  if (!dependencia) {
    dependencia = await dependenciaModel.crearDependencia(dependenciaData);
    console.log(`✅ Dependencia creada: ${dependencia.nombre}`);
  }

  return dependencia;
}

/**
 * Crear procesos de ejemplo
 */
async function crearProcesosEjemplo(dependenciaId: string) {
  console.log('⚙️ Creando procesos de ejemplo...');

  const procesos = [
    {
      nombre: 'Proceso Estratégico',
      codigo: 'PE-001',
      descripcion: 'Proceso orientado a la planificación estratégica y toma de decisiones',
      orden: 1
    },
    {
      nombre: 'Proceso Misional',
      codigo: 'PM-001',
      descripcion: 'Proceso principal de la entidad que genera valor directo',
      orden: 2
    },
    {
      nombre: 'Proceso de Apoyo',
      codigo: 'PA-001',
      descripcion: 'Proceso de soporte a los procesos misionales',
      orden: 3
    }
  ];

  const procesosCreados = [];

  for (const procesoData of procesos) {
    let proceso = await procesoModel.buscarPorCodigoEnDependencia(dependenciaId, procesoData.codigo);
    
    if (!proceso) {
      proceso = await procesoModel.crearProceso({
        dependenciaId,
        nombre: procesoData.nombre,
        codigo: procesoData.codigo,
        descripcion: procesoData.descripcion,
        orden: procesoData.orden
      });
      console.log(`✅ Proceso creado: ${proceso.nombre}`);
    }
    
    procesosCreados.push(proceso);
  }

  return procesosCreados;
}

/**
 * Crear actividades de ejemplo
 */
async function crearActividadesEjemplo(procesos: any[]) {
  console.log('📋 Creando actividades de ejemplo...');

  const actividadesData = [
    // Actividades para Proceso Estratégico
    { procesoIndex: 0, nombre: 'Planificación Estratégica', codigo: 'ACT-PE-001', orden: 1 },
    { procesoIndex: 0, nombre: 'Seguimiento y Control', codigo: 'ACT-PE-002', orden: 2 },
    
    // Actividades para Proceso Misional
    { procesoIndex: 1, nombre: 'Análisis de Cargas', codigo: 'ACT-PM-001', orden: 1 },
    { procesoIndex: 1, nombre: 'Generación de Reportes', codigo: 'ACT-PM-002', orden: 2 },
    
    // Actividades para Proceso de Apoyo
    { procesoIndex: 2, nombre: 'Gestión Documental', codigo: 'ACT-PA-001', orden: 1 },
    { procesoIndex: 2, nombre: 'Soporte Técnico', codigo: 'ACT-PA-002', orden: 2 }
  ];

  const actividadesCreadas = [];

  for (const actData of actividadesData) {
    const proceso = procesos[actData.procesoIndex];
    if (!proceso) continue;

    let actividad = await actividadModel.buscarPorCodigoEnProceso(proceso.id, actData.codigo);
    
    if (!actividad) {
      actividad = await actividadModel.crearActividad({
        procesoId: proceso.id,
        nombre: actData.nombre,
        codigo: actData.codigo,
        descripcion: `Actividad del proceso ${proceso.nombre}`,
        orden: actData.orden
      });
      console.log(`✅ Actividad creada: ${actividad.nombre}`);
    }
    
    actividadesCreadas.push(actividad);
  }

  return actividadesCreadas;
}

/**
 * Crear procedimientos de ejemplo
 */
async function crearProcedimientosEjemplo(actividades: any[]) {
  console.log('📝 Creando procedimientos de ejemplo...');

  const procedimientosData = [
    // Procedimientos para diferentes actividades y niveles
    { 
      actividadIndex: 0, 
      nombre: 'Definición de Objetivos Estratégicos', 
      codigo: 'PROC-001',
      nivel: NivelJerarquico.DIRECTIVO,
      requisitos: 'Experiencia en planificación estratégica, conocimiento del sector público'
    },
    { 
      actividadIndex: 0, 
      nombre: 'Análisis de Contexto Institucional', 
      codigo: 'PROC-002',
      nivel: NivelJerarquico.PROFESIONAL,
      requisitos: 'Título profesional, experiencia en análisis organizacional'
    },
    { 
      actividadIndex: 1, 
      nombre: 'Elaboración de Indicadores', 
      codigo: 'PROC-003',
      nivel: NivelJerarquico.PROFESIONAL,
      requisitos: 'Conocimientos en estadística y elaboración de indicadores'
    },
    { 
      actividadIndex: 2, 
      nombre: 'Recolección de Datos de Tiempo', 
      codigo: 'PROC-004',
      nivel: NivelJerarquico.TECNICO,
      requisitos: 'Conocimientos en técnicas de medición de tiempos y movimientos'
    },
    { 
      actividadIndex: 3, 
      nombre: 'Generación de Reportes Ejecutivos', 
      codigo: 'PROC-005',
      nivel: NivelJerarquico.PROFESIONAL,
      requisitos: 'Manejo de herramientas de business intelligence y reporting'
    },
    { 
      actividadIndex: 4, 
      nombre: 'Archivo y Custodia de Documentos', 
      codigo: 'PROC-006',
      nivel: NivelJerarquico.ASISTENCIAL,
      requisitos: 'Conocimientos en gestión documental y archivo'
    }
  ];

  const procedimientosCreados = [];

  for (const procData of procedimientosData) {
    const actividad = actividades[procData.actividadIndex];
    if (!actividad) continue;

    let procedimiento = await procedimientoModel.crearProcedimiento({
      actividadId: actividad.id,
      nombre: procData.nombre,
      descripcion: `Procedimiento de la actividad ${actividad.nombre}`,
      nivelJerarquico: procData.nivel,
      orden: procedimientosCreados.filter(p => p.actividadId === actividad.id).length + 1
    });
    
    procedimientosCreados.push(procedimiento);
  }

  return procedimientosCreados;
}

/**
 * Crear tiempos de ejemplo basados en los datos del Excel
 */
async function crearTiemposEjemplo(procedimientos: any[]) {
  console.log('⏱️ Creando tiempos de ejemplo...');

  // Obtener empleos para asignar tiempos
  const empleos = await empleoModel.buscarActivos();

  const tiemposEjemplo = [
    { frecuencia: 0.5, tmin: 24, tprom: 32, tmax: 40 },
    { frecuencia: 0.083, tmin: 16, tprom: 20, tmax: 24 },
    { frecuencia: 0.083, tmin: 8, tprom: 12, tmax: 16 },
    { frecuencia: 2.0, tmin: 5, tprom: 7, tmax: 9 },
    { frecuencia: 5.0, tmin: 8, tprom: 16, tmax: 20 },
    { frecuencia: 3.0, tmin: 8, tprom: 15, tmax: 30 }
  ];

  let tiempoIndex = 0;

  for (const procedimiento of procedimientos) {
    // Encontrar empleos compatibles con el nivel jerárquico del procedimiento
    const empleosCompatibles = empleos.filter((e: any) => e.nivelJerarquico === procedimiento.nivelJerarquico);
    
    if (empleosCompatibles.length === 0) continue;

    // Asignar tiempo al primer empleo compatible
    const empleo = empleosCompatibles[0];
    const tiempoData = tiemposEjemplo[tiempoIndex % tiemposEjemplo.length];

    try {
      // Verificar si ya existe un tiempo para esta combinación
      const tiemposExistentes = await tiempoProcedimientoModel.buscarPorProcedimiento(procedimiento.id);
      const yaExiste = tiemposExistentes.some((t: any) => t.empleoId === empleo!.id);

      if (!yaExiste && tiempoData) {
        await tiempoProcedimientoModel.crearTiempoProcedimiento({
          procedimientoId: procedimiento.id,
          empleoId: empleo!.id,
          frecuenciaMensual: tiempoData.frecuencia,
          tiempoMinimo: tiempoData.tmin,
          tiempoPromedio: tiempoData.tprom,
          tiempoMaximo: tiempoData.tmax,
          observaciones: 'Tiempo de ejemplo generado automáticamente'
        });
        console.log(`✅ Tiempo creado para: ${procedimiento.nombre} - ${empleo!.denominacion}`);
      }
    } catch (error) {
      console.warn(`⚠️ No se pudo crear tiempo para ${procedimiento.nombre}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    tiempoIndex++;
  }
}

// Ejecutar seed si este archivo se ejecuta directamente
if (require.main === module) {
  ejecutarSeed();
}

export { ejecutarSeed };
