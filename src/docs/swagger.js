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
