import { createContext, useContext, useState, useEffect } from 'react'

const Ctx = createContext({})

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aa_cart') || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('aa_cart', JSON.stringify(cart)) }, [cart])

  const addToCart = (product, qty = 1) => setCart(prev => {
    const ex = prev.find(i => i.id === product.id)
    if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
    return [...prev, { ...product, qty }]
  })

  const removeFromCart = (id) => setCart(p => p.filter(i => i.id !== id))
  const updateQty      = (id, qty) => { if (qty < 1) removeFromCart(id); else setCart(p => p.map(i => i.id === id ? { ...i, qty } : i)) }
  const clearCart      = () => setCart([])

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <Ctx.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </Ctx.Provider>
  )
}

export const useCart = () => useContext(Ctx)
