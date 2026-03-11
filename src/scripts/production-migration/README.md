# Guía de Migración Segura a Producción

Este directorio contiene los scripts necesarios para realizar la migración de datos una vez que los cambios se pasen a la rama `main` y se configuren las credenciales de producción en el `.env`.

## Orden de Ejecución Recomendado

### 1. Migración de Estructura (Automático)
Al iniciar el servidor en producción, las migraciones de Sequelize crearán la tabla `beneficios` y los campos necesarios.

### 2. Migración de Descuentos en Convenios
Este script prepara la tabla `convenios` agregando las columnas necesarias (`valor_descuento`, `tipo_descuento`, etc.) y migra el porcentaje actual al nuevo campo de valor.
```bash
node src/scripts/production-migration/01-migrate-convenio-discounts.js
```

### 3. Carga de Historial de Beneficiarios (BACKFILL)
Ejecute este script para pasar los registros antiguos a la nueva tabla. Es seguro correrlo mientras la app está encendida porque usa `upsert`.
```bash
node src/scripts/production-migration/02-backfill-beneficios-history.js
```

### 4. Cambio de Endpoints (Corte Final)
Una vez que el historial esté cargado, puedes empezar a cambiar el Frontend para que use `/api/beneficios`. 
**Nota importante**: No hay prisa para este paso, ya que los "Hooks" mantienen las tablas viejas y la nueva sincronizadas en tiempo real.

---
**Nota**: Asegúrese de que el servidor esté apagado o en modo mantenimiento durante la ejecución de estos scripts si desea evitar colisiones de validación.
