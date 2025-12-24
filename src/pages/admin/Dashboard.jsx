import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { PageLoader } from '../../components/common';

const Dashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, avgOrder: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([orderService.getAllOrders(), productService.getAdminProducts()]);
        setStats({
          revenue: ordersData.stats?.totalRevenue || 0,
          orders: ordersData.stats?.totalOrders || 0,
          products: productsData.total || 0,
          avgOrder: ordersData.stats?.avgOrderValue || 0,
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  const cards = [
    { title: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { title: 'Orders', value: stats.orders, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { title: 'Products', value: stats.products, icon: Package, color: 'bg-amber-100 text-amber-600' },
    { title: 'Avg Order', value: `$${stats.avgOrder.toFixed(2)}`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border">
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
              <card.icon size={24} />
            </div>
            <p className="text-gray-500 text-sm">{card.title}</p>
            <p className="text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;