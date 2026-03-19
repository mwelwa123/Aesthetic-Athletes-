import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pw, setPw]         = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady]   = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') setReady(true) })
    supabase.auth.getSession().then(({ data:{session} }) => { if (session) setReady(true) })
  }, [])

  const sc = (() => { let s=0; if(pw.length>=8)s++; if(/[A-Z]/.test(pw))s++; if(/[0-9]/.test(pw))s++; if(/[^A-Za-z0-9]/.test(pw))s++; return s })()
  const scColor = ['','#ef4444','#f59e0b','#00b4d8','#10b981'][sc]

  const submit = async (e) => {
    e.preventDefault()
    if (pw.length < 8)   return toast.error('Min. 8 characters')
    if (pw !== confirm)  return toast.error('Passwords do not match')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) toast.error(error.message)
    else { toast.success('Password updated!'); navigate('/login') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div className="bg-mesh"/><div className="bg-lines"/>
      <div style={{ position:'relative',zIndex:1,width:'100%',maxWidth:420 }}>
        <div className="card afu" style={{ position:'relative' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--cyan),var(--blue))',borderRadius:'16px 16px 0 0' }} />
          <div style={{ width:54,height:54,borderRadius:'50%',background:'rgba(0,180,216,.1)',border:'2px solid rgba(0,180,216,.3)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:18 }}><Lock size={25} color="var(--cyan)"/></div>
          <h1 style={{ fontSize:32,letterSpacing:2,marginBottom:6 }}>New Password</h1>
          <p style={{ color:'rgba(255,255,255,.46)',fontSize:14,marginBottom:24 }}>Choose a strong password for your account.</p>
          {!ready
            ? <div style={{ textAlign:'center',padding:'20px 0',color:'rgba(255,255,255,.4)' }}><div className="spin" style={{ margin:'0 auto 12px' }}/><p>Verifying link…</p></div>
            : <form onSubmit={submit}>
                <div className="fgroup">
                  <label className="flabel">New Password</label>
                  <div style={{ position:'relative' }}>
                    <input className="finput" type={showPw?'text':'password'} placeholder="Min. 8 characters" value={pw} onChange={e=>setPw(e.target.value)} style={{ paddingRight:44 }} />
                    <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,.35)' }}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                  </div>
                  {pw && <div style={{ marginTop:8 }}><div style={{ display:'flex',gap:4 }}>{[1,2,3,4].map(n=><div key={n} style={{ flex:1,height:3,borderRadius:2,background:n<=sc?scColor:'rgba(255,255,255,.1)',transition:'background .3s' }} />)}</div></div>}
                </div>
                <div className="fgroup">
                  <label className="flabel">Confirm Password</label>
                  <input className="finput" type="password" placeholder="Re-enter password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" style={{ padding:14,fontSize:15,marginTop:6 }} disabled={loading}>{loading?'Updating…':'Update Password'}</button>
              </form>
          }
        </div>
      </div>
    </div>
  )
}
