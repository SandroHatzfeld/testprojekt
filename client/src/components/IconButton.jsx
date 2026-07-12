const variants = {
  default: 'text-gray-400 hover:bg-gray-100 hover:text-brand-navy',
  danger: 'text-gray-400 hover:bg-red-50 hover:text-red-600',
  success: 'text-gray-400 hover:bg-green-50 hover:text-green-600',
};

export default function IconButton({ onClick, label, variant = 'default', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-lg p-1.5 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
