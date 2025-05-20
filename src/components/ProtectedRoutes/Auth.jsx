import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Auth = (props) => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  async function isLogin() {
    if (!authState?.username) {
      navigate('/', { 
        state: { message: 'You need to sign in Before Creating Room'} 
      });
      toast.info('Please sign in or use the guest login to continue');
    }
  }
  
  useEffect(() => {
    isLogin();
  }, [authState.username, navigate]);
  
  return (
    <div>
      <props.compo />
    </div>
  );
};

export default Auth