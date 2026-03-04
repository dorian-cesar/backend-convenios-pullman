# FEATURE: Soporte de Rutas Específicas y Tipo de Descuento Unificado en Convenio

## ⚠️ IMPORTANTE

Este cambio es una mejora evolutiva.
No debe romper los convenios actuales en producción.

Se deben agregar nuevas estructuras sin eliminar columnas existentes hasta validar migración.

---

# 1️⃣ CAMBIOS EN TABLA CONVENIO

## Nuevas Reglas de Negocio

* Un CONVENIO tiene un único `tipo_descuento`.
* El tipo de descuento puede ser:

  * Porcentaje
  * Monto Fijo
  * Tarifa Plana
* Si el convenio es Global, aplica a todas las rutas.
* Si es Rutas Especificas, solo aplica a las rutas configuradas.

---

## Estructura Final Esperada

```sql
CONVENIO (
    id INT PK,
    empresa_id INT,
    api_consulta_id INT,

    nombre VARCHAR(255),
    codigo VARCHAR(100),
    beneficio TEXT,
    imagenes JSON,

    tipo_alcance ENUM('Global','Rutas Especificas') NOT NULL,
    tipo_descuento ENUM('Porcentaje','Monto Fijo','Tarifa Plana') NOT NULL,

    valor_descuento DECIMAL(10,2) NULL,

    tope_monto_descuento DECIMAL(10,2),
    tope_cantidad_tickets INT,
    consumo_tickets INT,
    consumo_monto_descuento DECIMAL(10,2),

    limitar_por_stock BOOLEAN,
    limitar_por_monto BOOLEAN,

    fecha_inicio DATE,
    fecha_termino DATE,
    status ENUM('Activo','Inactivo'),

    createdAt DATETIME,
    updatedAt DATETIME,
    deletedAt DATETIME
);
```

---

## Validaciones

* Si tipo_descuento = 'Tarifa Plana'

  * valor_descuento debe ser NULL.
* Si tipo_descuento = 'Porcentaje' o 'Monto Fijo'

  * valor_descuento es obligatorio.

---

# 2️⃣ NUEVA TABLA: CONVENIO_RUTA

Un convenio puede tener múltiples rutas.

```sql
CONVENIO_RUTA (
    id INT PK,
    convenio_id INT NOT NULL,

    origen_codigo VARCHAR(10) NOT NULL,
    origen_ciudad VARCHAR(100) NOT NULL,
    destino_codigo VARCHAR(10) NOT NULL,
    destino_ciudad VARCHAR(100) NOT NULL,

    createdAt DATETIME,
    updatedAt DATETIME,
    deletedAt DATETIME,

    FOREIGN KEY (convenio_id) REFERENCES CONVENIO(id)
);
```

## Restricción recomendada

UNIQUE (convenio_id, origen_codigo, destino_codigo)

---

# 3️⃣ NUEVA TABLA: CONVENIO_RUTA_CONFIG

Permite configurar:

* Tipo de viaje (Solo Ida | Ida y Vuelta)
* Tipo de asiento (Semi Cama | Cama | Premium)
* Precio plano si aplica

```sql
CONVENIO_RUTA_CONFIG (
    id INT PK,
    convenio_ruta_id INT NOT NULL,

    tipo_viaje ENUM('Solo Ida','Ida y Vuelta') NOT NULL,
    tipo_asiento ENUM('Semi Cama','Cama','Premium') NOT NULL,

    precio_solo_ida DECIMAL(10,2) NULL,
    precio_ida_vuelta DECIMAL(10,2) NULL,

    max_pasajes INT NULL,

    createdAt DATETIME,
    updatedAt DATETIME,
    deletedAt DATETIME,

    FOREIGN KEY (convenio_ruta_id) REFERENCES CONVENIO_RUTA(id)
);
```

---

# 4️⃣ LÓGICA DE APLICACIÓN

## Si tipo_alcance = 'Global'

* Se ignora CONVENIO_RUTA.
* Se aplica descuento según tipo_descuento.

## Si tipo_alcance = 'Rutas Especificas'

* Se busca coincidencia exacta:

  * origen_codigo
  * destino_codigo
* Luego se valida:

  * tipo_viaje
  * tipo_asiento

---

# 5️⃣ MIGRACIÓN SEGURA

1. Agregar columnas nuevas en CONVENIO (tipo_alcance, tipo_descuento).
2. Crear tablas nuevas.
3. Mantener columnas antiguas temporalmente.
4. Migrar datos existentes:

   * Convenios actuales => tipo_alcance = 'Global'
   * Mapear porcentaje_descuento anterior a:
     tipo_descuento = 'Porcentaje'
     valor_descuento = porcentaje_descuento
5. Una vez validado, deprecar columnas antiguas.

---

# 6️⃣ CONSIDERACIONES IMPORTANTES

* No permitir mezcla de descuentos dentro de un mismo convenio.
* No permitir rutas duplicadas.
* Validar coherencia entre tipo_descuento y valores nulos.
* Mantener soft delete con deletedAt en todas las tablas.
* Índices recomendados:

  * CONVENIO(tipo_alcance, tipo_descuento)
  * CONVENIO_RUTA(origen_codigo, destino_codigo)
  * CONVENIO_RUTA_CONFIG(tipo_viaje, tipo_asiento)

---

# RESULTADO FINAL

Modelo escalable, consistente y compatible con producción.
