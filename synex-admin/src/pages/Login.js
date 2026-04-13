import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../lib/firebase';

const S = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#030812', position:'relative', overflow:'hidden' },
  bg1: { position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,229,255,.06),transparent)', top:-100, left:-100, pointerEvents:'none' },
  bg2: { position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,77,255,.06),transparent)', bottom:-100, right:-100, pointerEvents:'none' },
  card: { background:'linear-gradient(180deg,rgba(11,31,61,.98),rgba(8,21,40,.98))', border:'1px solid rgba(0,229,255,.15)', borderRadius:24, padding:'40px 32px', width:'100%', maxWidth:420, position:'relative', boxShadow:'0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(0,229,255,.05)' },
  top: { position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#00e5ff,transparent)', borderRadius:'24px 24px 0 0' },
  logoWrap: { textAlign:'center', marginBottom:32 },
  hexWrap: { width:72, height:72, margin:'0 auto 16px', background:'linear-gradient(135deg,#0d47a1,#00e5ff)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 40px rgba(0,229,255,.3)', border:'2px solid rgba(0,229,255,.4)' },
  hexText: { fontFamily:'Orbitron,monospace', fontWeight:900, fontSize:28, color:'#fff' },
  logo: { fontFamily:'Orbitron,monospace', fontWeight:900, fontSize:22, background:'linear-gradient(135deg,#fff,#90caf9,#00e5ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  sub: { fontFamily:'Rajdhani,sans-serif', color:'rgba(0,229,255,.5)', fontSize:11, letterSpacing:5, textTransform:'uppercase', marginTop:4 },
  label: { display:'block', fontFamily:'Rajdhani,sans-serif', fontSize:11, color:'rgba(255,255,255,.4)', letterSpacing:1, textTransform:'uppercase', fontWeight:700, marginBottom:6 },
  inp: { width:'100%', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:'12px 16px', color:'#fff', fontFamily:'Inter,sans-serif', fontSize:14, outline:'none', transition:'border-color .2s', marginBottom:16 },
  btn: { width:'100%', padding:14, background:'linear-gradient(135deg,#1565c0,#1976d2)', border:'none', borderRadius:12, color:'#fff', fontFamily:'Orbitron,monospace', fontSize:13, fontWeight:700, cursor:'pointer', letterSpacing:2, boxShadow:'0 6px 20px rgba(21,101,192,.4)', transition:'all .2s' },
  err: { color:'#ff4444', fontFamily:'Rajdhani,sans-serif', fontSize:13, textAlign:'center', marginTop:12, minHeight:16 },
  badge: { display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:'rgba(255,68,68,.1)', border:'1px solid rgba(255,68,68,.3)', color:'#ff4444', fontFamily:'Rajdhani,sans-serif', fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:20 }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const doLogin = async (e) => {
    e.preventDefault();
    if (!email || !pass) { setErr('Fill all fields'); return; }
    setLoading(true); setErr('');
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      const msgs = { 'auth/user-not-found':'No admin account found', 'auth/wrong-password':'Wrong password', 'auth/invalid-credential':'Invalid credentials', 'auth/too-many-requests':'Too many attempts' };
      setErr(msgs[e.code] || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.bg1}/><div style={S.bg2}/>
      <div style={S.card}>
        <div style={S.top}/>
        <div style={S.logoWrap}>
          <div style={S.hexWrap}><span style={S.hexText}>S</span></div>
          <div style={S.logo}>SYNEX ADMIN</div>
          <div style={S.sub}>Control Center</div>
        </div>
        <div style={{textAlign:'center',marginBottom:24}}>
          <span style={S.badge}>ðŸ” RESTRICTED ACCESS â€” ADMIN ONLY</span>
        </div>
        <form onSubmit={doLogin}>
          <label style={S.label}>Admin Email</label>
          <input style={S.inp} type="email" placeholder="admin@synex.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
          <label style={S.label}>Password</label>
          <div style={{position:'relative',marginBottom:16}}>
            <input style={{...S.inp,marginBottom:0,paddingRight:48}} type={showPass?'text':'password'} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={pass} onChange={e=>setPass(e.target.value)} autoComplete="current-password"/>
            <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,.4)',cursor:'pointer',fontSize:16}}>
              {showPass ? 'ðŸ™ˆ' : 'ðŸ‘ï¸'}
            </button>
          </div>
          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? 'â³ Logging in...' : 'ðŸš€ LOGIN TO ADMIN'}
          </button>
        </form>
        <div style={S.err}>{err}</div>
        <div style={{textAlign:'center',marginTop:20,fontFamily:'Rajdhani,sans-serif',fontSize:11,color:'rgba(255,255,255,.2)',letterSpacing:1}}>
          SYNEX TOURNAMENT ADMIN PANEL v2.0
        </div>
      </div>
    </div>
  );
}
