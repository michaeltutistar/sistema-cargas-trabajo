# Presentación ejecutiva — Sistema de Gestión de Cargas de Trabajo

## Resumen
El **Sistema de Gestión de Cargas de Trabajo** es una plataforma web para **capturar, estandarizar, calcular y reportar** cargas laborales por **estructura**, **dependencia**, **proceso/actividad/procedimiento** y **nivel jerárquico** (Directivo, Asesor, Profesional, Técnico, Asistencial, Contratista y Trabajador Oficial), con exportación a **Excel** y trazabilidad de registros.

## ¿Qué hace el software?
- **Levantamiento estructurado de información**: registra tiempos y frecuencias mensuales por procedimiento, vinculados a la estructura organizacional.
- **Cálculo de tiempos estándar**: soporta estimaciones tipo PERT (mínimo, promedio, máximo) para obtener un **tiempo estándar** por actividad/procedimiento.
- **Consolidación automática**: genera reportes por dependencia o por “**todas las dependencias**”, evitando reprocesos manuales.
- **Indicadores y totales**: consolida horas por nivel jerárquico y apoya el cálculo de **personal requerido** (según la regla vigente del sistema).
- **Reportes exportables**: descarga el reporte a **Excel** con las mismas columnas visibles en pantalla (incluyendo “Grado” cuando aplica y “Dependencia” cuando se reporta “todas”).
- **Control de acceso por roles**: usuarios con roles (p. ej. admin, tiempos/usuario, consulta) para separar captura, administración y consulta.

## Alcance funcional (alto nivel)
- **Gestión de estructura**: parametriza dependencias y jerarquía organizacional (insumo para reportes).
- **Ingreso de tiempos**: captura de tiempos/frecuencias y observaciones por procedimiento.
- **Reportes**:
  - Por dependencia (vista focalizada).
  - Por todas las dependencias (vista consolidada, con columna “Dependencia”).
  - Exportación a Excel.
- **Catálogo de empleos/cargos**: selección estandarizada por nivel jerárquico (con “grado” cuando aplica).

## Ventajas principales de su uso
- **Estandarización**: todos los equipos capturan la información con el mismo formato, reduciendo interpretaciones.
- **Trazabilidad y auditoría**: cada registro queda asociado a estructura/empleo/procedimiento/fecha, facilitando validaciones.
- **Calidad del dato**: menos riesgo de fórmulas alteradas, celdas mal referenciadas o versiones diferentes de archivos.
- **Consolidación en minutos**: reportes y totales se generan automáticamente, sin “pegar” información entre hojas.
- **Escalabilidad**: soporta múltiples estructuras/dependencias sin multiplicar archivos.
- **Continuidad**: el histórico queda en base de datos; no depende del envío de archivos por correo o de “la última versión”.

## Comparación vs. método anterior (entrevistas + Excel con fórmulas)
### Limitaciones del método anterior
- **Alto tiempo operativo**: coordinación de entrevistas, transcripción y consolidación manual.
- **Riesgo de errores**: fórmulas editadas, referencias rotas, duplicidades, filas omitidas o versiones no controladas.
- **Baja trazabilidad**: difícil reconstruir quién cambió qué y cuándo, o justificar cambios ante auditoría.
- **Difícil homologación**: cada entrevistador/archivo puede usar criterios distintos para tiempos, frecuencias y supuestos.
- **Consolidación compleja**: sumar por dependencias/niveles exige manipulación manual y aumenta el riesgo.

### Beneficios concretos del software frente al método anterior
- **Captura directa en sistema**: elimina transcripción posterior desde entrevistas/formatos dispersos.
- **Cálculos consistentes**: reglas de cálculo centralizadas (evita “Excel distinto por persona”).
- **Reportes repetibles**: generar el mismo reporte en distintos momentos produce resultados comparables, con histórico.
- **Menos retrabajo**: ajustes se reflejan inmediatamente en reportes, sin circular nuevas versiones de archivos.
- **Mejor gobierno del dato**: roles y permisos; registros en un repositorio único de información.

## Impacto esperado (para dirección)
- **Reducción de tiempos de levantamiento y consolidación**: de días/semanas (según tamaño) a generación automática de reportes.
- **Menos hallazgos por inconsistencias**: disminuye el riesgo de errores por manejo manual de Excel.
- **Mayor capacidad de análisis**: la información queda lista para comparar dependencias, priorizar procesos y sustentar decisiones.

## Resultados que habilita
- **Mapa de cargas por dependencia y nivel** para decisiones de distribución de trabajo.
- **Sustento técnico** para requerimientos de personal y ajustes organizacionales.
- **Seguimiento** del comportamiento de tiempos/frecuencias y evidencia para auditorías.

## Nota sobre “personal requerido”
El sistema calcula “personal requerido” a partir de los **totales de horas** y una **jornada mensual** definida en la regla vigente. Si se requiere, este parámetro puede **unificarse o configurarse** para alinearlo con la política institucional (p. ej. 167 vs 176 horas/mes).

