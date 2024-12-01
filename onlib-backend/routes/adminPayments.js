const express = require('express');
const router = express.Router();

// Rota para obter o estado de pagamentos de todos os utilizadores
router.get('/status', async (req, res) => {
  try {
    const [results] = await req.db.query(`
      SELECT users.id AS userId, users.name, users.email, 
             subscriptions.status AS subscriptionStatus,
             subscriptions.next_payment_date AS nextPaymentDate,
             subscriptions.last_payment_date AS lastPaymentDate
      FROM users
      LEFT JOIN subscriptions ON users.id = subscriptions.user_id
    `);

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching payment statuses:', error);
    res.status(500).json({ message: 'Failed to fetch payment statuses.' });
  }
});

// Rota para atualizar o estado da subscrição de um utilizador
router.put('/update/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { status, nextPaymentDate, lastPaymentDate } = req.body;

  try {
    await req.db.query(
      `UPDATE subscriptions 
       SET status = ?, next_payment_date = ?, last_payment_date = ? 
       WHERE user_id = ?`,
      [status, nextPaymentDate, lastPaymentDate, userId]
    );

    res.status(200).json({ message: 'Payment status updated successfully.' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Failed to update payment status.' });
  }
});

module.exports = router;
