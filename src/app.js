const express = require('express');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger'); // { changed code }

const app = express();

// Middlewares base
app.use(express.json());

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api', routes);

// Errores (siempre al final)
app.use(errorMiddleware);

module.exports = app;
