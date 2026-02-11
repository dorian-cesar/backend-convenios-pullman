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
      { name: 'Eventos', description: 'Gestión de eventos (viajes)' },
      { name: 'ApiKeys', description: 'Gestión de llaves de acceso para integraciones externas' }
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
            endpoint: { type: 'string', example: '/api/integraciones/araucana/validar', description: 'Ruta relativa del endpoint' },
            tope_monto_ventas: { type: 'integer', example: 1000000 },
            tope_cantidad_tickets: { type: 'integer', example: 50 },
            porcentaje_descuento: { type: 'integer', example: 15 },
            codigo: { type: 'string', example: 'PROMO2026' },
            limitar_por_stock: { type: 'boolean', example: false },
            limitar_por_monto: { type: 'boolean', example: false },
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
            pasajero_id: { type: 'integer', example: 1 },
            empresa_id: { type: 'integer', example: 1 },
            hora_salida: { type: 'string', example: '14:30' },
            terminal_origen: { type: 'string', example: 'Terminal Sur' },
            terminal_destino: { type: 'string', example: 'Terminal Valparaíso' },
            numero_ticket: { type: 'string', example: 'T-12345' },
            pnr: { type: 'string', example: 'PNR-XYZ' }
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
