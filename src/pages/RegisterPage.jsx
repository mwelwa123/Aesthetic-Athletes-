import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Mail, CheckCircle, RefreshCw, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

// ─── How long user must wait before resending (seconds) ───
const RESEND_COOLDOWN = 60
// ─── How long the magic link is valid (seconds) ───
const LINK_EXPIRY = 300 // 5 minutes

export default function RegisterPage() {
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [done, setDone]       = useState(false)
  const [regEmail, setRegEmail] = useState('')
  const [errors, setErrors]   = useState({})
  const [form, setForm]       = useState({ email:'', password:'', confirm:'', full_name:'', phone:'', sport:'' })

  // ── Resend cooldown timer ──
  const [cooldown, setCooldown]     = useState(0)   // seconds remaining
  const [resending, setResending]   = useState(false)
  const cooldownRef                 = useRef(null)

  // ── Link expiry countdown ──
  const [linkExpiry, setLinkExpiry] = useState(LINK_EXPIRY)
  const [linkExpired, setLinkExpired] = useState(false)
  const expiryRef                   = useRef(null)

  // Start the 5-minute link expiry countdown when we reach the verify screen
  useEffect(() => {
    if (!done) return
    setLinkExpiry(LINK_EXPIRY)
    setLinkExpired(false)
    expiryRef.current = setInterval(() => {
      setLinkExpiry(prev => {
        if (prev <= 1) {
          clearInterval(expiryRef.current)
          setLinkExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(expiryRef.current)
  }, [done])

  // Clean up cooldown on unmount
  useEffect(() => () => clearInterval(cooldownRef.current), [])

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN)
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }))
  }

  const validateStep0 = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Min. 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e); return !Object.keys(e).length
  }
  const validateStep1 = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    setErrors(e); return !Object.keys(e).length
  }

  const sc = (() => {
    let s = 0
    if (form.password.length >= 8) s++
    if (/[A-Z]/.test(form.password)) s++
    if (/[0-9]/.test(form.password)) s++
    if (/[^A-Za-z0-9]/.test(form.password)) s++
    return s
  })()
  const scColor = ['', '#ef4444', '#f59e0b', '#00b4d8', '#10b981'][sc]
  const scLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][sc]

  // ── Main registration call ──
  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validateStep1()) return
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, phone: form.phone, sport: form.sport },
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    })

    // ── THIS IS WHERE "email rate limit exceeded" was surfacing ──
    // We now check specifically for rate-limit errors and handle gracefully
    if (error) {
      const msg = error.message?.toLowerCase() || ''

      if (msg.includes('rate limit') || msg.includes('email rate') || msg.includes('too many')) {
        // Rate limited — go to verify screen anyway so user knows to wait
        // and give them a resend button once cooldown expires
        toast.error('Email limit reached. You can resend after 1 minute.', { duration: 5000 })
        setRegEmail(form.email)
        setDone(true)
        startCooldown()
      } else if (msg.includes('already registered') || msg.includes('user already exists')) {
        toast.error('This email is already registered. Try signing in instead.')
      } else {
        toast.error(error.message)
      }
    } else {
      setRegEmail(form.email)
      setDone(true)
      startCooldown() // prevent spamming even on success
    }

    setLoading(false)
  }

  // ── Resend verification email ──
  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: regEmail,
      options: { emailRedirectTo: `${window.location.origin}/verify` },
    })

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('rate limit') || msg.includes('too many')) {
        toast.error('Still rate limited. Please wait a minute before trying again.', { duration: 5000 })
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success('Verification email resent! Check your inbox.')
      // Reset the 5-min link expiry countdown
      clearInterval(expiryRef.current)
      setLinkExpiry(LINK_EXPIRY)
      setLinkExpired(false)
      expiryRef.current = setInterval(() => {
        setLinkExpiry(prev => {
          if (prev <= 1) { clearInterval(expiryRef.current); setLinkExpired(true); return 0 }
          return prev - 1
        })
      }, 1000)
    }

    startCooldown()
    setResending(false)
  }

  // Format seconds → mm:ss
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div className="bg-mesh"/><div className="bg-lines"/>
      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:480 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:30 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:12, textDecoration:'none' }}>
            <div style={{ width:42, height:42, borderRadius:10, background:'linear-gradient(135deg,var(--cyan),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue', fontSize:17, color:'white' }}>AA</div>
            <span style={{ fontFamily:'Bebas Neue', fontSize:21, letterSpacing:2 }}>Aesthetic Athletes</span>
          </Link>
        </div>

        <div className="card afu" style={{ position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--cyan),var(--blue))', borderRadius:'16px 16px 0 0' }} />

          {!done ? (
            <>
              {/* Step indicators */}
              <div style={{ display:'flex', alignItems:'center', marginBottom:28 }}>
                {['Credentials', 'Personal Info', 'Verify Email'].map((s, i) => (
                  <div key={s} style={{ display:'flex', alignItems:'center', flex:i < 2 ? 1 : 'none' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background:i<step?'linear-gradient(135deg,var(--cyan),var(--blue))':i===step?'rgba(0,180,216,.18)':'rgba(255,255,255,.06)', border:`2px solid ${i<=step?'var(--cyan)':'rgba(255,255,255,.1)'}`, color:i<=step?'white':'rgba(255,255,255,.3)' }}>
                        {i < step ? <CheckCircle size={13}/> : i + 1}
                      </div>
                      <span style={{ fontSize:9, color:i===step?'var(--cyan)':'rgba(255,255,255,.3)', fontWeight:700, letterSpacing:.5, whiteSpace:'nowrap', textTransform:'uppercase' }}>{s}</span>
                    </div>
                    {i < 2 && <div style={{ flex:1, height:2, background:i<step?'var(--cyan)':'rgba(255,255,255,.08)', margin:'0 6px', marginBottom:18, transition:'background .3s' }} />}
                  </div>
                ))}
              </div>

              {/* Step 0 — Credentials */}
              {step === 0 && (
                <div>
                  <h1 style={{ fontSize:32, letterSpacing:2, marginBottom:4 }}>Create Account</h1>
                  <p style={{ color:'rgba(255,255,255,.46)', fontSize:14, marginBottom:24 }}>Start with your login credentials</p>
                  <div className="fgroup">
                    <label className="flabel">Email Address</label>
                    <input className={`finput${errors.email?' err':''}`} type="email" placeholder="you@example.com"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                    {errors.email && <p className="ferr">{errors.email}</p>}
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Password</label>
                    <div style={{ position:'relative' }}>
                      <input className={`finput${errors.password?' err':''}`} type={showPw?'text':'password'} placeholder="Min. 8 characters"
                        value={form.password} onChange={e => set('password', e.target.value)} style={{ paddingRight:44 }} />
                      <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,.35)' }}>
                        {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                    {form.password && (
                      <div style={{ marginTop:8 }}>
                        <div style={{ display:'flex', gap:4 }}>
                          {[1,2,3,4].map(n => <div key={n} style={{ flex:1, height:3, borderRadius:2, background:n<=sc?scColor:'rgba(255,255,255,.1)', transition:'background .3s' }} />)}
                        </div>
                        <p style={{ fontSize:11, color:scColor, marginTop:4, fontWeight:600 }}>{scLabel}</p>
                      </div>
                    )}
                    {errors.password && <p className="ferr">{errors.password}</p>}
                  </div>
                  <div className="fgroup">
                    <label className="flabel">Confirm Password</label>
                    <input className={`finput${errors.confirm?' err':''}`} type="password" placeholder="Re-enter password"
                      value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                    {errors.confirm && <p className="ferr">{errors.confirm}</p>}
                  </div>
                  <button className="btn btn-primary btn-full" style={{ padding:14, fontSize:15, marginTop:6 }}
                    onClick={() => validateStep0() && setStep(1)}>
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 1 — Personal details */}
              {step === 1 && (
                <form onSubmit={handleRegister}>
                  <h1 style={{ fontSize:32, letterSpacing:2, marginBottom:4 }}>Your Details</h1>
                  <p style={{ color:'rgba(255,255,255,.46)', fontSize:14, marginBottom:24 }}>Tell us about yourself</p>
                  <div className="fgroup">
                    <label className="flabel">Full Name *</label>
                    <input className={`finput${errors.full_name?' err':''}`} type="text" placeholder="Alex Johnson"
                      value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                    {errors.full_name && <p className="ferr">{errors.full_name}</p>}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    <div className="fgroup">
                      <label className="flabel">Phone</label>
                      <input className="finput" type="tel" placeholder="+260 97 000 0000"
                        value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>
                    <div className="fgroup">
                      <label className="flabel">Sport</label>
                      <select className="finput" value={form.sport} onChange={e => set('sport', e.target.value)}>
                        <option value="">Select…</option>
                        {['Running','Crossfit','Cycling','Swimming','Football','Basketball','Weightlifting','Tennis','General Fitness'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:12, marginTop:8 }}>
                    <button type="button" className="btn btn-outline" style={{ flex:1, padding:14 }} onClick={() => setStep(0)}>← Back</button>
                    <button type="submit" className="btn btn-primary" style={{ flex:2, padding:14, fontSize:15 }} disabled={loading}>
                      {loading ? 'Creating Account…' : <><UserPlus size={16}/>Create Account</>}
                    </button>
                  </div>
                </form>
              )}

              <p style={{ textAlign:'center', fontSize:14, color:'rgba(255,255,255,.44)', marginTop:22 }}>
                Already have an account? <Link to="/login" style={{ color:'var(--cyan)', fontWeight:700 }}>Sign In</Link>
              </p>
            </>

          ) : (
            /* ── Step 2 — Verify email screen ── */
            <div style={{ textAlign:'center', padding:'4px 0' }}>
              <div style={{ width:70, height:70, borderRadius:'50%', background:'rgba(0,180,216,.1)', border:'2px solid rgba(0,180,216,.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <Mail size={32} color="var(--cyan)" />
              </div>

              <h1 style={{ fontSize:30, letterSpacing:2, marginBottom:8 }}>Check Your Email</h1>
              <p style={{ color:'rgba(255,255,255,.52)', fontSize:14, marginBottom:4 }}>We sent a verification link to:</p>
              <p style={{ color:'var(--cyan)', fontWeight:700, fontSize:16, marginBottom:20 }}>{regEmail}</p>

              {/* 5-minute link expiry countdown */}
              <div style={{ background: linkExpired ? 'rgba(239,68,68,.08)' : 'rgba(0,180,216,.07)', border:`1px solid ${linkExpired?'rgba(239,68,68,.25)':'rgba(0,180,216,.2)'}`, borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <Clock size={15} color={linkExpired ? 'var(--danger)' : 'var(--cyan)'} />
                {linkExpired ? (
                  <span style={{ fontSize:13, color:'var(--danger)', fontWeight:600 }}>
                    Link expired — please request a new one below
                  </span>
                ) : (
                  <span style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>
                    Link valid for <strong style={{ color:'var(--cyan)', fontFamily:'Space Mono', fontSize:14 }}>{fmt(linkExpiry)}</strong>
                  </span>
                )}
              </div>

              {/* Steps */}
              <div style={{ background:'rgba(0,180,216,.05)', border:'1px solid rgba(0,180,216,.12)', borderRadius:12, padding:16, textAlign:'left', marginBottom:22 }}>
                {['Open your email app', 'Find the email from Aesthetic Athletes', 'Click "Confirm your email" — valid for 5 min', 'You\'ll be redirected back here automatically'].map((s, i) => (
                  <div key={s} style={{ display:'flex', alignItems:'center', gap:11, marginBottom:i < 3 ? 10 : 0 }}>
                    <div style={{ width:21, height:21, borderRadius:'50%', background:'rgba(0,180,216,.18)', border:'1px solid rgba(0,180,216,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'var(--cyan)', flexShrink:0 }}>{i + 1}</div>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,.62)' }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* Resend button with cooldown */}
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="btn btn-outline btn-full"
                style={{ marginBottom:12, opacity: cooldown > 0 ? 0.6 : 1 }}
              >
                {resending ? (
                  <><div className="spin spin-sm"/>Sending…</>
                ) : cooldown > 0 ? (
                  <><Clock size={14}/>Resend in {cooldown}s</>
                ) : (
                  <><RefreshCw size={14}/>Resend Verification Email</>
                )}
              </button>

              <Link to="/login" className="btn btn-primary btn-full">Go to Sign In</Link>

              <p style={{ fontSize:11, color:'rgba(255,255,255,.25)', marginTop:16, lineHeight:1.6 }}>
                Didn't receive it? Check your spam folder.<br/>
                Supabase free tier allows 2 emails/hour — the resend button unlocks after {RESEND_COOLDOWN}s.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
