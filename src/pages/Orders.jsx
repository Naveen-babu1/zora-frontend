import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ShoppingBag,
  MapPin,
  CreditCard,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { Button, PageLoader } from '../components/common';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-700', 
    icon: Clock,
    description: 'Order is being processed'
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-blue-100 text-blue-700', 
    icon: RefreshCw,
    description: 'Order is being prepared'
  },
  shipped: { 
    label: 'Shipped', 
    color: 'bg-purple-100 text-purple-700', 
    icon: Truck,
    description: 'Order is on the way'
  },
  delivered: { 
    label: 'Delivered', 
    color: 'bg-green-100 text-green-700', 
    icon: CheckCircle,
    description: 'Order has been delivered'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-700', 
    icon: XCircle,
    description: 'Order was cancelled'
  },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    toast.success('Order ID copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(query);
        const matchesId = order._id?.toLowerCase().includes(query);
        const matchesProduct = order.items?.some(item => 
          item.name?.toLowerCase().includes(query)
        );
        return matchesOrderNumber || matchesId || matchesProduct;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOrder === 'highest') {
        return b.totalPrice - a.totalPrice;
      } else {
        return a.totalPrice - b.totalPrice;
      }
    });

  if (loading) return <PageLoader />;

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={48} className="text-gray-300" />
            </div>
            <h1 className="text-2xl font-bold mb-3">No orders yet</h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link to="/shop">
              <Button>
                Start Shopping
                <ChevronRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-500 mt-1">
            Track and manage your orders
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <div className="relative">
                <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 border rounded-xl focus:outline-none focus:border-black appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="pl-10 pr-8 py-2.5 border rounded-xl focus:outline-none focus:border-black appearance-none bg-white cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || statusFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-500">
                    <XCircle size={14} />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  Status: {statusConfig[statusFilter]?.label}
                  <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-red-500">
                    <XCircle size={14} />
                  </button>
                </span>
              )}
              <button 
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="text-sm text-red-500 hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>

        {/* No Results */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Order Header */}
                <div 
                  className="p-4 sm:p-6 cursor-pointer"
                  onClick={() => toggleOrderExpand(order._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-start gap-4">
                      {/* Product Images Stack */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl overflow-hidden">
                          <img
                            src={order.items?.[0]?.image || 'https://via.placeholder.com/100'}
                            alt={order.items?.[0]?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {order.items?.length > 1 && (
                          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-black text-white text-xs rounded-full flex items-center justify-center">
                            +{order.items.length - 1}
                          </span>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyOrderId(order.orderNumber || order._id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy Order ID"
                          >
                            {copiedId === (order.orderNumber || order._id) ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {formatDate(order.createdAt)} • {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                        </p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Price & Expand */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold">${order.totalPrice?.toFixed(2)}</p>
                        {order.isPaid && (
                          <p className="text-xs text-green-600 flex items-center justify-end gap-1">
                            <CheckCircle size={12} />
                            Paid
                          </p>
                        )}
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t">
                    {/* Progress Tracker */}
                    {order.status !== 'cancelled' && (
                      <div className="p-4 sm:p-6 bg-gray-50">
                        <div className="flex items-center justify-between max-w-md mx-auto">
                          {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                            const stepStatus = statusConfig[step];
                            const StepIcon = stepStatus.icon;
                            const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                            const currentIdx = statusOrder.indexOf(order.status);
                            const isCompleted = idx <= currentIdx;
                            const isCurrent = step === order.status;

                            return (
                              <div key={step} className="flex items-center">
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                      isCompleted
                                        ? 'bg-black text-white'
                                        : 'bg-gray-200 text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-black/20' : ''}`}
                                  >
                                    <StepIcon size={18} />
                                  </div>
                                  <span className={`text-xs mt-2 ${isCompleted ? 'text-black font-medium' : 'text-gray-400'}`}>
                                    {stepStatus.label}
                                  </span>
                                </div>
                                {idx < 3 && (
                                  <div
                                    className={`w-8 sm:w-16 h-0.5 mx-1 ${
                                      idx < currentIdx ? 'bg-black' : 'bg-gray-200'
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-4">
                          {status.description}
                        </p>
                      </div>
                    )}

                    {/* Cancelled Notice */}
                    {order.status === 'cancelled' && (
                      <div className="p-4 sm:p-6 bg-red-50">
                        <div className="flex items-center gap-3 text-red-700">
                          <XCircle size={24} />
                          <div>
                            <p className="font-medium">Order Cancelled</p>
                            <p className="text-sm text-red-600">
                              This order was cancelled on {formatDate(order.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="p-4 sm:p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <ShoppingBag size={18} />
                        Order Items
                      </h4>
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.image || 'https://via.placeholder.com/100'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link 
                                to={`/product/${item.product}`}
                                className="font-medium text-gray-900 hover:text-gray-600 truncate block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {item.name}
                              </Link>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × ${item.price?.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="p-4 sm:p-6 border-t grid sm:grid-cols-2 gap-6">
                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin size={18} />
                          Shipping Address
                        </h4>
                        <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                          <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                          <p>{order.shippingAddress?.street}</p>
                          {order.shippingAddress?.apartment && <p>{order.shippingAddress.apartment}</p>}
                          <p>
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                          </p>
                          <p>{order.shippingAddress?.country}</p>
                          {order.shippingAddress?.phone && (
                            <p className="mt-2">{order.shippingAddress.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Payment & Summary */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CreditCard size={18} />
                          Payment Summary
                        </h4>
                        <div className="text-sm bg-gray-50 rounded-xl p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>${order.itemsPrice?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span>
                              {order.shippingPrice === 0 ? (
                                <span className="text-green-600">Free</span>
                              ) : (
                                `$${order.shippingPrice?.toFixed(2)}`
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span>${order.taxPrice?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t">
                            <span>Total</span>
                            <span>${order.totalPrice?.toFixed(2)}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-gray-600">
                              Payment Method: <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
                            </p>
                            {order.paidAt && (
                              <p className="text-gray-600">
                                Paid on: <span className="font-medium text-gray-900">{formatDateTime(order.paidAt)}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="p-4 sm:p-6 border-t bg-blue-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Truck size={20} className="text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">Tracking Number</p>
                              <p className="text-sm text-blue-700">{order.trackingNumber}</p>
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            className="text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://track.example.com/${order.trackingNumber}`, '_blank');
                            }}
                          >
                            Track Package
                            <ExternalLink size={14} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="p-4 sm:p-6 border-t flex flex-wrap gap-3">
                      <Link to={`/shop`} onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" className="text-sm">
                          <RefreshCw size={16} className="mr-2" />
                          Buy Again
                        </Button>
                      </Link>
                      {order.status === 'delivered' && (
                        <Button variant="secondary" className="text-sm">
                          Write a Review
                        </Button>
                      )}
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <Button variant="outline" className="text-sm text-red-500 border-red-200 hover:bg-red-50">
                          Cancel Order
                        </Button>
                      )}
                      <Button variant="outline" className="text-sm">
                        Need Help?
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Load More / Pagination placeholder */}
        {filteredOrders.length > 0 && filteredOrders.length >= 10 && (
          <div className="text-center mt-8">
            <Button variant="secondary">
              Load More Orders
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;