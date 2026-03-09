const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Convenios Pullman',
      version: '1.2.0', // Refactor Pasajeros v2
      description: 'Documentación del backend de convenios Pullman (Enterprise)'
    },
    servers: [
      {
        url: process.env.SWAGGER_BASE_URL || 'http://localhost:3000',
        description: 'URL base (puede configurarse con SWAGGER_BASE_URL)'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Operaciones de autenticación (login, register)' },
      { name: 'Admin', description: 'Administración de usuarios y roles' },
      { name: 'Empresas', description: 'Gestión de empresas' },
      { name: 'Convenios', description: 'Gestión de convenios empresariales (Datos base)' },
      { name: 'Rutas de Convenios', description: 'Gestión de rutas específicas y configuraciones de pasajes' },
      { name: 'Pasajeros', description: 'Gestión de pasajeros' },
      { name: 'Eventos', description: 'Gestión de eventos (viajes)' },
      { name: 'ApiKeys', description: 'Gestión de llaves de acceso para integraciones externas' },
      { name: 'Estudiantes', description: 'Gestión de estudiantes independientes' },
      { name: 'Adultos Mayores', description: 'Gestión de adultos mayores independientes' },
      { name: 'Pasajeros Frecuentes', description: 'Gestión de pasajeros frecuentes independientes' },
      { name: 'Carabineros', description: 'Validación de convenio Carabineros' },
      { name: 'Beneficios', description: 'Gestión unificada de beneficiarios y sus programas (Ej. Escuela Militar)' },
      { name: 'APIs Registro', description: 'Catálogo de APIs para registro de beneficiarios externos' },
      { name: 'APIs Consulta', description: 'Catálogo de APIs para verificación de beneficiarios' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      },
      schemas: {
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                correo: { type: 'string' },
                rol: { type: 'string' }
              }
            },
            message: { type: 'string' }
          }
        },
        Empresa: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Empresa Test S.A.' },
            rut_empresa: { type: 'string', example: '76.000.000-1' },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        ApiConsulta: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'API Araucana' },
            endpoint: { type: 'string', example: '/api/integraciones/araucana/validar' },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        ApiRegistro: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'API Registro Estudiante' },
            endpoint: { type: 'string', example: '/api/integraciones/beneficiarios/estudiante/validar' },
            empresa_id: { type: 'integer' },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        Beneficio: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            slug: { type: 'string', example: 'ESTUDIANTE' },
            nombre: { type: 'string', example: 'Estudiante Regular' },
            api_consulta_id: { type: 'integer' },
            api_registro_id: { type: 'integer' },
            configuracion_imagenes: { type: 'object' },
            status: { type: 'string' }
          }
        },
        CreateEmpresa: {
          type: 'object',
          required: ['nombre', 'rut'],
          properties: {
            nombre: { type: 'string', example: 'Empresa Nueva S.A.' },
            rut: { type: 'string', example: '12.345.678-9' }
          }
        },
        UpdateEmpresa: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            rut: { type: 'string' },
            status: { type: 'string', enum: ['ACTIVO', 'INACTIVO'] }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            correo: { type: 'string', example: 'admin@pullman.cl' },
            nombre: { type: 'string', example: 'Admin User' },
            rut: { type: 'string', example: '11.111.111-1' },
            telefono: { type: 'string', example: '+56912345678' },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        Convenio: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Convenio ABC' },
            empresa_id: { type: 'integer', example: 1 },
            empresa_nombre: { type: 'string', example: 'Empresa ABC', description: 'Nombre de la empresa (primer nivel)' },
            empresa_rut: { type: 'string', example: '76.000.000-1', description: 'RUT de la empresa (primer nivel)' },
            tipo_consulta: { type: 'string', example: 'API_EXTERNA' },
            api_url_id: { type: 'integer', example: 1 },
            endpoint: { type: 'string', example: '/api/integraciones/araucana/validar', description: 'Ruta relativa del endpoint' },
            fecha_inicio: { type: 'string', format: 'date-time', example: '2026-01-01T00:00:00Z' },
            fecha_termino: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59Z' },
            tope_monto_descuento: { type: 'integer', example: 1000000, description: 'Monto máximo acumulado de descuentos' },
            tope_cantidad_tickets: { type: 'integer', example: 50 },
            tipo_alcance: { type: 'string', example: 'Global', enum: ['Global', 'Rutas Especificas'] },
            tipo_descuento: { type: 'string', example: 'Porcentaje', enum: ['Porcentaje', 'Monto Fijo', 'Tarifa Plana'] },
            valor_descuento: { type: 'integer', example: 15, description: 'Valor del descuento según su tipo' },
            porcentaje_descuento: { type: 'integer', example: 15 },
            codigo: { type: 'string', example: 'PROMO2026' },
            limitar_por_stock: { type: 'boolean', example: false },
            limitar_por_monto: { type: 'boolean', example: false },
            beneficio: { type: 'boolean', example: false },
            beneficio_nombre: { type: 'string', example: 'Descuento Estudiante', description: 'Nombre del beneficio si el convenio es de tipo beneficio' },
            beneficio_empresa: { type: 'string', example: 'Pullman Bus', description: 'Empresa vinculada al beneficio' },
            beneficio_endpoint_registro: { type: 'string', example: '/api/beneficios', description: 'Endpoint interno o externo al cual enviar los datos de registro (RUT, Nombre, convenio_id)' },
            beneficio_endpoint_validacion: { type: 'string', example: '/api/integraciones/beneficiarios/validar', description: 'Endpoint al cual enviar RUt y convenio_id para validar el beneficio' },
            imagenes: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://img1.com', 'https://img2.com']
            },
            status: { type: 'string', example: 'ACTIVO' },
            rutas: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ConvenioRuta'
              }
            }
          }
        },
        ConvenioRutaConfig: {
          type: 'object',
          properties: {
            tipo_viaje: { type: 'string', example: 'Solo Ida' },
            tipo_asiento: { type: 'string', example: 'Semi Cama' },
            precio_solo_ida: { type: 'number', example: 15000 },
            precio_ida_vuelta: { type: 'number', example: null },
            max_pasajes: { type: 'integer', example: 5 }
          }
        },
        ConvenioRuta: {
          type: 'object',
          properties: {
            origen_codigo: { type: 'string', example: '01' },
            origen_ciudad: { type: 'string', example: 'Santiago' },
            destino_codigo: { type: 'string', example: '02' },
            destino_ciudad: { type: 'string', example: 'Valparaíso' },
            configuraciones: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ConvenioRutaConfig'
              }
            }
          }
        },
        RutaInput: {
          type: 'object',
          properties: {
            origen_codigo: { type: 'string', example: '01' },
            origen_ciudad: { type: 'string', example: 'Santiago' },
            destino_codigo: { type: 'string', example: '02' },
            destino_ciudad: { type: 'string', example: 'Valparaíso' },
            configuraciones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipo_viaje: { type: 'string', example: 'Solo Ida' },
                  tipo_asiento: { type: 'string', example: 'Semi Cama' },
                  precio_solo_ida: { type: 'integer', example: 15000 },
                  precio_ida_vuelta: { type: 'integer', example: null },
                  max_pasajes: { type: 'integer', example: 5 }
                }
              }
            }
          }
        },
        Pasajero: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            rut: { type: 'string', example: '11.111.111-1' },
            nombres: { type: 'string', example: 'Juan' },
            apellidos: { type: 'string', example: 'Pérez' },
            fecha_nacimiento: { type: 'string', format: 'date', example: '1990-01-01' },
            correo: { type: 'string', example: 'juan@email.com' },
            telefono: { type: 'string', example: '+56912345678' },
            tipo_pasajero_id: { type: 'integer', example: 1 },
            empresa_id: { type: 'integer', example: 1 },
            convenio_id: { type: 'integer', example: 1 },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        Estudiante: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Maria Estudiante' },
            rut: { type: 'string', example: '20.200.200-K' },
            telefono: { type: 'string', example: '+56911111111' },
            correo: { type: 'string', example: 'maria@test.com' },
            direccion: { type: 'string', example: 'Av. Universidad 123' },
            imagen_cedula_identidad: { type: 'string', description: 'Imagen de la cédula de identidad en base64' },
            imagen_certificado_alumno_regular: { type: 'string', description: 'Certificado de alumno regular en base64' },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        AdultoMayor: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Juan Mayor' },
            rut: { type: 'string', example: '5.500.500-5' },
            telefono: { type: 'string', example: '+56922222222' },
            correo: { type: 'string', example: 'juan@test.com' },
            direccion: { type: 'string', example: 'Calle Mayor 456' },
            certificado: { type: 'string', example: 'CERT-SENAMA-001' },
            imagen_cedula_identidad: { type: 'string', description: 'Imagen de la cédula de identidad en base64' },
            imagen_certificado_residencia: { type: 'string', description: 'Certificado de residencia en base64' },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        PasajeroFrecuente: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Pedro Frecuente' },
            rut: { type: 'string', example: '10.100.100-1' },
            telefono: { type: 'string', example: '+56933333333' },
            correo: { type: 'string', example: 'pedro@test.com' },
            direccion: { type: 'string', example: 'Av. Viajes 789' },
            imagen_cedula_identidad: { type: 'string', description: 'Imagen de la cédula de identidad en base64' },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        Beneficio: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            convenio_id: { type: 'integer', example: 158 },
            nombre: { type: 'string', example: 'Juan Perez' },
            nombre_beneficio: { type: 'string', example: 'Estudiante Regular' },
            rut: { type: 'string', example: '11.111.111-1' },
            telefono: { type: 'string', example: '+56912345678' },
            correo: { type: 'string', example: 'juan@email.com' },
            direccion: { type: 'string', example: 'Calle Falsa 123' },
            status: { type: 'string', example: 'ACTIVO' },
            imagenes: {
              type: 'object',
              additionalProperties: { type: 'string' },
              description: 'Mapa de imágenes en Base64 (ej: { "cedula_frontal": "data:image/png;base64,..." })'
            },
            razon_rechazo: { type: 'string', example: 'Documento ilegible' }
          }
        },
        CrearBeneficio: {
          type: 'object',
          required: ['nombre', 'rut', 'convenio_id'],
          properties: {
            nombre: { type: 'string', example: 'Juan Perez' },
            nombre_beneficio: { type: 'string', example: 'Estudiante Regular', description: 'Nombre descriptivo del beneficio o programa asociado' },
            rut: { type: 'string', example: '11.111.111-1' },
            convenio_id: { type: 'integer', example: 158 },            telefono: { type: 'string', example: '+56912345678' },
            correo: { type: 'string', example: 'juan@email.com' },
            direccion: { type: 'string', example: 'Calle Falsa 123' },
            imagenes: {
              type: 'object',
              additionalProperties: { type: 'string' },
              description: 'Mapa de imágenes en Base64'
            },
            status: { type: 'string', example: 'INACTIVO', default: 'INACTIVO' }
          }
        },
        ActualizarBeneficio: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: 'Juan Perez' },
            nombre_beneficio: { type: 'string', example: 'Estudiante Regular' },
            rut: { type: 'string', example: '11.111.111-1' },
            convenio_id: { type: 'integer', example: 158 },            telefono: { type: 'string', example: '+56912345678' },
            correo: { type: 'string', example: 'juan@email.com' },
            direccion: { type: 'string', example: 'Calle Falsa 123' },
            imagenes: {
              type: 'object',
              additionalProperties: { type: 'string' }
            },
            status: { type: 'string', example: 'ACTIVO' },
            razon_rechazo: { type: 'string', example: 'Documento faltante' }
          }
        },

        Evento: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            tipo_evento: { type: 'string', enum: ['COMPRA', 'CAMBIO', 'DEVOLUCION'] },
            tipo_pago: { type: 'string', enum: ['EFECTIVO', 'DEBITO', 'CREDITO', 'WEBPAY', 'TRANSFERENCIA'], example: 'WEBPAY' },
            ciudad_origen: { type: 'string', example: 'Santiago' },
            ciudad_destino: { type: 'string', example: 'Valparaíso' },
            fecha_viaje: { type: 'string', format: 'date', example: '2026-02-15' },
            tarifa_base: { type: 'integer', example: 10000 },
            monto_pagado: { type: 'integer', example: 8000 },
            porcentaje_descuento_aplicado: { type: 'integer', example: 20 },
            pasajero_id: { type: 'integer', example: 1 },
            empresa_id: { type: 'integer', example: 1 },
            hora_salida: { type: 'string', example: '14:30' },
            terminal_origen: { type: 'string', example: 'Terminal Sur' },
            terminal_destino: { type: 'string', example: 'Terminal Valparaíso' },
            numero_ticket: { type: 'string', example: 'T-12345' },
            pnr: { type: 'string', example: 'PNR-XYZ' },
            codigo_autorizacion: { type: 'string', example: '123456' },
            token: { type: 'string', example: 'token_transbank_abc123' },
            estado: { type: 'string', example: 'confirmado', description: 'Estado del evento (e.g. confirmado, anulado, revertido, error_confirmacion)' }
          }
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Servicio Externo X' },
            key: { type: 'string', example: 'pb_6aac4c1130df091c9...' },
            status: { type: 'string', example: 'ACTIVO' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Descripción del error' }
          }
        },
        ValidacionBeneficiarioResponse: {
          type: 'object',
          properties: {
            afiliado: { type: 'boolean', example: true },
            mensaje: { type: 'string', example: 'Validación exitosa' },
            pasajero: { $ref: '#/components/schemas/Pasajero' },
            empresa: { type: 'string', example: 'PULLMAN BUS' },
            convenio: { $ref: '#/components/schemas/Convenio' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
        apiKeyAuth: []
      }
    ]
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

module.exports = swaggerJSDoc(options);
