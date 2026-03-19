import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CATS = ['All','Footwear','Apparel','Equipment','Accessories']

export default function HomePage() {
  const { profile } = useAuth()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('All')
  const [adding, setAdding]     = useState(null)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false })
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  const filtered = products.filter(p => {
    const mc = cat === 'All' || p.category === cat
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || (p.description||'').toLowerCase().includes(search.toLowerCase())
    return mc && ms
  })

  const handleAdd = (product) => {
    setAdding(product.id)
    addToCart(product)
    toast.success(`${product.name} added to cart!`, {
      style: { background:'#0a1535', color:'white', border:'1px solid rgba(0,180,216,.3)' },
      iconTheme: { primary:'#00b4d8', secondary:'white' }
    })
    setTimeout(() => setAdding(null), 700)
  }

  return (
    <div className="page">
      <div className="bg-mesh"/><div className="bg-lines"/>

      {/* Page header */}
      <div style={{ background:'rgba(0,0,0,.22)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'28px 0',position:'relative',zIndex:1 }}>
        <div className="wrap">
          <p style={{ color:'var(--cyan)',fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',marginBottom:5 }}>
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Athlete'} 👊
          </p>
          <h1 style={{ fontSize:46,letterSpacing:2 }}>SHOP THE COLLECTION</h1>
          <p style={{ color:'rgba(255,255,255,.46)',marginTop:4,fontSize:14 }}>{products.length} products available · New Collection 2026</p>
        </div>
      </div>

      <div className="wrap" style={{ position:'relative',zIndex:1,padding:'28px 24px' }}>
        {/* Search + filters */}
        <div style={{ display:'flex',gap:14,marginBottom:28,flexWrap:'wrap',alignItems:'center' }}>
          <div style={{ position:'relative',flex:1,minWidth:200 }}>
            <Search size={15} style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.28)' }}/>
            <input className="finput" placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:42 }} />
          </div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={()=>setCat(c)} style={{
                padding:'9px 18px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,transition:'all .2s',
                background: cat===c ? 'linear-gradient(135deg,var(--cyan),var(--blue))' : 'rgba(255,255,255,.06)',
                color: cat===c ? 'white' : 'rgba(255,255,255,.55)',
                boxShadow: cat===c ? '0 4px 12px rgba(0,180,216,.28)' : 'none'
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-center"><div className="spin"/></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:'80px 0',color:'rgba(255,255,255,.35)' }}>
            <Package size={46} style={{ margin:'0 auto 14px',opacity:.3 }}/>
            <p style={{ fontSize:17,fontWeight:600 }}>No products found</p>
            <p style={{ fontSize:14,marginTop:6 }}>Try a different search or category</p>
          </div>
        ) : (
          <div className="pgrid">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} onAdd={handleAdd} adding={adding===p.id} delay={i*.04} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product: p, onAdd, adding, delay }) {
  return (
    <div className="afu" style={{ animationDelay:`${delay}s`, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, overflow:'hidden', transition:'transform .2s,box-shadow .2s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,.32)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>

      {/* Image */}
      <div style={{ position:'relative',paddingBottom:'64%',background:'rgba(0,0,0,.28)',overflow:'hidden' }}>
        <img src={p.image_url} alt={p.name} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transition:'transform .35s' }}
          onError={e=>e.target.src=`https://placehold.co/400x260/0d1b4b/00b4d8?text=${encodeURIComponent(p.name)}`}
          onMouseEnter={e=>e.target.style.transform='scale(1.06)'}
          onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
        {p.category && (
          <span style={{ position:'absolute',top:11,left:11,background:'rgba(0,0,0,.7)',backdropFilter:'blur(8px)',color:'var(--cyan)',fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',padding:'4px 10px',borderRadius:100,border:'1px solid rgba(0,180,216,.28)' }}>{p.category}</span>
        )}
        {p.stock < 10 && p.stock > 0 && (
          <span style={{ position:'absolute',top:11,right:11,background:'rgba(245,158,11,.88)',color:'white',fontSize:10,fontWeight:700,padding:'4px 9px',borderRadius:100 }}>Low Stock</span>
        )}
        {p.stock === 0 && (
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,.62)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span style={{ color:'white',fontWeight:700,fontSize:13,letterSpacing:2 }}>OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'17px 18px 20px' }}>
        <h3 style={{ fontSize:15,fontWeight:700,marginBottom:5,lineHeight:1.3 }}>{p.name}</h3>
        <p style={{ fontSize:13,color:'rgba(255,255,255,.46)',lineHeight:1.5,marginBottom:15,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{p.description}</p>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <span style={{ fontFamily:'Bebas Neue',fontSize:26,color:'var(--cyan)',letterSpacing:1 }}>K{parseFloat(p.price).toFixed(2)}</span>
            {p.stock > 0 && <p style={{ fontSize:11,color:'rgba(255,255,255,.3)',marginTop:1 }}>{p.stock} in stock</p>}
          </div>
          <button onClick={()=>onAdd(p)} disabled={adding||p.stock===0} className="btn btn-primary btn-sm" style={{ gap:6 }}>
            {adding
              ? <div className="spin spin-sm"/>
              : <ShoppingCart size={13}/>
            }
            {adding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
