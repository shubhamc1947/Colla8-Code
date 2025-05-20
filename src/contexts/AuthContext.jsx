// src/contexts/AuthContext.js

import  { createContext, useState,  useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register , logout} from '../utils/api';
import { toast } from 'react-toastify';
import { GUEST_CREDENTIALS } from '../utils/guestCreds';
const AuthContext = createContext();
export const useAuth=()=>useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [loading,setLoading]=useState(false);
  const [authState, setAuthState] = useState({
    username: localStorage.getItem('username'),
    isGuest: localStorage.getItem('isGuest') === 'true'
  });
  const reactNavigate = useNavigate();

  const loginHandler = async (credentials) => {
    setLoading(true);
    try {
      const response = await login(credentials);
      if (response.msg === 'Login successful') {
        setAuthState({ 
          username: credentials.username,
          isGuest: credentials.isGuest || false
        });
        localStorage.setItem('username', credentials.username);
        if (credentials.isGuest) {
          localStorage.setItem('isGuest', 'true');
        }
        reactNavigate('/createRoom');
        toast.success('😍 Login successful');
      }
    } catch (err) {
      console.error(err.message);
      toast.error('Login failed: ' + (err.response?.data?.msg || 'Server error'));
    } finally {
      setLoading(false);
    }
  };
  const guestLoginHandler = async () => {
    // Pick a random guest account from the list
    const randomIndex = Math.floor(Math.random() * GUEST_CREDENTIALS.length);
    const guestCredentials = GUEST_CREDENTIALS[randomIndex];
    
    // Add isGuest flag to credentials
    const credentials = {
      ...guestCredentials,
      isGuest: true
    };
    
    // Use the regular login handler
    await loginHandler(credentials);
  };


  const registerHandler = async (credentials) => {
    setLoading(true);
    try {
      const response = await register(credentials);
      if (response.msg === 'Registration successful') {
        setAuthState({ 
          username: credentials.username,
          isGuest: false
        });
        localStorage.setItem('username', credentials.username);
        localStorage.removeItem('isGuest');
        reactNavigate('/');
        toast.success('😎 Registration successful');
      }
    } catch (err) {
      console.error(err.message);
      toast.error('Registration failed: ' + (err.response?.data?.msg || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  const logoutHandler = async () => {
    setLoading(true);
    try {
      await logout(); // Call logout API
      setAuthState({ username: null, isGuest: false });
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      localStorage.removeItem('isGuest');
      toast.success("😊 Logout Successfully");
      reactNavigate('/');
    } catch (err) { 
      console.error(err.message);
      toast.error('Logout failed: ' + err.response?.data?.msg || 'Server error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ 
      authState, 
      loginHandler, 
      registerHandler, 
      logoutHandler, 
      guestLoginHandler,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
