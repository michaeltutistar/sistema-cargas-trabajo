/**
 * Utilidades para cálculos de cargas de trabajo usando la fórmula PERT
 */

/**
 * Calcula el tiempo esperado usando la fórmula PERT
 * Fórmula: ((Tmin + 4*Tprom + Tmax) / 6) * 1.07
 * 
 * @param tiempoMinimo - Tiempo mínimo en horas
 * @param tiempoPromedio - Tiempo promedio en horas
 * @param tiempoMaximo - Tiempo máximo en horas
 * @param factor - Factor multiplicador (por defecto 1.07)
 * @returns Tiempo calculado usando PERT
 */
export function calcularTiempoPERT(
  tiempoMinimo: number,
  tiempoPromedio: number,
  tiempoMaximo: number,
  factor: number = 1.07
): number {
  // Validar que los tiempos sean válidos
  if (tiempoMinimo < 0 || tiempoPromedio < 0 || tiempoMaximo < 0) {
    throw new Error('Los tiempos no pueden ser negativos');
  }

  if (tiempoMinimo > tiempoPromedio || tiempoPromedio > tiempoMaximo) {
    throw new Error('Los tiempos deben cumplir: Tmin ≤ Tprom ≤ Tmax');
  }

  // Aplicar fórmula PERT
  const tiempoEsperado = ((tiempoMinimo + (4 * tiempoPromedio) + tiempoMaximo) / 6) * factor;
  
  // Redondear a 2 decimales
  return Math.round(tiempoEsperado * 100) / 100;
}

/**
 * Calcula la carga total de trabajo para un procedimiento
 * 
 * @param frecuenciaMensual - Número de veces que se ejecuta el procedimiento al mes
 * @param tiempoPERT - Tiempo calculado con PERT en horas
 * @returns Carga total en horas/mes
 */
export function calcularCargaTotal(
  frecuenciaMensual: number,
  tiempoPERT: number
): number {
  if (frecuenciaMensual < 0 || tiempoPERT < 0) {
    throw new Error('La frecuencia y el tiempo deben ser positivos');
  }

  const carga = frecuenciaMensual * tiempoPERT;
  return Math.round(carga * 100) / 100;
}

/**
 * Valida que los tiempos sean consistentes
 * 
 * @param tiempoMinimo - Tiempo mínimo
 * @param tiempoPromedio - Tiempo promedio
 * @param tiempoMaximo - Tiempo máximo
 * @returns true si los tiempos son válidos
 */
export function validarTiempos(
  tiempoMinimo: number,
  tiempoPromedio: number,
  tiempoMaximo: number
): boolean {
  return (
    tiempoMinimo >= 0 &&
    tiempoPromedio >= 0 &&
    tiempoMaximo >= 0 &&
    tiempoMinimo <= tiempoPromedio &&
    tiempoPromedio <= tiempoMaximo
  );
}

/**
 * Calcula estadísticas de carga de trabajo por nivel jerárquico
 * 
 * @param cargas - Array de cargas de trabajo
 * @param nivelJerarquico - Nivel jerárquico a filtrar
 * @returns Estadísticas del nivel
 */
export function calcularEstadisticasNivel(
  cargas: Array<{ nivelJerarquico: string; horasMensual: number }>,
  nivelJerarquico: string
): {
  totalHoras: number;
  promedioHoras: number;
  cantidadProcedimientos: number;
} {
  const cargasNivel = cargas.filter(c => c.nivelJerarquico === nivelJerarquico);
  
  const totalHoras = cargasNivel.reduce((sum, c) => sum + c.horasMensual, 0);
  const cantidadProcedimientos = cargasNivel.length;
  const promedioHoras = cantidadProcedimientos > 0 ? totalHoras / cantidadProcedimientos : 0;

  return {
    totalHoras: Math.round(totalHoras * 100) / 100,
    promedioHoras: Math.round(promedioHoras * 100) / 100,
    cantidadProcedimientos
  };
}

/**
 * Convierte horas mensuales a jornada laboral (asumiendo 176 horas/mes)
 * 
 * @param horasMensual - Horas mensuales
 * @returns Porcentaje de jornada laboral
 */
export function convertirAJornadaLaboral(horasMensual: number): number {
  const HORAS_JORNADA_MENSUAL = 176; // 8 horas * 22 días laborales
  const porcentaje = (horasMensual / HORAS_JORNADA_MENSUAL) * 100;
  return Math.round(porcentaje * 100) / 100;
}

/**
 * Calcula el número de empleados necesarios basado en las cargas de trabajo
 * 
 * @param totalHorasMensual - Total de horas mensuales requeridas
 * @param horasJornadaMensual - Horas de jornada mensual (por defecto 176)
 * @returns Número de empleados necesarios (redondeado hacia arriba)
 */
export function calcularEmpleadosNecesarios(
  totalHorasMensual: number,
  horasJornadaMensual: number = 176
): number {
  if (totalHorasMensual <= 0) return 0;
  return Math.ceil(totalHorasMensual / horasJornadaMensual);
}
