const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Configuração do formato
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'onlib-backend' },
    transports: [
        // Salvar logs diários
        new DailyRotateFile({
            filename: 'logs/%DATE%-backend.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d', // Guardar logs por 14 dias
        }),
        // Mostrar logs no console
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            ),
        }),
    ],
});

// Exportar o logger
module.exports = logger;
