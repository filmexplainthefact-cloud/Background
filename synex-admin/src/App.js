import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, ref, get } from './lib/firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const Spinner = ({ msg }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#030812', flexDirection:'column', gap:16 }}>
    <div style={{ width:52, height:52, border:'3px solid rgba(0,229,255,.1)', borderTop:'3px solid #00e5ff', borderRadius:'50%', animation:'sp .7s linear infinite' }}/>
    <p style={{ fontFamily:'Orbitron,monospace', color:'#00e5ff', fontSize:'.78rem', letterSpacing:3 }}>{msg}</p>
    <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const Blocked = ({ onLogout }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#030812', flexDirection:'column', gap:16, padding:20 }}>
    <div style={{ fontSize:48 }}>ðŸš«</div>
    <div style={{ fontFamily:'Orbitron,monospace', fontSize:18, color:'#ff4444', textAlign:'center' }}>UNAUTHORIZED</div>
    <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:14, color:'rgba(255,255,255,.5)', textAlign:'center', maxWidth:300 }}>
      Ye account admin panel access karne ke liye authorized nahi hai.
    </div>
    <button onClick={onLogout} style={{ marginTop:8, padding:'10px 28px', background:'rgba(255,68,68,.1)', border:'1px solid rgba(255,68,68,.4)', borderRadius:10, color:'#ff4444', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>
      ðŸšª Logout
    </button>
  </div>
);

export default function App() {
  const [user, setUser]         = useState(null);
  const [isAdmin, setIsAdmin]   = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null); setIsAdmin(false); setAuthLoading(false);
        return;
      }
      setChecking(true);
      setUser(u);
      try {
        // Check adminEmails collection â€” UID se koi lena dena nahi
        const snap = await get(ref(db, 'adminEmails'));
        if (snap.exists()) {
          const adminList = Object.values(snap.val()).map(v =>
            typeof v === 'string' ? v.toLowerCase() : (v.email || '').toLowerCase()
          );
          const authorized = adminList.includes(u.email.toLowerCase());
          setIsAdmin(authorized);
          if (!authorized) setTimeout(() => auth.signOut(), 2000);
        } else {
          setIsAdmin(false);
          setTimeout(() => auth.signOut(), 2000);
        }
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setChecking(false);
        setAuthLoading(false);
      }
    });
    return unsub;
  }, []);

  if (authLoading || checking) return <Spinner msg={checking ? 'VERIFYING ACCESS...' : 'LOADING...'} />;
  if (!user) return <Login />;
  if (!isAdmin) return <Blocked onLogout={() => auth.signOut()} />;
  return <Dashboard user={user} />;
}
