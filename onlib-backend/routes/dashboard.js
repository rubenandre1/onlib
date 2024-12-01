const express = require('express');
const router = express.Router();

// Middleware para verificar se o utilizador está autenticado
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/google'); // Redirecionar para login se não autenticado
}

// Rota protegida
router.get('/', isAuthenticated, (req, res) => {
    res.send(`Bem-vindo(a), ${req.user.name}!`);
});

module.exports = router;
