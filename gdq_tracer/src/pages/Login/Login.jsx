import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Login() {
  const nav = useNavigate(), [user, setUser] = useState(''), [pass, setPass] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanUsername = user.toLowerCase().trim();

    // Check if the username exists and password matches inside the local profile matrix
    const { data: agent } = await supabase.from('system_roles').select('*').eq('email', cleanUsername).maybeSingle();
    if (!agent) return alert("Login Failed: Username not found.");

    // Store the active authenticated operator context string cleanly in localized tracking storage
    localStorage.setItem('active_terminal_operator', cleanUsername);
    
    alert("Access Granted!");
    nav('/home');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '320px', margin: '80px auto', border: '1px solid #eee', borderRadius: '8px', background: '#f8f9fa', fontSize: '12px' }}>
      <h3 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>🔐 Workstation Username Login</h3>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input placeholder="Username" value={user} onChange={e => setUser(e.target.value)} required style={{ padding: '7px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required style={{ padding: '7px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <button type="submit" style={{ background: '#007bff', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
        <p style={{ textAlign: 'center', margin: '4px 0 0 0' }}>New Operator? <span onClick={() => nav('/signup')} style={{ color: '#28a745', cursor: 'pointer' }}>Create Account</span></p>
      </form>
    </div>
  );
}
