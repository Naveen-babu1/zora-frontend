import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Users, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const links = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/categories', icon: FolderTree, label: 'Categories' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h1 className="text-xl font-semibold">ZORA<span className="text-amber-500">.</span> Admin</h1>
          <button onClick={onClose} className="lg:hidden"><X size={20} /></button>
        </div>

        <nav className="py-6">
          {links.map(({ path, icon: Icon, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-sm ${isActive ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <p className="text-sm mb-4">{user?.name}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;