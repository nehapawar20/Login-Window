import React, { useState } from 'react';
import { LoginWindow } from './components/LoginWindow';
import { UserSession } from './types/auth';
import { Layout, AppWindow, X, Check, Code, Shield } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'card' | 'modal'>('card');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lastLoggedInSession, setLastLoggedInSession] = useState<UserSession | null>(null);

  const handleLoginSuccess = (session: UserSession) => {
    setLastLoggedInSession(session);
  };

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <header className="app-header">
        <div className="header-brand">
          <Shield className="brand-logo-icon" size={24} />
          <span className="brand-name">React + TS Auth</span>
        </div>

        {/* View Mode Switcher */}
        <div className="view-switcher">
          <button
            type="button"
            className={`mode-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('card');
              setIsModalOpen(false);
            }}
          >
            <Layout size={16} />
            <span>Card View</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${viewMode === 'modal' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('modal');
              setIsModalOpen(true);
            }}
          >
            <AppWindow size={16} />
            <span>Modal Window View</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {viewMode === 'card' ? (
          <div className="centered-view">
            <LoginWindow onSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <div className="modal-trigger-view">
            <div className="modal-promo-card">
              <div className="promo-icon">
                <AppWindow size={36} />
              </div>
              <h2>Modal / Dialog Window Demonstration</h2>
              <p>
                In modal mode, the login window pops up over the background content as a modal
                dialog with an overlay backdrop and close button.
              </p>
              <button
                type="button"
                className="btn-open-modal"
                onClick={() => setIsModalOpen(true)}
              >
                Open Login Window
              </button>
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
              <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                <div
                  className="modal-window"
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                >
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                  <LoginWindow
                    onSuccess={(session) => {
                      handleLoginSuccess(session);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informational Feature Highlights */}
        <aside className="features-section">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <Code size={18} />
              </div>
              <div className="feature-text">
                <h3>100% TypeScript Typed</h3>
                <p>Strict types for forms, validations, API responses, and user sessions.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Check size={18} />
              </div>
              <div className="feature-text">
                <h3>Live Validation & Visibility</h3>
                <p>Real-time email & password checking with toggleable password visibility.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Shield size={18} />
              </div>
              <div className="feature-text">
                <h3>Registration Enforced</h3>
                <p>Only users registered in the database can sign in. Unregistered emails are blocked.</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        {lastLoggedInSession ? (
          <p>
            Logged in as <strong>{lastLoggedInSession.email}</strong> at{' '}
            {lastLoggedInSession.loggedInAt}
          </p>
        ) : (
          <p>React + TypeScript Basic Login Window Demo</p>
        )}
      </footer>
    </div>
  );
};

export default App;

