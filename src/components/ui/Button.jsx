import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-white text-[#0D0D0D] hover:bg-[#E0E0E0] font-semibold',
  secondary: 'glass text-white hover:bg-white/5',
  danger: 'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30',
  ghost: 'text-[#A0A0A0] hover:text-white hover:bg-white/5',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-medium rounded-xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  )
}
