process.env.TZ = 'America/Santiago';
const express = require('express');
const compression = require('compression');
const routes = require('./routes');
const cors = require('cors');
const errorMiddleware = require('./middlewares/error.middleware');
const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

// CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://backend-dev-convenios.dev-wit.com',
    'https://convenios.pullmanbus.cl'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(null, true); // Fallback to true for testing, but ideally restricted
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true
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
