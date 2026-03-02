process.env.TZ = 'America/Santiago';
const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// CORS
// CORS
app.use(cors({
    origin: '*', // En producción limitar
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Middlewares base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Swagger (Solo activo si no es entorno de producción)
if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./docs/swagger');
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Rutas
app.use('/api', routes);

// Errores (siempre al final)
app.use(errorMiddleware);

module.exports = app;
