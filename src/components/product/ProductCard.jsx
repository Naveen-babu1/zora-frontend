import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Use slug if available, otherwise use _id
  const productLink = `/product/${product.slug || product._id}`;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product._id, 1);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <Link
      to={productLink}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-1 bg-black text-white text-xs font-semibold rounded-lg">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded-lg">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
        </button>

        {/* Quick Actions - Show on Hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transform transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingToCart ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Cart
                </>
              )}
            </button>
            <button className="p-2.5 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors">
              <Eye size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category?.name && (
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ${product.price?.toFixed(2)}
          </span>
          {product.comparePrice > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ${product.comparePrice?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Warning */}
        {product.stock > 0 && product.stock < 10 && (
          <p className="text-xs text-orange-500 mt-2">
            Only {product.stock} left in stock
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;