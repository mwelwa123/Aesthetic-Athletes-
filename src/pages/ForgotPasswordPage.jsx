import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'
import loginAthletes from '../assets/login-athletes.png'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]   = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo:`${window.location.origin}/reset-password` })
    if (error) toast.error(error.message); else setSent(true)
    setLoading(false)
  }

  return (
    <div className="login-page reset-request-page" style={{ backgroundImage:`linear-gradient(rgba(239,249,255,.10), rgba(239,249,255,.10)), url(${loginAthletes})` }}>
      <div className="login-shell">
        <div className="login-brand">
          <Link to="/" aria-label="Aesthetic Athletes home"><img src={logo} alt="Aesthetic Athletes" /></Link>
        </div>
        <div className="login-card card afu">
          {!sent ? (
            <>
              <h1>Reset Password</h1>
              <p className="login-intro">Enter your email address and we'll send you a link to reset your password.</p>
              <form onSubmit={submit}>
                <div className="fgroup">
                  <label className="flabel">Email Address</label>
                  <div className="login-input-wrap">
                    <Mail size={19} aria-hidden="true" />
                    <input className="finput" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full login-submit" disabled={loading}>
                  {loading?'Sending…':<><Mail size={19}/>Send Reset Link</>}
                </button>
              </form>
              <p className="login-register">Remember your password? <Link to="/login" style={{ color:'var(--cyan)',fontWeight:700 }}>Sign In</Link></p>
            </>
          ) : (
            <div className="reset-success">
              <div className="reset-success-icon"><CheckCircle size={34} color="var(--success)"/></div>
              <h2>Check Your Email</h2>
              <p>Reset link sent to:</p>
              <p className="reset-success-email">{email}</p>
              <Link to="/login" className="btn btn-primary btn-full">Back to Sign In</Link>
            </div>
          )}
        </div>
      </div>
      <p className="login-tagline" aria-hidden="true">Fast<br/>Fierce<br/>Fearless</p>
    </div>
  )
}
