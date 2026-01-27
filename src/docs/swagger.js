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
        url: 'http://localhost:3030/api',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
      ,
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            correo: { type: 'string', example: 'usuario@pullman.cl' },
            rol: { type: 'string', example: 'USUARIO' }
          }
        },
        Rol: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'USUARIO' },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJ...' }
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
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

module.exports = swaggerJSDoc(options);
