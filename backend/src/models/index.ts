// Importar todos los modelos
import { BaseModel } from './BaseModel';
import { UsuarioModel } from './Usuario';
import { DependenciaModel } from './Dependencia';
import { ProcesoModel } from './Proceso';
import { ActividadModel } from './Actividad';
import { ProcedimientoModel } from './Procedimiento';
import { EmpleoModel } from './Empleo';
import { TiempoProcedimientoModel } from './TiempoProcedimiento';
import { EstructuraModel, ElementoEstructuraModel } from './Estructura';

// Exportar todos los modelos
export { BaseModel };
export { UsuarioModel };
export { DependenciaModel };
export { ProcesoModel };
export { ActividadModel };
export { ProcedimientoModel };
export { EmpleoModel };
export { TiempoProcedimientoModel };
export { EstructuraModel, ElementoEstructuraModel };

// Crear instancias de los modelos para usar en la aplicación
export const usuarioModel = new UsuarioModel();
export const dependenciaModel = new DependenciaModel();
export const procesoModel = new ProcesoModel();
export const actividadModel = new ActividadModel();
export const procedimientoModel = new ProcedimientoModel();
export const empleoModel = new EmpleoModel();
export const tiempoProcedimientoModel = new TiempoProcedimientoModel();
export const estructuraModel = new EstructuraModel();
export const elementoEstructuraModel = new ElementoEstructuraModel();
