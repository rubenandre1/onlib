import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookCatalog.css';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  // Função para buscar todos os livros
  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    }
  };

  // Função para buscar livros filtrados pelo termo de busca
  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/books?search=${searchTerm}`);
      setBooks(response.data);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    }
  };

  return (
    <div className="catalog-container">
      <h2>Book Catalog</h2>
      <input
        type="text"
        placeholder="Search for books..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            {book.title} by {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookCatalog;
