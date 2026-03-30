process.env.TZ = 'America/Santiago';
const express = require('express');
const compression = require('compression');
const routes = require('./routes');
const cors = require('cors');
const errorMiddleware = require('./middlewares/error.middleware');
const app = express();

// CORS
const allowedOrigins = [
    '*'
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como apps móviles o curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(compression());

// Contexto Asíncrono para Auditoría
const { context } = require('./utils/context');
app.use((req, res, next) => {
    context.run({ userId: null }, next);
});

// Middlewares base
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Rutas
if (process.env.SHOW_SWAGGER === 'true' || process.env.NODE_ENV === 'development') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


app.use('/api', routes);

// Errores (siempre al final)
app.use(errorMiddleware);

module.exports = app;
