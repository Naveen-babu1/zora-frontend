import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  Check,
  Lock,
  Truck,
  ArrowLeft,
  Package,
  ShoppingBag,
  AlertCircle,
  Gift,
  Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { Button, Input, PageLoader } from '../components/common';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, name: 'Shipping', icon: MapPin },
  { id: 2, name: 'Payment', icon: CreditCard },
  { id: 3, name: 'Review', icon: Package },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState('standard');
  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', price: 0, days: '5-7 business days', minOrder: 50 },
    { id: 'express', name: 'Express Shipping', price: 9.99, days: '2-3 business days', minOrder: 0 },
    { id: 'overnight', name: 'Overnight Shipping', price: 19.99, days: 'Next business day', minOrder: 0 },
  ];

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [saveCard, setSaveCard] = useState(false);

  // Gift Options
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Form Errors
  const [errors, setErrors] = useState({});

  // Populate user data
  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'United States',
      }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart?.items || cart.items.length === 0) && !orderComplete) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate, orderComplete]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !cartLoading) {
      toast.error('Please sign in to checkout');
      navigate('/signin', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, cartLoading, navigate]);

  // Calculate totals
  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  
  const selectedShipping = shippingOptions.find(s => s.id === shippingMethod);
  const shippingCost = shippingMethod === 'standard' && subtotal >= 50 ? 0 : selectedShipping?.price || 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Validate shipping form
  const validateShipping = () => {
    const newErrors = {};
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) newErrors.email = 'Invalid email';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone is required';
    if (!shippingAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate payment form
  const validatePayment = () => {
    if (paymentMethod !== 'card') return true;
    
    const newErrors = {};
    if (!cardDetails.number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Invalid card number';
    }
    if (!cardDetails.name.trim()) newErrors.cardName = 'Cardholder name is required';
    if (!cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) newErrors.expiry = 'Invalid expiry date';
    if (!cardDetails.cvv.match(/^\d{3,4}$/)) newErrors.cvv = 'Invalid CVV';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle shipping submit
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle payment submit
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (validatePayment()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      const orderPayload = {
        items: items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0]?.url,
          price: item.product.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          apartment: shippingAddress.apartment,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
        shippingMethod,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shippingCost,
        taxPrice: tax,
        totalPrice: total,
        isGift,
        giftMessage: isGift ? giftMessage : '',
      };

      const response = await orderService.createOrder(orderPayload);
      setOrderData(response.order);
      setOrderComplete(true);
      await clearCart();
      toast.success('Order placed successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Go back handler
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/cart');
    }
  };

  if (cartLoading) return <PageLoader />;

  // Order Success Screen
  if (orderComplete && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check size={48} className="text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-6">Your order has been confirmed</p>
            
            {/* Order Details Card */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Number</p>
                  <p className="font-bold text-lg">{orderData.orderNumber || orderData._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    {selectedShipping?.days}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="font-bold text-lg text-green-600">${total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Truck size={18} />
                Shipping To
              </h3>
              <p className="text-gray-600">
                {shippingAddress.fullName}<br />
                {shippingAddress.street}
                {shippingAddress.apartment && `, ${shippingAddress.apartment}`}<br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                {shippingAddress.country}
              </p>
            </div>

            {/* Confirmation Email Notice */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  A confirmation email has been sent to{' '}
                  <span className="font-medium">{shippingAddress.email}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Please check your spam folder if you don't see it.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/orders" className="flex-1">
                <Button variant="secondary" className="w-full">
                  <Package size={18} className="mr-2" />
                  View My Orders
                </Button>
              </Link>
              <Link to="/shop" className="flex-1">
                <Button className="w-full">
                  Continue Shopping
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-black transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          {step > 1 ? 'Back' : 'Back to Cart'}
        </button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id > step}
                className="flex items-center disabled:cursor-not-allowed"
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                    step >= s.id
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step > s.id ? <Check size={20} /> : <s.icon size={20} />}
                </div>
                <span
                  className={`ml-2 font-medium hidden sm:block ${
                    step >= s.id ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  {s.name}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-16 lg:w-24 h-0.5 mx-2 sm:mx-4 transition-colors ${
                    step > s.id ? 'bg-black' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <form onSubmit={handleShippingSubmit}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6">
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Full Name *"
                        placeholder="John Doe"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                        error={errors.fullName}
                      />
                    </div>
                    <Input
                      label="Email *"
                      type="email"
                      placeholder="john@example.com"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                      error={errors.email}
                    />
                    <Input
                      label="Phone *"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      error={errors.phone}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Street Address *"
                        placeholder="123 Main Street"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        error={errors.street}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Apartment, Suite, etc. (optional)"
                        placeholder="Apt 4B"
                        value={shippingAddress.apartment}
                        onChange={(e) => setShippingAddress({...shippingAddress, apartment: e.target.value})}
                      />
                    </div>
                    <Input
                      label="City *"
                      placeholder="New York"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      error={errors.city}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="State *"
                        placeholder="NY"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        error={errors.state}
                      />
                      <Input
                        label="ZIP Code *"
                        placeholder="10001"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        error={errors.zipCode}
                      />
                    </div>
                    <Input
                      label="Country *"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                    />
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6">
                  <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
                  <div className="space-y-3">
                    {shippingOptions.map((option) => {
                      const isFree = option.id === 'standard' && subtotal >= option.minOrder;
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                            shippingMethod === option.id
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value={option.id}
                              checked={shippingMethod === option.id}
                              onChange={(e) => setShippingMethod(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              shippingMethod === option.id ? 'border-black' : 'border-gray-300'
                            }`}>
                              {shippingMethod === option.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-black" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <p className="text-sm text-gray-500">{option.days}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {isFree ? (
                              <span className="font-medium text-green-600">FREE</span>
                            ) : (
                              <span className="font-medium">${option.price.toFixed(2)}</span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Gift Option */}
                <div className="bg-white rounded-2xl p-6 sm:p-8">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <div>
                      <span className="font-medium flex items-center gap-2">
                        <Gift size={18} />
                        This is a gift
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        We'll hide the price and include a gift receipt
                      </p>
                    </div>
                  </label>
                  
                  {isGift && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gift Message (optional)
                      </label>
                      <textarea
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder="Add a personal message..."
                        rows={3}
                        maxLength={200}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {giftMessage.length}/200
                      </p>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full mt-6">
                  Continue to Payment
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              </form>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <form onSubmit={handlePaymentSubmit}>
                <div className="bg-white rounded-2xl p-6 sm:p-8">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

                  {/* Payment Options */}
                  <div className="space-y-3 mb-6">
                    {[
                      { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
                      { id: 'paypal', label: 'PayPal', icon: () => <span className="text-blue-600 font-bold text-lg">P</span>, desc: 'Pay with your PayPal account' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                          paymentMethod === method.id ? 'border-black' : 'border-gray-300'
                        }`}>
                          {paymentMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-black" />
                          )}
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <method.icon size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <span className="font-medium">{method.label}</span>
                          <p className="text-sm text-gray-500">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Card Details */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-6 border-t">
                      <Input
                        label="Card Number *"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({
                          ...cardDetails, 
                          number: formatCardNumber(e.target.value)
                        })}
                        maxLength={19}
                        error={errors.cardNumber}
                      />
                      <Input
                        label="Cardholder Name *"
                        placeholder="JOHN DOE"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({
                          ...cardDetails, 
                          name: e.target.value.toUpperCase()
                        })}
                        error={errors.cardName}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Expiry Date *"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({
                            ...cardDetails, 
                            expiry: formatExpiry(e.target.value)
                          })}
                          maxLength={5}
                          error={errors.expiry}
                        />
                        <Input
                          label="CVV *"
                          placeholder="123"
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({
                            ...cardDetails, 
                            cvv: e.target.value.replace(/\D/g, '')
                          })}
                          maxLength={4}
                          error={errors.cvv}
                        />
                      </div>

                      {/* Save Card Option */}
                      <label className="flex items-center gap-2 cursor-pointer mt-4">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-gray-600">
                          Save this card for future purchases
                        </span>
                      </label>
                    </div>
                  )}

                  {/* PayPal Message */}
                  {paymentMethod === 'paypal' && (
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                      <p className="text-sm text-blue-800">
                        You will be redirected to PayPal to complete your payment securely.
                      </p>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 mt-6 p-4 bg-gray-50 rounded-xl">
                    <Lock size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Your payment information is encrypted and secure
                    </span>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6">
                  Review Order
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              </form>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Shipping Summary */}
                <div className="bg-white rounded-2xl p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Truck size={20} />
                      Shipping Details
                    </h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Ship To</p>
                      <p className="text-gray-800">
                        {shippingAddress.fullName}<br />
                        {shippingAddress.street}
                        {shippingAddress.apartment && `, ${shippingAddress.apartment}`}<br />
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                        {shippingAddress.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Contact</p>
                      <p className="text-gray-800">
                        {shippingAddress.email}<br />
                        {shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Shipping Method</p>
                    <p className="text-gray-800">
                      {selectedShipping?.name} - {selectedShipping?.days}
                    </p>
                  </div>
                  {isGift && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Gift size={14} />
                        Gift Order
                      </p>
                      {giftMessage && (
                        <p className="text-gray-800 italic">"{giftMessage}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-2xl p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <CreditCard size={20} />
                      Payment Method
                    </h3>
                    <button
                      onClick={() => setStep(2)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-gray-800">
                    {paymentMethod === 'card' 
                      ? `Credit Card ending in ${cardDetails.number.slice(-4)}`
                      : 'PayPal'
                    }
                  </p>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl p-6 sm:p-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <ShoppingBag size={20} />
                    Order Items ({items.length})
                  </h3>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product._id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.images?.[0]?.url || 'https://via.placeholder.com/100'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium mt-1">
                            ${item.product.price.toFixed(2)} each
                          </p>
                        </div>
                        <p className="font-bold text-right">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  loading={processing}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                </Button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  By placing this order, you agree to our{' '}
                  <Link to="/terms" className="underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="underline">Privacy Policy</Link>
                </p>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>
              
              {/* Items Preview */}
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        src={item.product.images?.[0]?.url || 'https://via.placeholder.com/100'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Secure Checkout Badge */}
              <div className="mt-6 pt-6 border-t flex items-center justify-center gap-2 text-gray-500">
                <Lock size={16} />
                <span className="text-xs">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;