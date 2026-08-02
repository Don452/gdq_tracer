import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { supabase } from './supabaseClient';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



async function testDatabaseConnection() {
  console.log("⚡ Testing database connection...");
  // Updated target from 'inventory' to 'baggage_record'
  const { data, error } = await supabase.from('baggage_record').select('*').limit(1);
  
  if (error) {
    console.error("🛑 Database connection failed! Error:", error.message);
  } else {
    console.log("✅ Database connection successful! Data:", data);
  }
}

testDatabaseConnection();


