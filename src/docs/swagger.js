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
      { name: 'Eventos', description: 'Gestión de eventos' }
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
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            message: { type: 'string', example: 'Usuario creado satisfactoriamente' }
          }
        },
        CreateUser: {
          type: 'object',
          required: ['correo','password'],
          properties: {
            correo: { type: 'string', example: 'nuevo@pullman.cl' },
            password: { type: 'string', example: 'Password123' },
            rol: { type: 'string', example: 'USUARIO' }
          }
        },
        UpdateUser: {
          type: 'object',
          properties: {
            correo: { type: 'string', example: 'actualizado@pullman.cl' },
            password: { type: 'string', example: 'NewPass123' },
            rol: { type: 'string', example: 'USUARIO' }
          }
        }
        ,
        Empresa: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Mi Empresa' },
            rut: { type: 'string', example: '12345678-9' },
            status: { type: 'string', example: 'ACTIVO' }
          }
        },
        CreateEmpresa: {
          type: 'object',
          required: ['nombre','rut'],
          properties: {
            nombre: { type: 'string', example: 'Mi Empresa' },
            rut: { type: 'string', example: '12345678-9' }
          }
        },
        UpdateEmpresa: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: 'Mi Empresa S.A.' },
            rut: { type: 'string', example: '12345678-9' },
            status: { type: 'string', example: 'INACTIVA' }
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
    './src/routes/**/*.js',
    './src/controllers/*.js'
  ]
};

module.exports = swaggerJSDoc(options);
