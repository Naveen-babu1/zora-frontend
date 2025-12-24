import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { PageLoader, Modal, Button } from '../../components/common';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => { orderService.getAllOrders().then(data => setOrders(data.orders)).catch(console.error).finally(() => setLoading(false)); }, []);

  const updateStatus = async () => {
    try { await orderService.updateOrderStatus(selected._id, { status }); toast.success('Updated'); setSelected(null); orderService.getAllOrders().then(data => setOrders(data.orders)); }
    catch (err) { toast.error(err.message); }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.user?.name || order.shippingAddress?.fullName}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{order.status}</span></td>
                <td className="px-6 py-4 font-medium">${order.totalPrice?.toFixed(2)}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => { setSelected(order); setStatus(order.status); }} className="text-sm text-blue-600">Update</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Update Order">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input mb-4">
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setSelected(null)} className="flex-1">Cancel</Button>
          <Button onClick={updateStatus} className="flex-1">Update</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrders;