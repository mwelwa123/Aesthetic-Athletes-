import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, LockKeyhole, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'
import loginAthletes from '../assets/login-athletes.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e); return !Object.keys(e).length
  }

  const submit = async (ev) => {
    ev.preventDefault(); if (!validate()) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) {
      if (error.message.includes('Email not confirmed')) toast.error('Please verify your email first.')
      else toast.error(error.message)
    } else { toast.success('Welcome back! 👊'); navigate('/home') }
    setLoading(false)
  }

  return (
    <div className="login-page" style={{ backgroundImage:`linear-gradient(rgba(239,249,255,.10), rgba(239,249,255,.10)), url(${loginAthletes})` }}>
      <div className="login-shell">
        <div className="login-brand">
          <Link to="/" aria-label="Aesthetic Athletes home"><img src={logo} alt="Aesthetic Athletes" /></Link>
        </div>
        <div className="login-card card afu">
          <h1>Welcome Back, Athlete</h1>
          <p className="login-intro">Sign in to access your orders, profile and the latest collections.</p>

          <form onSubmit={submit}>
            <div className="fgroup">
              <label className="flabel">Email Address</label>
              <div className="login-input-wrap">
                <Mail size={19} aria-hidden="true" />
                <input className={`finput${errors.email?' err':''}`} type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({...p,email:e.target.value}))} />
              </div>
              {errors.email && <p className="ferr">{errors.email}</p>}
            </div>
            <div className="fgroup">
              <label className="flabel">Password</label>
              <div className="login-input-wrap login-password-wrap">
                <LockKeyhole size={19} aria-hidden="true" />
                <input className={`finput${errors.password?' err':''}`} type={showPw?'text':'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({...p,password:e.target.value}))} />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              {errors.password && <p className="ferr">{errors.password}</p>}
            </div>
            <div className="login-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-full login-submit" disabled={loading}>
              {loading ? <><div className="spin spin-sm"/>&nbsp;Signing in…</> : <><LogIn size={19}/>Sign In</>}
            </button>
          </form>

          <p className="login-register">
            Don't have an account? <Link to="/register" style={{ color:'var(--cyan)',fontWeight:700 }}>Create one free</Link>
          </p>
        </div>
      </div>
      <p className="login-tagline" aria-hidden="true">Fast<br/>Fierce<br/>Fearless</p>
    </div>
  )
}
