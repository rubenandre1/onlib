import React, { useEffect, useState } from 'react';
import './PaymentProcessing.css'; // Crie o arquivo CSS para os estilos

const PaymentProcessing = ({ userId }) => {
    const [paymentData, setPaymentData] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch detalhes de pagamento
        const fetchPaymentData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/payments/details?userId=${userId}`);
                if (!response.ok) throw new Error(`Failed to fetch payment details: ${response.status}`);
                const data = await response.json();
                setPaymentData(data);
            } catch (err) {
                setMessage(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentData();
    }, [userId]);

    const handleProcessPayment = async (type) => {
        try {
            const response = await fetch('http://localhost:5000/payments/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, type }),
            });
            if (!response.ok) throw new Error(`Failed to process payment: ${response.status}`);
            const result = await response.json();
            setMessage(result.message);
            setPaymentData({ ...paymentData, ...result.updatedData }); // Atualizar estado
        } catch (err) {
            setMessage(err.message);
        }
    };

    if (loading) return <div>Loading payment details...</div>;
    if (!paymentData) return <div>{message || 'No payment data available.'}</div>;

    return (
        <div className="payment-container">
            <h2>Payment Processing</h2>
            <p><strong>Subscription Status:</strong> {paymentData.subscriptionStatus || 'N/A'}</p>
            <p><strong>Total Amount Due:</strong> €{paymentData.totalDue || 0}</p>
            <button
                className="payment-button"
                onClick={() => handleProcessPayment('late_fee')}
                disabled={paymentData.totalDue <= 0}
            >
                Pay Now
            </button>
            {message && <div className="payment-message">{message}</div>}
        </div>
    );
};

export default PaymentProcessing;
