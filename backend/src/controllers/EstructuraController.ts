import { Request, Response } from 'express';
import { estructuraModel, elementoEstructuraModel } from '../models/Estructura';
import { generarRespuestaExito, generarRespuestaError } from '../utils/helpers';
import { ValidacionError, RecursoNoEncontradoError } from '../types';

export class EstructuraController {
  /**
   * Crear nueva estructura
   */
  async crearEstructura(req: Request, res: Response) {
    try {
      const { nombre, descripcion } = req.body;
      const usuarioId = (req as any).usuario?.id;

      if (!usuarioId) {
        return res.status(401).json(generarRespuestaError('Usuario no autenticado', 401));
      }

      if (!nombre) {
        return res.status(400).json(generarRespuestaError('El nombre de la estructura es requerido', 400));
      }

      // Verificar si ya existe una estructura con ese nombre
      const estructuraExistente = await estructuraModel.buscarPorNombre(nombre);
      if (estructuraExistente) {
        return res.status(400).json(generarRespuestaError('Ya existe una estructura con ese nombre', 400));
      }

      const estructura = await estructuraModel.crearEstructura({
        nombre,
        descripcion,
        usuarioCreadorId: usuarioId
      });

      return res.status(201).json(generarRespuestaExito(estructura, 'Estructura creada exitosamente'));
    } catch (error) {
      console.error('Error creando estructura:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener estructura por ID
   */
  async obtenerEstructura(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de estructura requerido', 400));
      }

      const estructura = await estructuraModel.buscarPorId(id);
      if (!estructura) {
        return res.status(404).json(generarRespuestaError('Estructura no encontrada', 404));
      }

      return res.json(generarRespuestaExito(estructura, 'Estructura obtenida exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estructura:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Listar todas las estructuras activas
   */
  async listarEstructuras(_req: Request, res: Response) {
    try {
      const estructuras = await estructuraModel.listarActivas();
      return res.json(generarRespuestaExito(estructuras, 'Estructuras obtenidas exitosamente'));
    } catch (error) {
      console.error('Error listando estructuras:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Actualizar estructura
   */
  async actualizarEstructura(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de estructura requerido', 400));
      }

      if (!nombre) {
        return res.status(400).json(generarRespuestaError('El nombre de la estructura es requerido', 400));
      }

      const estructura = await estructuraModel.actualizarEstructura(id, {
        nombre,
        descripcion
      });

      return res.json(generarRespuestaExito(estructura, 'Estructura actualizada exitosamente'));
    } catch (error) {
      if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      }
      console.error('Error actualizando estructura:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Desactivar estructura
   */
  async desactivarEstructura(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de estructura requerido', 400));
      }

      await estructuraModel.desactivarEstructura(id);

      return res.json(generarRespuestaExito(null, 'Estructura desactivada exitosamente'));
    } catch (error) {
      if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      }
      console.error('Error desactivando estructura:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Activar estructura
   */
  async activarEstructura(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de estructura requerido', 400));
      }

      await estructuraModel.activarEstructura(id);

      return res.json(generarRespuestaExito(null, 'Estructura activada exitosamente'));
    } catch (error) {
      if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      }
      console.error('Error activando estructura:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Agregar elemento a la estructura
   */
  async agregarElemento(req: Request, res: Response) {
    try {
      const { estructuraId, tipo, elementoId, padreId, orden } = req.body;

      if (!estructuraId || !tipo || !elementoId) {
        return res.status(400).json(generarRespuestaError('estructuraId, tipo y elementoId son requeridos', 400));
      }

      // Verificar que la estructura existe
      const estructura = await estructuraModel.buscarPorId(estructuraId);
      if (!estructura) {
        return res.status(404).json(generarRespuestaError('Estructura no encontrada', 404));
      }

      const elemento = await elementoEstructuraModel.crearElemento({
        estructuraId,
        tipo,
        elementoId,
        padreId,
        orden
      });

      return res.status(201).json(generarRespuestaExito(elemento, 'Elemento agregado exitosamente'));
    } catch (error) {
      console.error('Error agregando elemento:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener estructura completa con elementos
   */
  async obtenerEstructuraCompleta(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de estructura requerido', 400));
      }

      // Verificar que la estructura existe
      const estructura = await estructuraModel.buscarPorId(id);
      if (!estructura) {
        return res.status(404).json(generarRespuestaError('Estructura no encontrada', 404));
      }

      // Obtener elementos de la estructura
      const elementos = await elementoEstructuraModel.obtenerEstructuraCompleta(id);

      const estructuraCompleta = {
        estructura,
        elementos
      };

      return res.json(generarRespuestaExito(estructuraCompleta, 'Estructura completa obtenida exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estructura completa:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Eliminar elemento de la estructura
   */
  async eliminarElemento(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de elemento requerido', 400));
      }

      await elementoEstructuraModel.eliminarElemento(id);

      return res.json(generarRespuestaExito(null, 'Elemento eliminado exitosamente'));
    } catch (error) {
      if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      }
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      }
      console.error('Error eliminando elemento:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener elementos por tipo
   */
  async obtenerElementosPorTipo(req: Request, res: Response) {
    try {
      const { estructuraId, tipo } = req.params;

      if (!estructuraId || !tipo) {
        return res.status(400).json(generarRespuestaError('estructuraId y tipo son requeridos', 400));
      }

      // Verificar que la estructura existe
      const estructura = await estructuraModel.buscarPorId(estructuraId);
      if (!estructura) {
        return res.status(404).json(generarRespuestaError('Estructura no encontrada', 404));
      }

      const elementos = await elementoEstructuraModel.buscarPorEstructuraYTipo(estructuraId, tipo);

      return res.json(generarRespuestaExito(elementos, 'Elementos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error obteniendo elementos por tipo:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener dependencias por estructura
   */
  async obtenerDependenciasPorEstructura(req: Request, res: Response) {
    try {
      const { estructuraId } = req.params;

      if (!estructuraId) {
        return res.status(400).json(generarRespuestaError('estructuraId es requerido', 400));
      }

      // Verificar que la estructura existe
      const estructura = await estructuraModel.buscarPorId(estructuraId);
      if (!estructura) {
        return res.status(404).json(generarRespuestaError('Estructura no encontrada', 404));
      }

      // Obtener dependencias de la estructura
      const dependencias = await elementoEstructuraModel.obtenerDependenciasPorEstructura(estructuraId);

      return res.json(generarRespuestaExito(dependencias, 'Dependencias obtenidas exitosamente'));
    } catch (error) {
      console.error('Error obteniendo dependencias por estructura:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }
}

export const estructuraController = new EstructuraController(); 