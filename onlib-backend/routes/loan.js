const express = require('express');
const router = express.Router();

// Obter todos os empréstimos
router.get('/', async (req, res) => {
    try {
        const [loans] = await req.db.query(`
            SELECT loans.id, loans.user_id, loans.book_id, loans.loan_date, loans.return_date,
                   users.name AS user_name, users.email AS user_email,
                   books.title AS book_title, books.author AS book_author
            FROM loans
            INNER JOIN books ON loans.book_id = books.id
            INNER JOIN users ON loans.user_id = users.id
        `);
        res.json(loans);
    } catch (error) {
        console.error('Failed to fetch loans:', error);
        res.status(500).send('Failed to fetch loans');
    }
});

// Obter livros emprestados
router.get('/loaned-books', async (req, res) => {
    try {
        const [loanedBooks] = await req.db.query(`
            SELECT loans.id AS loan_id, loans.book_id, loans.user_id, 
                   books.title, books.author
            FROM loans
            INNER JOIN books ON loans.book_id = books.id
            WHERE loans.return_date IS NULL
        `);
        res.json(loanedBooks);
    } catch (error) {
        console.error('Failed to fetch loaned books:', error);
        res.status(500).send('Failed to fetch loaned books');
    }
});

// Adicionar um novo empréstimo
router.post('/loan', async (req, res) => {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
        return res.status(400).send('User ID and Book ID are required.');
    }

    try {
        // Verificar se o livro está disponível
        const [books] = await req.db.query('SELECT available FROM books WHERE id = ?', [bookId]);
        if (books.length === 0 || !books[0].available) {
            return res.status(400).send('Book is not available.');
        }

        // Criar o empréstimo
        await req.db.query(
            'INSERT INTO loans (user_id, book_id, loan_date) VALUES (?, ?, CURDATE())',
            [userId, bookId]
        );

        // Atualizar disponibilidade do livro
        await req.db.query('UPDATE books SET available = FALSE WHERE id = ?', [bookId]);

        res.status(201).send('Loan added successfully');
    } catch (error) {
        console.error('Failed to add loan:', error);
        res.status(500).send('Failed to add loan');
    }
});

// Devolver um empréstimo
router.post('/return', async (req, res) => {
    const { loanId, userId } = req.body;

    if (!loanId || !userId) {
        return res.status(400).send('Loan ID and User ID are required.');
    }

    try {
        // Obter o empréstimo
        const [loans] = await req.db.query('SELECT user_id, book_id FROM loans WHERE id = ?', [loanId]);
        if (loans.length === 0) {
            return res.status(404).send('Loan not found.');
        }

        const loan = loans[0];

        // Validar se o utilizador é o dono do empréstimo
        if (loan.user_id !== parseInt(userId)) {
            return res.status(403).send('You are not authorized to return this loan.');
        }

        // Atualizar a data de devolução do empréstimo
        await req.db.query('UPDATE loans SET return_date = CURDATE() WHERE id = ?', [loanId]);

        // Atualizar disponibilidade do livro
        await req.db.query('UPDATE books SET available = TRUE WHERE id = ?', [loan.book_id]);

        res.status(200).send('Loan returned successfully');
    } catch (error) {
        console.error('Failed to return loan:', error);
        res.status(500).send('Failed to return loan');
    }
});

module.exports = router;