import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ShoppingBag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { user, profile } = useAuth()
  const { cart, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [form, setForm] = useState({ address:'', city:'', phone: profile?.phone||'', notes:'' })

  if (cart.length === 0 && !done) return (
    <div className="page"><div className="bg-mesh"/><div className="bg-lines"/>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh' }}>
        <div className="card" style={{ textAlign:'center',maxWidth:380,position:'relative',zIndex:1 }}>
          <ShoppingBag size={44} style={{ margin:'0 auto 14px',color:'rgba(255,255,255,.28)' }}/>
          <h2 style={{ fontSize:28,marginBottom:10 }}>Cart is Empty</h2>
          <p style={{ color:'rgba(255,255,255,.46)',marginBottom:22 }}>Add some items before checking out.</p>
          <button className="btn btn-primary btn-full" onClick={()=>navigate('/home')}>Browse Products</button>
        </div>
      </div>
    </div>
  )

  const submit = async (e) => {
    e.preventDefault()
    if (!form.address.trim() || !form.city.trim()) return toast.error('Please enter delivery address')
    setLoading(true)
    try {
      const { data: order, error: oErr } = await supabase.from('orders')
        .insert({ user_id:user.id, status:'pending', total, delivery_address:form.address, city:form.city, notes:form.notes })
        .select().single()
      if (oErr) throw oErr
      const items = cart.map(i => ({ order_id:order.id, product_id:i.id, quantity:i.qty, unit_price:i.price }))
      const { error: iErr } = await supabase.from('order_items').insert(items)
      if (iErr) throw iErr
      setOrderId(order.id); clearCart(); setDone(true)
    } catch (err) { toast.error(err.message || 'Failed to place order') }
    setLoading(false)
  }

  if (done) return (
    <div className="page"><div className="bg-mesh"/><div className="bg-lines"/>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:24 }}>
        <div className="card afu" style={{ textAlign:'center',maxWidth:460,position:'relative',zIndex:1 }}>
          <div style={{ width:78,height:78,borderRadius:'50%',background:'rgba(16,185,129,.1)',border:'2px solid rgba(16,185,129,.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 22px' }}>
            <CheckCircle size={38} color="var(--success)"/>
          </div>
          <h1 style={{ fontSize:40,letterSpacing:2,marginBottom:10 }}>Order Placed!</h1>
          <p style={{ color:'rgba(255,255,255,.55)',fontSize:15,marginBottom:8 }}>Your order has been received and is being processed.</p>
          <p style={{ color:'var(--cyan)',fontFamily:'Space Mono',fontSize:12,marginBottom:26 }}>Order #{orderId?.slice(0,8).toUpperCase()}</p>
          <div style={{ display:'flex',gap:12 }}>
            <button className="btn btn-outline" style={{ flex:1 }} onClick={()=>navigate('/orders')}>View Orders</button>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={()=>navigate('/home')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page"><div className="bg-mesh"/><div className="bg-lines"/>
      <div className="wrap" style={{ position:'relative',zIndex:1,padding:'36px 24px' }}>
        <h1 style={{ fontSize:46,letterSpacing:2,marginBottom:28 }}>CHECKOUT</h1>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 370px',gap:28,alignItems:'start' }}>

          {/* Form */}
          <div className="card">
            <h2 style={{ fontSize:24,letterSpacing:2,marginBottom:22 }}>Delivery Details</h2>
            <form onSubmit={submit}>
              <div className="fgroup">
                <label className="flabel">Street Address *</label>
                <input className="finput" placeholder="123 Cairo Road" value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} />
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                <div className="fgroup">
                  <label className="flabel">City *</label>
                  <input className="finput" placeholder="Lusaka" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} />
                </div>
                <div className="fgroup">
                  <label className="flabel">Phone</label>
                  <input className="finput" placeholder="+260 97…" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} />
                </div>
              </div>
              <div className="fgroup">
                <label className="flabel">Order Notes</label>
                <textarea className="finput" placeholder="Any special instructions…" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ padding:14,fontSize:15,marginTop:6 }} disabled={loading}>
                {loading ? 'Placing Order…' : `Place Order · K${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="card" style={{ position:'sticky',top:80 }}>
            <h2 style={{ fontSize:22,letterSpacing:2,marginBottom:18 }}>Order Summary</h2>
            <div style={{ display:'flex',flexDirection:'column',gap:13,marginBottom:18 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display:'flex',gap:12,alignItems:'center' }}>
                  <img src={item.image_url} alt={item.name} style={{ width:46,height:46,borderRadius:7,objectFit:'cover',flexShrink:0 }}
                    onError={e=>e.target.src='https://placehold.co/46x46/1a2a6c/00b4d8?text=AA'}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize:12,color:'rgba(255,255,255,.4)' }}>Qty: {item.qty}</p>
                  </div>
                  <span style={{ fontSize:13,fontWeight:700,color:'var(--cyan)' }}>K{(item.price*item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:14 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:7 }}>
                <span style={{ color:'rgba(255,255,255,.46)',fontSize:14 }}>Subtotal</span>
                <span style={{ fontSize:14 }}>K{total.toFixed(2)}</span>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:14 }}>
                <span style={{ color:'rgba(255,255,255,.46)',fontSize:14 }}>Delivery</span>
                <span style={{ fontSize:14,color:'var(--success)' }}>Free</span>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between' }}>
                <span style={{ fontWeight:700,fontSize:15 }}>Total</span>
                <span style={{ fontFamily:'Bebas Neue',fontSize:28,color:'var(--cyan)',letterSpacing:1 }}>K{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
