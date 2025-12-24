import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-semibold">ZORA<span className="text-amber-500">.</span></Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm hover:text-gray-600">Home</Link>
            <Link to="/shop" className="text-sm hover:text-gray-600">Shop</Link>
            <Link to="/cart" className="relative">
              <ShoppingCart size={20} />
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                </button>
                {userMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2">
                      <Link to="/profile" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">Profile</Link>
                      <Link to="/orders" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">Orders</Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">Admin Panel</Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/signin" className="text-sm font-medium">Sign In</Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart size={20} />
              {cart.totalItems > 0 && <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.totalItems}</span>}
            </Link>
            <button onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>

      {mobileMenu && (
        <div className="md:hidden bg-white border-t py-4 px-4">
          <Link to="/" onClick={() => setMobileMenu(false)} className="block py-3">Home</Link>
          <Link to="/shop" onClick={() => setMobileMenu(false)} className="block py-3">Shop</Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenu(false)} className="block py-3">Profile</Link>
              <Link to="/orders" onClick={() => setMobileMenu(false)} className="block py-3">Orders</Link>
              <button onClick={() => { handleLogout(); setMobileMenu(false); }} className="block py-3 text-red-600">Logout</button>
            </>
          ) : (
            <Link to="/signin" onClick={() => setMobileMenu(false)} className="block py-3">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;