import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Minus, 
  Plus, 
  Star, 
  Truck, 
  Shield, 
  RefreshCw,
  ChevronRight,
  Check
} from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button, PageLoader } from '../components/common';
import toast from 'react-hot-toast';

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      // Try fetching by slug first, then by ID
      let data;
      try {
        data = await productService.getProduct(slug);
      } catch (err) {
        // If not found, the error will be caught below
        throw err;
      }
      
      if (!data || !data.product) {
        throw new Error('Product not found');
      }
      
      setProduct(data.product);
      
      // Fetch related products
      if (data.product?.category) {
        try {
          const categoryId = data.product.category._id || data.product.category;
          const related = await productService.getProducts({ 
            category: categoryId,
            limit: 5 
          });
          setRelatedProducts(
            related.products.filter(p => p._id !== data.product._id).slice(0, 4)
          );
        } catch (relatedErr) {
          console.log('Could not fetch related products');
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Product not found');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      navigate('/signin');
      return;
    }
    
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue');
      navigate('/signin');
      return;
    }
    
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      navigate('/checkout');
    } catch (err) {
      toast.error('Failed to proceed');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return null;

  const images = product.images?.length > 0 
    ? product.images 
    : [{ url: 'https://via.placeholder.com/600x600?text=No+Image' }];

  const discount = product.comparePrice 
    ? Math.round((1 - product.price / product.comparePrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-black">Shop</Link>
          <ChevronRight size={14} />
          {product.category?.name && (
            <>
              <Link 
                to={`/shop?category=${product.category._id}`} 
                className="hover:text-black"
              >
                {product.category.name}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl p-6 lg:p-10">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                <img
                  src={images[selectedImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx 
                          ? 'border-black' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              {/* Category & Rating */}
              <div className="flex items-center gap-4 mb-3">
                {product.category?.name && (
                  <span className="text-sm text-gray-500 uppercase tracking-wide">
                    {product.category.name}
                  </span>
                )}
                {product.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-gray-400">
                      ({product.numReviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                {product.comparePrice > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ${product.comparePrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {product.stock > 0 ? (
                  <>
                    <Check size={18} className="text-green-600" />
                    <span className="text-green-600 font-medium">
                      In Stock
                    </span>
                    {product.stock < 10 && (
                      <span className="text-orange-500 text-sm">
                        (Only {product.stock} left)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-gray-600">Quantity:</span>
                  <div className="flex items-center border rounded-full">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-3 hover:bg-gray-100 rounded-l-full transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="p-3 hover:bg-gray-100 rounded-r-full transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  loading={addingToCart}
                  className="flex-1"
                  variant="secondary"
                >
                  <ShoppingBag size={20} className="mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1"
                >
                  Buy Now
                </Button>
                <button className="p-4 border rounded-full hover:bg-gray-50 transition-colors">
                  <Heart size={20} />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t">
                <div className="text-center">
                  <Truck size={24} className="mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Free Shipping</p>
                  <p className="text-xs text-gray-400">Orders over $50</p>
                </div>
                <div className="text-center">
                  <Shield size={24} className="mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Secure Payment</p>
                  <p className="text-xs text-gray-400">100% Protected</p>
                </div>
                <div className="text-center">
                  <RefreshCw size={24} className="mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Easy Returns</p>
                  <p className="text-xs text-gray-400">30 Day Policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(item => (
                <Link
                  key={item._id}
                  to={`/product/${item.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={item.images?.[0]?.url || 'https://via.placeholder.com/300'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="text-lg font-bold mt-1">${item.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;