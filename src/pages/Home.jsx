import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, RefreshCw, CreditCard } from 'lucide-react';
import { productService } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import { PageLoader } from '../components/common';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts({ featured: true, limit: 8 });
        setProducts(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center bg-gradient-to-br from-amber-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-600 font-medium mb-4 tracking-wide">NEW COLLECTION 2025</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight mb-6">
                Elevate Your <br />
                <span className="font-semibold">Living with ZORA</span>
              </h1>
              <p className="text-gray-600 text-lg mb-8 max-w-md">
                Discover curated pieces that blend timeless design with modern functionality.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition flex items-center gap-2"
                >
                  Shop Now <ChevronRight size={18} />
                </Link>
                {/* <button className="border border-gray-300 px-8 py-4 rounded-full hover:border-gray-400 transition">
                  View Lookbook
                </button> */}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-amber-100 to-rose-100 rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-lg">
                <p className="text-sm text-gray-500">Starting from</p>
                <p className="text-2xl font-semibold">$35</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day policy' },
              { icon: CreditCard, title: 'Flexible Pay', desc: 'Buy now, pay later' },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <feature.icon size={24} />
                </div>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-amber-600 font-medium mb-2">FEATURED</p>
              <h2 className="text-3xl font-light">Bestsellers</h2>
            </div>
            <Link
              to="/shop"
              className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No products available yet.</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-light mb-4">Join Our Newsletter</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Subscribe to get special offers, free giveaways, and new arrivals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full bg-gray-800 border border-gray-700 focus:outline-none focus:border-gray-500 text-white"
            />
            <button className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;