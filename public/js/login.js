import axios from 'axios';
import { showAlert } from './alerts';

export const login= async (email, password) => {
  try {
    const res= await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    if(res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout= async () => {
  try {
    const res= await axios({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/users/logout'
    });
    // if(res.data.status === 'success') {
    //   showAlert('success', 'Logged out successfully!');
    //   window.setTimeout(() => {
    //     location.reload(true);
    //   }, 1000);
    // }
    if(res.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Error logging out, please try again');
  }
};