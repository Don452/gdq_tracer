import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginSignup() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <h1>Welcome to Local Tracer</h1>
      <p>Please select an option below to proceed:</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => navigate('/login')} style={{ padding: '12px 24px', margin: '10px', fontSize: '16px', cursor: 'pointer' }}>
          Go to Sign In Form
        </button>
        <button onClick={() => navigate('/signup')} style={{ padding: '12px 24px', margin: '10px', fontSize: '16px', cursor: 'pointer' }}>
          Go to Registration Form
        </button>
      </div>
    </div>
  );
}

export default LoginSignup;
