import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">ZORA<span className="text-amber-500">.</span></h2>
          <p className="text-gray-400 text-sm">Quality products for modern living.</p>
        </div>
        <div>
          <h3 className="font-medium mb-4">Shop</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <Link to="/shop" className="block hover:text-white">All Products</Link>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-4">Account</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <Link to="/signin" className="block hover:text-white">Sign In</Link>
            <Link to="/orders" className="block hover:text-white">Orders</Link>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-4">Support</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Contact: support@zora.com</p>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} ZORA. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;