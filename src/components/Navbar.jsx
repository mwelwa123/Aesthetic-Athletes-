import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, LogOut, LayoutDashboard, ClipboardList, Menu, X, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'
import logo from '../assets/logo.png'
export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { count } = useCart()
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = profile?.role === 'admin'

  const nl = (to) => ({ textDecoration:'none', fontSize:14, fontWeight:500, color: pathname === to ? 'var(--cyan)' : 'var(--gray)', transition:'color .2s', padding:'8px 14px' })

  return (
    <>
      <nav className="main-nav" style={{ position:'fixed',top:0,left:0,right:0,zIndex:200,height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(255,255,255,.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(15,23,42,.08)',boxShadow:'0 4px 20px rgba(15,23,42,.05)' }}>

        <Link
  to={user ? '/home' : '/'}
  className="nav-brand"
  style={{
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none'
  }}
>
 <img
  src={logo}
  alt="Aesthetic Athletes"
  style={{
    width: 200,
    height: 50,
    objectFit: 'contain',
    display: 'block',
    background: 'transparent'
  }}
/>
</Link>

        {/* Links */}
        <div className="nav-desktop-links" style={{ display:'flex',alignItems:'center',gap:4 }}>
          {user ? (
            <>
              <Link to="/home"   style={nl('/home')}>Shop</Link>
              <Link to="/orders" style={{ ...nl('/orders'), display:'flex', alignItems:'center', gap:6 }}><ClipboardList size={14} />My Orders</Link>
              {isAdmin && <Link to="/admin" style={{ ...nl('/admin'), display:'flex', alignItems:'center', gap:6 }}><LayoutDashboard size={14} />Admin</Link>}

              {/* Cart */}
              <button onClick={() => setCartOpen(true)} className="nav-cart-button" aria-label="Open cart" style={{ position:'relative',background:'rgba(0,180,216,.1)',border:'1px solid rgba(0,180,216,.25)',borderRadius:8,padding:'8px 13px',color:'var(--cyan)',display:'flex',alignItems:'center',gap:6,fontSize:14,marginLeft:6 }}>
                <ShoppingCart size={16} />
                {count > 0 && <span style={{ position:'absolute',top:-6,right:-6,background:'linear-gradient(135deg,var(--cyan),var(--blue))',color:'white',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700 }}>{count}</span>}
              </button>

              {/* User */}
              <div style={{ display:'flex',alignItems:'center',gap:8,marginLeft:10,paddingLeft:12,borderLeft:'1px solid rgba(255,255,255,.09)' }}>
                <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--cyan),var(--blue))',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700 }}>
                  {profile?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize:13,color:'var(--gray)',maxWidth:110,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{profile?.full_name || user.email}</span>
                <button onClick={() => { signOut(); navigate('/') }} title="Sign Out" style={{ background:'transparent',border:'none',color:'var(--gray)',display:'flex',padding:6,borderRadius:6,transition:'color .2s' }}><LogOut size={15} /></button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
            </>
          )}
        </div>

        {user && (
          <div className="nav-mobile-actions">
            <span className="nav-notification" aria-label="Notifications"><Bell size={18} /></span>
            <button onClick={() => setCartOpen(true)} className="nav-cart-button" aria-label="Open cart">
              <ShoppingCart size={18} />
              {count > 0 && <span className="nav-cart-count">{count}</span>}
            </button>
            <button onClick={() => setMenuOpen(open => !open)} className="nav-menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
              {menuOpen ? <X size={21}/> : <Menu size={22}/>}
            </button>
          </div>
        )}
      </nav>
      {user && menuOpen && (
        <div className="nav-mobile-menu">
          <div className="nav-mobile-profile">
            <div>{profile?.full_name?.[0]?.toUpperCase() || '?'}</div>
            <span>{profile?.full_name || user.email}</span>
          </div>
          <Link to="/home" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
          {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
          <button onClick={() => { setMenuOpen(false); signOut(); navigate('/') }}><LogOut size={16}/>Sign Out</button>
        </div>
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
