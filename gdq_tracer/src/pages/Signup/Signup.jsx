import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Signup() {
  const nav = useNavigate(), [em, setEm] = useState('');
  const [form, setForm] = useState({ first: '', middle: '' });

  const handleSignup = async (e) => {
    e.preventDefault();
    const cleanEmail = em.toLowerCase().trim();
    
    const { data: ext } = await supabase.from('system_roles').select('email').eq('email', cleanEmail).maybeSingle();
    if (ext) return alert("Email already registered. Please login.");

    const { error } = await supabase.from('system_roles').insert([{ 
      email: cleanEmail, role: 'User', user_first_name: form.first, user_middle_name: form.middle
    }]);

    if (error) return alert("Error: " + error.message);
    alert("Profile registered! Please log in to request your access link.");
    nav('/login');
  };

  return (
    <div style={{ padding: '25px', fontFamily: 'sans-serif', maxWidth: '350px', margin: '80px auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8f9fa', fontSize: '13px' }}>
      <h3 style={{ margin: '0 0 15px 0' }}>🧳 Operator Profile Signup</h3>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="First Name" value={form.first} onChange={e => setForm({ ...form, first: e.target.value })} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input type="text" placeholder="Middle Name" value={form.middle} onChange={e => setForm({ ...form, middle: e.target.value })} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input type="email" placeholder="Email Address" value={em} onChange={e => setEm(e.target.value)} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <button type="submit" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Register Profile</button>
        <p style={{ margin: '10px 0 0 0', textAlign: 'center' }}>Registered? <span onClick={() => nav('/login')} style={{ color: '#007bff', cursor: 'pointer' }}>Login</span></p>
      </form>
    </div>
  );
}
