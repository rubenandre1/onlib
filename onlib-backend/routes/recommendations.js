const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

// Rota para obter todas as recomendações (nova rota)
router.get('/', async (req, res) => {
    try {
        const [recommendations] = await req.db.query(
            `SELECT r.id, r.comment, r.rating, u.name AS user_name, b.title AS book_title, b.author AS book_author
             FROM recommendations r
             INNER JOIN users u ON r.user_id = u.id
             INNER JOIN books b ON r.book_id = b.id`
        );
        res.json(recommendations);
    } catch (error) {
        console.error('Failed to fetch all recommendations:', error);
        res.status(500).send('Failed to fetch all recommendations.');
    }
});

// Rota para obter todas as recomendações de um livro específico
router.get('/books/:bookId', async (req, res) => {
    const { bookId } = req.params;

    try {
        const [recommendations] = await req.db.query(
            `SELECT r.id, r.comment, r.rating, u.name AS user_name 
             FROM recommendations r
             INNER JOIN users u ON r.user_id = u.id
             WHERE r.book_id = ?`,
            [bookId]
        );
        res.json(recommendations);
    } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        res.status(500).send('Failed to fetch recommendations.');
    }
});

// Rota para obter todas as recomendações feitas por um utilizador específico
router.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [recommendations] = await req.db.query(
            `SELECT r.id, r.comment, r.rating, b.title AS book_title 
             FROM recommendations r
             INNER JOIN books b ON r.book_id = b.id
             WHERE r.user_id = ?`,
            [userId]
        );
        res.json(recommendations);
    } catch (error) {
        console.error('Failed to fetch user recommendations:', error);
        res.status(500).send('Failed to fetch user recommendations.');
    }
});

// Rota para adicionar uma nova recomendação (ajustada)
router.post('/', async (req, res) => {
    const { userId, bookId, comment, rating } = req.body;

    if (!userId || !bookId || !rating) {
        return res.status(400).send('User ID, Book ID, and Rating are required.');
    }

    try {
        // Verificar se o livro existe
        const [bookExists] = await req.db.query('SELECT id FROM books WHERE id = ?', [bookId]);
        if (bookExists.length === 0) {
            return res.status(404).send('Book not found.');
        }

        // Verificar se o utilizador existe
        const [userExists] = await req.db.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (userExists.length === 0) {
            return res.status(404).send('User not found.');
        }

        // Adicionar a recomendação
        const [result] = await req.db.query(
            `INSERT INTO recommendations (user_id, book_id, comment, rating) 
             VALUES (?, ?, ?, ?)`,
            [userId, bookId, comment || '', rating]
        );

        res.status(201).json({
            message: 'Recommendation added successfully.',
            recommendationId: result.insertId,
        });
    } catch (error) {
        console.error('Failed to add recommendation:', error);
        res.status(500).send('Failed to add recommendation.');
    }
});

// Rota para remover uma recomendação (opcional, caso necessário)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await req.db.query('DELETE FROM recommendations WHERE id = ?', [id]);
        res.status(200).send('Recommendation deleted successfully.');
    } catch (error) {
        console.error('Failed to delete recommendation:', error);
        res.status(500).send('Failed to delete recommendation.');
    }
});

// Rota para gerar recomendações de livros com Machine Learning
router.get('/ml/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Buscar interações do usuário e livros no banco de dados
        const [interactions] = await req.db.query(
            `SELECT user_id, book_id, rating 
             FROM recommendations 
             WHERE user_id = ?`,
            [userId]
        );

        const [books] = await req.db.query(
            `SELECT id AS book_id, title 
             FROM books`
        );

        // Verificar se há dados suficientes para gerar recomendações
        if (interactions.length === 0 || books.length === 0) {
            return res.status(404).json({ message: 'Not enough data to generate recommendations.' });
        }

        // Chamar o script Python
        const python = spawn('python', ['./ml/recommender.py']);
        const inputData = JSON.stringify({ userId, interactions, books });

        python.stdin.write(inputData);
        python.stdin.end();

        let recommendations = '';

        python.stdout.on('data', (data) => {
            recommendations += data.toString();
        });

        python.stderr.on('data', (data) => {
            console.error('Python Error:', data.toString());
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('Python script exited with code:', code);
                return res.status(500).json({ message: 'Failed to generate recommendations.' });
            }

            try {
                const recommendedBooks = JSON.parse(recommendations);

                // Verificar se há recomendações
                if (Array.isArray(recommendedBooks) && recommendedBooks.length === 0) {
                    return res.status(404).json({ message: 'No recommendations available.' });
                }

                res.status(200).json({ recommendedBooks });
            } catch (error) {
                console.error('JSON Parse Error:', error);
                res.status(500).json({ message: 'Error parsing recommendations output.' });
            }
        });
    } catch (error) {
        console.error('Failed to generate ML recommendations:', error);
        res.status(500).send('Failed to generate ML recommendations.');
    }
});

module.exports = router;
