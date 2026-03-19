import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { count } = useCart()
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const [cartOpen, setCartOpen] = useState(false)
  const isAdmin = profile?.role === 'admin'

  const nl = (to) => ({ textDecoration:'none', fontSize:14, fontWeight:500, color: pathname === to ? 'var(--cyan)' : 'rgba(255,255,255,.58)', transition:'color .2s', padding:'8px 14px' })

  return (
    <>
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:200,height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(6,13,46,.88)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.07)' }}>

        {/* Logo */}
        <Link to={user ? '/home' : '/'} style={{ display:'flex',alignItems:'center',gap:12,textDecoration:'none' }}>
          <div style={{ width:38,height:38,borderRadius:9,background:'linear-gradient(135deg,var(--cyan),var(--blue))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Bebas Neue',fontSize:16,color:'white' }}>AA</div>
          <div style={{ lineHeight:1 }}>
            <div style={{ fontFamily:'Bebas Neue',fontSize:18,letterSpacing:2,color:'white' }}>Aesthetic Athletes</div>
            <div style={{ fontSize:9,letterSpacing:3,color:'var(--cyan)',fontWeight:600,textTransform:'uppercase' }}>Fast · Fierce · Fearless</div>
          </div>
        </Link>

        {/* Links */}
        <div style={{ display:'flex',alignItems:'center',gap:4 }}>
          {user ? (
            <>
              <Link to="/home"   style={nl('/home')}>Shop</Link>
              <Link to="/orders" style={{ ...nl('/orders'), display:'flex', alignItems:'center', gap:6 }}><ClipboardList size={14} />My Orders</Link>
              {isAdmin && <Link to="/admin" style={{ ...nl('/admin'), display:'flex', alignItems:'center', gap:6 }}><LayoutDashboard size={14} />Admin</Link>}

              {/* Cart */}
              <button onClick={() => setCartOpen(true)} style={{ position:'relative',background:'rgba(0,180,216,.1)',border:'1px solid rgba(0,180,216,.25)',borderRadius:8,padding:'8px 13px',color:'var(--cyan)',display:'flex',alignItems:'center',gap:6,fontSize:14,marginLeft:6 }}>
                <ShoppingCart size={16} />
                {count > 0 && <span style={{ position:'absolute',top:-6,right:-6,background:'linear-gradient(135deg,var(--cyan),var(--blue))',color:'white',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700 }}>{count}</span>}
              </button>

              {/* User */}
              <div style={{ display:'flex',alignItems:'center',gap:8,marginLeft:10,paddingLeft:12,borderLeft:'1px solid rgba(255,255,255,.09)' }}>
                <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--cyan),var(--blue))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700 }}>
                  {profile?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize:13,color:'rgba(255,255,255,.6)',maxWidth:110,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{profile?.full_name || user.email}</span>
                <button onClick={() => { signOut(); navigate('/') }} title="Sign Out" style={{ background:'transparent',border:'none',color:'rgba(255,255,255,.35)',display:'flex',padding:6,borderRadius:6,transition:'color .2s' }}><LogOut size={15} /></button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
            </>
          )}
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
