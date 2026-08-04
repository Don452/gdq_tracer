import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const TM = { Open: '#e3f2fd', Arrived: '#fff3e0', Delivered: '#d4edda', Suspended: '#f8d7da', 'File Closed': '#e2e8f0' };

export default function Home() {
  const nav = useNavigate(), [usr, setUsr] = useState(''), [sch, setSch] = useState(''), [flt, setFlt] = useState('All');
  const [bags, setBags] = useState([]), [pDt, setPDt] = useState(''), [pSt, setPSt] = useState('All'), [pAg, setPAg] = useState(''), [agents, setAgents] = useState({});
  const [rows, setRows] = useState([{ id: Date.now(), tag: '', tkt: '', first: '', last: '', phone: '', status: 'Open' }]);

  const sync = async () => {
    const { data: b } = await supabase.from('baggage_record').select('*').order('id', { ascending: false });
    const { data: r } = await supabase.from('system_roles').select('*');
    if (r) {
      const map = {};
      r.forEach(p => p.email && (map[p.email.toLowerCase().trim()] = ((p.user_first_name || '').charAt(0) + (p.user_middle_name || '').charAt(0)).toUpperCase() || '??'));
      setAgents(map);
    }
    if (b) setBags(b);
  };

  useEffect(() => {
  const activeUser = localStorage.getItem('active_terminal_operator');
  if (activeUser) {
    setUsr(activeUser.toLowerCase().trim());
    sync();
  } else {
    nav('/'); // Lock down unauthenticated routing blocks
  }
}, [nav]);

  const save = async (e) => {
    e.preventDefault();
    if (rows.some(r => !/^\d{13}$/.test(r.tkt))) return alert("Tickets must be 13 digits.");
    await supabase.from('baggage_record').insert(rows.map(r => ({ tag_number: r.tag, ticket_number: r.tkt,passenger_last_name: r.last,passenger_first_name: r.first, passenger_phone: r.phone, status: r.status, registered_by: usr.toLowerCase().trim(), file_created: false })));
    setRows([{ id: Date.now(), tag: '', tkt: '', first: '', last: '', phone: '', status: 'Open' }]);
    sync();
  };

    // 🔍 FIXED: Centralized calculation engine that updates BOTH your screen and your print manifests simultaneously
  const getFilt = () => bags.filter(b => {
    const em = (b.registered_by || '').toLowerCase().trim();
    const localDateStr = b.created_at ? new Date(b.created_at).toLocaleDateString('en-CA') : '';
    
    // Links your data streams directly onto your active drop down option pickers
    const matchesDate = !pDt || localDateStr === pDt;
    const matchesStatus = pSt === 'All' || b.status === pSt;
    const matchesAgent = pAg === 'All' || !pAg || agents[em] === pAg;
    
    return matchesDate && matchesStatus && matchesAgent;
  });

  // 🔍 FIXED: Main UI visible table grid now listens to your text searches AND your option changes instantly
  const fd = getFilt().filter(b => 
    [b.tag_number, b.ticket_number, b.passenger_first_name, b.passenger_last_name].some(v => 
      (v || '').toLowerCase().includes(sch.toLowerCase())
    )
  );


     const print = () => {
    const list = getFilt(); 
    if (!list.length) return alert("No records match your filters.");
    
    const w = window.open('', '_blank');
    w.document.write(`
      <h2>Manifest Report</h2>
      <table border="1" style="width:100%;border-collapse:collapse;font-size:12px;font-family:sans-serif;">
        <tr style="background:#f4f4f4;font-weight:bold;">
          <th style="padding:6px;">Tag</th>
          <th style="padding:6px;">Ticket</th>
          <th style="padding:6px;">Passenger Name</th>
          <th style="padding:6px;">Phone Number</th>
          <th style="padding:6px;">Status</th>
          <th style="padding:6px;">Agent</th>
        </tr>
        ${list.map(b => { 
          const em = (b.registered_by || '').toLowerCase().trim(); 
          return `<tr>
            <td style="padding:6px;"><b>${b.tag_number || '-'}</b></td>
            <td style="padding:6px;font-family:monospace;">${b.ticket_number || '-'}</td>
            <td style="padding:6px;">${b.passenger_last_name || ''} ${b.passenger_first_name || ''}</td>
            <td style="padding:6px;">${b.passenger_phone || '-'}</td>
            <td style="padding:6px;">${b.status || '-'}</td>
            <td style="padding:6px;font-weight:bold;color:#2b6cb0;">${agents[em] || em.substring(0,2).toUpperCase()}</td>
          </tr>`; 
        }).join('')}
      </table>
      <script>setTimeout(()=>{window.print();window.close();},300);</script>
    `);
    w.document.close();
  };


  const excel = () => {
    const list = getFilt(); if (!list.length) return alert("No records.");
    let csv = "\uFEFFTag,Ticket,Last,First,Phone,Date,Status,Agent,WorldTracer\n";
    list.forEach(b => { const em = (b.registered_by || '').toLowerCase().trim(); csv += `"${b.tag_number}","${b.ticket_number}","${b.passenger_last_name}","${b.passenger_first_name}","${b.passenger_phone}","${new Date(b.created_at).toLocaleDateString()}","${b.status}","${agents[em] || '??'}","${b.file_created ? 'Yes' : 'No'}"\n`; });
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); a.download = `Report.csv`; document.body.appendChild(a); a.click(); a.remove();
  };

  // const fd = bags.filter(b => [b.tag_number, b.ticket_number, b.passenger_first_name, b.passenger_last_name].some(v => (v || '').toLowerCase().includes(sch.toLowerCase())) && (flt === 'All' || b.status === flt));
  const tc = s => { const t = (s || '').trim().split(/[\s,]+/); return t.length <= 1 ? s : <span title={s.replace(/[\s,]+/g, ', ')} style={{ cursor: 'help', borderBottom: '1px dashed #2b6cb0', color: '#2b6cb0', fontWeight: 'bold' }}>{t[0]} (+{t.length - 1})</span>; };

  return (
    <div style={{ padding: '8px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', fontSize: '11px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', marginBottom: '5px' }}>
        <h3>🧳GDQ TRACER ({agents[usr] || '...'})</h3>
        <h1>TESTING STYLES HERE</h1>
        <button onClick={() => nav('/')} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px' }}>Logout</button>
      </div>

      <form onSubmit={save} style={{ background: '#f8f9fa', padding: '5px', border: '1px solid #e2e8f0', marginBottom: '5px' }}>
        {rows.map(r => (
          <div key={r.id} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <input placeholder="Tags" value={r.tag} title={r.tag} onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, tag: e.target.value } : x))} required style={{ flex: 1.5 }} />
            {['tkt', 'first', 'last', 'phone'].map(f => (
              <input key={f} placeholder={f === 'tkt' ? 'Ticket' : f} value={r[f]} maxLength={f === 'tkt' ? 13 : undefined} onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, [f]: f === 'tkt' ? e.target.value.replace(/\D/g, '') : e.target.value } : x))} required style={{ flex: 1 }} />
            ))}
            <select value={r.status} onChange={e => setRows(rows.map(x => x.id === r.id ? { ...x, status: e.target.value } : r))}>{Object.keys(TM).map(s => <option key={s} value={s}>{s}</option>)}</select>
            <button type="button" onClick={() => setRows(rows.filter(x => x.id !== r.id))} disabled={rows.length === 1}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', marginTop: '4px' }}>
          <button type="button" onClick={() => setRows([...rows, { id: Date.now() + Math.random(), tag: '', tkt: '', first: '', last: '', phone: '', status: 'Open' }])}>＋ Row</button>
          <button type="submit" style={{ background: '#28a745', color: '#fff', marginLeft: 'auto' }}>Save</button>
        </div>
      </form>

        <div style={{ background: '#edf2f7', padding: '4px', marginBottom: '4px', display: 'flex', gap: '2px', alignItems: 'center', borderRadius: '3px' }}>
          <input type="date" value={pDt} onChange={e => setPDt(e.target.value)} style={{ padding: '2px', border: '1px solid #ccc', borderRadius: '3px' }} />
          <button type="button" onClick={() => setPDt('')}>Clear</button>
        
        {/* 📊 FIXED: Status options render dynamically matching system criteria keys */}
        <select value={pSt} onChange={e => setPSt(e.target.value)} style={{ marginLeft: '6px' }}>
          <option value="All">All Statuses</option>
          {Object.keys(TM).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        
        {/* 📊 FIXED: Maps initials out of the live global register matrix keys cleanly */}
        <select value={pAg} onChange={e => setPAg(e.target.value)}>
          <option value="All">All Agents</option>
          {[...new Set(Object.values(agents))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <button type="button" onClick={print} style={{ background: '#007bff', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Print</button>
        <button type="button" onClick={excel} style={{ background: '#107c41', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer' }}>Excel</button>
      </div>


      <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
        <input placeholder="🔍 Live Search Filter..." value={sch} onChange={e => setSch(e.target.value)} style={{ flex: 1, padding: '3px', border: '1px solid #ccc', borderRadius: '3px' }} />
        {/* 📊 FIXED: Connects the bottom selection box directly to the centralized pSt state */}
        <select value={pSt} onChange={e => setPSt(e.target.value)} style={{ padding: '2px' }}>
          <option value="All">All Statuses</option>
          {Object.keys(TM).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>


      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
        <thead><tr style={{ background: '#1a202c', color: '#fff' }}>{['Tag', 'Ticket', 'Last', 'First', 'Phone', 'Date', 'Status', 'Agent', 'WorldTracer', 'Created?', 'Save', 'Del'].map(h => <th key={h} style={{ padding: '4px', textAlign: 'left' }}>{h}</th>)}</tr></thead>
        <tbody>
          {fd.map(b => {
            const em = (b.registered_by || '').toLowerCase().trim();
            return (
              <tr key={b.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td>{tc(b.tag_number)}</td>
                  <td>{b.ticket_number ? <span title={b.ticket_number} style={{ cursor: 'help', borderBottom: '1px dashed #4a5568', fontFamily: 'monospace' }}>{b.ticket_number.substring(0, 3)}...{b.ticket_number.substring(10)}</span> : 'N/A'}</td>
                  <td>{b.passenger_last_name}</td><td>{b.passenger_first_name}</td><td>{b.passenger_phone}</td><td>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td><select value={b.status} onChange={e => setBags(p => p.map(x => x.id === b.id ? { ...x, status: e.target.value } : x))} style={{ background: TM[b.status] || '#eee', borderRadius: '4px' }}>{Object.keys(TM).map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                  <td style={{ fontWeight: 'bold', color: '#2b6cb0' }}>{agents[em] || em.substring(0, 2).toUpperCase() || '...'}</td>
                  <td style={{ fontWeight: 'bold', color: '#035b29' }}>{b.file_created ? 'Created' : <a href="https://desktop.worldtracer.aero/desktop/index.html#!/index/login" target="_blank" rel="noreferrer">
                 <button type="button" >Create File</button>
                </a>}
                </td>
                <td style={{ textAlign: 'center' }}><input type="checkbox" checked={!!b.file_created} onChange={e => setBags(p => p.map(x => x.id === b.id ? { ...x, file_created: e.target.checked } : x))} /></td>
                <td><button onClick={async () => { await supabase.from('baggage_record').update({ status: b.status, file_created: !!b.file_created }).eq('id', b.id); alert("Saved!"); sync(); }}>Save</button></td>
                <td style={{ fontWeight: 'bold', color: '#035b29' }}><button onClick={async () => { await supabase.from('baggage_record').delete().eq('id', b.id); sync(); }}>Delete</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
