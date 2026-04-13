import React, { useState, useEffect, useRef } from 'react';
import { db, auth, ref, onValue, set, update, remove, push, get, signOut } from '../lib/firebase';

// â”€â”€ COLORS & THEME â”€â”€
const C = {
  bg: '#030812', bg2: '#081528', card: '#0b1f3d', card2: '#0e2650',
  border: '#1b3c6e', cyan: '#00e5ff', gold: '#ffd700', success: '#00e676',
  danger: '#ff4444', warn: '#ffaa00', purple: '#7c4dff', white: '#e8f4ff', muted: '#5a80b0'
};

const css = `
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:${C.bg}}
  ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
  input,textarea,select{outline:none}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin3d{from{transform:rotateY(0deg)}to{transform:rotateY(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(0,229,255,.3)}50%{box-shadow:0 0 24px rgba(0,229,255,.7)}}
  @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
  .anim-fade{animation:fadeUp .3s ease both}
  .anim-float{animation:float 3s ease infinite}
  .stat-num{animation:countUp .5s ease both}
`;

// â”€â”€ SMALL COMPONENTS â”€â”€
function Card({ children, style, glow }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${glow ? C.cyan+'44' : C.border}`, borderRadius: 16, padding: 20, boxShadow: glow ? `0 0 20px rgba(0,229,255,.1)` : '0 4px 20px rgba(0,0,0,.3)', ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, color = C.cyan, style, danger, success, disabled }) {
  const bg = danger ? 'linear-gradient(135deg,#c62828,#ff4444)' : success ? 'linear-gradient(135deg,#1b5e20,#00e676)' : `linear-gradient(135deg,#0d47a1,${color})`;
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '10px 20px', background: disabled ? C.card2 : bg, border: 'none', borderRadius: 10, color: disabled ? C.muted : '#fff', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer', letterSpacing: .5, transition: 'all .2s', ...style }}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, style }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: '100%', background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px', color: C.white, fontFamily: 'Inter,sans-serif', fontSize: 14, ...style }}
      />
    </div>
  );
}

function Badge({ children, color = C.cyan }) {
  return <span style={{ padding: '2px 10px', borderRadius: 20, background: color + '22', border: `1px solid ${color}55`, color, fontFamily: 'Rajdhani,sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: .5 }}>{children}</span>;
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const col = type === 'success' ? C.success : type === 'error' ? C.danger : C.warn;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.card, border: `1px solid ${col}55`, borderRadius: 12, padding: '12px 20px', color: C.white, fontFamily: 'Rajdhani,sans-serif', fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: `0 8px 30px rgba(0,0,0,.5),0 0 0 1px ${col}33`, animation: 'fadeUp .3s ease', maxWidth: 320 }}>
      {type === 'success' ? 'âœ…' : type === 'error' ? 'âŒ' : 'âš ï¸'} {msg}
    </div>
  );
}

// â”€â”€ 3D STAT CARD â”€â”€
function StatCard3D({ title, value, icon, color, sub }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: `linear-gradient(135deg,${C.card},${C.card2})`, border: `1px solid ${color}44`, borderRadius: 18, padding: '20px 18px', cursor: 'default', transition: 'all .3s', transform: hovered ? 'translateY(-4px) scale(1.02)' : 'none', boxShadow: hovered ? `0 12px 40px ${color}33,0 0 0 1px ${color}22` : `0 4px 20px rgba(0,0,0,.3)`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle,${color}18,transparent)`, borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 28, filter: `drop-shadow(0 0 8px ${color})` }}>{icon}</div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: 'pulse 2s ease infinite' }} />
      </div>
      <div className="stat-num" style={{ fontFamily: 'Orbitron,monospace', fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
      {sub && <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: color + '99', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SECTIONS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ OVERVIEW â”€â”€
function Overview({ stats, toast }) {
  const [activity, setActivity] = useState([]);
  useEffect(() => {
    const q = ref(db, 'depositRequests');
    const unsub = onValue(q, snap => {
      if (!snap.exists()) return;
      const arr = [];
      snap.forEach(c => arr.push({ ...c.val(), _id: c.key }));
      setActivity(arr.sort((a, b) => b.date - a.date).slice(0, 8));
    });
    return unsub;
  }, []);

  return (
    <div className="anim-fade">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 20, color: C.white, marginBottom: 4 }}>Control Center</h2>
        <p style={{ fontFamily: 'Rajdhani,sans-serif', color: C.muted, fontSize: 14 }}>Real-time platform overview</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard3D title="Total Users" value={stats.users} icon="ðŸ‘¥" color={C.cyan} sub="Registered" />
        <StatCard3D title="Tournaments" value={stats.tournaments} icon="ðŸ†" color={C.gold} sub="Active" />
        <StatCard3D title="Total Balance" value={`â‚¹${stats.totalBal}`} icon="ðŸ’°" color={C.success} sub="In wallets" />
        <StatCard3D title="Pending Dep" value={stats.pendingDep} icon="â³" color={C.warn} sub="Need approval" />
        <StatCard3D title="Pending WD" value={stats.pendingWd} icon="ðŸ“¤" color={C.purple} sub="Need action" />
        <StatCard3D title="Blocked" value={stats.blocked} icon="ðŸš«" color={C.danger} sub="Users" />
      </div>

      {/* Recent Deposits */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, color: C.cyan, marginBottom: 14, letterSpacing: 1 }}>ðŸ“¨ RECENT DEPOSIT REQUESTS</div>
        {activity.length === 0 ? <div style={{ color: C.muted, fontFamily: 'Rajdhani,sans-serif', fontSize: 13, textAlign: 'center', padding: 20 }}>No recent activity</div> :
          activity.map(d => (
            <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid rgba(255,255,255,.04)` }}>
              <div>
                <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14, color: C.white }}>{d.userName}</div>
                <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: C.muted }}>UTR: {d.utr} Â· {new Date(d.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, color: C.success, fontWeight: 700 }}>â‚¹{d.amount}</div>
                <Badge color={d.status === 'approved' ? C.success : d.status === 'rejected' ? C.danger : C.warn}>{d.status?.toUpperCase() || 'PENDING'}</Badge>
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}

// â”€â”€ USERS â”€â”€
function Users({ toast }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editBal, setEditBal] = useState(null);
  const [balVal, setBalVal] = useState('');
  const [balMode, setBalMode] = useState('set');
  const [sending, setSending] = useState(null);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifUser, setNotifUser] = useState(null);

  useEffect(() => {
    const unsub = onValue(ref(db, 'users'), snap => {
      if (!snap.exists()) { setUsers([]); return; }
      const arr = [];
      snap.forEach(c => arr.push({ ...c.val(), _uid: c.key }));
      setUsers(arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    });
    return unsub;
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u._uid || '').toLowerCase().includes(q);
    const matchF = filter === 'all' || (filter === 'blocked' && u.isBlocked) || (filter === 'active' && !u.isBlocked) || (filter === 'admin' && u.isAdmin);
    return matchQ && matchF;
  });

  const toggleBlock = async (uid, block) => {
    try { await update(ref(db, `users/${uid}`), { isBlocked: block }); toast(block ? 'User blocked' : 'User unblocked', block ? 'error' : 'success'); }
    catch { toast('Error', 'error'); }
  };

  const saveBal = async () => {
    const val = parseInt(balVal);
    if (isNaN(val) || val < 0) { toast('Enter valid amount', 'error'); return; }
    const cur = editBal.wallet || 0;
    const newBal = balMode === 'set' ? val : balMode === 'add' ? cur + val : Math.max(0, cur - val);
    try {
      const txKey = push(ref(db, `users/${editBal._uid}/transactions`)).key;
      await update(ref(db), {
        [`users/${editBal._uid}/wallet`]: newBal,
        [`users/${editBal._uid}/transactions/${txKey}`]: { type: 'Admin Adjustment', amount: newBal - cur, date: Date.now(), status: 'completed', desc: `Admin ${balMode}` }
      });
      toast(`Balance updated â†’ â‚¹${newBal}`, 'success');
      setEditBal(null); setBalVal('');
    } catch { toast('Error', 'error'); }
  };

  const sendNotif = async () => {
    if (!notifTitle || !notifBody) { toast('Fill title and message', 'error'); return; }
    setSending(notifUser?._uid || 'all');
    try {
      if (notifUser) {
        const nk = push(ref(db, `notifications/${notifUser._uid}`)).key;
        await set(ref(db, `notifications/${notifUser._uid}/${nk}`), { title: notifTitle, body: notifBody, type: 'admin', date: Date.now(), read: false });
        toast(`Notification sent to ${notifUser.name}`, 'success');
      } else {
        const allUids = users.map(u => u._uid);
        const upd = {};
        allUids.forEach(uid => { const nk = push(ref(db, `notifications/${uid}`)).key; upd[`notifications/${uid}/${nk}`] = { title: notifTitle, body: notifBody, type: 'admin', date: Date.now(), read: false }; });
        await update(ref(db), upd);
        toast(`Notification sent to all ${allUids.length} users!`, 'success');
      }
      setNotifTitle(''); setNotifBody(''); setNotifUser(null);
    } catch { toast('Error sending', 'error'); }
    setSending(null);
  };

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, color: C.white }}>ðŸ‘¥ Users</h2>
          <p style={{ fontFamily: 'Rajdhani,sans-serif', color: C.muted, fontSize: 13, marginTop: 2 }}>{users.length} total users</p>
        </div>
      </div>

      {/* Notification Broadcast */}
      <Card style={{ marginBottom: 16, borderColor: C.cyan + '33' }}>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: C.cyan, marginBottom: 12, letterSpacing: 1 }}>ðŸ“¢ SEND NOTIFICATION</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Notification title" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.white, fontFamily: 'Inter,sans-serif', fontSize: 13 }} />
          <input value={notifBody} onChange={e => setNotifBody(e.target.value)} placeholder="Message body" style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.white, fontFamily: 'Inter,sans-serif', fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Btn onClick={sendNotif} disabled={!!sending} style={{ flex: 1 }}>
            {sending === 'all' ? 'â³ Sending...' : `ðŸ“¢ Send to All (${users.length})`}
          </Btn>
          {notifUser && <Badge color={C.cyan}>{notifUser.name} selected</Badge>}
          {notifUser && <Btn onClick={() => setNotifUser(null)} style={{ padding: '10px 16px' }} danger>âœ• Clear</Btn>}
        </div>
      </Card>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ðŸ” Search name / email / UID..." style={{ flex: 1, minWidth: 200, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.white, fontFamily: 'Inter,sans-serif', fontSize: 13 }} />
        {['all', 'active', 'blocked', 'admin'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 16px', background: filter === f ? C.cyan : C.card2, border: `1px solid ${filter === f ? C.cyan : C.border}`, borderRadius: 10, color: filter === f ? '#000' : C.muted, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>{f}</button>
        ))}
      </div>

      {/* User Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(u => (
          <Card key={u._uid} style={{ borderLeft: `3px solid ${u.isBlocked ? C.danger : u.isAdmin ? C.gold : C.border}`, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,#0d47a1,${C.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron,monospace', fontWeight: 900, fontSize: 16, color: '#fff', flexShrink: 0 }}>
                  {(u.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15, color: C.white }}>{u.name || 'Unknown'}</span>
                    {u.isBlocked && <Badge color={C.danger}>BLOCKED</Badge>}
                    {u.isAdmin && <Badge color={C.gold}>ADMIN</Badge>}
                  </div>
                  <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: C.muted, marginBottom: 4 }}>{u.email}</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: C.gold }}>â‚¹{u.wallet || 0}</span>
                    {u.ign && <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: C.cyan }}>ðŸŽ® {u.ign}</span>}
                    <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: C.muted }}>ðŸ“… {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'â€”'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                <Btn onClick={() => { setEditBal(u); setBalVal(''); setBalMode('set'); }} style={{ padding: '8px 12px', fontSize: 12 }}>ðŸ’° Bal</Btn>
                <Btn onClick={() => { setNotifUser(u); }} style={{ padding: '8px 12px', fontSize: 12, background: `linear-gradient(135deg,#4a148c,${C.purple})` }}>ðŸ”” Notif</Btn>
                {u.isBlocked
                  ? <Btn onClick={() => toggleBlock(u._uid, false)} style={{ padding: '8px 12px', fontSize: 12 }} success>âœ“ Unblock</Btn>
                  : <Btn onClick={() => toggleBlock(u._uid, true)} style={{ padding: '8px 12px', fontSize: 12 }} danger>ðŸš« Block</Btn>
                }
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Balance Modal */}
      {editBal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <Card style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 16, color: C.cyan, marginBottom: 16 }}>ðŸ’° Edit Balance</div>
            <div style={{ background: C.card2, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontFamily: 'Rajdhani,sans-serif', color: C.white }}>
              <b>{editBal.name}</b> Â· Current: <span style={{ color: C.gold, fontFamily: 'Orbitron,monospace' }}>â‚¹{editBal.wallet || 0}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {['set', 'add', 'sub'].map(m => (
                <button key={m} onClick={() => setBalMode(m)} style={{ flex: 1, padding: '8px 4px', background: balMode === m ? `linear-gradient(135deg,#0d47a1,${C.cyan})` : C.card2, border: `1px solid ${balMode === m ? C.cyan : C.border}`, borderRadius: 8, color: balMode === m ? '#fff' : C.muted, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {m === 'set' ? 'Set' : m === 'add' ? '+ Add' : 'âˆ’ Sub'}
                </button>
              ))}
            </div>
            <Input label="Amount (â‚¹)" type="number" value={balVal} onChange={e => setBalVal(e.target.value)} placeholder="Enter amount" />
            {balVal && <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: C.muted, marginBottom: 12 }}>
              Result: <span style={{ color: C.success, fontFamily: 'Orbitron,monospace' }}>â‚¹{balMode === 'set' ? (parseInt(balVal) || 0) : balMode === 'add' ? (editBal.wallet || 0) + (parseInt(balVal) || 0) : Math.max(0, (editBal.wallet || 0) - (parseInt(balVal) || 0))}</span>
            </div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={saveBal} style={{ flex: 1 }} success>âœ“ Save</Btn>
              <Btn onClick={() => setEditBal(null)} style={{ flex: 1 }} danger>âœ• Cancel</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// â”€â”€ DEPOSITS â”€â”€
function Deposits({ toast }) {
  const [deps, setDeps] = useState([]);
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    const unsub = onValue(ref(db, 'depositRequests'), snap => {
      if (!snap.exists()) { setDeps([]); return; }
      const arr = [];
      snap.forEach(c => arr.push({ ...c.val(), _id: c.key }));
      setDeps(arr.sort((a, b) => b.date - a.date));
    });
    return unsub;
  }, []);

  const approve = async (dep) => {
    try {
      const curSnap = await get(ref(db, `users/${dep.userId}/wallet`));
      const cur = curSnap.val() || 0;
      const txKey = push(ref(db, `users/${dep.userId}/transactions`)).key;
      const nk = push(ref(db, `notifications/${dep.userId}`)).key;
      await update(ref(db), {
        [`users/${dep.userId}/wallet`]: cur + dep.amount,
        [`users/${dep.userId}/transactions/${txKey}`]: { type: 'Deposit', amount: dep.amount, date: Date.now(), status: 'completed', desc: 'Admin approved' },
        [`depositRequests/${dep._id}/status`]: 'approved',
        [`notifications/${dep.userId}/${nk}`]: { title: 'âœ… Payment Confirmed!', body: `â‚¹${dep.amount} added to your wallet!`, type: 'deposit', date: Date.now(), read: false }
      });
      toast(`â‚¹${dep.amount} approved for ${dep.userName}`, 'success');
    } catch { toast('Error', 'error'); }
  };

  const reject = async (dep) => {
    try {
      const nk = push(ref(db, `notifications/${dep.userId}`)).key;
      await update(ref(db), {
        [`depositRequests/${dep._id}/status`]: 'rejected',
        [`notifications/${dep.userId}/${nk}`]: { title: 'âŒ Payment Rejected', body: `Your â‚¹${dep.amount} deposit was rejected. Contact support.`, type: 'deposit', date: Date.now(), read: false }
      });
      toast('Deposit rejected', 'error');
    } catch { toast('Error', 'error'); }
  };

  const filtered = deps.filter(d => tab === 'all' || d.status === tab || (!d.status && tab === 'pending'));

  return (
    <div className="anim-fade">
      <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, color: C.white, marginBottom: 4 }}>ðŸ’° Deposit Requests</h2>
      <p style={{ fontFamily: 'Rajdhani,sans-serif', color: C.muted, fontSize: 13, marginBottom: 20 }}>{deps.filter(d => !d.status || d.status === 'pending').length} pending</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['pending', 'approved', 'rejected', 'all'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', background: tab === t ? `linear-gradient(135deg,#0d47a1,${C.cyan})` : C.card2, border: `1px solid ${tab === t ? C.cyan : C.border}`, borderRadius: 10, color: tab === t ? '#fff' : C.muted, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? <Card><div style={{ textAlign: 'center', color: C.muted, fontFamily: 'Rajdhani,sans-serif', padding: 30 }}>No deposits in this category</div></Card> :
          filtered.map(d => (
            <Card key={d._id} style={{ borderLeft: `3px solid ${(!d.status || d.status === 'pending') ? C.warn : d.status === 'approved' ? C.success : C.danger}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15, color: C.white }}>{d.userName}</span>
                    <Badge color={(!d.status || d.status === 'pending') ? C.warn : d.status === 'approved' ? C.success : C.danger}>{d.status?.toUpperCase() || 'PENDING'}</Badge>
                  </div>
                  <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: C.muted, marginBottom: 4 }}>{d.email}</div>
                  <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, fontWeight: 900, color: C.success, marginBottom: 4 }}>â‚¹{d.amount}</div>
                  <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: C.muted }}>UTR: <span style={{ color: C.cyan }}>{d.utr}</span> Â· {new Date(d.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  {d.screenshot && <div style={{ marginTop: 10 }}><img src={d.screenshot} alt="proof" onClick={() => window.open(d.screenshot)} style={{ height: 90, borderRadius: 8, cursor: 'pointer', border: `1px solid ${C.border}` }} /></div>}
                </div>
                {(!d.status || d.status === 'pending') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <Btn onClick={() => approve(d)} success style={{ padding: '9px 16px', fontSize: 13 }}>âœ“ Approve</Btn>
                    <Btn onClick={() => reject(d)} danger style={{ padding: '9px 16px', fontSize: 13 }}>âœ• Reject</Btn>
                  </div>
                )}
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  );
}

// â”€â”€ WITHDRAWALS â”€â”€
function Withdrawals({ toast }) {
  const [wds, setWds] = useState([]);

  useEffect(() => {
    const unsub = onValue(ref(db, 'withdrawalRequests'), snap => {
      if (!snap.exists()) { setWds([]); return; }
      const arr = [];
      snap.forEach(c => arr.push({ ...c.val(), _id: c.key }));
      setWds(arr.sort((a, b) => b.date - a.date));
    });
    return unsub;
  }, []);

  const approve = async (wd) => {
    try {
      const curSnap = await get(ref(db, `users/${wd.userId}/wallet`));
      const cur = curSnap.val() || 0;
      if (cur < wd.amount) { toast('User has insufficient balance now!', 'error'); return; }
      const txKey = push(ref(db, `users/${wd.userId}/transactions`)).key;
      const nk = push(ref(db, `notifications/${wd.userId}`)).key;
      await update(ref(db), {
        [`users/${wd.userId}/wallet`]: cur - wd.amount,
        [`users/${wd.userId}/transactions/${txKey}`]: { type: 'Withdrawal', amount: -wd.amount, date: Date.now(), status: 'completed', desc: `Paid to ${wd.upiId}` },
        [`withdrawalRequests/${wd._id}/status`]: 'approved',
        [`notifications/${wd.userId}/${nk}`]: { title: 'âœ… Withdrawal Processed!', body: `â‚¹${wd.amount} sent to ${wd.upiId}`, type: 'deposit', date: Date.now(), read: false }
      });
      toast(`â‚¹${wd.amount} withdrawal approved`, 'success');
    } catch { toast('Error', 'error'); }
  };

  const reject = async (wd) => {
    try {
      const nk = push(ref(db, `notifications/${wd.userId}`)).key;
      await update(ref(db), {
        [`withdrawalRequests/${wd._id}/status`]: 'rejected',
        [`notifications/${wd.userId}/${nk}`]: { title: 'âŒ Withdrawal Rejected', body: `â‚¹${wd.amount} withdrawal request rejected. Contact support.`, type: 'default', date: Date.now(), read: false }
      });
      toast('Withdrawal rejected', 'error');
    } catch { toast('Error', 'error'); }
  };

  const pending = wds.filter(w => !w.status || w.status === 'pending');

  return (
    <div className="anim-fade">
      <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, color: C.white, marginBottom: 4 }}>ðŸ“¤ Withdrawals</h2>
      <p style={{ fontFamily: 'Rajdhani,sans-serif', color: C.muted, fontSize: 13, marginBottom: 20 }}>{pending.length} pending requests</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {wds.length === 0 ? <Card><div style={{ textAlign: 'center', color: C.muted, fontFamily: 'Rajdhani,sans-serif', padding: 30 }}>No withdrawal requests</div></Card> :
          wds.map(w => (
            <Card key={w._id} style={{ borderLeft: `3px solid ${(!w.status || w.status === 'pending') ? C.warn : w.status === 'approved' ? C.success : C.danger}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15, color: C.white }}>{w.userName}</span>
                    <Badge color={(!w.status || w.status === 'pending') ? C.warn : w.status === 'approved' ? C.success : C.danger}>{w.status?.toUpperCase() || 'PENDING'}</Badge>
                  </div>
                  <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 20, fontWeight: 900, color: C.warn, marginBottom: 4 }}>â‚¹{w.amount}</div>
                  <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: C.muted }}>UPI: <span style={{ color: C.cyan, fontFamily: 'Orbitron,monospace', fontSize: 12 }}>{w.upiId}</span></div>
                  <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: C.muted }}>{new Date(w.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {(!w.status || w.status === 'pending') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <Btn onClick={() => approve(w)} success style={{ padding: '9px 16px', fontSize: 13 }}>âœ“ Approve</Btn>
                    <Btn onClick={() => reject(w)} danger style={{ padding: '9px 16px', fontSize: 13 }}>âœ• Reject</Btn>
                  </div>
                )}
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  );
}

// â”€â”€ TOURNAMENTS â”€â”€
function Tournaments({ toast }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', entryFee: 0, prizePool: '', map: 'Bermuda', maxPlayers: 32, mode: 'solo', startTime: '', rules: '', roomId: '', roomPassword: '', featured: false });
  const [editing, setEditing] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [thumbData, setThumbData] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(db, 'tournaments'), snap => {
      if (!snap.exists()) { setList([]); return; }
      const arr = [];
      snap.forEach(c => arr.push({ ...c.val(), _tid: c.key }));
      setList(arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    });
    return unsub;
  }, []);

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast('Max 3MB image', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setThumbPreview(ev.target.result); setThumbData(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.prizePool || !form.map) { toast('Fill required fields', 'error'); return; }
    const data = { name: form.name, entryFee: parseInt(form.entryFee) || 0, prizePool: form.prizePool, map: form.map, maxPlayers: parseInt(form.maxPlayers) || 32, mode: form.mode, startTime: form.startTime ? new Date(form.startTime).getTime() : null, rules: form.rules ? form.rules.split('\n').filter(r => r.trim()) : [], roomId: form.roomId || '', roomPassword: form.roomPassword || '', featured: form.featured, thumbnail: thumbData || (editing?.thumbnail || '') };
    try {
      if (editing) {
        await update(ref(db, `tournaments/${editing._tid}`), data);
        if (form.roomId && form.roomPassword) {
          // Notify all players
          const players = editing.players || {};
          const upd = {};
          Object.keys(players).forEach(uid => { const nk = push(ref(db, `notifications/${uid}`)).key; upd[`notifications/${uid}/${nk}`] = { title: 'ðŸ” Room Ready!', body: `Room ID & Password set for ${form.name}. Check My Matches!`, type: 'room', date: Date.now(), read: false }; });
          if (Object.keys(upd).length > 0) await update(ref(db), upd);
        }
        toast('Tournament updated!', 'success');
      } else {
        const key = push(ref(db, 'tournaments')).key;
        await set(ref(db, `tournaments/${key}`), { ...data, registered: 0, createdAt: Date.now() });
        toast('Tournament created! ðŸ†', 'success');
      }
      setForm({ name: '', entryFee: 0, prizePool: '', map: 'Bermuda', maxPlayers: 32, mode: 'solo', startTime: '', rules: '', roomId: '', roomPassword: '', featured: false });
      setThumbPreview(''); setThumbData(''); setEditing(null); setShowForm(false);
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  };

  const deleteT = async (tid) => {
    if (!window.confirm('Delete this tournament?')) return;
    try { await remove(ref(db, `tournaments/${tid}`)); toast('Deleted', 'error'); }
    catch { toast('Error', 'error'); }
  };

  const editT = (t) => {
    setEditing(t);
    setForm({ name: t.name || '', entryFee: t.entryFee || 0, prizePool: t.prizePool || '', map: t.map || 'Bermuda', maxPlayers: t.maxPlayers || 32, mode: t.mode || 'solo', startTime: t.startTime ? new Date(t.startTime - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '', rules: (t.rules || []).join('\n'), roomId: t.roomId || '', roomPassword: t.roomPassword || '', featured: t.featured || false });
    setThumbPreview(t.thumbnail || ''); setThumbData(''); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const iS = { background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.white, fontFamily: 'Inter,sans-serif', fontSize: 13, width: '100%' };
  const iL = { display: 'block', fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 };

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, color: C.white }}>ðŸ† Tournaments</h2>
          <p style={{ fontFamily: 'Rajdhani,sans-serif', color: C.muted, fontSize: 13, marginTop: 2 }}>{list.length} total</p>
        </div>
        <Btn onClick={() => { setEditing(null); setForm({ name: '', entryFee: 0, prizePool: '', map: 'Bermuda', maxPlayers: 32, mode: 'solo', startTime: '', rules: '', roomId: '', roomPassword: '', featured: false }); setThumbPreview(''); setThumbData(''); setShowForm(!showForm); }}>
          {showForm ? 'âœ• Close Form' : 'ï¼‹ Create New'}
        </Btn>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card style={{ marginBottom: 20, borderColor: C.cyan + '44' }}>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, color: C.cyan, marginBottom: 16, letterSpacing: 1 }}>
            {editing ? 'âœï¸ EDIT TOURNAMENT' : 'ï¼‹ CREATE TOURNAMENT'}
          </div>

          {/* Thumbnail Upload */}
          <div style={{ marginBottom: 14 }}>
            <label style={iL}>Tournament Thumbnail (16:9)</label>
            <label style={{ display: 'block', border: `2px dashed ${C.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', aspectRatio: thumbPreview ? 'auto' : '16/9', maxHeight: thumbPreview ? 'none' : 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.card2, position: 'relative' }}>
              {thumbPreview
                ? <img src={thumbPreview} alt="thumb" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10 }} />
                : <div style={{ textAlign: 'center', padding: 20, color: C.muted, fontFamily: 'Rajdhani,sans-serif', fontSize: 13 }}>ðŸ“ Click to upload thumbnail from device<br /><span style={{ fontSize: 11, opacity: .6 }}>PNG, JPG, WEBP Â· 16:9 recommended</span></div>
              }
              <input type="file" accept="image/*" onChange={handleThumb} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            </label>
            {thumbPreview && <button onClick={() => { setThumbPreview(''); setThumbData(''); }} style={{ marginTop: 6, background: 'none', border: 'none', color: C.danger, fontFamily: 'Rajdhani,sans-serif', fontSize: 12, cursor: 'pointer' }}>âœ• Remove thumbnail</button>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={iL}>Tournament Name *</label>
              <input style={iS} placeholder="Weekend Rumble" value={form.name} onChange={e => F('name', e.target.value)} />
            </div>
            <div>
              <label style={iL}>Entry Fee (â‚¹)</label>
              <input style={iS} type="number" placeholder="0 = FREE" value={form.entryFee} onChange={e => F('entryFee', e.target.value)} />
            </div>
            <div>
              <label style={iL}>Prize Pool *</label>
              <input style={iS} placeholder="â‚¹5000" value={form.prizePool} onChange={e => F('prizePool', e.target.value)} />
            </div>
            <div>
              <label style={iL}>Map *</label>
              <select style={iS} value={form.map} onChange={e => F('map', e.target.value)}>
                {['Bermuda', 'Kalahari', 'Purgatory', 'Alpine', 'Nexterra'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={iL}>Max Players</label>
              <input style={iS} type="number" placeholder="32" value={form.maxPlayers} onChange={e => F('maxPlayers', e.target.value)} />
            </div>
            <div>
              <label style={iL}>Mode</label>
              <select style={iS} value={form.mode} onChange={e => F('mode', e.target.value)}>
                <option value="solo">ðŸ‘¤ Solo</option>
                <option value="duo">ðŸ‘¥ Duo</option>
                <option value="squad">âš”ï¸ Squad</option>
              </select>
            </div>
            <div>
              <label style={iL}>Start Time</label>
              <input style={iS} type="datetime-local" value={form.startTime} onChange={e => F('startTime', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={iL}>Rules (one per line)</label>
              <textarea style={{ ...iS, height: 80, resize: 'vertical' }} placeholder="No hacking&#10;Screenshot required" value={form.rules} onChange={e => F('rules', e.target.value)} />
            </div>
            <div style={{ background: 'rgba(0,229,255,.04)', border: `1px solid rgba(0,229,255,.2)`, borderRadius: 12, padding: 14, gridColumn: '1/-1' }}>
              <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 13, color: C.cyan, marginBottom: 12 }}>ðŸ” Room Credentials (set before match)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={iL}>Room ID</label><input style={iS} placeholder="Room ID" value={form.roomId} onChange={e => F('roomId', e.target.value)} /></div>
                <div><label style={iL}>Room Password</label><input style={iS} placeholder="Password" value={form.roomPassword} onChange={e => F('roomPassword', e.target.value)} /></div>
              </div>
            </div>
            <div>
              <label style={iL}>Featured?</label>
              <select style={iS} value={form.featured ? '1' : '0'} onChange={e => F('featured', e.target.value === '1')}>
                <option value="0">Normal</option>
                <option value="1">â­ Featured</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Btn onClick={save} success style={{ flex: 1 }}>{editing ? 'âœ“ Save Changes' : 'ï¼‹ Create Tournament'}</Btn>
            <Btn onClick={() => { setShowForm(false); setEditing(null); }} danger style={{ flex: 1 }}>âœ• Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Tournament List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.length === 0 ? <Card><div style={{ textAlign: 'center', color: C.muted, fontFamily: 'Rajdhani,sans-serif', padding: 30 }}>No tournaments yet. Create one above!</div></Card> :
          list.map(t => (
            <Card key={t._tid} style={{ padding: 0, overflow: 'hidden', borderColor: t.featured ? C.gold + '55' : C.border }}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {t.thumbnail && <img src={t.thumbnail} alt="thumb" style={{ width: 100, objectFit: 'cover', flexShrink: 0 }} />}
                <div style={{ flex: 1, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, fontWeight: 700, color: C.white }}>{t.name}</span>
                        {t.featured && <Badge color={C.gold}>â­ FEATURED</Badge>}
                        {t.roomId && <Badge color={C.cyan}>ðŸ” ROOM SET</Badge>}
                      </div>
                      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: C.muted }}>
                        {t.map} Â· {(t.mode || 'solo').toUpperCase()} Â· â‚¹{t.entryFee || 0} Â· Prize: {t.prizePool} Â· {t.registered || 0}/{t.maxPlayers}
                      </div>
                      {t.startTime && <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: C.cyan, marginTop: 3 }}>ðŸ“… {new Date(t.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <Btn onClick={() => editT(t)} style={{ padding: '7px 12px', fontSize: 12 }}>âœï¸ Edit</Btn>
                      <Btn onClick={() => deleteT(t._tid)} danger style={{ padding: '7px 12px', fontSize: 12 }}>ðŸ—‘ï¸</Btn>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  );
}

// â”€â”€ SPIN WHEEL SETTINGS â”€â”€
function SpinSettings({ toast }) {
  const [cost, setCost] = useState(10);
  const [prizes, setPrizes] = useState([
    { label: 'Better Luck', value: 0, prob: 35, color: '#1b3c6e', type: 'nothing' },
    { label: 'S$ 2', value: 2, prob: 22, color: '#1565c0', type: 'cash' },
    { label: 'S$ 5', value: 5, prob: 16, color: '#7c4dff', type: 'cash' },
    { label: 'S$ 10', value: 10, prob: 11, color: '#00e5ff', type: 'cash' },
    { label: 'S$ 25', value: 25, prob: 7, color: '#00e676', type: 'cash' },
    { label: 'S$ 50', value: 50, prob: 4, color: '#ffd700', type: 'cash' },
    { label: 'Ticket', value: 1, prob: 3, color: '#f50057', type: 'ticket' },
    { label: 'S$ 100', value: 100, prob: 2, color: '#ff6d00', type: 'cash' },
  ]);
  const [newPrize, setNewPrize] = useState({ label: '', value: 0, prob: 10, color: '#7c4dff', type: 'cash' });
  const [stickerData, setStickerData] = useState('');
  const [stickerPreview, setStickerPreview] = useState('');

  useEffect(() => {
    get(ref(db, 'settings/wheel')).then(snap => {
      if (snap.exists()) {
        const d = snap.val();
        if (d.cost) setCost(d.cost);
        if (d.prizes?.length) setPrizes(d.prizes);
      }
    });
    get(ref(db, 'settings/sticker')).then(snap => {
      if (snap.exists() && snap.val()) setStickerPreview(snap.val());
    });
  }, []);

  const totalProb = prizes.reduce((s, p) => s + (p.prob || 0), 0);

  const save = async () => {
    try {
      await update(ref(db, 'settings/wheel'), { cost: parseInt(cost) || 10, prizes });
      toast('Wheel settings saved! âœ“', 'success');
    } catch { toast('Error saving', 'error'); }
  };

  const addPrize = () => {
    if (!newPrize.label) { toast('Enter prize label', 'error'); return; }
    setPrizes(p => [...p, { ...newPrize }]);
    setNewPrize({ label: '', value: 0, prob: 10, color: '#7c4dff', type: 'cash' });
  };

  const removePrize = (i) => setPrizes(p => p.filter((_, idx) => idx !== i));
  const updatePrize = (i, k, v) => setPrizes(p => p.map((pr, idx) => idx === i ? { ...pr, [k]: v } : pr));

  const handleSticker = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast('Max 2MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setStickerPreview(ev.target.result); setStickerData(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const saveSticker = async () => {
    if (!stickerData) { toast('Upload a sticker first', 'error'); return; }
    try { await set(ref(db, 'settings/sticker'), stickerData); toast('Sticker saved!', 'success'); }
    catch { toast('Error', 'error'); }
  };

  const iS2 = { background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.white, fontFamily: 'Inter,sans-serif', fontSize: 12 };

  return (
    <div className="anim-fade">
      <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, color: C.white, marginBottom: 20 }}>ðŸŽ¡ Spin Wheel Settings</h2>

      {/* Spin Cost */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: C.cyan, marginBottom: 12, letterSpacing: 1 }}>SPIN COST</div>
        <Input label="Cost per spin (â‚¹)" type="number" value={cost} onChange={e => setCost(e.target.value)} />
      </Card>

      {/* Sticker Upload */}
      <Card style={{ marginBottom: 16, borderColor: C.gold + '44' }}>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: C.gold, marginBottom: 12, letterSpacing: 1 }}>ðŸ·ï¸ SPIN WHEEL STICKER / BRANDING</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {stickerPreview && <img src={stickerPreview} alt="sticker" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'contain', border: `1px solid ${C.border}`, background: '#fff' }} />}
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', background: C.card2, border: `2px dashed ${C.border}`, borderRadius: 10, padding: 14, textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
              <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 13, color: C.muted }}>ðŸ“ Upload Sticker (PNG/SVG) â€” Square</div>
              <input type="file" accept="image/*" onChange={handleSticker} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            </label>
          </div>
          <Btn onClick={saveSticker} style={{ padding: '10px 18px' }}>ðŸ’¾ Save</Btn>
        </div>
      </Card>

      {/* Prizes List */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: C.cyan, letterSpacing: 1 }}>PRIZE SLOTS</div>
          <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: totalProb === 100 ? C.success : C.warn }}>Total Prob: {totalProb}% {totalProb !== 100 ? 'âš ï¸ Should be 100%' : 'âœ“'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {prizes.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center', background: C.card2, borderRadius: 10, padding: '10px 12px', border: `1px solid ${C.border}` }}>
              <input value={p.label} onChange={e => updatePrize(i, 'label', e.target.value)} style={iS2} placeholder="Label" />
              <input type="number" value={p.value} onChange={e => updatePrize(i, 'value', parseFloat(e.target.value) || 0)} style={iS2} placeholder="Value" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="number" value={p.prob} onChange={e => updatePrize(i, 'prob', parseInt(e.target.value) || 0)} style={{ ...iS2, width: '100%' }} placeholder="Prob%" />
                <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: C.muted, flexShrink: 0 }}>%</span>
              </div>
              <select value={p.type} onChange={e => updatePrize(i, 'type', e.target.value)} style={iS2}>
                <option value="nothing">âŒ Nothing</option>
                <option value="cash">ðŸ’° Cash</option>
                <option value="ticket">ðŸŽ« Ticket</option>
              </select>
              <input type="color" value={p.color} onChange={e => updatePrize(i, 'color', e.target.value)} style={{ ...iS2, padding: 4, height: 34, cursor: 'pointer' }} />
              <button onClick={() => removePrize(i)} style={{ background: 'rgba(255,68,68,.1)', border: `1px solid ${C.danger}44`, borderRadius: 6, color: C.danger, padding: '6px 10px', cursor: 'pointer', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12 }}>âœ•</button>
            </div>
          ))}
        </div>

        {/* Add New Prize */}
        <div style={{ marginTop: 12, background: 'rgba(0,229,255,.04)', border: `1px solid rgba(0,229,255,.15)`, borderRadius: 10, padding: 12 }}>
          <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12, color: C.cyan, marginBottom: 8 }}>+ ADD NEW PRIZE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
            <input value={newPrize.label} onChange={e => setNewPrize(p => ({ ...p, label: e.target.value }))} style={iS2} placeholder="Label" />
            <input type="number" value={newPrize.value} onChange={e => setNewPrize(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} style={iS2} placeholder="Value" />
            <input type="number" value={newPrize.prob} onChange={e => setNewPrize(p => ({ ...p, prob: parseInt(e.target.value) || 0 }))} style={iS2} placeholder="Prob%" />
            <select value={newPrize.type} onChange={e => setNewPrize(p => ({ ...p, type: e.target.value }))} style={iS2}>
              <option value="nothing">âŒ Nothing</option>
              <option value="cash">ðŸ’° Cash</option>
              <option value="ticket">ðŸŽ« Ticket</option>
            </select>
            <input type="color" value={newPrize.color} onChange={e => setNewPrize(p => ({ ...p, color: e.target.value }))} style={{ ...iS2, padding: 4, height: 34, cursor: 'pointer' }} />
            <Btn onClick={addPrize} style={{ padding: '7px 12px', fontSize: 12 }}>ï¼‹ Add</Btn>
          </div>
        </div>

        <Btn onClick={save} success style={{ width: '100%', marginTop: 14 }}>ðŸ’¾ Save All Settings</Btn>
      </Card>
    </div>
  );
}

// â”€â”€ UPI / SETTINGS â”€â”€
function Settings({ toast }) {
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('Synex');
  const [liveUrl, setLiveUrl] = useState('');
  const [liveTitle, setLiveTitle] = useState('');
  const [liveActive, setLiveActive] = useState(false);
  const [tg, setTg] = useState('');
  const [wa, setWa] = useState('');
  const [em, setEm] = useState('');

  useEffect(() => {
    get(ref(db, 'settings/upi')).then(s => { if (s.exists()) { setUpiId(s.val().id || ''); setUpiName(s.val().name || 'Synex'); } });
    get(ref(db, 'liveStream')).then(s => { if (s.exists()) { setLiveUrl(s.val().url || ''); setLiveTitle(s.val().title || ''); setLiveActive(s.val().active || false); } });
    get(ref(db, 'settings/support')).then(s => { if (s.exists()) { setTg(s.val().telegram || ''); setWa(s.val().whatsapp || ''); setEm(s.val().email || ''); } });
  }, []);

  const saveUPI = async () => {
    if (!upiId) { toast('Enter UPI ID', 'error'); return; }
    try { await set(ref(db, 'settings/upi'), { id: upiId, name: upiName }); toast('UPI settings saved!', 'success'); }
    catch { toast('Error', 'error'); }
  };
  const saveLive = async () => {
    try { await set(ref(db, 'liveStream'), { url: liveUrl, title: liveTitle, active: liveActive, updatedAt: Date.now() }); toast('Live settings saved!', 'success'); }
    catch { toast('Error', 'error'); }
  };
  const saveSupport = async () => {
    try { await set(ref(db, 'settings/support'), { telegram: tg, whatsapp: wa, email: em }); toast('Support links saved!', 'success'); }
    catch { toast('Error', 'error'); }
  };

  return (
    <div className="anim-fade">
      <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 18, color: C.white, marginBottom: 20 }}>âš™ï¸ Settings</h2>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: C.gold, marginBottom: 12, letterSpacing: 1 }}>ðŸ’³ UPI PAYMENT</div>
        <Input label="UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@okhdfcbank" />
        <Input label="Merchant Name" value={upiName} onChange={e => setUpiName(e.target.value)} placeholder="Synex Tournament" />
        <Btn onClick={saveUPI} success>ðŸ’¾ Save UPI</Btn>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: C.danger, marginBottom: 12, letterSpacing: 1 }}>ðŸ“º LIVE STREAM</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <input type="checkbox" checked={liveActive} onChange={e => setLiveActive(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
          <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, color: liveActive ? C.danger : C.muted }}>ðŸ”´ Live Stream {liveActive ? 'ACTIVE' : 'INACTIVE'}</span>
        </div>
        <Input label="YouTube URL or ID" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://youtube.com/live/..." />
        <Input label="Stream Title" value={liveTitle} onChange={e => setLiveTitle(e.target.value)} placeholder="Synex Live â€“ Finals" />
        <Btn onClick={saveLive}>ðŸ’¾ Save Live Settings</Btn>
      </Card>
      <Card>
        <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, color: C.cyan, marginBottom: 12, letterSpacing: 1 }}>ðŸŽ§ SUPPORT LINKS</div>
        <Input label="Telegram Link" value={tg} onChange={e => setTg(e.target.value)} placeholder="https://t.me/synexsupport" />
        <Input label="WhatsApp Number" value={wa} onChange={e => setWa(e.target.value)} placeholder="919876543210" />
        <Input label="Support Email" value={em} onChange={e => setEm(e.target.value)} placeholder="support@synex.com" />
        <Btn onClick={saveSupport}>ðŸ’¾ Save Support Links</Btn>
      </Card>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN DASHBOARD
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const MENU = [
  { id: 'overview', icon: 'ðŸ“Š', label: 'Overview' },
  { id: 'users', icon: 'ðŸ‘¥', label: 'Users' },
  { id: 'deposits', icon: 'ðŸ’°', label: 'Deposits' },
  { id: 'withdrawals', icon: 'ðŸ“¤', label: 'Withdrawals' },
  { id: 'tournaments', icon: 'ðŸ†', label: 'Tournaments' },
  { id: 'spin', icon: 'ðŸŽ¡', label: 'Spin Wheel' },
  { id: 'settings', icon: 'âš™ï¸', label: 'Settings' },
];

export default function Dashboard({ user }) {
  const [active, setActive] = useState('overview');
  const [sideOpen, setSideOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ users: 0, tournaments: 0, totalBal: 0, pendingDep: 0, pendingWd: 0, blocked: 0 });

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    // Load stats
    onValue(ref(db, 'users'), snap => {
      if (!snap.exists()) return;
      let totalBal = 0, blocked = 0, count = 0;
      snap.forEach(c => { const u = c.val(); totalBal += u.wallet || 0; if (u.isBlocked) blocked++; count++; });
      setStats(s => ({ ...s, users: count, totalBal, blocked }));
    });
    onValue(ref(db, 'tournaments'), snap => setStats(s => ({ ...s, tournaments: snap.exists() ? Object.keys(snap.val()).length : 0 })));
    onValue(ref(db, 'depositRequests'), snap => {
      if (!snap.exists()) { setStats(s => ({ ...s, pendingDep: 0 })); return; }
      let p = 0; snap.forEach(c => { if (!c.val().status || c.val().status === 'pending') p++; });
      setStats(s => ({ ...s, pendingDep: p }));
    });
    onValue(ref(db, 'withdrawalRequests'), snap => {
      if (!snap.exists()) { setStats(s => ({ ...s, pendingWd: 0 })); return; }
      let p = 0; snap.forEach(c => { if (!c.val().status || c.val().status === 'pending') p++; });
      setStats(s => ({ ...s, pendingWd: p }));
    });
  }, []);

  const W = sideOpen ? 240 : 64;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: 'Inter,sans-serif' }}>
      <style>{css}</style>

      {/* SIDEBAR */}
      <div style={{ width: W, background: `linear-gradient(180deg,${C.bg2},${C.bg})`, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width .25s ease', overflow: 'hidden', position: 'sticky', top: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: sideOpen ? '24px 20px 20px' : '24px 12px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="anim-float" style={{ width: 36, height: 36, background: `linear-gradient(135deg,#0d47a1,${C.cyan})`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron,monospace', fontWeight: 900, fontSize: 16, color: '#fff', flexShrink: 0, boxShadow: `0 0 16px rgba(0,229,255,.3)` }}>S</div>
            {sideOpen && <div><div style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, fontWeight: 900, background: `linear-gradient(135deg,#fff,${C.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SYNEX</div><div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>Admin Panel</div></div>}
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {MENU.map(m => {
            const hasBadge = (m.id === 'deposits' && stats.pendingDep > 0) || (m.id === 'withdrawals' && stats.pendingWd > 0);
            return (
              <div key={m.id} onClick={() => setActive(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: sideOpen ? '12px 18px' : '12px', cursor: 'pointer', borderLeft: `3px solid ${active === m.id ? C.cyan : 'transparent'}`, background: active === m.id ? `linear-gradient(90deg,rgba(0,229,255,.1),transparent)` : 'transparent', color: active === m.id ? C.cyan : C.muted, transition: 'all .2s', position: 'relative', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{m.icon}</span>
                {sideOpen && <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14 }}>{m.label}</span>}
                {hasBadge && <span style={{ position: 'absolute', right: sideOpen ? 14 : 6, top: '50%', transform: 'translateY(-50%)', background: C.danger, color: '#fff', borderRadius: 10, padding: '1px 6px', fontFamily: 'Orbitron,monospace', fontSize: 9, fontWeight: 700 }}>{m.id === 'deposits' ? stats.pendingDep : stats.pendingWd}</span>}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: sideOpen ? '14px 18px' : '14px 12px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          {sideOpen && <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 11, color: C.muted, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>}
          <button onClick={() => signOut(auth)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,68,68,.1)', border: `1px solid rgba(255,68,68,.3)`, borderRadius: 8, padding: sideOpen ? '8px 14px' : '8px', color: C.danger, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer', width: '100%' }}>
            ðŸšª{sideOpen && ' Logout'}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ background: `linear-gradient(90deg,${C.bg2},${C.card})`, borderBottom: `1px solid ${C.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSideOpen(o => !o)} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 10px', color: C.white, cursor: 'pointer', fontSize: 14 }}>â˜°</button>
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, color: C.white }}>{MENU.find(m => m.id === active)?.icon} {MENU.find(m => m.id === active)?.label}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {stats.pendingDep > 0 && <Badge color={C.warn}>â³ {stats.pendingDep} Pending Deps</Badge>}
            {stats.pendingWd > 0 && <Badge color={C.purple}>ðŸ“¤ {stats.pendingWd} Pending WDs</Badge>}
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, boxShadow: `0 0 8px ${C.success}`, animation: 'pulse 2s ease infinite' }} />
            <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 12, color: C.success }}>LIVE</span>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {active === 'overview' && <Overview stats={stats} toast={showToast} />}
          {active === 'users' && <Users toast={showToast} />}
          {active === 'deposits' && <Deposits toast={showToast} />}
          {active === 'withdrawals' && <Withdrawals toast={showToast} />}
          {active === 'tournaments' && <Tournaments toast={showToast} />}
          {active === 'spin' && <SpinSettings toast={showToast} />}
          {active === 'settings' && <Settings toast={showToast} />}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
