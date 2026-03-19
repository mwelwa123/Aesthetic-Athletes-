import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader, RefreshCw, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const RESEND_COOLDOWN = 60

export default function VerifyPage() {
  const navigate = useNavigate()
  const [status, setStatus]   = useState('loading') // loading | success | error
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const [email, setEmail]     = useState('')

  useEffect(() => {
    handleVerification()
  }, [])

  async function handleVerification() {
    // Supabase puts tokens in the URL hash after the user clicks the email link
    // e.g. /verify#access_token=xxx&refresh_token=yyy&type=signup
    const hash = window.location.hash

    if (hash && hash.includes('access_token')) {
      const params       = new URLSearchParams(hash.substring(1))
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (error) {
          setStatus('error'); return
        }
        if (data.session) {
          // Clean up the URL
          window.history.replaceState(null, '', window.location.pathname)
          setStatus('success')
          setTimeout(() => navigate('/home'), 2500)
          return
        }
      }
    }

    // Fallback: already have a session (same browser)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setStatus('success')
      setTimeout(() => navigate('/home'), 2500)
      return
    }

    // Listen for auth state change (Supabase JS auto-handles hash in some versions)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        window.history.replaceState(null, '', window.location.pathname)
        setStatus('success')
        setTimeout(() => navigate('/home'), 2500)
        subscription.unsubscribe()
      }
    })

    // If nothing after 7s, show error
    setTimeout(() => {
      setStatus(prev => {
        if (prev === 'loading') return 'error'
        return prev
      })
      subscription.unsubscribe()
    }, 7000)
  }

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN)
    const t = setInterval(() => {
      setCooldown(prev => { if (prev <= 1) { clearInterval(t); return 0 } return prev - 1 })
    }, 1000)
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email address below to resend')
      return
    }
    if (cooldown > 0 || resending) return
    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/verify` }
    })
    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('rate limit') || msg.includes('too many')) {
        toast.error('Email rate limit hit. Please wait a minute and try again.', { duration: 5000 })
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success('Verification email resent! Check your inbox.')
      setStatus('loading')
      setTimeout(() => setStatus(prev => prev === 'loading' ? 'error' : prev), 7000)
    }
    startCooldown()
    setResending(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div className="bg-mesh"/><div className="bg-lines"/>
      <div className="card afu" style={{ maxWidth:440, width:'100%', textAlign:'center', position:'relative', zIndex:1 }}>

        {/* ── LOADING ── */}
        {status === 'loading' && (
          <>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(0,180,216,.1)', border:'2px solid rgba(0,180,216,.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px' }}>
              <Loader size={34} color="var(--cyan)" style={{ animation:'spinning 1s linear infinite' }}/>
            </div>
            <h2 style={{ fontSize:30, letterSpacing:2, marginBottom:10 }}>Verifying Email</h2>
            <p style={{ color:'rgba(255,255,255,.46)', fontSize:14 }}>Hang tight, confirming your account…</p>
          </>
        )}

        {/* ── SUCCESS ── */}
        {status === 'success' && (
          <>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(16,185,129,.1)', border:'2px solid rgba(16,185,129,.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px' }}>
              <CheckCircle size={36} color="var(--success)"/>
            </div>
            <h2 style={{ fontSize:32, letterSpacing:2, marginBottom:10 }}>Email Verified!</h2>
            <p style={{ color:'rgba(255,255,255,.55)', marginBottom:22 }}>Your account is confirmed. Taking you to the shop…</p>
            <Link to="/home" className="btn btn-primary btn-full">Go to Shop</Link>
          </>
        )}

        {/* ── ERROR / EXPIRED ── */}
        {status === 'error' && (
          <>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(239,68,68,.1)', border:'2px solid rgba(239,68,68,.28)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px' }}>
              <XCircle size={36} color="var(--danger)"/>
            </div>
            <h2 style={{ fontSize:32, letterSpacing:2, marginBottom:10 }}>Link Expired</h2>
            <p style={{ color:'rgba(255,255,255,.52)', fontSize:14, marginBottom:24 }}>
              This verification link has expired or already been used.<br/>
              Enter your email to get a new one.
            </p>

            {/* Email input + resend */}
            <div style={{ textAlign:'left', marginBottom:14 }}>
              <label className="flabel">Your Email Address</label>
              <input className="finput" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <button onClick={handleResend} disabled={cooldown > 0 || resending}
              className="btn btn-outline btn-full" style={{ marginBottom:12, opacity:cooldown>0?.6:1 }}>
              {resending
                ? <><div className="spin spin-sm"/>Sending…</>
                : cooldown > 0
                  ? <><Clock size={14}/>Resend in {cooldown}s</>
                  : <><RefreshCw size={14}/>Send New Verification Email</>
              }
            </button>

            <Link to="/login" className="btn btn-primary btn-full">Back to Sign In</Link>

            <p style={{ fontSize:11, color:'rgba(255,255,255,.24)', marginTop:16, lineHeight:1.6 }}>
              Supabase free tier: 2 emails/hour. If you hit the limit, wait 1 minute then resend.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
