import { useState, useEffect, useRef } from 'react'
import { LayoutDashboard, Package, ShoppingBag, Plus, Edit2, Trash2, X, Check,
         TrendingUp, AlertCircle, Upload, Eye, EyeOff, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { supabase, uploadProductImage } from '../lib/supabase'
import toast from 'react-hot-toast'

const TABS = [
  { id:'overview', label:'Overview',  icon:LayoutDashboard },
  { id:'products', label:'Products',  icon:Package },
  { id:'orders',   label:'Orders',    icon:ShoppingBag },
]
const SFLOW = {
  pending:   { label:'Pending',   cls:'b-pending',   next:'confirmed', nl:'Confirm Order' },
  confirmed: { label:'Confirmed', cls:'b-confirmed', next:'shipped',   nl:'Mark Shipped' },
  shipped:   { label:'Shipped',   cls:'b-shipped',   next:'delivered', nl:'Mark Delivered' },
  delivered: { label:'Delivered', cls:'b-delivered', next:null },
  cancelled: { label:'Cancelled', cls:'b-cancelled', next:null },
}

export default function AdminDashboard() {
  const [tab, setTab]         = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [modal, setModal]     = useState(null)
  const [oFilter, setOFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadProducts(), loadOrders()])
    setLoading(false)
  }
  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at',{ascending:false})
    setProducts(data||[])
  }
  async function loadOrders() {
    const { data } = await supabase.from('orders')
      .select('*, profiles(full_name,email), order_items(*, products(name,price,image_url))')
      .order('created_at',{ascending:false})
    setOrders(data||[])
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success(`Marked as ${status}`); loadOrders() }
  }
  async function toggleActive(p) {
    await supabase.from('products').update({ active:!p.active }).eq('id',p.id)
    loadProducts()
  }
  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id',id)
    if (error) toast.error(error.message)
    else { toast.success('Deleted'); loadProducts() }
  }

  const filtered = oFilter==='all' ? orders : orders.filter(o=>o.status===oFilter)
  const revenue  = orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+parseFloat(o.total||0),0)
  const pending  = orders.filter(o=>o.status==='pending').length

  const stats = [
    { label:'Active Products', value:products.filter(p=>p.active).length, icon:Package,     color:'#00b4d8' },
    { label:'Total Orders',    value:orders.length,                        icon:ShoppingBag, color:'#818cf8' },
    { label:'Revenue',         value:`K${revenue.toFixed(2)}`,             icon:TrendingUp,  color:'#10b981' },
    { label:'Pending',         value:pending,                              icon:AlertCircle, color:'#f59e0b' },
  ]

  return (
    <div className="page"><div className="bg-mesh"/><div className="bg-lines"/>

      {/* Admin header */}
      <div style={{ background:'rgba(0,0,0,.28)',borderBottom:'1px solid rgba(255,255,255,.07)',padding:'22px 0',position:'relative',zIndex:1 }}>
        <div className="wrap" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14 }}>
          <div>
            <div style={{ fontSize:10,color:'var(--cyan)',fontWeight:700,letterSpacing:3,textTransform:'uppercase',marginBottom:4 }}>Admin Panel</div>
            <h1 style={{ fontSize:38,letterSpacing:2 }}>DASHBOARD</h1>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <button onClick={()=>{setBusy(true);loadAll().finally(()=>setBusy(false))}} className="btn btn-ghost btn-sm" disabled={busy}>
              <RefreshCw size={13} style={{ animation:busy?'spinning .8s linear infinite':'none' }}/>
              Refresh
            </button>
            <div style={{ display:'flex',gap:3,background:'rgba(0,0,0,.28)',padding:3,borderRadius:10 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:'flex',alignItems:'center',gap:7,padding:'8px 16px',border:'none',borderRadius:7,cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .2s',background:tab===t.id?'linear-gradient(135deg,var(--cyan),var(--blue))':'transparent',color:tab===t.id?'white':'rgba(255,255,255,.5)' }}>
                  <t.icon size={13}/>{t.label}
                  {t.id==='orders' && pending>0 && <span style={{ background:'#f59e0b',color:'white',borderRadius:100,padding:'1px 6px',fontSize:10,fontWeight:700 }}>{pending}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ position:'relative',zIndex:1,padding:'28px 24px' }}>

        {/* OVERVIEW */}
        {tab==='overview' && (
          <div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:18,marginBottom:28 }}>
              {stats.map(s => (
                <div key={s.label} className="card afu" style={{ display:'flex',alignItems:'center',gap:16 }}>
                  <div style={{ width:50,height:50,borderRadius:13,background:`${s.color}18`,border:`1px solid ${s.color}28`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><s.icon size={22} color={s.color}/></div>
                  <div>
                    <p style={{ fontSize:10,color:'rgba(255,255,255,.38)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:3 }}>{s.label}</p>
                    <p style={{ fontFamily:'Bebas Neue',fontSize:30,color:s.color,letterSpacing:1,lineHeight:1 }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {pending>0 && (
              <div style={{ background:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.22)',borderRadius:12,padding:'13px 18px',marginBottom:22,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
                <div style={{ display:'flex',alignItems:'center',gap:9 }}>
                  <AlertCircle size={17} color="#f59e0b"/>
                  <span style={{ fontSize:14,color:'rgba(255,255,255,.78)' }}><strong style={{ color:'#f59e0b' }}>{pending} order{pending>1?'s':''}</strong> waiting for confirmation</span>
                </div>
                <button onClick={()=>{setTab('orders');setOFilter('pending')}} style={{ background:'rgba(245,158,11,.14)',color:'#f59e0b',border:'1px solid rgba(245,158,11,.28)',borderRadius:7,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:700 }}>Review Now</button>
              </div>
            )}
            <div className="card" style={{ padding:0,overflow:'hidden' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                <h2 style={{ fontSize:24,letterSpacing:2 }}>Recent Orders</h2>
                <button className="btn btn-outline btn-sm" onClick={()=>setTab('orders')}>View All</button>
              </div>
              <OrdersTable orders={orders.slice(0,5)} onUpdate={updateStatus} expanded={expanded} setExpanded={setExpanded} admin/>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab==='products' && (
          <div>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,flexWrap:'wrap',gap:14 }}>
              <div>
                <h2 style={{ fontSize:34,letterSpacing:2 }}>CATALOG</h2>
                <p style={{ color:'rgba(255,255,255,.46)',fontSize:14 }}>{products.filter(p=>p.active).length} active · {products.filter(p=>!p.active).length} hidden</p>
              </div>
              <button className="btn btn-primary" onClick={()=>setModal('new')}><Plus size={15}/>Add Product</button>
            </div>
            {loading ? <div className="loading-center"><div className="spin"/></div> :
            products.length===0 ? (
              <div className="card" style={{ textAlign:'center',padding:56 }}>
                <Package size={40} style={{ margin:'0 auto 14px',color:'rgba(255,255,255,.28)' }}/>
                <p style={{ fontSize:16,fontWeight:600,marginBottom:8 }}>No products yet</p>
                <button className="btn btn-primary" onClick={()=>setModal('new')} style={{ marginTop:8 }}><Plus size={14}/>Add First Product</button>
              </div>
            ) : (
              <div className="card" style={{ padding:0,overflow:'hidden' }}>
                <div className="tbl-wrap">
                  <table>
                    <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} style={{ opacity:p.active?1:.54 }}>
                          <td>
                            <div style={{ display:'flex',alignItems:'center',gap:13 }}>
                              <img src={p.image_url} alt={p.name} style={{ width:46,height:46,borderRadius:8,objectFit:'cover',flexShrink:0,background:'rgba(0,0,0,.3)' }}
                                onError={e=>e.target.src='https://placehold.co/46/0d1b4b/00b4d8?text=AA'}/>
                              <div>
                                <p style={{ fontSize:14,fontWeight:600 }}>{p.name}</p>
                                <p style={{ fontSize:12,color:'rgba(255,255,255,.34)',maxWidth:190,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.description}</p>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontSize:12,color:'var(--cyan)',background:'rgba(0,180,216,.1)',padding:'3px 10px',borderRadius:100,fontWeight:600 }}>{p.category||'—'}</span></td>
                          <td><span style={{ fontFamily:'Bebas Neue',fontSize:20,color:'var(--cyan)',letterSpacing:1 }}>K{parseFloat(p.price).toFixed(2)}</span></td>
                          <td><span style={{ fontWeight:700,color:p.stock===0?'#ef4444':p.stock<10?'#f59e0b':'#10b981' }}>{p.stock}</span></td>
                          <td>
                            <button onClick={()=>toggleActive(p)} style={{ display:'flex',alignItems:'center',gap:6,background:p.active?'rgba(16,185,129,.12)':'rgba(255,255,255,.06)',color:p.active?'var(--success)':'rgba(255,255,255,.4)',border:`1px solid ${p.active?'rgba(16,185,129,.3)':'rgba(255,255,255,.1)'}`,borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:600 }}>
                              {p.active?<><Eye size={11}/>Visible</>:<><EyeOff size={11}/>Hidden</>}
                            </button>
                          </td>
                          <td>
                            <div style={{ display:'flex',gap:7 }}>
                              <button className="btn btn-outline btn-sm" onClick={()=>setModal(p)}><Edit2 size={12}/></button>
                              <button className="btn btn-danger btn-sm" onClick={()=>deleteProduct(p.id)}><Trash2 size={12}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {tab==='orders' && (
          <div>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,flexWrap:'wrap',gap:14 }}>
              <div>
                <h2 style={{ fontSize:34,letterSpacing:2 }}>ALL ORDERS</h2>
                <p style={{ color:'rgba(255,255,255,.46)',fontSize:14 }}>{filtered.length} of {orders.length} orders</p>
              </div>
              <div style={{ display:'flex',gap:7,flexWrap:'wrap' }}>
                {['all','pending','confirmed','shipped','delivered','cancelled'].map(s => {
                  const cnt = s==='all'?orders.length:orders.filter(o=>o.status===s).length
                  return <button key={s} onClick={()=>setOFilter(s)} style={{ padding:'7px 14px',borderRadius:7,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,textTransform:'capitalize',background:oFilter===s?'linear-gradient(135deg,var(--cyan),var(--blue))':'rgba(255,255,255,.06)',color:oFilter===s?'white':'rgba(255,255,255,.55)' }}>{s} ({cnt})</button>
                })}
              </div>
            </div>
            <div className="card" style={{ padding:0,overflow:'hidden' }}>
              <OrdersTable orders={filtered} onUpdate={updateStatus} expanded={expanded} setExpanded={setExpanded} admin/>
            </div>
          </div>
        )}
      </div>

      {modal!==null && <ProductModal product={modal==='new'?null:modal} onClose={()=>setModal(null)} onSave={()=>{loadProducts();setModal(null)}}/>}
    </div>
  )
}

function OrdersTable({ orders, onUpdate, expanded, setExpanded, admin }) {
  if (!orders.length) return (
    <div style={{ textAlign:'center',padding:50,color:'rgba(255,255,255,.32)' }}>
      <ShoppingBag size={36} style={{ margin:'0 auto 11px',opacity:.3 }}/><p>No orders found</p>
    </div>
  )
  return (
    <div className="tbl-wrap">
      <table>
        <thead><tr><th>Order</th>{admin&&<th>Customer</th>}<th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.map(order => {
            const cfg = SFLOW[order.status]||SFLOW.pending
            const open = expanded===order.id
            return (
              <>
                <tr key={order.id}>
                  <td>
                    <span style={{ fontFamily:'Space Mono',fontSize:12,color:'var(--cyan)' }}>#{order.id.slice(0,8).toUpperCase()}</span>
                    <button onClick={()=>setExpanded(open?null:order.id)} style={{ display:'block',marginTop:3,background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,.32)',fontSize:11,padding:0,display:'flex',alignItems:'center',gap:3 }}>
                      {open?<><ChevronUp size={10}/>hide</>:<><ChevronDown size={10}/>items</>}
                    </button>
                  </td>
                  {admin&&<td><p style={{ fontSize:13,fontWeight:600 }}>{order.profiles?.full_name||'—'}</p><p style={{ fontSize:11,color:'rgba(255,255,255,.34)' }}>{order.profiles?.email}</p></td>}
                  <td style={{ fontSize:13,color:'rgba(255,255,255,.5)',whiteSpace:'nowrap' }}>{new Date(order.created_at).toLocaleDateString('en-ZM',{day:'numeric',month:'short',year:'numeric'})}</td>
                  <td><span style={{ fontFamily:'Bebas Neue',fontSize:21,color:'var(--cyan)',letterSpacing:1 }}>K{parseFloat(order.total||0).toFixed(2)}</span></td>
                  <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                  <td>
                    <div style={{ display:'flex',gap:7,flexWrap:'wrap' }}>
                      {admin&&cfg.next&&<button className="btn btn-success btn-sm" onClick={()=>onUpdate(order.id,cfg.next)}><Check size={11}/>{cfg.nl}</button>}
                      {admin&&order.status==='pending'&&<button className="btn btn-danger btn-sm" style={{ marginLeft:4 }} onClick={()=>onUpdate(order.id,'cancelled')}>Cancel</button>}
                    </div>
                  </td>
                </tr>
                {open&&(
                  <tr key={`${order.id}-x`}>
                    <td colSpan={admin?6:5} style={{ background:'rgba(0,0,0,.18)',padding:'15px 22px' }}>
                      <div style={{ display:'flex',flexDirection:'column',gap:9 }}>
                        {order.order_items?.map(item=>(
                          <div key={item.id} style={{ display:'flex',alignItems:'center',gap:12 }}>
                            <img src={item.products?.image_url} alt="" style={{ width:40,height:40,borderRadius:7,objectFit:'cover' }}
                              onError={e=>e.target.src='https://placehold.co/40/0d1b4b/00b4d8?text=AA'}/>
                            <span style={{ flex:1,fontSize:13 }}>{item.products?.name}</span>
                            <span style={{ fontSize:12,color:'rgba(255,255,255,.4)' }}>×{item.quantity}</span>
                            <span style={{ fontSize:13,fontWeight:700,color:'var(--cyan)' }}>K{(item.quantity*item.unit_price).toFixed(2)}</span>
                          </div>
                        ))}
                        {order.delivery_address&&<p style={{ fontSize:12,color:'rgba(255,255,255,.34)',marginTop:6,paddingTop:9,borderTop:'1px solid rgba(255,255,255,.06)' }}>📍 {order.delivery_address}{order.city?`, ${order.city}`:''}</p>}
                        {order.notes&&<p style={{ fontSize:12,color:'rgba(255,255,255,.34)' }}>📝 {order.notes}</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ProductModal({ product, onClose, onSave }) {
  const isNew  = !product
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name:        product?.name        || '',
    description: product?.description || '',
    price:       product?.price       || '',
    category:    product?.category    || '',
    stock:       product?.stock       ?? 0,
    image_url:   product?.image_url   || '',
    active:      product?.active      ?? true,
  })
  const set = (k,v) => { setForm(p=>({...p,[k]:v})); if(errors[k]) setErrors(p=>({...p,[k]:''})) }

  const handleFile = async (file) => {
    if (!file||!file.type.startsWith('image/')) return toast.error('Select an image file')
    if (file.size>5*1024*1024) return toast.error('Max 5 MB')
    setUploading(true)
    try { set('image_url', await uploadProductImage(file)); toast.success('Image uploaded!') }
    catch (err) { toast.error(err.message) }
    setUploading(false)
  }

  const save = async () => {
    const e={}
    if (!form.name.trim()) e.name='Name is required'
    if (!form.price)       e.price='Price is required'
    setErrors(e); if(Object.keys(e).length) return
    setSaving(true)
    const payload = { ...form, price:parseFloat(form.price), stock:parseInt(form.stock)||0 }
    const { error } = isNew
      ? await supabase.from('products').insert(payload)
      : await supabase.from('products').update(payload).eq('id',product.id)
    if (error) toast.error(error.message)
    else { toast.success(isNew?'Product created!':'Product updated!'); onSave() }
    setSaving(false)
  }

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <h2 style={{ fontSize:24 }}>{isNew?'ADD PRODUCT':'EDIT PRODUCT'}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding:8 }}><X size={17}/></button>
        </div>

        {/* Image upload */}
        <div style={{ marginBottom:18 }}>
          <label className="flabel">Product Image</label>
          <div onClick={()=>!uploading&&fileRef.current?.click()}
            onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0])}}
            style={{ border:`2px dashed ${form.image_url?'rgba(0,180,216,.4)':'rgba(255,255,255,.14)'}`,borderRadius:11,overflow:'hidden',cursor:'pointer',background:'rgba(0,0,0,.2)',minHeight:130,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',transition:'border-color .2s' }}>
            {form.image_url
              ? <img src={form.image_url} alt="" style={{ width:'100%',height:160,objectFit:'cover',display:'block' }} onError={e=>e.target.style.display='none'}/>
              : <div style={{ textAlign:'center',padding:28,color:'rgba(255,255,255,.32)' }}>
                  {uploading?<><div className="spin" style={{ margin:'0 auto 10px' }}/><p style={{ fontSize:13 }}>Uploading…</p></>:<><Upload size={28} style={{ margin:'0 auto 9px' }}/><p style={{ fontSize:13,fontWeight:600 }}>Click or drag image here</p><p style={{ fontSize:11,marginTop:3 }}>PNG, JPG, WebP · max 5 MB</p></>}
                </div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])}/>
          <input className="finput" placeholder="…or paste image URL" value={form.image_url} onChange={e=>set('image_url',e.target.value)} style={{ marginTop:8,fontSize:13 }}/>
        </div>

        <div className="fgroup">
          <label className="flabel">Product Name *</label>
          <input className={`finput${errors.name?' err':''}`} placeholder="e.g. Pro Running Shoes" value={form.name} onChange={e=>set('name',e.target.value)}/>
          {errors.name&&<p className="ferr">{errors.name}</p>}
        </div>
        <div className="fgroup">
          <label className="flabel">Description</label>
          <textarea className="finput" placeholder="Short product description…" rows={2} value={form.description} onChange={e=>set('description',e.target.value)}/>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14 }}>
          <div className="fgroup">
            <label className="flabel">Price (K) *</label>
            <input className={`finput${errors.price?' err':''}`} type="number" min="0" step="0.01" placeholder="99.99" value={form.price} onChange={e=>set('price',e.target.value)}/>
            {errors.price&&<p className="ferr">{errors.price}</p>}
          </div>
          <div className="fgroup">
            <label className="flabel">Stock</label>
            <input className="finput" type="number" min="0" placeholder="50" value={form.stock} onChange={e=>set('stock',e.target.value)}/>
          </div>
          <div className="fgroup">
            <label className="flabel">Category</label>
            <select className="finput" value={form.category} onChange={e=>set('category',e.target.value)}>
              <option value="">None</option>
              {['Footwear','Apparel','Equipment','Accessories'].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:'flex',alignItems:'center',gap:11,marginBottom:22 }}>
          <button type="button" onClick={()=>set('active',!form.active)} style={{ width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',position:'relative',background:form.active?'linear-gradient(135deg,var(--cyan),var(--blue))':'rgba(255,255,255,.12)',transition:'background .25s',flexShrink:0 }}>
            <div style={{ position:'absolute',top:2,left:form.active?22:2,width:20,height:20,borderRadius:'50%',background:'white',transition:'left .25s' }}/>
          </button>
          <span style={{ fontSize:14,color:form.active?'rgba(255,255,255,.75)':'rgba(255,255,255,.38)' }}>{form.active?'✅ Visible in shop':'🙈 Hidden from shop'}</span>
        </div>

        <div style={{ display:'flex',gap:11 }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:2 }} onClick={save} disabled={saving||uploading}>
            {saving?'Saving…':isNew?<><Plus size={14}/>Add Product</>:<><Check size={14}/>Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}
