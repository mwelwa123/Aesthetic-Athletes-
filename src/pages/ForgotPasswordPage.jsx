import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

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
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div className="bg-mesh"/><div className="bg-lines"/>
      <div style={{ position:'relative',zIndex:1,width:'100%',maxWidth:420 }}>
        <div style={{ textAlign:'center',marginBottom:30 }}>
          <Link to="/" style={{ display:'inline-flex',alignItems:'center',gap:12,textDecoration:'none' }}>
            <div style={{ width:42,height:42,borderRadius:10,background:'linear-gradient(135deg,var(--cyan),var(--blue))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Bebas Neue',fontSize:17,color:'white' }}>AA</div>
            <span style={{ fontFamily:'Bebas Neue',fontSize:21,letterSpacing:2 }}>Aesthetic Athletes</span>
          </Link>
        </div>
        <div className="card afu" style={{ position:'relative' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--cyan),var(--blue))',borderRadius:'16px 16px 0 0' }} />
          {!sent ? (
            <>
              <h1 style={{ fontSize:32,letterSpacing:2,marginBottom:6 }}>Reset Password</h1>
              <p style={{ color:'rgba(255,255,255,.46)',fontSize:14,marginBottom:24 }}>Enter your email and we'll send a reset link.</p>
              <form onSubmit={submit}>
                <div className="fgroup">
                  <label className="flabel">Email Address</label>
                  <input className="finput" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" style={{ padding:14,fontSize:15 }} disabled={loading}>
                  {loading?'Sending…':<><Mail size={16}/>Send Reset Link</>}
                </button>
              </form>
              <div style={{ marginTop:22,textAlign:'center' }}>
                <Link to="/login" style={{ color:'var(--cyan)',fontSize:14,display:'inline-flex',alignItems:'center',gap:6 }}><ArrowLeft size={13}/>Back to Sign In</Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:68,height:68,borderRadius:'50%',background:'rgba(16,185,129,.1)',border:'2px solid rgba(16,185,129,.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px' }}><CheckCircle size={34} color="var(--success)"/></div>
              <h2 style={{ fontSize:30,letterSpacing:2,marginBottom:10 }}>Check Your Email</h2>
              <p style={{ color:'rgba(255,255,255,.55)',marginBottom:6 }}>Reset link sent to:</p>
              <p style={{ color:'var(--cyan)',fontWeight:700,marginBottom:24 }}>{email}</p>
              <Link to="/login" className="btn btn-primary btn-full">Back to Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
