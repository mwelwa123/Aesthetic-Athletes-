import { useNavigate } from 'react-router-dom'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartDrawer({ open, onClose }) {
  const { cart, updateQty, removeFromCart, total } = useCart()
  const navigate = useNavigate()
  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.65)',backdropFilter:'blur(4px)',zIndex:300,animation:'fadeIn .2s ease' }} />
      <div style={{ position:'fixed',top:0,right:0,bottom:0,width:400,background:'#0a1535',borderLeft:'1px solid rgba(255,255,255,.09)',zIndex:301,display:'flex',flexDirection:'column',animation:'slideInR .3s ease' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <ShoppingBag size={20} color="var(--cyan)" />
            <h3 style={{ fontFamily:'Bebas Neue',fontSize:24,letterSpacing:2 }}>Your Cart</h3>
            {cart.length > 0 && <span style={{ background:'rgba(0,180,216,.15)',color:'var(--cyan)',borderRadius:100,padding:'2px 8px',fontSize:12,fontWeight:700 }}>{cart.length}</span>}
          </div>
          <button onClick={onClose} className="btn-ghost btn btn-sm" style={{ padding:8 }}><X size={17} /></button>
        </div>

        {/* Items */}
        <div style={{ flex:1,overflowY:'auto',padding:'16px 24px' }}>
          {cart.length === 0
            ? <div style={{ textAlign:'center',paddingTop:80,color:'rgba(255,255,255,.35)' }}>
                <ShoppingBag size={44} style={{ margin:'0 auto 14px',opacity:.3 }} />
                <p style={{ fontSize:16,fontWeight:600 }}>Cart is empty</p>
                <p style={{ fontSize:14,marginTop:6 }}>Add items to get started</p>
              </div>
            : <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display:'flex',gap:14,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:14 }}>
                    <img src={item.image_url} alt={item.name} style={{ width:62,height:62,objectFit:'cover',borderRadius:8,flexShrink:0 }}
                      onError={e => e.target.src='https://placehold.co/62x62/0d1b4b/00b4d8?text=AA'} />
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:14,fontWeight:600,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize:13,color:'var(--cyan)',fontWeight:700,marginBottom:10 }}>K{(item.price*item.qty).toFixed(2)}</p>
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        {[{icon:<Minus size={12}/>,fn:()=>updateQty(item.id,item.qty-1)},{icon:<Plus size={12}/>,fn:()=>updateQty(item.id,item.qty+1)}].map((b,idx) => (
                          <button key={idx} onClick={b.fn} style={{ width:26,height:26,borderRadius:6,background:'rgba(255,255,255,.08)',border:'none',color:'white',display:'flex',alignItems:'center',justifyContent:'center' }}>{b.icon}</button>
                        ))}
                        <span style={{ fontSize:14,fontWeight:600,minWidth:20,textAlign:'center' }}>{item.qty}</span>
                        <button onClick={() => removeFromCart(item.id)} style={{ marginLeft:'auto',background:'rgba(239,68,68,.1)',border:'none',borderRadius:6,padding:'5px 8px',color:'var(--danger)',display:'flex' }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding:'20px 24px',borderTop:'1px solid rgba(255,255,255,.08)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:14 }}>
              <span style={{ color:'rgba(255,255,255,.55)',fontSize:14 }}>Total</span>
              <span style={{ fontFamily:'Bebas Neue',fontSize:28,color:'var(--cyan)',letterSpacing:1 }}>K{total.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-full" onClick={() => { onClose(); navigate('/checkout') }}>Proceed to Checkout</button>
          </div>
        )}
      </div>
    </>
  )
}
