const express = require('express');
const router = express.Router();
const logger = require('../utils/logger'); // Importar o logger

// Log para verificar se o arquivo foi carregado
logger.info('Subscriptions route loaded');

// Rota para criar uma nova subscrição
router.post('/subscribe', async (req, res) => {
    logger.info('POST /subscribe endpoint accessed');

    const { userId, duration } = req.body;
    logger.info('Request body:', { userId, duration });

    if (!userId || !duration) {
        logger.warn('Missing userId or duration in request body');
        return res.status(400).json({ message: 'User ID and duration are required.' });
    }

    const amount = duration === 1 ? 5 : 10;
    const startDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const endDate = new Date(new Date().setMonth(new Date().getMonth() + duration))
        .toISOString().slice(0, 19).replace('T', ' ');

    try {
        const result = await req.db.query(
            'INSERT INTO subscriptions (user_id, start_date, end_date, amount) VALUES (?, ?, ?, ?)',
            [userId, startDate, endDate, amount]
        );
        logger.info('Subscription created successfully:', result);
        res.status(201).send('Subscription created successfully.');
    } catch (error) {
        logger.error('Failed to create subscription:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Rota para obter informações sobre a subscrição de um utilizador
router.get('/subscription', async (req, res) => {
    logger.info('GET /subscription endpoint accessed');

    const { userId } = req.query;
    logger.info('Query params:', { userId });

    if (!userId) {
        logger.warn('Missing userId in query params');
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        const [results] = await req.db.query(
            `SELECT 
                users.id AS userId, 
                users.name, 
                users.email, 
                subscriptions.status AS subscriptionStatus,
                subscriptions.next_payment_date AS nextPaymentDate,
                subscriptions.last_payment_date AS lastPaymentDate,
                subscriptions.amount AS amount,
                subscriptions.start_date AS startDate,
                subscriptions.end_date AS endDate
            FROM users
            LEFT JOIN subscriptions ON users.id = subscriptions.user_id
            WHERE users.id = ?`,
            [userId]
        );

        logger.info('Query results:', results);

        if (results.length === 0) {
            logger.warn('No subscription found for user:', userId);
            return res.status(404).json({ message: 'No subscription found for this user.' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        logger.error('Error fetching subscription:', error);
        res.status(500).json({ message: 'Failed to fetch subscription.' });
    }
});

// Rota para verificar atrasos e aplicar taxas
router.post('/check-late-fees', async (req, res) => {
    logger.info('POST /check-late-fees endpoint accessed');

    try {
        const [subscriptions] = await req.db.query(
            `SELECT 
                id, 
                user_id, 
                next_payment_date, 
                status 
             FROM subscriptions 
             WHERE status = 'active'`
        );

        const currentDate = new Date();
        const lateFee = 5.00; // Valor da taxa de atraso
        const updates = [];

        for (const subscription of subscriptions) {
            const nextPaymentDate = new Date(subscription.next_payment_date);
            
            // Verificar se a data de pagamento já passou
            if (nextPaymentDate < currentDate) {
                updates.push({
                    id: subscription.id,
                    userId: subscription.user_id,
                });

                // Atualizar status e adicionar taxa de atraso
                await req.db.query(
                    `UPDATE subscriptions 
                     SET status = 'inactive' 
                     WHERE id = ?`,
                    [subscription.id]
                );

                await req.db.query(
                    `INSERT INTO late_fees (user_id, amount, date_applied) 
                     VALUES (?, ?, ?)`,
                    [subscription.user_id, lateFee, currentDate]
                );
            }
        }

        if (updates.length === 0) {
            logger.info('No late fees applied. All subscriptions are up to date.');
            return res.status(200).json({ message: 'No late fees applied. All subscriptions are up to date.' });
        }

        logger.info('Late fees applied to subscriptions:', updates);
        res.status(200).json({
            message: 'Late fees applied successfully.',
            updates,
        });
    } catch (error) {
        logger.error('Error applying late fees:', error);
        res.status(500).json({ message: 'Failed to apply late fees.', error: error.message });
    }
});

module.exports = router;
