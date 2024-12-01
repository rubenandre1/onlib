const express = require('express');
const router = express.Router();

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [history] = await req.db.query(`
            SELECT loans.id AS loan_id, books.title, books.author, loans.return_date AS read_date
            FROM loans
            INNER JOIN books ON loans.book_id = books.id
            WHERE loans.user_id = ? AND loans.return_date IS NOT NULL
        `, [userId]);

        res.json(history);
    } catch (error) {
        console.error('Failed to fetch reading history:', error);
        res.status(500).send('Failed to fetch reading history');
    }
});

module.exports = router;
