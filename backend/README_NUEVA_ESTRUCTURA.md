# Nueva Estructura de Tiempos de Procedimientos

## 📋 Resumen de Cambios

Se ha modificado la estructura de la tabla `tiempos_procedimientos` para implementar un sistema más flexible que permita distribuir las horas hombre por niveles de empleo, similar a la tabla de Excel proporcionada.

## 🔄 Cambios Principales

### 1. Estructura de Base de Datos

**Antes:**
```sql
tiempo_horas DECIMAL(10,2) -- Tiempo calculado PERT
```

**Después:**
```sql
tiempo_estandar DECIMAL(10,2) -- Tiempo estándar por procedimiento
horas_directivo DECIMAL(10,2) -- Horas hombre para nivel Directivo
horas_asesor DECIMAL(10,2) -- Horas hombre para nivel Asesor
horas_profesional DECIMAL(10,2) -- Horas hombre para nivel Profesional
horas_tecnico DECIMAL(10,2) -- Horas hombre para nivel Técnico
horas_asistencial DECIMAL(10,2) -- Horas hombre para nivel Asistencial
```

### 2. Tipos TypeScript

**Antes:**
```typescript
interface TiempoProcedimiento {
  tiempoCalculadoPERT: number;
  cargaTotal: number;
}
```

**Después:**
```typescript
interface TiempoProcedimiento {
  tiempoEstandar: number;
  horasDirectivo: number;
  horasAsesor: number;
  horasProfesional: number;
  horasTecnico: number;
  horasAsistencial: number;
}
```

## 📊 Concepto de la Nueva Estructura

### Tiempo Estándar
- Se calcula usando la fórmula PERT: `(Tmin + 4*Tprom + Tmax) / 6`
- Representa el tiempo estándar por cada procedimiento
- Equivale a la columna "TIEMPO POR CADA PROCEDIMIENTO EN HORAS (TIEMPO ESTANDAR)" del Excel

### Horas Hombre por Niveles
- Cada registro puede distribuir las horas hombre entre diferentes niveles de empleo
- Se multiplica por la frecuencia mensual para obtener el total
- Equivale a las columnas ASESOR, PROFESIONAL, TÉCNICO, ASISTENCIAL del Excel

### Ejemplo de Distribución
```javascript
// Ejemplo basado en la tabla Excel
{
  frecuenciaMensual: 0.5,
  tiempoEstandar: 34.2,
  horasDirectivo: 0,      // 0 horas para Directivo
  horasAsesor: 17.12,     // 17.12 horas para Asesor
  horasProfesional: 1.78, // 1.78 horas para Profesional
  horasTecnico: 0,        // 0 horas para Técnico
  horasAsistencial: 0     // 0 horas para Asistencial
}
```

## 🚀 Implementación

### 1. Scripts SQL

**modificar_estructura_tiempos.sql**
- Renombra `tiempo_horas` a `tiempo_estandar`
- Agrega columnas para horas hombre por niveles
- Crea índices para optimizar consultas
- Crea vistas para totales y resúmenes

**migrar_datos_tiempos.sql**
- Migra datos existentes a la nueva estructura
- Distribuye las horas hombre según el nivel jerárquico del empleo
- Verifica la migración

### 2. Modelo TypeScript

**TiempoProcedimientoModel**
- Actualizado para trabajar con la nueva estructura
- Nuevos métodos para obtener totales por niveles
- Cálculos automáticos de horas hombre

### 3. Nuevos Métodos

```typescript
// Obtener totales por niveles de empleo
async obtenerTotalesPorNiveles(usuarioId?: string): Promise<TotalesPorNiveles[]>

// Resumen por dependencia con nueva estructura
async obtenerResumenPorDependencia(): Promise<Array<ResumenTiempos>>
```

## 📈 Ventajas de la Nueva Estructura

1. **Flexibilidad**: Permite distribuir horas hombre entre múltiples niveles
2. **Precisión**: Refleja mejor la realidad organizacional
3. **Análisis**: Facilita el análisis por niveles de empleo
4. **Compatibilidad**: Mantiene compatibilidad con datos existentes
5. **Escalabilidad**: Fácil de extender para nuevos niveles

## 🔧 Uso

### Crear un Nuevo Tiempo
```typescript
const nuevoTiempo = {
  procedimientoId: "1",
  empleoId: "2",
  frecuenciaMensual: 5.0,
  tiempoMinimo: 24.0,
  tiempoPromedio: 32.0,
  tiempoMaximo: 40.0,
  horasDirectivo: 0,
  horasAsesor: 17.12,
  horasProfesional: 1.78,
  horasTecnico: 0,
  horasAsistencial: 0,
  observaciones: "Distribución según Excel"
};

await tiempoModel.crearTiempoProcedimiento(nuevoTiempo, usuarioId);
```

### Obtener Totales por Niveles
```typescript
const totales = await tiempoModel.obtenerTotalesPorNiveles(usuarioId);
// Resultado:
// [
//   { nivelJerarquico: 'DIRECTIVO', totalHoras: 150.5 },
//   { nivelJerarquico: 'ASESOR', totalHoras: 320.8 },
//   { nivelJerarquico: 'PROFESIONAL', totalHoras: 450.2 },
//   { nivelJerarquico: 'TECNICO', totalHoras: 280.1 },
//   { nivelJerarquico: 'ASISTENCIAL', totalHoras: 120.3 }
// ]
```

### Resumen por Dependencia
```typescript
const resumen = await tiempoModel.obtenerResumenPorDependencia();
// Resultado incluye totales por dependencia y distribución por niveles
```

## 📝 Notas Importantes

1. **Migración**: Los datos existentes se migran automáticamente
2. **Compatibilidad**: El sistema mantiene compatibilidad hacia atrás
3. **Validación**: Se validan los tiempos mínimo, promedio y máximo
4. **Cálculos**: Los cálculos PERT se mantienen para el tiempo estándar
5. **Índices**: Se han agregado índices para optimizar consultas

## 🧪 Pruebas

Ejecutar el script de ejemplo:
```bash
node ejemplo_nueva_estructura.js
```

Este script demuestra:
- Creación de tiempos con distribución por niveles
- Obtención de totales por niveles
- Resumen por dependencia
- Vista completa de procedimientos

## 📊 Estructura Final

La nueva estructura permite:
- ✅ Guardar tiempo estándar por procedimiento
- ✅ Distribuir horas hombre por niveles de empleo
- ✅ Calcular totales por niveles automáticamente
- ✅ Mantener compatibilidad con datos existentes
- ✅ Facilitar análisis y reportes
- ✅ Escalar para futuras necesidades 