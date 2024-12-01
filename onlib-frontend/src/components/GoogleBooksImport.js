import React, { useState } from 'react';
import axios from 'axios';
import './GoogleBooksImport.css';

const GoogleBooksImport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Inicializar como array vazio
  const [message, setMessage] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false); // Controlar se uma pesquisa foi feita

  const handleSearch = async () => {
    try {
      setSearchAttempted(true); // Indicar que uma pesquisa foi feita
      const response = await axios.post('http://localhost:5000/books/import', { searchQuery });
      setMessage('Books imported successfully.');
      setSearchResults(response.data || []); // Garantir que sempre retorna um array
    } catch (error) {
      console.error('Failed to import books:', error);
      setMessage('Failed to import books.');
      setSearchResults([]); // Definir como array vazio em caso de erro
    }
  };

  return (
    <div className="google-books-import-container">
      <div className="header">
        <h2>
          Import Books from Google 
          <img src="/googlelogo.png" alt="Google Logo" className="google-logo" />
        </h2>
      </div>
      <input
        type="text"
        placeholder="Enter search term (e.g., Harry Potter)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">Search & Import</button>
      {message && <p className="message">{message}</p>}
      {searchAttempted && (
        <div className="search-results">
          <h3>Search Results</h3>
          {Array.isArray(searchResults) && searchResults.length > 0 ? (
            <ul>
              {searchResults.map((book, index) => (
                <li key={index} className="result-item">
                  <strong>{book.title}</strong> by {book.author}
                </li>
              ))}
            </ul>
          ) : (
            searchResults.length === 0 && <p className="no-results">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleBooksImport;