import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LateFees.css';

const LateFees = ({ userId }) => {
  const [lateFees, setLateFees] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false); // Estado para indicar erro técnico

  useEffect(() => {
    fetchLateFees();
  }, []);

  const fetchLateFees = async () => {
    try {
      const response = await axios.post('http://localhost:5000/late-fees/calculate', { userId });
      setLateFees(response.data || []);
      
      // Caso não existam taxas de atraso
      if (response.data.length === 0) {
        setMessage('You currently have no late fees. Great job returning books on time!');
        setError(false); // Sem erros
      } else {
        setMessage(''); // Limpar mensagem se houver dados
      }
    } catch (error) {
      console.error('Error fetching late fees:', error);
      setMessage('We encountered an issue fetching your late fees. Please try again later.');
      setError(true); // Indicar erro
    }
  };

  return (
    <div className="late-fees-container">
      <h2>Your Late Fees</h2>
      
      {/* Exibir mensagem relevante */}
      {message && (
        <p className={`message ${error ? 'error-message' : 'no-fees-message'}`}>
          {message}
        </p>
      )}
      
      {/* Exibir tabela apenas se houver taxas de atraso */}
      {lateFees.length > 0 && (
        <table className="late-fees-table">
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Due Date</th>
              <th>Days Late</th>
              <th>Late Fee</th>
            </tr>
          </thead>
          <tbody>
            {lateFees.map((fee, index) => (
              <tr key={index}>
                <td>{fee.title}</td>
                <td>{fee.dueDate}</td>
                <td>{fee.daysLate}</td>
                <td>{fee.lateFee} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LateFees;
