import React, { useEffect, useState } from 'react';
import './UserSubscription.css'; // Para estilos (opcional)

const UserSubscription = ({ userId }) => {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(`http://localhost:5000/subscriptions/subscription?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch subscription: ${response.status}`);
        }
        const data = await response.json();
        setSubscriptionData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSubscription();
  }, [userId]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!subscriptionData) {
    return <div>Loading subscription details...</div>;
  }

  return (
    <div className="subscription-container">
      <h2>Your Subscription Details</h2>
      <p className={`status ${subscriptionData.subscriptionStatus === 'active' ? 'highlight' : 'error'}`}>
        Status: {subscriptionData.subscriptionStatus || 'N/A'}
      </p>
      <p className="highlight">
        Next Payment Date: {subscriptionData.nextPaymentDate || 'N/A'}
      </p>
      <p>
        Last Payment Date: {subscriptionData.lastPaymentDate || 'N/A'}
      </p>
      <p className="highlight">
        Amount: €{subscriptionData.amount || 'N/A'}
      </p>
      <p>
        Start Date: {subscriptionData.startDate || 'N/A'}
      </p>
      <p className="highlight">
        End Date: {subscriptionData.endDate || 'N/A'}
      </p>
    </div>
  );
};

export default UserSubscription;
