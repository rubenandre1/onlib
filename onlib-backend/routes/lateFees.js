const express = require('express');
const router = express.Router();

// Rota para calcular a taxa de atraso
router.post('/calculate', async (req, res) => {
    const { loanId } = req.body;

    if (!loanId) {
        return res.status(400).send('Loan ID is required.');
    }

    try {
        // Buscar os detalhes do empréstimo
        const [loan] = await req.db.query('SELECT return_date FROM loans WHERE id = ?', [loanId]);
        if (!loan.length) {
            return res.status(404).send('Loan not found.');
        }

        const today = new Date();
        const returnDate = new Date(loan[0].return_date);

        if (today > returnDate) {
            const daysLate = Math.ceil((today - returnDate) / (1000 * 60 * 60 * 24)); // Dias de atraso
            const lateFee = Math.ceil(daysLate / 15) * 5; // Taxa de 5 euros por cada 15 dias atrasados

            // Atualizar a taxa de atraso no empréstimo
            await req.db.query('UPDATE loans SET late_fee = ? WHERE id = ?', [lateFee, loanId]);

            return res.status(200).send({ lateFee });
        } else {
            return res.status(200).send({ lateFee: 0 });
        }
    } catch (error) {
        console.error('Failed to calculate late fee:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
