const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Convenios Pullman',
      version: '1.1.0', // Updated
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
      { name: 'Convenios', description: 'Gestión de convenios empresariales' },
      { name: 'Pasajeros', description: 'Gestión de pasajeros' },
      { name: 'Códigos de Descuento', description: 'Gestión de códigos de descuento' },
      { name: 'Descuentos', description: 'Gestión de reglas de descuento' },
      { name: 'Eventos', description: 'Gestión de eventos (viajes)' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
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
            tipo_consulta: { type: 'string', example: 'API_EXTERNA' },
            endpoint: { type: 'string', example: 'http://localhost:3000/api/integraciones/araucana/validar' },
            tope_monto_ventas: { type: 'integer', example: 1000000 },
            tope_cantidad_tickets: { type: 'integer', example: 50 },
            status: { type: 'string', example: 'ACTIVO' }
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
        CodigoDescuento: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            codigo: { type: 'string', example: 'VERANO2026' },
            convenio_id: { type: 'integer', example: 1 },
            fecha_inicio: { type: 'string', format: 'date', example: '2026-01-01' },
            fecha_termino: { type: 'string', format: 'date', example: '2026-03-01' },
            max_usos: { type: 'integer', example: 100 },
            usos_realizados: { type: 'integer', example: 10 },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        Descuento: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            convenio_id: { type: 'integer', example: 1 },
            codigo_descuento_id: { type: 'integer', example: null },
            tipo_pasajero_id: { type: 'integer', example: 1 },
            pasajero_id: { type: 'integer', example: null },
            porcentaje_descuento: { type: 'integer', example: 15 },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        Evento: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            tipo_evento: { type: 'string', enum: ['COMPRA', 'CAMBIO', 'DEVOLUCION'] },
            ciudad_origen: { type: 'string', example: 'Santiago' },
            ciudad_destino: { type: 'string', example: 'Valparaíso' },
            fecha_viaje: { type: 'string', format: 'date', example: '2026-02-15' },
            tarifa_base: { type: 'integer', example: 10000 },
            monto_pagado: { type: 'integer', example: 8000 },
            porcentaje_descuento_aplicado: { type: 'integer', example: 20 },
            usuario_id: { type: 'integer', example: 1 },
            pasajero_id: { type: 'integer', example: 1 },
            empresa_id: { type: 'integer', example: 1 }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

module.exports = swaggerJSDoc(options);
