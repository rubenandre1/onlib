const express = require('express');
const passport = require('../auth/googleAuth');
const router = express.Router();

// Iniciar login com Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback do Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard'); // Redirecionar após login bem-sucedido
  }
);

module.exports = router;
