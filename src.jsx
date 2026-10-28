import React,{useState} from 'react';
import{createRoot}from'react-dom/client';
import seed from './data.json';
import './style.css';
const remote=true;
function App(){
 const [rows,setRows]=useState(()=>remote?[]:JSON.parse(localStorage.getItem('records')||'null')||seed);
 const [search,S]=useState(''),[user,U]=useState(''),[error,E]=useState('');
 async function login(e){e.preventDefault();const f=new FormData(e.target);const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(f))});if(!r.ok){E('Login failed');return;}U(f.get('username'));setRows(await(await fetch('/api/records')).json());}
 async function change(id,key,value){const next=rows.map(r=>r.id===id?{...r,[key]:value}:r);if(remote){const r=await fetch('/api/records/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({[key]:value})});if(!r.ok){E('Save failed');return;}}else localStorage.setItem('records',JSON.stringify(next));setRows(next);}
 if(remote&&!user)return <main><h1>Customer orders</h1><form onSubmit={login}><input name="username" placeholder="Username" required/><input name="password" type="password" placeholder="Password" required/><button>Log in</button></form><p>{error}</p></main>;
 return <main><h1>Customer orders</h1><p>{remote?'Signed in as '+user:'Local prototype · browser data only'}</p><input placeholder="Search customers or items" value={search} onChange={e=>S(e.target.value)}/><table><thead><tr>{['ID','Customer / SKU','Item','Quantity','Status'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase())).map(r=><tr key={r.id}><td>{r.id}</td><td>{r.customer}</td><td>{r.item}</td><td><input aria-label={'Quantity '+r.id} type="number" min="0" value={r.quantity} onChange={e=>change(r.id,'quantity',Number(e.target.value))}/></td><td><select aria-label={'Status '+r.id} value={r.status} onChange={e=>change(r.id,'status',e.target.value)}>{["New", "Processing", "Shipped"].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table><p>{error}</p></main>;
}createRoot(document.getElementById('root')).render(<App/>);
