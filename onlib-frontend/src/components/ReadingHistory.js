import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReadingHistory.css';

const ReadingHistory = () => {
  const [readingHistory, setReadingHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchReadingHistory();
  }, []);

  const fetchReadingHistory = async () => {
    try {
      const userId = localStorage.getItem('userId'); // Obter o ID do utilizador autenticado
      if (!userId) {
        setErrorMessage('Utilizador não autenticado.');
        return;
      }

      const response = await axios.get(`http://localhost:5000/reading-history/${userId}`);
      setReadingHistory(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Erro ao buscar histórico de leitura:', error);
      setErrorMessage('Falha ao carregar histórico de leitura. Tente novamente.');
    }
  };

  return (
    <div className="reading-history-container">
      <h2>Reading History</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <ul>
        {readingHistory.map(entry => (
          <li key={entry.loan_id}>
            <strong>{entry.title}</strong> by {entry.author} - {new Date(entry.read_date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReadingHistory;
