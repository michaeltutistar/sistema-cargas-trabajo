import { usuarioModel, empleoModel } from '../models';
import { NivelJerarquico } from '../types';
// import * as fs from 'fs';
// import * as path from 'path';

/**
 * Script de seed expandido con datos reales basados en el análisis Excel
 */
async function ejecutarSeedReal() {
  try {
    console.log('🌱 Iniciando seed expandido con datos reales...');



    // Crear usuarios base
    await crearUsuarios();

    // Crear empleos completos
    await crearEmpleosCompletos();



    console.log('✅ Seed expandido completado exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error ejecutando seed expandido:', error);
    process.exit(1);
  }
}

/**
 * Crear usuarios del sistema
 */
async function crearUsuarios() {
  console.log('👥 Creando usuarios del sistema...');

  const usuarios = [
    {
      email: 'admin@cargas-trabajo.gov.co',
      password: 'Admin123!',
      nombre: 'Administrador',
      apellido: 'Sistema',
      rol: 'admin' as const
    },
    {
      email: 'director@cargas-trabajo.gov.co',
      password: 'Director123!',
      nombre: 'Luis Carlos',
      apellido: 'Rodríguez',
      rol: 'usuario' as const
    },
    {
      email: 'jefe.talento@cargas-trabajo.gov.co',
      password: 'Jefe123!',
      nombre: 'María Elena',
      apellido: 'González',
      rol: 'usuario' as const
    },
    {
      email: 'analista1@cargas-trabajo.gov.co',
      password: 'Analista123!',
      nombre: 'Carlos',
      apellido: 'Hernández',
      rol: 'usuario' as const
    },
    {
      email: 'analista2@cargas-trabajo.gov.co',
      password: 'Analista123!',
      nombre: 'Patricia',
      apellido: 'López',
      rol: 'usuario' as const
    },
    {
      email: 'consultor@cargas-trabajo.gov.co',
      password: 'Consulta123!',
      nombre: 'Fernando',
      apellido: 'Silva',
      rol: 'consulta' as const
    }
  ];

  for (const userData of usuarios) {
    const existeUsuario = await usuarioModel.buscarPorEmail(userData.email);
    if (!existeUsuario) {
      await usuarioModel.crearUsuario(userData);
      console.log(`✅ Usuario creado: ${userData.email}`);
    }
  }
}

/**
 * Crear empleos completos por nivel jerárquico
 */
async function crearEmpleosCompletos() {
  console.log('💼 Creando empleos completos...');

  const empleosData = [
    // Nivel Directivo
    { nivel: NivelJerarquico.DIRECTIVO, denominacion: 'Director General', codigo: 'DIR-001', grado: 24, descripcion: 'Máximo directivo de la entidad' },
    { nivel: NivelJerarquico.DIRECTIVO, denominacion: 'Subdirector Administrativo', codigo: 'DIR-002', grado: 22, descripcion: 'Subdirector del área administrativa' },
    { nivel: NivelJerarquico.DIRECTIVO, denominacion: 'Subdirector Técnico', codigo: 'DIR-003', grado: 22, descripcion: 'Subdirector del área técnica' },
    { nivel: NivelJerarquico.DIRECTIVO, denominacion: 'Jefe de Oficina', codigo: 'DIR-004', grado: 20, descripcion: 'Jefe de oficina asesora' },
    
    // Nivel Asesor
    { nivel: NivelJerarquico.ASESOR, denominacion: 'Asesor Principal', codigo: 'ASE-001', grado: 20, descripcion: 'Asesor de alta dirección' },
    { nivel: NivelJerarquico.ASESOR, denominacion: 'Asesor Especializado', codigo: 'ASE-002', grado: 18, descripcion: 'Asesor especializado en área específica' },
    { nivel: NivelJerarquico.ASESOR, denominacion: 'Asesor Senior', codigo: 'ASE-003', grado: 16, descripcion: 'Asesor con experiencia senior' },
    { nivel: NivelJerarquico.ASESOR, denominacion: 'Asesor Junior', codigo: 'ASE-004', grado: 14, descripcion: 'Asesor con experiencia junior' },
    
    // Nivel Profesional
    { nivel: NivelJerarquico.PROFESIONAL, denominacion: 'Profesional Especializado', codigo: 'PRO-001', grado: 16, descripcion: 'Profesional con especialización' },
    { nivel: NivelJerarquico.PROFESIONAL, denominacion: 'Profesional Universitario Senior', codigo: 'PRO-002', grado: 14, descripcion: 'Profesional universitario senior' },
    { nivel: NivelJerarquico.PROFESIONAL, denominacion: 'Profesional Universitario', codigo: 'PRO-003', grado: 12, descripcion: 'Profesional universitario estándar' },
    { nivel: NivelJerarquico.PROFESIONAL, denominacion: 'Profesional Junior', codigo: 'PRO-004', grado: 10, descripcion: 'Profesional recién graduado' },
    
    // Nivel Técnico
    { nivel: NivelJerarquico.TECNICO, denominacion: 'Técnico Especializado', codigo: 'TEC-001', grado: 10, descripcion: 'Técnico con especialización' },
    { nivel: NivelJerarquico.TECNICO, denominacion: 'Técnico Operativo Senior', codigo: 'TEC-002', grado: 8, descripcion: 'Técnico operativo senior' },
    { nivel: NivelJerarquico.TECNICO, denominacion: 'Técnico Operativo', codigo: 'TEC-003', grado: 6, descripcion: 'Técnico operativo estándar' },
    { nivel: NivelJerarquico.TECNICO, denominacion: 'Técnico Auxiliar', codigo: 'TEC-004', grado: 4, descripcion: 'Técnico auxiliar' },
    
    // Nivel Asistencial
    { nivel: NivelJerarquico.ASISTENCIAL, denominacion: 'Asistente Administrativo Especializado', codigo: 'ASI-001', grado: 6, descripcion: 'Asistente administrativo especializado' },
    { nivel: NivelJerarquico.ASISTENCIAL, denominacion: 'Asistente Administrativo', codigo: 'ASI-002', grado: 4, descripcion: 'Asistente administrativo estándar' },
    { nivel: NivelJerarquico.ASISTENCIAL, denominacion: 'Auxiliar Administrativo', codigo: 'ASI-003', grado: 2, descripcion: 'Auxiliar administrativo' },
    { nivel: NivelJerarquico.ASISTENCIAL, denominacion: 'Secretaria Ejecutiva', codigo: 'ASI-004', grado: 4, descripcion: 'Secretaria ejecutiva' }
  ];

  for (const empleoData of empleosData) {
    const existeEmpleo = await empleoModel.buscarPorCodigo(empleoData.codigo);
    if (!existeEmpleo) {
      await empleoModel.crearEmpleo({
        nivelJerarquico: empleoData.nivel,
        denominacion: empleoData.denominacion,
        codigo: empleoData.codigo,
        grado: empleoData.grado,
        descripcion: empleoData.descripcion
      });
      console.log(`✅ Empleo creado: ${empleoData.denominacion}`);
    }
  }
}



// Ejecutar seed expandido si este archivo se ejecuta directamente
if (require.main === module) {
  ejecutarSeedReal();
}

export { ejecutarSeedReal };
