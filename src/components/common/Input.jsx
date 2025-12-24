import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

export const Input = ({
  label,
  error,
  success,
  hint,
  icon,
  type = 'text',
  className = '',
  inputClassName = '',
  required = false,
  disabled = false,
  showPasswordToggle = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  // Check if icon is a React element or a component
  const renderIcon = () => {
    if (!icon) return null;
    
    // If it's already a JSX element (e.g., <User size={18} />)
    if (typeof icon === 'object' && icon.$$typeof) {
      return icon;
    }
    
    // If it's a component reference (e.g., User)
    const IconComponent = icon;
    return <IconComponent size={18} className={`${error ? 'text-red-400' : isFocused ? 'text-black' : 'text-gray-400'} transition-colors`} />;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            {renderIcon()}
          </div>
        )}

        {/* Input Field */}
        <input
          type={inputType}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 
            border rounded-xl 
            bg-white
            transition-all duration-200
            placeholder:text-gray-400
            focus:outline-none focus:ring-1
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${(isPassword && showPasswordToggle) || error || success ? 'pr-10' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : success 
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-200 focus:border-black focus:ring-black'
            }
            ${inputClassName}
          `}
          {...props}
        />

        {/* Right Side Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Success Icon */}
          {success && !error && !isPassword && (
            <Check size={18} className="text-green-500" />
          )}

          {/* Error Icon */}
          {error && !isPassword && (
            <AlertCircle size={18} className="text-red-500" />
          )}

          {/* Password Toggle */}
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {/* Success Message */}
      {success && typeof success === 'string' && (
        <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
          <Check size={14} />
          {success}
        </p>
      )}

      {/* Hint Text */}
      {hint && !error && !success && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
};

// Textarea Component
export const Textarea = ({
  label,
  error,
  hint,
  className = '',
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  showCount = false,
  value = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        value={value}
        className={`
          w-full px-4 py-3 
          border rounded-xl 
          bg-white
          transition-all duration-200
          placeholder:text-gray-400
          focus:outline-none focus:ring-1 focus:border-black focus:ring-black
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          resize-none
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'}
        `}
        {...props}
      />

      {/* Bottom Row */}
      <div className="flex justify-between items-center mt-1.5">
        {/* Error or Hint */}
        <div>
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="text-sm text-gray-500">{hint}</p>
          )}
        </div>

        {/* Character Count */}
        {showCount && maxLength && (
          <p className={`text-xs ${String(value).length >= maxLength ? 'text-red-500' : 'text-gray-400'}`}>
            {String(value).length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

// Select Component
export const Select = ({
  label,
  error,
  hint,
  icon,
  options = [],
  placeholder = 'Select an option',
  className = '',
  required = false,
  disabled = false,
  ...props
}) => {
  // Check if icon is a React element or a component
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'object' && icon.$$typeof) {
      return icon;
    }
    
    const IconComponent = icon;
    return <IconComponent size={18} className="text-gray-400" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {renderIcon()}
          </div>
        )}

        {/* Select Field */}
        <select
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 
            border border-gray-200 rounded-xl 
            bg-white
            transition-all duration-200
            focus:outline-none focus:border-black focus:ring-1 focus:ring-black
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {/* Hint Text */}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
};

// Checkbox Component
export const Checkbox = ({
  label,
  description,
  error,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`${className}`}>
      <label className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          disabled={disabled}
          className={`
            mt-0.5 w-5 h-5 
            rounded border-gray-300 
            text-black 
            focus:ring-black focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : ''}
          `}
          {...props}
        />
        <div>
          {label && (
            <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              {label}
            </span>
          )}
          {description && (
            <p className={`text-sm ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
      </label>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 ml-8">{error}</p>
      )}
    </div>
  );
};

export default Input;