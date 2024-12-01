import React, { useEffect, useState } from 'react';
import './UserPaymentDetails.css';

const UserPaymentDetails = ({ userId }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // Mensagem de feedback

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/payments/details?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch payment details: ${response.status}`);
        }
        const data = await response.json();
        console.log('Payment details fetched:', data); // Log para depuração
        setPaymentDetails(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching payment details:', err); // Log para depuração
      }
    };

    fetchPaymentDetails();
  }, [userId]);

  const handlePayNow = async () => {
    if (!paymentDetails || !userId || !paymentDetails.subscriptionAmount) {
      setMessage('Error: Missing required payment details.');
      console.error('Missing data:', {
        userId,
        type: 'subscription',
        amount: paymentDetails?.subscriptionAmount,
      });
      return;
    }

    console.log('Attempting to process payment:', {
      userId,
      type: 'subscription',
      amount: paymentDetails.subscriptionAmount,
    });

    try {
      const response = await fetch('http://localhost:5000/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: 'subscription', // Pode ser 'late_fee' se necessário
          amount: paymentDetails.subscriptionAmount,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Payment processed successfully!');
        console.log('Payment successful:', result);

        // Atualizar os detalhes de pagamento após o pagamento bem-sucedido
        setPaymentDetails((prevDetails) => ({
          ...prevDetails,
          subscriptionStatus: 'active',
          totalLateFees: 0,
        }));
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Error during payment processing:', err);
      setMessage(`Error: ${err.message}`);
    }
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!paymentDetails) {
    return <div className="loading-message">Loading payment details...</div>;
  }

  return (
    <div className="payment-details-container">
      <h2>Your Payment Details</h2>
      <p className="status">
        <strong>Status:</strong>{' '}
        <span className={paymentDetails.subscriptionStatus === 'active' ? 'highlight' : 'error'}>
          {paymentDetails.subscriptionStatus}
        </span>
      </p>
      <div className="details">
        <p><strong>Next Payment Date:</strong> {paymentDetails.nextPaymentDate || 'N/A'}</p>
        <p><strong>Last Payment Date:</strong> {paymentDetails.lastPaymentDate || 'N/A'}</p>
        <p><strong>Subscription Amount:</strong> €{paymentDetails.subscriptionAmount || 'N/A'}</p>
        <p><strong>Total Late Fees:</strong> €{paymentDetails.totalLateFees || '0.00'}</p>
      </div>
      <div className="pay-now">
        <button onClick={handlePayNow}>Pay Now</button>
      </div>
      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
    </div>
  );
};

export default UserPaymentDetails;
