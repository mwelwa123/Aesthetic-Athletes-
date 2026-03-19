import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

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
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div className="bg-mesh" /><div className="bg-lines" />
      <div style={{ position:'relative',zIndex:1,width:'100%',maxWidth:440 }}>
        <div style={{ textAlign:'center',marginBottom:32 }}>
          <Link to="/" style={{ display:'inline-flex',alignItems:'center',gap:12,textDecoration:'none' }}>
            <div style={{ width:42,height:42,borderRadius:10,background:'linear-gradient(135deg,var(--cyan),var(--blue))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Bebas Neue',fontSize:17,color:'white' }}>AA</div>
            <span style={{ fontFamily:'Bebas Neue',fontSize:21,letterSpacing:2 }}>Aesthetic Athletes</span>
          </Link>
        </div>
        <div className="card afu" style={{ position:'relative' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--cyan),var(--blue))',borderRadius:'16px 16px 0 0' }} />
          <h1 style={{ fontSize:34,letterSpacing:2,marginBottom:6 }}>Welcome Back</h1>
          <p style={{ color:'rgba(255,255,255,.46)',fontSize:14,marginBottom:26 }}>Sign in to your account to continue</p>

          <form onSubmit={submit}>
            <div className="fgroup">
              <label className="flabel">Email Address</label>
              <input className={`finput${errors.email?' err':''}`} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({...p,email:e.target.value}))} />
              {errors.email && <p className="ferr">{errors.email}</p>}
            </div>
            <div className="fgroup">
              <label className="flabel">Password</label>
              <div style={{ position:'relative' }}>
                <input className={`finput${errors.password?' err':''}`} type={showPw?'text':'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({...p,password:e.target.value}))} style={{ paddingRight:44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,.35)' }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="ferr">{errors.password}</p>}
            </div>
            <div style={{ textAlign:'right',marginBottom:22 }}>
              <Link to="/forgot-password" style={{ fontSize:13,color:'var(--cyan)' }}>Forgot password?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding:14,fontSize:15 }}>
              {loading ? <><div className="spin spin-sm"/>&nbsp;Signing in…</> : <><LogIn size={16}/>Sign In</>}
            </button>
          </form>

          <div className="divider">or</div>
          <p style={{ textAlign:'center',fontSize:14,color:'rgba(255,255,255,.46)' }}>
            Don't have an account? <Link to="/register" style={{ color:'var(--cyan)',fontWeight:700 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
