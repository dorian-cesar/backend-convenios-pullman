const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Convenios Pullman',
      version: '1.0.0',
      description: 'Documentación del backend de convenios Pullman'
    },
    servers: [
      {
        url: process.env.SWAGGER_BASE_URL || 'http://localhost:3030',
        description: 'URL base (puede configurarse con SWAGGER_BASE_URL)'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Operaciones de autenticación (login, register)' },
      { name: 'Admin', description: 'Administración de usuarios y roles' },
      { name: 'Eventos', description: 'Gestión de eventos' },
      { name: 'Convenios', description: 'Gestión de convenios empresariales' },
      { name: 'Pasajeros', description: 'Gestión de pasajeros' },
      { name: 'Códigos de Descuento', description: 'Gestión de códigos de descuento' },
      { name: 'Descuentos', description: 'Gestión de reglas de descuento' }
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
        Descuento: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            convenio_id: { type: 'integer', example: 1 },
            codigo_descuento_id: { type: 'integer', example: null },
            tipo_pasajero_id: { type: 'integer', example: 1 },
            pasajero_id: { type: 'integer', example: null },
            porcentaje_descuento: { type: 'integer', example: 15 },
            status: { type: 'string', enum: ['ACTIVO', 'INACTIVO'], example: 'ACTIVO' },
            convenio: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                nombre: { type: 'string', example: 'Convenio Verano 2026' }
              }
            },
            tipo_pasajero: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                nombre: { type: 'string', example: 'ESTUDIANTE' }
              }
            }
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
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJSDoc(options);
