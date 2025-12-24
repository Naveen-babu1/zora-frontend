import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button, PageLoader } from '../components/common';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const handleUpdateQuantity = async (productId, newQty, maxStock) => {
    if (newQty < 1 || newQty > maxStock) return;
    setUpdatingId(productId);
    try {
      await updateQuantity(productId, newQty);
    } catch (err) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId, productName) => {
    setRemovingId(productId);
    try {
      await removeFromCart(productId);
      toast.success(`${productName} removed from cart`);
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;
    try {
      await clearCart();
      toast.success('Cart cleared successfully');
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to proceed to checkout');
      navigate('/signin', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    // Demo coupon codes
    const validCoupons = {
      'SAVE10': 10,
      'SAVE20': 20,
      'WELCOME': 15,
    };

    const discount = validCoupons[couponCode.toUpperCase()];
    if (discount) {
      setCouponDiscount(discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! ${discount}% off`);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    toast.success('Coupon removed');
  };

  if (loading) return <PageLoader />;

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity, 
    0
  );
  const discountAmount = couponApplied ? (subtotal * couponDiscount) / 100 : 0;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const total = subtotal - discountAmount + shipping;

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} className="text-gray-300" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Looks like you haven't added anything to your cart yet. 
              Start shopping to fill it up!
            </p>
            <Link to="/shop">
              <Button>
                Start Shopping
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t">
              <div className="text-center">
                <Truck size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-500">Free Shipping<br />Over $50</p>
              </div>
              <div className="text-center">
                <Shield size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-500">Secure<br />Checkout</p>
              </div>
              <div className="text-center">
                <RefreshCw size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-500">Easy<br />Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 self-start"
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              
              const isUpdating = updatingId === product._id;
              const isRemoving = removingId === product._id;
              
              return (
                <div
                  key={product._id}
                  className={`bg-white rounded-2xl p-4 sm:p-6 transition-opacity ${
                    isRemoving ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link 
                      to={`/product/${product.slug}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/150'}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Link 
                            to={`/product/${product.slug}`}
                            className="font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-2 text-sm sm:text-base"
                          >
                            {product.name}
                          </Link>
                          {product.category?.name && (
                            <p className="text-sm text-gray-400 mt-0.5">
                              {product.category.name}
                            </p>
                          )}
                          
                          {/* Unit Price */}
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-medium">
                              ${product.price?.toFixed(2)}
                            </span>
                            {product.comparePrice > 0 && (
                              <span className="text-xs text-gray-400 line-through">
                                ${product.comparePrice?.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Stock Warning */}
                          {product.stock < 10 && product.stock > 0 && (
                            <p className="text-xs text-orange-500 mt-1">
                              Only {product.stock} left in stock
                            </p>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(product._id, product.name)}
                          disabled={isRemoving}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 h-fit"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Quantity & Total - Bottom Section */}
                      <div className="flex items-end justify-between mt-auto pt-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-3 hidden sm:block">Qty:</span>
                          <div className="flex items-center border rounded-lg bg-gray-50">
                            <button
                              onClick={() => handleUpdateQuantity(product._id, item.quantity - 1, product.stock)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-10 sm:w-12 text-center font-medium text-sm">
                              {isUpdating ? (
                                <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(product._id, item.quantity + 1, product.stock)}
                              disabled={item.quantity >= product.stock || isUpdating}
                              className="p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold">
                            ${(product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue Shopping Link */}
            <Link
              to="/shop"
              className="inline-flex items-center text-gray-600 hover:text-black transition-colors mt-4 group"
            >
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Coupon Code */}
              {!couponApplied ? (
                <form onSubmit={handleApplyCoupon} className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have a coupon?
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-black transition-colors text-sm"
                      />
                    </div>
                    <Button type="submit" variant="secondary" className="px-4">
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Try: SAVE10, SAVE20, WELCOME
                  </p>
                </form>
              ) : (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {couponCode} (-{couponDiscount}%)
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                
                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({couponDiscount}%)</span>
                    <span className="font-medium">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                {/* Free Shipping Progress */}
                {shipping > 0 && (
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
                      <Truck size={16} />
                      <span>
                        Add <strong>${(50 - subtotal).toFixed(2)}</strong> more for free shipping!
                      </span>
                    </div>
                    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t my-6" />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <Button onClick={handleCheckout} className="w-full">
                Proceed to Checkout
                <ArrowRight size={18} className="ml-2" />
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <Shield size={20} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500">Secure<br/>Payment</p>
                  </div>
                  <div>
                    <Truck size={20} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500">Fast<br/>Delivery</p>
                  </div>
                  <div>
                    <RefreshCw size={20} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-500">Easy<br/>Returns</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 flex justify-center gap-3">
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">VISA</span>
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-red-500">MC</span>
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-800">AMEX</span>
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-500">PP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;