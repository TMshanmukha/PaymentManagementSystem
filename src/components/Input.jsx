import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, className = '', type, onWheel, style, ...props }, ref) {
  const handleWheel = (e) => {
    if (type === 'number') {
      e.currentTarget.blur();
    }
    onWheel?.(e);
  };

  const numberInputStyle = type === 'number' ? { MozAppearance: 'textfield', appearance: 'textfield', ...style } : style;

  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        type={type}
        onWheel={handleWheel}
        style={numberInputStyle}
        className={`input ${
          type === 'number'
            ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden'
            : ''
        } ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
});
