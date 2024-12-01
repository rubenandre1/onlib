import React, { useState, useEffect } from "react";

const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("http://localhost:5000/subscriptions/subscription?userId=9"); // Substituir pelo ID do utilizador autenticado
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError("Failed to load subscription data.");
      }
    };

    fetchSubscription();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!subscription) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Subscription Status</h1>
      <p><strong>Status:</strong> {subscription.subscriptionStatus || "No subscription"}</p>
      <p><strong>Next Payment Date:</strong> {subscription.nextPaymentDate || "N/A"}</p>
      <p><strong>Last Payment Date:</strong> {subscription.lastPaymentDate || "N/A"}</p>
      <p><strong>Amount:</strong> €{subscription.amount || "N/A"}</p>
    </div>
  );
};

export default SubscriptionStatus;
