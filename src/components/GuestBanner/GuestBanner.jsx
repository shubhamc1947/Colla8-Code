import { useAuth } from '../../contexts/AuthContext';
import './GuestBanner.css';

const GuestBanner = () => {
  const { authState } = useAuth();
  
  if (!authState.isGuest) return null;
  
  return (
    <div className="guest-banner">
      <p>You are using a guest account.</p>
    </div>
  );
};

export default GuestBanner;
