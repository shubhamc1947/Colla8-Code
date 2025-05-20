import { useAuth } from '../../contexts/AuthContext';
import './GuestLoginButton.css';

const GuestLoginButton = () => {
  const { guestLoginHandler, loading } = useAuth();

  return (
    <button 
      className="guest-login-btn" 
      onClick={guestLoginHandler}
      disabled={loading}
    >
      {loading ? 'Logging in...' : 'Try as Guest'}
    </button>
  );
};

export default GuestLoginButton;