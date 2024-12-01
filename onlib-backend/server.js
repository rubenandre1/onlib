const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const passport = require('./auth/googleAuth');
const session = require('express-session');
const authRoute = require('./routes/auth');
const dashboardRoute = require('./routes/dashboard');
const googleBooksRoute = require('./routes/googleBooks');
const lateFeesRoute = require('./routes/lateFees');
const adminPaymentsRoute = require('./routes/adminPayments');
const subscriptionsRoute = require('./routes/subscriptions');
const paymentsRoute = require('./routes/payments'); // Nova rota para pagamentos
const { metricsMiddleware, exposeMetrics } = require('./middlewares/metrics'); // Middleware de métricas

// Inicializar o app
const app = express();
require('dotenv').config();

// Configurar a conexão ao banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Salsa.0700',
    database: 'onlib',
};
const db = mysql.createPool(dbConfig);

// Middleware para injetar a conexão do banco de dados nas rotas
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Configurar middlewares globais
app.use(bodyParser.json());
app.use(cors());
app.use(metricsMiddleware); // Adicionar middleware de métricas

// Configurar o express-session
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'default_secret_key', // Substituir por uma chave segura
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 dia
        },
    })
);

// Middleware para inicializar o Passport
app.use(passport.initialize());
app.use(passport.session());

// Registrar as rotas principais
const booksRoute = require('./routes/books');
const recommendationsRoute = require('./routes/recommendations');
const loanRoute = require('./routes/loan');
const readingHistoryRoute = require('./routes/readingHistory');
const usersRoute = require('./routes/users');

// Registrar rotas
app.use('/auth', authRoute);
app.use('/dashboard', dashboardRoute);
app.use('/late-fees', lateFeesRoute);
app.use('/google-books', googleBooksRoute);
app.use('/books', booksRoute);
app.use('/recommendations', recommendationsRoute);
app.use('/loans', loanRoute);
app.use('/reading-history', readingHistoryRoute);
app.use('/users', usersRoute);
app.use('/subscriptions', subscriptionsRoute);
app.use('/admin/payments', adminPaymentsRoute);
app.use('/payments', paymentsRoute); // Nova rota de pagamentos

// Rota para expor métricas
app.get('/metrics', exposeMetrics); // Adicionar rota de métricas

// Rota de teste para confirmar se o servidor está rodando
app.get('/', (req, res) => {
    res.send('Servidor está funcionando corretamente!');
});

// Inicializar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = db;
