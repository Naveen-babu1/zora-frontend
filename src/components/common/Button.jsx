import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  // Variant styles
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 active:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-green-300',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
    link: 'text-black hover:text-gray-600 underline-offset-4 hover:underline p-0',
  };

  // Size styles
  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  // Icon sizes
  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
  };

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center 
        font-medium rounded-full 
        transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        disabled:cursor-not-allowed
        ${variants[variant]} 
        ${variant !== 'link' ? sizes[size] : ''} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 
          size={iconSizes[size]} 
          className={`animate-spin ${children ? 'mr-2' : ''}`} 
        />
      )}
      
      {/* Left icon */}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon 
          size={iconSizes[size]} 
          className={children ? 'mr-2' : ''} 
        />
      )}
      
      {/* Button text */}
      {children}
      
      {/* Right icon */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon 
          size={iconSizes[size]} 
          className={children ? 'ml-2' : ''} 
        />
      )}
    </button>
  );
};

// Icon-only button variant
export const IconButton = ({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  };

  const sizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4',
  };

  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  return (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center 
        rounded-full transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSizes[size]} className="animate-spin" />
      ) : (
        <Icon size={iconSizes[size]} />
      )}
    </button>
  );
};

export default Button;