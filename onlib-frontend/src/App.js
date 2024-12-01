import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import BookCatalog from './components/BookCatalog';
import Recommendations from './components/Recommendations';
import LoanManagement from './components/LoanManagement';
import ReadingHistory from './components/ReadingHistory';
import GoogleBooksImport from './components/GoogleBooksImport'; // Componente de Importação do Google
import LateFees from './components/LateFees'; // Novo componente de taxas de atraso
import AuthPage from './components/AuthPage'; // Componente de autenticação
import SubscriptionStatus from './components/SubscriptionStatus'; // Novo componente de estado de subscrição
import UserSubscription from './components/UserSubscription'; // Detalhes da subscrição
import UserPaymentDetails from './components/UserPaymentDetails';

import './App.css';

const App = () => {
  const [user, setUser] = useState(null); // Estado do utilizador autenticado

  return (
    <Router>
      <div className="app">
        {!user ? (
          // Página de autenticação se o utilizador não estiver autenticado
          <Routes>
            <Route path="*" element={<AuthPage onAuthSuccess={setUser} />} />
          </Routes>
        ) : (
          <>
            {/* Mensagem de boas-vindas */}
            <div className="welcome-message">
              <h1>Welcome to OnLib, {user.name}</h1>
              <button onClick={() => setUser(null)} className="logout-button">
                Logout
              </button>
            </div>

            {/* Botões de Ação */}
            <div className="action-buttons">
              <NavLink to="/catalog" className="action-button">Book Catalog</NavLink>
              <NavLink to="/recommendations" className="action-button">Recommendations</NavLink>
              <NavLink to="/loan" className="action-button">Loan Management</NavLink>
              <NavLink to="/history" className="action-button">Reading History</NavLink>
              <NavLink to="/import-books" className="action-button">Import Books</NavLink>
              <NavLink to="/late-fees" className="action-button">Late Fees</NavLink>
              <NavLink to="/subscription-status" className="action-button">Subscription Status</NavLink>
              <NavLink to="/subscription" className="action-button">Subscription Details</NavLink>
              <NavLink to="/payment-details" className="action-button">Payment Details</NavLink>
            </div>

            {/* Rotas */}
            <Routes>
              <Route path="/" element={null} />
              <Route path="/catalog" element={<BookCatalog userId={user.id} />} />
              <Route path="/recommendations" element={<Recommendations userId={user.id} />} />
              <Route path="/loan" element={<LoanManagement userId={user.id} />} />
              <Route path="/history" element={<ReadingHistory userId={user.id} />} />
              <Route path="/import-books" element={<GoogleBooksImport />} />
              <Route path="/late-fees" element={<LateFees userId={user.id} />} />
              <Route path="/subscription" element={<UserSubscription userId={user.id} />} />
              <Route path="/payment-details" element={<UserPaymentDetails userId={user.id} />} />
              <Route
                path="/subscription-status"
                element={<SubscriptionStatus userId={user.id} />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;