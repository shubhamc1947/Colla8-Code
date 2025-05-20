import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL;

export const login = async (credentials) => {
  // console.log("Login here is happening testing text");
  // console.log(API_BASE_URL);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials, { withCredentials: true });
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const register = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, credentials, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};
