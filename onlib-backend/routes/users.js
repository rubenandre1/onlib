const express = require('express');
const bcrypt = require('bcrypt'); // Para hash de passwords
const router = express.Router();

// Obter todos os utilizadores
router.get('/', async (req, res) => {
    try {
        const [users] = await req.db.query('SELECT id, name, email FROM users');
        res.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).send('Failed to fetch users');
    }
});

// Adicionar um novo utilizador
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await req.db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        res.status(201).send('User added successfully');
    } catch (error) {
        console.error('Failed to add user:', error);
        res.status(500).send('Failed to add user');
    }
});

// Rota de registro de utilizador
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required');
    }

    try {
        const [existingUser] = await req.db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await req.db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        res.status(201).json({ id: result.insertId, name, email });
    } catch (error) {
        console.error('Failed to register user:', error);
        res.status(500).send('Failed to register user');
    }
});

// Rota de login de utilizador
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    try {
        const [users] = await req.db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).send('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid password');
        }

        res.status(200).json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
        console.error('Failed to login:', error);
        res.status(500).send('Failed to login');
    }
});

// Remover um utilizador
router.delete('/:id', async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const [result] = await req.db.query('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).send('User removed successfully');
    } catch (error) {
        console.error('Failed to remove user:', error);
        res.status(500).send('Failed to remove user');
    }
});

// Editar um utilizador
router.put('/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, email, password } = req.body;

    try {
        const [users] = await req.db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            return res.status(404).send('User not found');
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

        await req.db.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [
            name || user.name,
            email || user.email,
            hashedPassword,
            userId
        ]);

        res.status(200).send('User updated successfully');
    } catch (error) {
        console.error('Failed to update user:', error);
        res.status(500).send('Failed to update user');
    }
});

module.exports = router;