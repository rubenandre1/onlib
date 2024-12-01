import React from 'react';

const PayNowButton = ({ userId, type, amount }) => {
  const handlePayment = async () => {
    try {
      const response = await fetch('http://localhost:5000/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || null,
          type: type || 'late_fee',
          amount: amount || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        return;
      }

      const data = await response.json();
      alert(`Payment successful: ${data.message}`);
    } catch (error) {
      alert('Unexpected error occurred.');
    }
  };

  return (
    <button onClick={handlePayment} className="pay-now-button">
      Pay Now (€{amount})
    </button>
  );
};

export default PayNowButton;
