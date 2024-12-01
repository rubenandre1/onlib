import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Recommendations.css';

const Recommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]); // Recomendações globais
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('');
  const [bookId, setBookId] = useState('');
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchRecommendations();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/recommendations'); // Agora busca todas as recomendações
      setRecommendations(response.data);
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
    }
  };

  const handleAddRecommendation = async () => {
    if (!bookId || !rating) {
      setMessage('Por favor, selecione um livro e insira uma classificação.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/recommendations', {
        userId,
        bookId,
        comment,
        rating,
      });

      if (response.status === 201) {
        setMessage('Recomendação adicionada com sucesso!');
        setComment('');
        setRating('');
        setBookId('');
        fetchRecommendations(); // Atualizar todas as recomendações
      } else {
        setMessage('Falha ao adicionar recomendação.');
      }
    } catch (error) {
      console.error('Erro ao adicionar recomendação:', error);
      setMessage('Erro ao adicionar recomendação.');
    }
  };

  return (
    <div className="recommendations-container">
      <h2>Recomendações de Livros</h2>

      {message && <div className="message">{message}</div>}

      <div className="add-recommendation">
        <h3>Adicionar Recomendação</h3>
        <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
          <option value="">Selecione um livro</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Classificação (1-5)"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="1"
          max="5"
        />

        <textarea
          placeholder="Comentário (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>

        <button onClick={handleAddRecommendation}>Adicionar</button>
      </div>

      <div className="all-recommendations">
        <h3>Recomendações Globais</h3>
        <ul>
          {recommendations.map((rec) => (
            <li key={rec.id}>
              <strong>{rec.book_title}</strong> - {rec.rating}/5
              <p>
                <em>Comentário:</em> {rec.comment || 'Sem comentário.'}
              </p>
              <p>
                <em>Por:</em> {rec.user_name}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Recommendations;
