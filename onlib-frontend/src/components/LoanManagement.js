import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faUndo } from '@fortawesome/free-solid-svg-icons';
import './LoanManagement.css';

const LoanManagement = () => {
  const [books, setBooks] = useState([]);
  const [loanedBooks, setLoanedBooks] = useState([]);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUserId = parseInt(localStorage.getItem('userId'), 10);
    console.log('Current User ID:', currentUserId);
    setUserId(currentUserId);
    fetchData(currentUserId);
  }, []);

  const fetchData = async (currentUserId) => {
    try {
      const booksResponse = await axios.get('http://localhost:5000/books');
      const loansResponse = await axios.get('http://localhost:5000/loans/loaned-books');
      const allBooks = booksResponse.data;
      const allLoans = loansResponse.data;

      console.log('Loans Response:', allLoans); // Log para inspecionar os empréstimos

      const availableBooks = allBooks.filter(book => !allLoans.some(loan => loan.book_id === book.id));

      const loanedBooks = allLoans.map(loan => {
        const canReturn = parseInt(loan.user_id, 10) === currentUserId;
        console.log('Loan:', loan, 'Can Return:', canReturn);
        return {
        loan_id: loan.loan_id,
        book_id: loan.book_id,
        title: loan.title || 'Unknown',
        author: loan.author || 'Unknown',
        user_id: loan.user_id,
        canReturn,
        };
      });

      console.log('Processed Loaned Books:', loanedBooks);

      setBooks(availableBooks);
      setLoanedBooks(loanedBooks);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setMessage('Erro ao carregar dados. Por favor, tente novamente.');
      setVariant('danger');
    }
  };

  const handleLoanBook = async (bookId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setMessage('Falha: Utilizador não autenticado.');
        setVariant('danger');
        return;
      }

      const response = await axios.post('http://localhost:5000/loans/loan', { userId, bookId });
      if (response.status === 201) {
        setMessage('Livro emprestado com sucesso.');
        setVariant('success');
        fetchData(parseInt(userId, 10));
      }
    } catch (error) {
      console.error('Erro ao emprestar livro:', error);
      setMessage('Falha ao emprestar o livro.');
      setVariant('danger');
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setMessage('Falha: Utilizador não autenticado.');
        setVariant('danger');
        return;
      }

      const response = await axios.post('http://localhost:5000/loans/return', { loanId, userId });
      if (response.status === 200) {
        setMessage('Livro devolvido com sucesso.');
        setVariant('success');
        fetchData(parseInt(userId, 10));
      }
    } catch (error) {
      console.error('Erro ao devolver livro:', error);
      setMessage('Falha ao devolver o livro.');
      setVariant('danger');
    }
  };

  return (
    <div className="loan-management-container">
      <h2>Loan Management</h2>
      {message && (
        <Alert variant={variant} onClose={() => setMessage('')} dismissible>
          {message}
        </Alert>
      )}
      <div className="available-books">
        <h3>Available Books</h3>
        <ul>
          {books.map(book => (
            <li key={book.id}>
              {book.title} by {book.author}
              <Button variant="primary" onClick={() => handleLoanBook(book.id)}>
                <FontAwesomeIcon icon={faBook} /> Loan
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="loaned-books">
        <h3>Loaned Books</h3>
        <ul>
          {loanedBooks.map(loan => (
            <li key={loan.loan_id}>
              {loan.title} by {loan.author}
              {loan.canReturn && (
                  <>
                      {console.log('Exibindo botão Return para o empréstimo:', loan)}
                      <Button variant="secondary" onClick={() => handleReturnBook(loan.loan_id)}>
                          <FontAwesomeIcon icon={faUndo} /> Return
                      </Button>
                  </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LoanManagement;