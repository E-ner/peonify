import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import Preloader from "./components/Preloader";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Builder from "./pages/Builder";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import Account from "./pages/Account";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminPage from "./pages/admin/AdminPage";
import About from "./pages/static/About";
import Contact from "./pages/static/Contact";
import { Privacy, Terms } from "./pages/static/Legal";

export default function App() {
  const { pathname } = useLocation();
  // Auth pages get no footer; the admin dashboard is a fully standalone
  // workspace with its own header (no storefront nav at all).
  const isAdmin = pathname === "/admin";
  const bareLayout = pathname === "/login" || pathname === "/signup" || isAdmin;

  return (
    <div className="flex min-h-screen flex-col">
      <Preloader />
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      {!bareLayout && <Footer />}
      <CookieConsent />
    </div>
  );
}
