import axios from 'axios';
import { showAlert } from './alerts';
const stripe= Stripe('pk_test_51HmPI5A7UnF5SOrXErtumnLSXCLxoUx3DPXBBh1efylCtTrN6qQlTXa3piijVGEtfg1mshYY6tbcjXLHcGLDExIE00GrIQr40c');

export const bookTour= async tourId => {
  try {
    // 1) Get checkout session from API
    const session= await axios(`http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error)
  }
};