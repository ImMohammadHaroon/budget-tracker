import { motion } from 'framer-motion'

const BLOB_RADIUS = [
  '60% 40% 30% 70% / 60% 30% 70% 40%',
  '30% 60% 70% 40% / 50% 60% 30% 60%',
  '50% 60% 30% 60% / 30% 60% 70% 40%',
  '60% 30% 60% 40% / 40% 60% 30% 70%',
  '60% 40% 30% 70% / 60% 30% 70% 40%',
]

export default function LiquidBlob({
  color = '#252525',
  size = 400,
  top,
  left,
  right,
  bottom,
  delay = 0,
  duration = 10,
  opacity = 0.7,
  blur = 100,
}) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: color,
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
      }}
      animate={{ borderRadius: BLOB_RADIUS }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}
