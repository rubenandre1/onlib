const express = require('express');
const router = express.Router();
const logger = require('../utils/logger'); // Importar o logger

// Rota para processar pagamentos
router.post('/process', async (req, res) => {
    logger.info('Dados recebidos no backend:', req.body);
    const { userId, type, amount } = req.body;

    if (!userId || !type || !amount) {
        logger.warn('User ID, payment type, and amount are required.');
        return res.status(400).json({ message: 'User ID, payment type, and amount are required.' });
    }

    logger.info(`[POST] Processing payment - User ID: ${userId}, Type: ${type}, Amount: €${amount}`);

    try {
        if (type === 'late_fee') {
            // Process payment for late fees
            const [result] = await req.db.query(
                `DELETE FROM late_fees WHERE user_id = ? AND amount = ? LIMIT 1`,
                [userId, amount]
            );
            logger.info(`[INFO] Late fee payment processed for User ID: ${userId}, Rows affected: ${result.affectedRows}`);
        } else if (type === 'subscription') {
            // Process payment for subscription
            const nextPaymentDate = new Date();
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            const [result] = await req.db.query(
                `UPDATE subscriptions 
                 SET status = 'active', next_payment_date = ?, last_payment_date = NOW()
                 WHERE user_id = ?`,
                [nextPaymentDate, userId]
            );
            logger.info(`[INFO] Subscription payment processed for User ID: ${userId}, Rows affected: ${result.affectedRows}`);
        } else {
            logger.warn('Invalid payment type.');
            return res.status(400).json({ message: 'Invalid payment type.' });
        }

        return res.status(200).json({
            message: 'Payment processed successfully.',
            userId,
            type,
            amount,
        });
    } catch (error) {
        logger.error(`[ERROR] Error processing payment for User ID: ${userId}:`, error);
        return res.status(500).json({ message: 'Failed to process payment.', error: error.message });
    }
});

// Rota para obter detalhes de pagamento de um utilizador
router.get('/details', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        logger.warn('User ID is required.');
        return res.status(400).json({ message: 'User ID is required.' });
    }

    logger.info(`[GET] Fetching payment details for User ID: ${userId}`);

    try {
        const [results] = await req.db.query(
            `SELECT 
                MAX(subscriptions.status) AS subscriptionStatus,
                MAX(subscriptions.amount) AS subscriptionAmount,
                MAX(subscriptions.end_date) AS endDate,
                MAX(subscriptions.next_payment_date) AS nextPaymentDate,
                MAX(subscriptions.last_payment_date) AS lastPaymentDate,
                IFNULL(SUM(late_fees.amount), 0) AS totalLateFees
            FROM subscriptions
            LEFT JOIN late_fees ON subscriptions.user_id = late_fees.user_id
            WHERE subscriptions.user_id = ?`,
            [userId]
        );

        if (results.length === 0) {
            logger.warn(`[WARN] No payment details found for User ID: ${userId}`);
            return res.status(404).json({ message: 'No payment details found for this user.' });
        }

        logger.info(`[INFO] Payment details fetched successfully for User ID: ${userId}`);
        res.status(200).json(results[0]);
    } catch (error) {
        logger.error(`[ERROR] Error fetching payment details for User ID: ${userId}:`, error);
        res.status(500).json({ message: 'Failed to fetch payment details.', error: error.message });
    }
});

module.exports = router;
