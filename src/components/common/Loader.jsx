import { Loader2 } from 'lucide-react';

// Inline Loader (for buttons, small areas)
export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-gray-400`} />
    </div>
  );
};

// Full Page Loader
export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
};

// Overlay Loader (for modals, sections)
export const OverlayLoader = () => {
  return (
    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-inherit">
      <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
    </div>
  );
};

// Skeleton Loader for cards
export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
};

// Skeleton Loader for text lines
export const SkeletonText = ({ lines = 3 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

export default Loader;