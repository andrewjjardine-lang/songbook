import { useState, useEffect } from 'react'
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, updateDoc, query, orderBy, onSnapshot
} from 'firebase/firestore'
import { db } from './firebase'

const ADMIN_PASSWORD = 'campfire2026'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { min-height: 100vh; }
  body { background: #1C1410; font-family: 'Lato', system-ui, sans-serif; color: #F5EDD8; }
  .app { min-height: 100vh; }

  .header {
    background: linear-gradient(160deg, #1C1410 0%, #2E1F0E 60%, #1C1410 100%);
    border-bottom: 2px solid #E8873A44;
    padding: 2rem 1.5rem 1.5rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 50% 120%, #E8873A22 0%, transparent 70%);
    pointer-events: none;
  }
  .header-flame {
    font-size: 2.8rem; display: block; margin-bottom: 0.4rem;
    filter: drop-shadow(0 0 12px #E8873A);
    animation: flicker 2.4s ease-in-out infinite alternate;
  }
  @keyframes flicker {
    0%   { filter: drop-shadow(0 0 8px #E8873A) brightness(1); transform: scale(1) rotate(-1deg); }
    40%  { filter: drop-shadow(0 0 18px #F5A623) brightness(1.15); transform: scale(1.04) rotate(0.5deg); }
    70%  { filter: drop-shadow(0 0 10px #E8873A) brightness(0.95); transform: scale(0.98) rotate(-0.5deg); }
    100% { filter: drop-shadow(0 0 14px #F5A623) brightness(1.08); transform: scale(1.02) rotate(1deg); }
  }
  .header h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    font-weight: 900; color: #F5EDD8; letter-spacing: 0.02em; line-height: 1.1;
  }
  .header h1 span { color: #E8873A; }
  .header p { color: #C4A97D; font-size: 0.95rem; margin-top: 0.5rem; font-weight: 300; letter-spacing: 0.04em; }

  .nav { display: flex; justify-content: center; gap: 0.5rem; padding: 1rem 1.5rem 0; background: #1C1410; }
  .nav button {
    background: transparent; border: 1px solid #E8873A55; color: #C4A97D;
    font-family: 'Lato', sans-serif; font-size: 0.85rem; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 0.5rem 1.2rem; border-radius: 2px; cursor: pointer; transition: all 0.2s;
  }
  .nav button.active, .nav button:hover { background: #E8873A; border-color: #E8873A; color: #1C1410; font-weight: 700; }

  .container { max-width: 680px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
  .container.wide { max-width: 800px; }

  .card { background: #2E1F0E; border: 1px solid #E8873A33; border-radius: 4px; padding: 1.8rem; margin-bottom: 1.2rem; }
  .card h2 {
    font-family: 'Playfair Display', Georgia, serif; font-size: 1.25rem; color: #F5EDD8;
    margin-bottom: 1.2rem; padding-bottom: 0.7rem; border-bottom: 1px solid #E8873A33;
  }

  .field { margin-bottom: 1.1rem; }
  .field label { display: block; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; color: #C4A97D; margin-bottom: 0.4rem; font-weight: 700; }
  .field input, .field textarea {
    width: 100%; background: #1C1410; border: 1px solid #E8873A44; border-radius: 2px;
    color: #F5EDD8; font-family: 'Lato', sans-serif; font-size: 0.95rem;
    padding: 0.65rem 0.9rem; outline: none; transition: border-color 0.2s; resize: vertical;
  }
  .field input:focus, .field textarea:focus { border-color: #E8873A; }
  .field textarea { min-height: 110px; }

  .btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.65rem 1.4rem; border: none; border-radius: 2px;
    font-family: 'Lato', sans-serif; font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.2s;
  }
  .btn-primary { background: #E8873A; color: #1C1410; }
  .btn-primary:hover { background: #F5A623; }
  .btn-primary:disabled { background: #6B4A2A; color: #9E7A4A; cursor: default; }
  .btn-ghost { background: transparent; color: #C4A97D; border: 1px solid #E8873A44; }
  .btn-ghost:hover { border-color: #E8873A; color: #F5EDD8; }
  .btn-danger { background: #C0392B22; color: #E74C3C; border: 1px solid #C0392B44; }
  .btn-danger:hover { background: #C0392B44; }
  .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.78rem; }

  .toast { padding: 0.9rem 1.2rem; border-radius: 2px; margin-top: 1rem; font-size: 0.9rem; }
  .toast.success { background: #6B7C5E33; border: 1px solid #6B7C5E; color: #A8C49A; }
  .toast.error { background: #C0392B22; border: 1px solid #C0392B55; color: #E74C3C; }

  .stats { display: flex; gap: 1.5rem; flex-wrap: wrap; padding: 1rem 1.8rem; background: #2E1F0E; border: 1px solid #E8873A33; border-radius: 4px; margin-bottom: 1.2rem; }
  .stat { text-align: center; }
  .stat-num { display: block; font-family: 'Playfair Display', Georgia, serif; font-size: 1.6rem; color: #E8873A; line-height: 1; }
  .stat-label { font-size: 0.72rem; color: #C4A97D; letter-spacing: 0.08em; text-transform: uppercase; }

  .song-item { background: #1C1410; border: 1px solid #E8873A22; border-radius: 2px; padding: 1rem 1.2rem; margin-bottom: 0.7rem; }
  .song-item-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.5rem; }
  .song-title-block h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.05rem; color: #F5EDD8; }
  .song-title-block p { font-size: 0.82rem; color: #C4A97D; margin-top: 0.15rem; }

  .badge { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 20px; white-space: nowrap; }
  .badge-green { background: #6B7C5E33; color: #A8C49A; border: 1px solid #6B7C5E44; }
  .badge-amber { background: #E8873A22; color: #E8873A; border: 1px solid #E8873A44; }
  .badge-red   { background: #C0392B22; color: #E74C3C; border: 1px solid #C0392B44; }

  .lyrics-preview { font-size: 0.82rem; color: #9E8A6A; line-height: 1.55; margin-top: 0.6rem; max-height: 80px; overflow: hidden; white-space: pre-wrap; }
  .lyrics-preview.expanded { max-height: none; }
  .expand-btn { background: none; border: none; color: #E8873A; font-size: 0.78rem; cursor: pointer; padding: 0.2rem 0; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; }
  .song-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.7rem; }

  .spin { display: inline-block; width: 14px; height: 14px; border: 2px solid #E8873A44; border-top-color: #E8873A; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .section-label { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: #C4A97D; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.8rem; }
  .section-label::after { content: ''; flex: 1; height: 1px; background: #E8873A22; }

  .empty { text-align: center; padding: 3rem 1rem; color: #6B4A2A; }
  .empty .emoji { font-size: 2.5rem; margin-bottom: 0.8rem; display: block; }

  .login-wrap { max-width: 380px; margin: 3rem auto; }
  .admin-banner { background: #E8873A11; border: 1px solid #E8873A44; border-radius: 2px; padding: 0.7rem 1rem; font-size: 0.82rem; color: #C4A97D; margin-bottom: 1.2rem; text-align: center; }

  .booklet-preview { background: #FFF8ED; color: #1C1410; font-family: Georgia, serif; border-radius: 4px; overflow: hidden; box-shadow: 0 8px 32px #00000088; }
  .booklet-cover-preview { background: #2E1F0E; color: #F5EDD8; text-align: center; padding: 3rem 2rem; border-bottom: 3px solid #E8873A; }
  .booklet-cover-preview h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 2rem; color: #E8873A; margin-bottom: 0.5rem; }
  .booklet-song-page { padding: 2rem; border-bottom: 1px solid #E8873A33; }
  .booklet-song-page h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.4rem; color: #2E1F0E; border-bottom: 2px solid #E8873A; padding-bottom: 0.4rem; margin-bottom: 0.3rem; }
  .booklet-song-page .artist { font-size: 0.85rem; color: #6B4A2A; font-style: italic; margin-bottom: 1rem; }
  .booklet-song-page pre { font-family: Georgia, serif; font-size: 0.92rem; line-height: 1.75; color: #2E1F0E; white-space: pre-wrap; word-wrap: break-word; }

  @media print {
    .no-print { display: none !important; }
    body { background: white !important; color: black !important; }
    .booklet-preview { box-shadow: none !important; border-radius: 0 !important; }
    .booklet-song-page { page-break-after: always; }
    .booklet-cover-preview { page-break-after: always; }
  }
  @media (max-width: 500px) {
    .header h1 { font-size: 1.6rem; }
    .card { padding: 1.2rem; }
    .stats { gap: 1rem; }
  }
`

function SubmitView() {
  const [form, setForm] = useState({ name: '', title: '', artist: '', lyrics: '' })
  const [status, setStatus] = useState(null)
  const [count, setCount] = useState(null)

  useEffect(() => {
    getDocs(collection(db, 'songs')).then(snap => setCount(snap.size)).catch(() => {})
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit() {
    if (!form.title.trim()) { setStatus('error-title'); return }
    setStatus('submitting')
    try {
      await addDoc(collection(db, 'songs'), {
        submittedBy: form.name.trim() || 'Anonymous',
        title: form.title.trim(),
        artist: form.artist.trim(),
        lyrics: form.lyrics.trim(),
        hasLyrics: !!form.lyrics.trim(),
        lyricsSource: form.lyrics.trim() ? 'submitted' : 'pending',
        submittedAt: new Date().toISOString(),
      })
      setStatus('done')
      setCount(c => (c || 0) + 1)
      setForm({ name: '', title: '', artist: '', lyrics: '' })
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>🎵 Suggest a Song</h2>
        <p style={{ fontSize: '0.88rem', color: '#C4A97D', marginBottom: '1.4rem', lineHeight: 1.6 }}>
          Help us build the ultimate campfire songbook! Add any song you know — just the title is enough, but feel free to share lyrics too.
        </p>
        <div className="field">
          <label>Your name (optional)</label>
          <input placeholder="Who's suggesting this one?" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Song title *</label>
          <input
            placeholder="e.g. Take Me Home, Country Roads"
            value={form.title}
            onChange={e => { set('title', e.target.value); setStatus(null) }}
            style={{ borderColor: status === 'error-title' ? '#E74C3C' : undefined }}
          />
          {status === 'error-title' && <p style={{ color: '#E74C3C', fontSize: '0.8rem', marginTop: '0.3rem' }}>Please enter a song title.</p>}
        </div>
        <div className="field">
          <label>Artist / band (optional)</label>
          <input placeholder="e.g. John Denver" value={form.artist} onChange={e => set('artist', e.target.value)} />
        </div>
        <div className="field">
          <label>Lyrics (optional — share what you know!)</label>
          <textarea
            placeholder={"Paste or type any lyrics you know...\n\nEven a chorus or a verse is helpful."}
            value={form.lyrics}
            onChange={e => set('lyrics', e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={submit} disabled={status === 'submitting' || status === 'done'}>
            {status === 'submitting' ? <><span className="spin" /> Submitting…</> : '🔥 Add to the Songbook'}
          </button>
          {count > 0 && <span style={{ fontSize: '0.82rem', color: '#6B4A2A' }}>{count} song{count !== 1 ? 's' : ''} so far</span>}
        </div>
        {status === 'done' && (
          <div className="toast success">
            ✓ Song added! Want to suggest another?
            <button onClick={() => setStatus(null)} style={{ background: 'none', border: 'none', color: '#A8C49A', marginLeft: '0.8rem', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>
              Add another
            </button>
          </div>
        )}
        {status === 'error' && <div className="toast error">Something went wrong — check your Firebase connection and try again.</div>}
      </div>
      <div style={{ textAlign: 'center', color: '#6B4A2A', fontSize: '0.8rem', marginTop: '2rem' }}>
        🪵 &nbsp;Gather 'round the fire &nbsp;🪵
      </div>
    </div>
  )
}

function AdminView() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [showBooklet, setShowBooklet] = useState(false)
  const [bookletTitle, setBookletTitle] = useState('Our Campfire Songbook')

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    const q = query(collection(db, 'songs'), orderBy('submittedAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setSongs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [authed])

  function login() {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
    else setPwError(true)
  }

  async function deleteSong(id) {
    if (!window.confirm('Remove this song?')) return
    await deleteDoc(doc(db, 'songs', id))
  }

  async function editLyrics(song) {
    const newLyrics = window.prompt(`Edit lyrics for "${song.title}":`, song.lyrics || '')
    if (newLyrics === null) return
    await updateDoc(doc(db, 'songs', song.id), {
      lyrics: newLyrics,
      hasLyrics: !!newLyrics,
      lyricsSource: newLyrics ? 'manual' : 'pending'
    })
  }

  if (!authed) {
    return (
      <div className="container">
        <div className="login-wrap">
          <div className="admin-banner">🔒 Admin access only</div>
          <div className="card">
            <h2>Sign in</h2>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                style={{ borderColor: pwError ? '#E74C3C' : undefined }}
              />
              {pwError && <p style={{ color: '#E74C3C', fontSize: '0.8rem', marginTop: '0.3rem' }}>Incorrect password.</p>}
            </div>
            <button className="btn btn-primary" onClick={login}>Enter</button>
          </div>
        </div>
      </div>
    )
  }

  const withLyrics = songs.filter(s => s.hasLyrics).length
  const withoutLyrics = songs.filter(s => !s.hasLyrics).length

  return (
    <div className="container wide">
      <div className="stats no-print" style={{ marginTop: '2rem' }}>
        <div className="stat"><span className="stat-num">{songs.length}</span><span className="stat-label">Total Songs</span></div>
        <div className="stat"><span className="stat-num" style={{ color: '#A8C49A' }}>{withLyrics}</span><span className="stat-label">Have Lyrics</span></div>
        <div className="stat"><span className="stat-num" style={{ color: '#E8873A' }}>{withoutLyrics}</span><span className="stat-label">Need Lyrics</span></div>
      </div>
      <div className="no-print" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {withLyrics > 0 && (
          <button className="btn btn-ghost" onClick={() => setShowBooklet(b => !b)}>
            📖 {showBooklet ? 'Hide' : 'Preview'} Booklet
          </button>
        )}
        {showBooklet && (
          <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
        )}
      </div>
      {!showBooklet && (
        <div className="no-print">
          <div className="section-label">Song submissions</div>
          {loading && <p style={{ color: '#6B4A2A', textAlign: 'center', padding: '2rem' }}>Loading…</p>}
          {!loading && songs.length === 0 && (
            <div className="empty">
              <span className="emoji">🎸</span>
              <p>No songs yet. Share your link to get suggestions rolling in!</p>
            </div>
          )}
          {!loading && songs.map(song => (
            <div className="song-item" key={song.id}>
              <div className="song-item-head">
                <div className="song-title-block">
                  <h3>{song.title}</h3>
                  <p>
                    {song.artist && <span>{song.artist} · </span>}
                    by {song.submittedBy}
                    {song.submittedAt && <span style={{ color: '#6B4A2A' }}> · {new Date(song.submittedAt).toLocaleDateString()}</span>}
                  </p>
                </div>
                <span className={`badge ${song.hasLyrics ? 'badge-green' : 'badge-red'}`}>
                  {song.hasLyrics ? 'Has lyrics' : 'No lyrics'}
                </span>
              </div>
              {song.lyrics && (
                <>
                  <div className={`lyrics-preview ${expanded[song.id] ? 'expanded' : ''}`}>{song.lyrics}</div>
                  <button className="expand-btn" onClick={() => setExpanded(e => ({ ...e, [song.id]: !e[song.id] }))}>
                    {expanded[song.id] ? '▲ Collapse' : '▼ Show lyrics'}
                  </button>
                </>
              )}
              <div className="song-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => editLyrics(song)}>✏️ Edit Lyrics</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteSong(song.id)}>🗑 Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showBooklet && (
        <div>
          <div className="no-print" style={{ marginBottom: '1rem' }}>
            <div className="field">
              <label>Booklet title</label>
              <input value={bookletTitle} onChange={e => setBookletTitle(e.target.value)} style={{ maxWidth: 380 }} />
            </div>
          </div>
          <div className="booklet-preview">
            <div className="booklet-cover-preview">
              <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🔥</div>
              <h1>{bookletTitle}</h1>
              <p style={{ color: '#C4A97D', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {withLyrics} songs · {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long' })}
              </p>
              <div style={{ textAlign: 'center', color: '#E8873A', fontSize: '1.2rem', letterSpacing: '0.5em', marginTop: '2rem', opacity: 0.5 }}>♪ ♩ ♪</div>
            </div>
            {songs.filter(s => s.hasLyrics).map((song, i) => (
              <div className="booklet-song-page" key={song.id}>
                <div style={{ fontSize: '0.75rem', color: '#9E7A4A', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Song {i + 1}</div>
                <h2>{song.title}</h2>
                {song.artist && <p className="artist">{song.artist}</p>}
                <pre>{song.lyrics}</pre>
                {song.submittedBy && song.submittedBy !== 'Anonymous' && (
                  <p style={{ fontSize: '0.75rem', color: '#9E7A4A', marginTop: '1rem', fontStyle: 'italic' }}>Suggested by {song.submittedBy}</p>
                )}
              </div>
            ))}
            <div style={{ background: '#2E1F0E', padding: '2rem', textAlign: 'center', color: '#6B4A2A', fontSize: '0.85rem' }}>
              🎵 Sing loud, sing proud 🎵
            </div>
          </div>
          <div className="no-print" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: '#6B4A2A', fontSize: '0.82rem' }}>Only songs with lyrics appear in the booklet. Use Print / Save PDF above to generate your file.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('submit')
  return (
    <div className="app">
      <style>{css}</style>
      <div className="header">
        <span className="header-flame">🔥</span>
        <h1>Campfire <span>Songbook</span></h1>
        <p>Suggest songs · Gather lyrics · Print &amp; sing</p>
      </div>
      <div className="nav no-print">
        <button className={view === 'submit' ? 'active' : ''} onClick={() => setView('submit')}>♪ Suggest a Song</button>
        <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>⚙ Admin &amp; Booklet</button>
      </div>
      {view === 'submit' ? <SubmitView /> : <AdminView />}
    </div>
  )
}
