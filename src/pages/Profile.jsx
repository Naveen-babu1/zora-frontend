import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  Bell,
  CreditCard,
  Lock,
  Check,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Button, Input, PageLoader } from '../components/common';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    sms: false,
  });

  // Form Errors
  const [errors, setErrors] = useState({});

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        apartment: user.address?.apartment || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'United States',
      });
    }
  }, [user]);

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await userService.uploadAvatar(formData);
      updateUser({ ...user, avatar: response.avatar });
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Validate profile form
  const validateProfile = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };
      
      const response = await userService.updateProfile(updateData);
      updateUser(response.user);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      apartment: user.address?.apartment || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      country: user.address?.country || 'United States',
    });
    setErrors({});
    setEditing(false);
  };

  // Validate password form
  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Handle notification preferences update
  const handleUpdateNotifications = async () => {
    setLoading(true);
    try {
      await userService.updateNotifications(notifications);
      toast.success('Notification preferences updated!');
    } catch (err) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    setLoading(true);
    try {
      await userService.deleteAccount();
      logout();
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <PageLoader />;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const quickLinks = [
    { label: 'My Orders', icon: Package, to: '/orders', description: 'Track your orders' },
    { label: 'Wishlist', icon: Heart, to: '/wishlist', description: 'Saved items' },
    { label: 'Payment Methods', icon: CreditCard, to: '/payment-methods', description: 'Manage cards' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Card */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div 
                    className={`w-24 h-24 rounded-full overflow-hidden bg-gray-200 ${
                      uploadingAvatar ? 'opacity-50' : ''
                    }`}
                  >
                    {user.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black text-white text-3xl font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <Camera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <h2 className="font-semibold text-lg">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                  {user.role || 'Customer'}
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6 pt-6 border-t space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <tab.icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-4">
              <h3 className="font-semibold mb-3 px-2">Quick Links</h3>
              <div className="space-y-1">
                {quickLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <link.icon size={18} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{link.label}</p>
                        <p className="text-xs text-gray-500">{link.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Profile Information</h2>
                    <p className="text-gray-500 mt-1">Update your personal details</p>
                  </div>
                  {!editing ? (
                    <Button
                      variant="secondary"
                      onClick={() => setEditing(true)}
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile}>
                  {/* Personal Info Section */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                      Personal Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!editing}
                        error={errors.name}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        disabled={true}
                        className="bg-gray-50"
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!editing}
                        error={errors.phone}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                      Shipping Address
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Input
                          label="Street Address"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          disabled={!editing}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <Input
                        label="Apartment, Suite, etc."
                        value={formData.apartment}
                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                        disabled={!editing}
                        placeholder="Apt 4B"
                      />
                      <Input
                        label="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={!editing}
                        placeholder="New York"
                      />
                      <Input
                        label="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        disabled={!editing}
                        placeholder="NY"
                      />
                      <Input
                        label="ZIP Code"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        disabled={!editing}
                        placeholder="10001"
                      />
                      <Input
                        label="Country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        disabled={!editing}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  {editing && (
                    <div className="flex gap-4">
                      <Button type="submit" loading={loading} disabled={loading}>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </Button>
                      <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white rounded-2xl p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">Change Password</h2>
                    <p className="text-gray-500 mt-1">Update your password regularly to keep your account secure</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="max-w-md">
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          label="Current Password"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          error={errors.currentPassword}
                          showPasswordToggle={false}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          label="New Password"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          error={errors.newPassword}
                          showPasswordToggle={false}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          label="Confirm New Password"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          error={errors.confirmPassword}
                          showPasswordToggle={false}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {/* Password Requirements */}
                      <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
                        <p className="font-medium mb-2">Password must contain:</p>
                        <ul className="space-y-1">
                          <li className={`flex items-center gap-2 ${passwordData.newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                            {passwordData.newPassword.length >= 6 ? <Check size={14} /> : <AlertCircle size={14} />}
                            At least 6 characters
                          </li>
                          <li className={`flex items-center gap-2 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                            {/[A-Z]/.test(passwordData.newPassword) ? <Check size={14} /> : <AlertCircle size={14} />}
                            One uppercase letter
                          </li>
                          <li className={`flex items-center gap-2 ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                            {/[0-9]/.test(passwordData.newPassword) ? <Check size={14} /> : <AlertCircle size={14} />}
                            One number
                          </li>
                        </ul>
                      </div>
                    </div>

                    <Button type="submit" className="mt-6" loading={loading} disabled={loading}>
                      Update Password
                    </Button>
                  </form>
                </div>

                {/* Delete Account */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-red-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Trash2 size={24} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-600">Delete Account</h3>
                      <p className="text-gray-500 mt-1 mb-4">
                        Once you delete your account, there is no going back. All your data will be permanently removed.
                      </p>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                      >
                        Delete My Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Notification Preferences</h2>
                  <p className="text-gray-500 mt-1">Choose what notifications you want to receive</p>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">Order Updates</p>
                            <p className="text-sm text-gray-500">Get notified about your order status</p>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={notifications.orderUpdates}
                            onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-black transition-colors" />
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                        </div>
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <Bell size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">Promotions & Offers</p>
                            <p className="text-sm text-gray-500">Receive exclusive deals and discounts</p>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={notifications.promotions}
                            onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-black transition-colors" />
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                        </div>
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <Mail size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">Newsletter</p>
                            <p className="text-sm text-gray-500">Weekly updates on new products and trends</p>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={notifications.newsletter}
                            onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-black transition-colors" />
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                      SMS Notifications
                    </h3>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <Phone size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">SMS Updates</p>
                          <p className="text-sm text-gray-500">Receive order updates via text message</p>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-black transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                      </div>
                    </label>
                  </div>

                  <Button onClick={handleUpdateNotifications} loading={loading} disabled={loading}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;