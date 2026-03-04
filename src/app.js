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


// Rutas
app.use('/api', routes);

// Errores (siempre al final)
app.use(errorMiddleware);

module.exports = app;
