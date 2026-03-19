import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import VerifyPage        from './pages/VerifyPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage  from './pages/ResetPasswordPage'
import HomePage          from './pages/HomePage'
import CheckoutPage      from './pages/CheckoutPage'
import OrdersPage        from './pages/OrdersPage'
import AdminDashboard    from './pages/AdminDashboard'

const WithNav = ({ children }) => <><Navbar />{children}</>

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" toastOptions={{ style:{ background:'#0a1535',color:'white',border:'1px solid rgba(0,180,216,.28)',fontFamily:'DM Sans' }, iconTheme:{ primary:'#00b4d8',secondary:'white' } }}/>
          <Routes>
            {/* Public */}
            <Route path="/"               element={<LandingPage/>} />
            <Route path="/verify"         element={<VerifyPage/>} />
            <Route path="/reset-password" element={<ResetPasswordPage/>} />

            {/* Guest only */}
            <Route path="/login"           element={<GuestRoute><LoginPage/></GuestRoute>} />
            <Route path="/register"        element={<GuestRoute><RegisterPage/></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage/></GuestRoute>} />

            {/* Logged in */}
            <Route path="/home"     element={<ProtectedRoute><WithNav><HomePage/></WithNav></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><WithNav><CheckoutPage/></WithNav></ProtectedRoute>} />
            <Route path="/orders"   element={<ProtectedRoute><WithNav><OrdersPage/></WithNav></ProtectedRoute>} />

            {/* Admin only */}
            <Route path="/admin" element={<AdminRoute><WithNav><AdminDashboard/></WithNav></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16 }}>
                <div className="bg-mesh"/><div className="bg-lines"/>
                <h1 style={{ fontFamily:'Bebas Neue',fontSize:100,color:'var(--cyan)',position:'relative',zIndex:1 }}>404</h1>
                <p style={{ color:'rgba(255,255,255,.5)',position:'relative',zIndex:1 }}>Page not found</p>
                <a href="/" className="btn btn-primary" style={{ position:'relative',zIndex:1 }}>Go Home</a>
              </div>
            }/>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
