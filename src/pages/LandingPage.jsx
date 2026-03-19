import { Link } from 'react-router-dom'
import { ArrowRight, Zap, BarChart2, Trophy, Users, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{ minHeight:'100vh',overflowX:'hidden' }}>
      <div className="bg-mesh" /><div className="bg-lines" />

      {/* Runner silhouette */}
      <svg style={{ position:'fixed',right:-40,bottom:0,width:'48vw',maxWidth:580,opacity:.055,zIndex:0,pointerEvents:'none' }} viewBox="0 0 400 500" fill="none">
        <ellipse cx="218" cy="44" rx="28" ry="28" fill="white"/>
        <path d="M178 80C173 112 176 152 184 182L208 176L224 186L246 178L253 146C261 114 258 88 247 72 235 56 198 60 178 80Z" fill="white"/>
        <path d="M184 182C168 218 156 252 150 280 147 296 154 308 168 308 180 308 188 299 191 286L207 248L224 280 228 310C230 324 242 332 256 328 270 324 274 310 272 296L254 248 246 178Z" fill="white"/>
        <path d="M150 280C133 298 117 320 108 338 104 351 108 364 122 366 132 368 142 359 146 347L164 317Z" fill="white"/>
        <path d="M272 296C288 318 298 340 303 356 306 368 299 378 286 378 276 378 268 370 265 358L252 326Z" fill="white"/>
        <path d="M178 132C165 121 149 117 137 127 127 137 130 152 141 159 152 165 166 162 176 153Z" fill="white"/>
      </svg>

      {/* Nav */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:200,height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',background:'rgba(6,13,46,.82)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.07)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:38,height:38,borderRadius:9,background:'linear-gradient(135deg,var(--cyan),var(--blue))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Bebas Neue',fontSize:16,color:'white' }}>AA</div>
          <div style={{ lineHeight:1 }}>
            <div style={{ fontFamily:'Bebas Neue',fontSize:18,letterSpacing:2 }}>Aesthetic Athletes</div>
            <div style={{ fontSize:9,letterSpacing:3,color:'var(--cyan)',fontWeight:600,textTransform:'uppercase' }}>Fast · Fierce · Fearless</div>
          </div>
        </div>
        <div style={{ display:'flex',gap:10 }}>
          <Link to="/login"    className="btn btn-outline btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position:'relative',zIndex:1,minHeight:'100vh',display:'flex',alignItems:'center',padding:'80px 48px 60px' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center',width:'100%' }}>
          <div className="afu">
            <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:100,border:'1px solid rgba(0,180,216,.4)',background:'rgba(0,180,216,.08)',fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'var(--cyan)',marginBottom:28 }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--cyan)',animation:'blink 1.4s infinite' }} />
              New Collection 2026
            </div>
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
            <h1 style={{ fontSize:'clamp(60px,7.5vw,96px)',lineHeight:.94,marginBottom:22 }}>
              TRAIN<br/>LIKE A<br/>
              <span style={{ background:'linear-gradient(90deg,var(--cyan),var(--cyan-l))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>CHAMPION</span>
            </h1>
            <p style={{ fontSize:17,lineHeight:1.7,color:'rgba(255,255,255,.58)',maxWidth:440,marginBottom:36,fontWeight:300 }}>
              Premium sports equipment and athletic gear for champions. Quality products designed to help you achieve your goals.
            </p>
            <div style={{ display:'flex',gap:14,flexWrap:'wrap' }}>
              <Link to="/register" className="btn btn-primary" style={{ fontSize:15,padding:'13px 30px' }}>Start Your Journey <ArrowRight size={16} /></Link>
              <Link to="/login"    className="btn btn-outline" style={{ fontSize:15,padding:'13px 26px' }}>Sign In</Link>
            </div>
            <div style={{ display:'flex',gap:40,marginTop:48,paddingTop:32,borderTop:'1px solid rgba(255,255,255,.08)' }}>
              {[['12K+','Athletes'],['340+','Products'],['98%','Satisfied']].map(([n,l]) => (
                <div key={l}>
                  <div style={{ fontFamily:'Bebas Neue',fontSize:34,color:'var(--cyan)',letterSpacing:1 }}>{n}</div>
                  <div style={{ fontSize:11,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,.38)',fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth card */}
          <div className="afu" style={{ animationDelay:'.12s' }}>
            <div className="card" style={{ position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--cyan),var(--blue),var(--cyan))',backgroundSize:'200%',animation:'shimmer 2.5s linear infinite' }} />
              <h2 style={{ fontSize:32,marginBottom:8,letterSpacing:2 }}>Join the Squad</h2>
              <p style={{ color:'rgba(255,255,255,.48)',fontSize:14,marginBottom:26 }}>Create your free account and start training.</p>
              {['Access exclusive products','Track your orders in real-time','Join 12,000+ athletes'].map(f => (
                <div key={f} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
                  <CheckCircle size={15} color="var(--cyan)" />
                  <span style={{ fontSize:14,color:'rgba(255,255,255,.68)' }}>{f}</span>
                </div>
              ))}
              <div style={{ display:'flex',flexDirection:'column',gap:12,marginTop:28 }}>
                <Link to="/register" className="btn btn-primary btn-full" style={{ fontSize:15,padding:14 }}>Create Free Account</Link>
                <Link to="/login"    className="btn btn-outline btn-full" style={{ fontSize:15,padding:14 }}>Already have an account?</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ position:'relative',zIndex:1,padding:'60px 48px' }}>
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <h2 style={{ textAlign:'center',fontSize:46,marginBottom:10,letterSpacing:2 }}>WHY AESTHETIC ATHLETES?</h2>
          <p style={{ textAlign:'center',color:'rgba(255,255,255,.45)',marginBottom:44,fontSize:16 }}>Everything you need to dominate your sport</p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20 }}>
            {[
              { icon:<Zap size={22} color="var(--cyan)"/>,       title:'Elite Gear',       desc:'Pro-grade equipment used by champions worldwide' },
              { icon:<BarChart2 size={22} color="var(--cyan)"/>, title:'Track Orders',     desc:'Real-time order tracking from purchase to delivery' },
              { icon:<Trophy size={22} color="var(--cyan)"/>,    title:'Top Selection',    desc:'Curated catalog of the best athletic products' },
              { icon:<Users size={22} color="var(--cyan)"/>,     title:'Community',        desc:'Join 12K+ athletes pushing limits every day' },
            ].map(f => (
              <div key={f.title} className="card" style={{ textAlign:'center' }}>
                <div style={{ width:50,height:50,borderRadius:12,background:'rgba(0,180,216,.1)',border:'1px solid rgba(0,180,216,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>{f.icon}</div>
                <h3 style={{ fontSize:21,marginBottom:8,letterSpacing:1.5 }}>{f.title}</h3>
                <p style={{ fontSize:14,color:'rgba(255,255,255,.46)',lineHeight:1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position:'relative',zIndex:1,padding:'70px 48px',background:'linear-gradient(135deg,rgba(0,180,216,.07),rgba(21,101,192,.11))',borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div style={{ textAlign:'center' }}>
          <h2 style={{ fontSize:54,marginBottom:14,letterSpacing:2 }}>READY TO ELEVATE?</h2>
          <p style={{ color:'rgba(255,255,255,.5)',fontSize:16,maxWidth:460,margin:'0 auto 34px' }}>Join thousands of athletes who trust Aesthetic Athletes.</p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize:16,padding:'15px 40px' }}>Start Your Journey <ArrowRight size={17} /></Link>
        </div>
      </section>
    </div>
  )
}
