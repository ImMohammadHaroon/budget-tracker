import { useState } from 'react'
import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  hover = true,
  onClick,
  delay = 0,
  animated = true,
  style,
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
        ...style,
      }}
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay }}
      whileHover={
        hover
          ? {
              scale: 1.01,
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.10)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }
          : {}
      }
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`rounded-3xl p-6 relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {hover && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
