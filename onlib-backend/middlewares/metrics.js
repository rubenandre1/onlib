const client = require('prom-client');

// Criar um coletor de métricas
const collectDefaultMetrics = client.collectDefaultMetrics;

// Inicializar métricas padrão
collectDefaultMetrics();

// Middleware para coletar métricas HTTP
const metricsMiddleware = (req, res, next) => {
    const end = res.end;
    const startEpoch = Date.now();

    res.end = (...args) => {
        const duration = (Date.now() - startEpoch) / 1000; // Duração em segundos
        client.register
            .getSingleMetric('http_request_duration_seconds')
            ?.observe({
                method: req.method,
                route: req.route ? req.route.path : req.url,
                status: res.statusCode,
            }, duration);

        end.apply(res, args);
    };

    next();
};

// Função para expor métricas
const exposeMetrics = async (req, res) => {
    try {
        const metrics = await client.register.metrics(); // Aguarde as métricas serem geradas
        res.set('Content-Type', client.register.contentType); // Defina o tipo de conteúdo
        res.end(metrics); // Envie as métricas como string
    } catch (error) {
        console.error('Error exposing metrics:', error);
        res.status(500).end('Error generating metrics'); // Retorne erro apropriado
    }
};

module.exports = {
    metricsMiddleware,
    exposeMetrics,
};
