import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Login() {
  const nav = useNavigate(), [em, setEm] = useState(''), [sent, setSent] = useState(false);

  const handleLoginLink = async (e) => {
    e.preventDefault();
    const cleanEmail = em.toLowerCase().trim();
    
    const { data: p } = await supabase.from('system_roles').select('role').eq('email', cleanEmail).maybeSingle();
    if (!p) return alert("Access Denied: Email not registered. Please sign up first.");

    const { error } = await supabase.auth.signInWithOtp({ 
      email: cleanEmail,
      options: { emailRedirectTo: window.location.origin + '/home' }
    });

    if (error) return alert("Login Error: " + error.message);
    setSent(true);
    alert("Secure Magic Link sent! Check your email inbox.");
  };

  return (
    <div style={{ padding: '25px', fontFamily: 'sans-serif', maxWidth: '350px', margin: '80px auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8f9fa', fontSize: '13px' }}>
      <h3 style={{ margin: '0 0 15px 0' }}>🔐 Terminal Gatekeeper Login</h3>
      {!sent ? (
        <form onSubmit={handleLoginLink} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" placeholder="Enter Registered Email" value={em} onChange={e => setEm(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <button type="submit" style={{ background: '#007bff', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Get Secure Access Link</button>
          <p style={{ margin: '10px 0 0 0', textAlign: 'center' }}>New Operator? <span onClick={() => nav('/signup')} style={{ color: '#28a745', cursor: 'pointer' }}>Create Profile</span></p>
        </form>
      ) : (
        <div style={{ textAlign: 'center', color: '#4a5568' }}>
          <p style={{ fontSize: '24px', margin: '0 0 10px 0' }}>✨</p>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Link Dispatched!</p>
          <p style={{ margin: 0 }}>Open your mailbox at <b>{em}</b> and click the secure link to unlock your dashboard terminal.</p>
        </div>
      )}
    </div>
  );
}
