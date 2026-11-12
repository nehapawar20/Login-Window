import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  LogIn,
  KeyRound,
  ShieldCheck,
  LogOut,
  UserPlus,
  Users,
  RotateCcw,
} from 'lucide-react';
import {
  AuthMode,
  FormErrors,
  RegisterFormData,
  RegisteredUser,
  UserSession,
} from '../types/auth';
import './LoginWindow.css';

interface LoginWindowProps {
  onSuccess?: (session: UserSession) => void;
}

const STORAGE_KEY = 'demo_registered_users_v1';

const INITIAL_SEEDED_USERS: RegisteredUser[] = [
  {
    id: 'usr_initial_1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123!',
    registeredAt: 'Earlier today',
  },
];

export const LoginWindow: React.FC<LoginWindowProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showRegisteredDrawer, setShowRegisteredDrawer] = useState<boolean>(false);

  // Registered Users Registry (persisted in localStorage)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load registered users from storage:', e);
    }
    return INITIAL_SEEDED_USERS;
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registeredUsers));
    } catch (e) {
      console.error('Failed to save registered users:', e);
    }
  }, [registeredUsers]);

  // Form State
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Reset errors & status when switching tabs
  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setStatusMessage(null);
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (mode !== 'forgot-password') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    // Register-specific validation
    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear specific field error as user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  // Handle Authentication Submission (Strict Check: Must be registered first to sign in!)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setStatusMessage(null);

    try {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const normalizedEmail = formData.email.trim().toLowerCase();

      // ==========================================
      // FLOW 1: FORGOT PASSWORD
      // ==========================================
      if (mode === 'forgot-password') {
        const found = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (!found) {
          setErrors({
            general: `No registered account found with email "${formData.email}". Please register first.`,
          });
        } else {
          setStatusMessage(
            `Password recovery link has been sent to ${formData.email}. Please check your inbox.`
          );
        }
        setIsLoading(false);
        return;
      }

      // ==========================================
      // FLOW 2: SIGN IN (LOGIN)
      // STRICT RULE: Only registered users can sign in!
      // ==========================================
      if (mode === 'login') {
        const registeredUser = registeredUsers.find(
          (u) => u.email.toLowerCase() === normalizedEmail
        );

        // 1. Check if user is registered
        if (!registeredUser) {
          setErrors({
            general: `Access denied: No account found for "${formData.email}". You must register first before signing in!`,
          });
          setIsLoading(false);
          return;
        }

        // 2. Check if password matches
        if (registeredUser.password !== formData.password) {
          setErrors({
            password: 'Incorrect password for this registered account. Please check and retry.',
          });
          setIsLoading(false);
          return;
        }

        // 3. Successful Sign In
        const session: UserSession = {
          email: registeredUser.email,
          name: registeredUser.name,
          token: 'token_' + Math.random().toString(36).substring(2, 12),
          loggedInAt: new Date().toLocaleTimeString(),
        };
        setCurrentUser(session);
        onSuccess?.(session);
      }

      // ==========================================
      // FLOW 3: REGISTRATION
      // ==========================================
      else if (mode === 'register') {
        const alreadyExists = registeredUsers.some(
          (u) => u.email.toLowerCase() === normalizedEmail
        );

        // Check for duplicate registration
        if (alreadyExists) {
          setErrors({
            email: `An account with "${formData.email}" already exists. Please switch to Sign In.`,
          });
          setIsLoading(false);
          return;
        }

        // Create new registered user
        const newUser: RegisteredUser = {
          id: 'usr_' + Date.now().toString(36),
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedList = [newUser, ...registeredUsers];
        setRegisteredUsers(updatedList);

        // Switch to login tab and prefill email so they can immediately sign in!
        setMode('login');
        setStatusMessage(
          `Registration successful for ${newUser.name}! Your account is created. Please enter your password to sign in.`
        );
        setFormData((prev) => ({
          ...prev,
          email: newUser.email,
          password: '',
          confirmPassword: '',
        }));
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    setStatusMessage(null);
    setErrors({});
  };

  // Helper to prefill an existing registered user for fast testing
  const selectRegisteredUser = (user: RegisteredUser) => {
    setFormData((prev) => ({
      ...prev,
      email: user.email,
      password: user.password,
    }));
    setMode('login');
    setErrors({});
    setStatusMessage(`Selected registered user: ${user.name} (${user.email})`);
  };

  const resetToInitialUsers = () => {
    setRegisteredUsers(INITIAL_SEEDED_USERS);
    localStorage.removeItem(STORAGE_KEY);
    setStatusMessage('Database reset to initial demo state.');
  };

  // Render Logged In Screen
  if (currentUser) {
    return (
      <div className="login-card-container">
        <div className="login-card logged-in-state">
          <div className="success-icon-badge">
            <CheckCircle2 size={44} className="icon-success" />
          </div>
          <h2 className="card-title">Welcome Back, {currentUser.name}!</h2>
          <p className="card-subtitle">
            You successfully verified and signed in using your registered account.
          </p>

          <div className="user-details-box">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{currentUser.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Registered Email:</span>
              <span className="detail-value">{currentUser.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Auth Session ID:</span>
              <span className="detail-value font-mono">
                {currentUser.token}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Sign-in Timestamp:</span>
              <span className="detail-value">{currentUser.loggedInAt}</span>
            </div>
          </div>

          <button type="button" onClick={handleLogout} className="btn-secondary full-width">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-card-container">
      <div className="login-card">
        {/* Top Header / Brand Icon */}
        <div className="card-header">
          <div className="brand-badge">
            {mode === 'forgot-password' ? (
              <KeyRound size={28} className="brand-icon" />
            ) : mode === 'register' ? (
              <UserPlus size={28} className="brand-icon" />
            ) : (
              <LogIn size={28} className="brand-icon" />
            )}
          </div>
          <h1 className="card-title">
            {mode === 'login' && 'Sign in to Account'}
            {mode === 'register' && 'Register New Account'}
            {mode === 'forgot-password' && 'Reset your Password'}
          </h1>
          <p className="card-subtitle">
            {mode === 'login' && 'Only registered users can sign in. Register first if you are new.'}
            {mode === 'register' && 'Register once, then sign in with your verified credentials.'}
            {mode === 'forgot-password' && 'Enter your registered email to receive recovery instructions.'}
          </p>
        </div>

        {/* Tab Navigation for Login / Register */}
        {mode !== 'forgot-password' && (
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleModeChange('login')}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleModeChange('register')}
            >
              <UserPlus size={15} />
              <span>Register First</span>
            </button>
          </div>
        )}

        {/* Status / Success Feedback Banner */}
        {statusMessage && (
          <div className="alert alert-info">
            <CheckCircle2 size={18} className="alert-icon-flex" />
            <div className="alert-content">
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        {/* Error Feedback Banner with direct registration shortcut */}
        {errors.general && (
          <div className="alert alert-danger">
            <AlertCircle size={20} className="alert-icon-flex" />
            <div className="alert-content">
              <span>{errors.general}</span>
              {mode === 'login' && (
                <button
                  type="button"
                  className="alert-action-btn"
                  onClick={() => {
                    setMode('register');
                    setErrors({});
                  }}
                >
                  Go to Register Tab →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Registration Enforced Notice */}
        {mode === 'login' && registeredUsers.length === 0 && (
          <div className="notice-box">
            <ShieldCheck size={18} className="notice-icon" />
            <div>
              <strong>No accounts registered yet!</strong> Please click{' '}
              <button
                type="button"
                className="inline-link"
                onClick={() => handleModeChange('register')}
              >
                Register First
              </button>{' '}
              to create your user account.
            </div>
          </div>
        )}

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name (Register Mode Only) */}
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <div className={`input-wrapper ${errors.name ? 'input-error' : ''}`}>
                <User size={18} className="input-icon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className={`input-wrapper ${errors.email ? 'input-error' : ''}`}>
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password (Login and Register Modes) */}
          {mode !== 'forgot-password' && (
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => handleModeChange('forgot-password')}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className={`input-wrapper ${errors.password ? 'input-error' : ''}`}>
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="icon-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
          )}

          {/* Confirm Password (Register Mode Only) */}
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className={`input-wrapper ${errors.confirmPassword ? 'input-error' : ''}`}>
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="icon-action-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* Remember Me Checkbox (Login Mode) */}
          {mode === 'login' && (
            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="checkbox-text">Remember me on this device</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn-primary full-width" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In (Registered Users Only)'}
                  {mode === 'register' && 'Register Account'}
                  {mode === 'forgot-password' && 'Send Reset Link'}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Back to Login link when in Forgot Password */}
        {mode === 'forgot-password' && (
          <div className="bottom-link-row">
            <button
              type="button"
              className="inline-link back-link"
              onClick={() => handleModeChange('login')}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Interactive Registered Users Inspector */}
        <div className="registered-users-panel">
          <div className="panel-header">
            <button
              type="button"
              className="panel-toggle-btn"
              onClick={() => setShowRegisteredDrawer(!showRegisteredDrawer)}
            >
              <Users size={16} />
              <span>Registered Users Database ({registeredUsers.length})</span>
              <span className="drawer-arrow">{showRegisteredDrawer ? '▲' : '▼'}</span>
            </button>
            {registeredUsers.length > 0 && (
              <button
                type="button"
                className="panel-reset-btn"
                onClick={resetToInitialUsers}
                title="Reset database to initial demo"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {showRegisteredDrawer && (
            <div className="users-list-box">
              {registeredUsers.length === 0 ? (
                <p className="no-users-text">No registered users in the database yet.</p>
              ) : (
                <ul className="registered-users-list">
                  {registeredUsers.map((user) => (
                    <li key={user.id} className="registered-user-row">
                      <div className="user-info-text">
                        <span className="user-name-tag">{user.name}</span>
                        <span className="user-email-tag">{user.email}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-use-user"
                        onClick={() => selectRegisteredUser(user)}
                        title="Autofill this user into the sign in form"
                      >
                        Sign in as this user
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer Policy text */}
        <div className="card-footer-note">
          Sign-in is strictly enforced for accounts registered in the database.
        </div>
      </div>
    </div>
  );
};
