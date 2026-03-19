import { useState, useEffect } from 'react'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const STATUS = {
  pending:   { label:'Pending',   cls:'b-pending' },
  confirmed: { label:'Confirmed', cls:'b-confirmed' },
  shipped:   { label:'Shipped',   cls:'b-shipped' },
  delivered: { label:'Delivered', cls:'b-delivered' },
  cancelled: { label:'Cancelled', cls:'b-cancelled' },
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    supabase.from('orders')
      .select('*, order_items(*, products(name, image_url, price))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [])

  return (
    <div className="page"><div className="bg-mesh"/><div className="bg-lines"/>
      <div className="wrap" style={{ position:'relative',zIndex:1,padding:'36px 24px' }}>
        <h1 style={{ fontSize:46,letterSpacing:2,marginBottom:6 }}>MY ORDERS</h1>
        <p style={{ color:'rgba(255,255,255,.46)',marginBottom:28,fontSize:14 }}>{orders.length} orders placed</p>

        {loading ? (
          <div className="loading-center"><div className="spin"/></div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign:'center',padding:56 }}>
            <Package size={46} style={{ margin:'0 auto 14px',color:'rgba(255,255,255,.28)' }}/>
            <h2 style={{ fontSize:26,marginBottom:8 }}>No Orders Yet</h2>
            <p style={{ color:'rgba(255,255,255,.46)',marginBottom:22 }}>Start shopping to see your orders here.</p>
            <a href="/home" className="btn btn-primary">Browse Products</a>
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {orders.map(order => {
              const cfg = STATUS[order.status] || STATUS.pending
              const isOpen = expanded === order.id
              return (
                <div key={order.id} className="card" style={{ padding:0,overflow:'hidden' }}>
                  <button onClick={()=>setExpanded(isOpen?null:order.id)} style={{ width:'100%',background:'none',border:'none',cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',gap:16 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:24,flex:1,flexWrap:'wrap' }}>
                      <div>
                        <p style={{ fontSize:10,color:'rgba(255,255,255,.38)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:3 }}>Order ID</p>
                        <p style={{ fontFamily:'Space Mono',fontSize:13,color:'var(--cyan)' }}>#{order.id.slice(0,8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p style={{ fontSize:10,color:'rgba(255,255,255,.38)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:3 }}>Date</p>
                        <p style={{ fontSize:13 }}>{new Date(order.created_at).toLocaleDateString('en-ZM',{day:'numeric',month:'short',year:'numeric'})}</p>
                      </div>
                      <div>
                        <p style={{ fontSize:10,color:'rgba(255,255,255,.38)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:3 }}>Total</p>
                        <p style={{ fontFamily:'Bebas Neue',fontSize:22,color:'var(--cyan)',letterSpacing:1 }}>K{parseFloat(order.total).toFixed(2)}</p>
                      </div>
                      <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    {isOpen ? <ChevronUp size={17} color="rgba(255,255,255,.38)"/> : <ChevronDown size={17} color="rgba(255,255,255,.38)"/>}
                  </button>

                  {isOpen && (
                    <div style={{ borderTop:'1px solid rgba(255,255,255,.06)',padding:'18px 24px' }}>
                      <p style={{ fontSize:10,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,.38)',marginBottom:14 }}>Items</p>
                      <div style={{ display:'flex',flexDirection:'column',gap:11 }}>
                        {order.order_items?.map(item => (
                          <div key={item.id} style={{ display:'flex',gap:13,alignItems:'center' }}>
                            <img src={item.products?.image_url} alt="" style={{ width:50,height:50,borderRadius:8,objectFit:'cover' }}
                              onError={e=>e.target.src='https://placehold.co/50x50/1a2a6c/00b4d8?text=AA'}/>
                            <div style={{ flex:1 }}>
                              <p style={{ fontSize:13,fontWeight:600 }}>{item.products?.name}</p>
                              <p style={{ fontSize:12,color:'rgba(255,255,255,.4)' }}>Qty: {item.quantity} · K{parseFloat(item.unit_price).toFixed(2)} each</p>
                            </div>
                            <span style={{ fontWeight:700,color:'var(--cyan)',fontSize:13 }}>K{(item.quantity*item.unit_price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {order.delivery_address && (
                        <p style={{ fontSize:12,color:'rgba(255,255,255,.38)',marginTop:14,paddingTop:12,borderTop:'1px solid rgba(255,255,255,.06)' }}>
                          📍 {order.delivery_address}{order.city ? `, ${order.city}` : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
