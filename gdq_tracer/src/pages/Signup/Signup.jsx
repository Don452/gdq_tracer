import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Signup() {
  const nav = useNavigate(), [user, setUser] = useState(''), [pass, setPass] = useState(''), [conf, setConf] = useState('');
  const [form, setForm] = useState({ first: '', last: '' });

  const handleSignup = async (e) => {
    e.preventDefault();
    const cleanUsername = user.toLowerCase().trim();

    if (pass !== conf) return alert("Validation Failed: Passwords do not match!");
    if (pass.length < 6) return alert("Security Check: Password must be at least 6 characters.");

    // Check if the username is already registered in your roles ledger
    const { data: existing } = await supabase.from('system_roles').select('email').eq('email', cleanUsername).maybeSingle();
    if (existing) return alert("Username already taken. Please pick another one.");

    // Save name metadata and create the local profile ledger entry
    const { error: dbError } = await supabase.from('system_roles').insert([{ 
      email: cleanUsername, role: 'User', user_first_name: form.first, user_middle_name: form.last 
    }]);
    if (dbError) return alert("Database Sync Error: " + dbError.message);

    alert("Operator Profile Registered Successfully!");
    nav('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '320px', margin: '60px auto', border: '1px solid #eee', borderRadius: '8px', background: '#f8f9fa', fontSize: '12px' }}>
      <h3 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>🧳 Create Operator Account</h3>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input placeholder="First Name" value={form.first} onChange={e => setForm({ ...form, first: e.target.value })} required style={{ padding: '7px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input placeholder="Last Name" value={form.last} onChange={e => setForm({ ...form, last: e.target.value })} required style={{ padding: '7px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input placeholder="Create Username" value={user} onChange={e => setUser(e.target.value)} required style={{ padding: '7px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required style={{ padding: '7px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input type="password" placeholder="Confirm Password" value={conf} onChange={e => setConf(e.target.value)} required style={{ padding: '7px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <button type="submit" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Register Profile</button>
        <p style={{ textAlign: 'center', margin: '4px 0 0 0' }}>Registered operator? <span onClick={() => nav('/login')} style={{ color: '#007bff', cursor: 'pointer' }}>Login</span></p>
      </form>
    </div>
  );
}
