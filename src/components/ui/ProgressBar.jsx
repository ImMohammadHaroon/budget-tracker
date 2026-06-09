import { motion } from 'framer-motion'

export default function ProgressBar({
  value = 0,
  max = 100,
  barStyle,
  height = 'h-2',
  showLabel = false,
  className = '',
}) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const isOver = value > max && max > 0

  const defaultBarStyle = isOver
    ? {
        background: 'linear-gradient(90deg, #4A2A2A, #7A3535)',
        animation: 'pulse 2s ease-in-out infinite',
      }
    : {
        background: 'linear-gradient(90deg, #2A2A2A, #606060, #2A2A2A)',
        backgroundSize: '200% 100%',
        animation: 'liquidFlow 3s ease infinite',
      }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[#606060] mb-1">
          <span>{Math.round(percent)}%</span>
          {isOver && <span className="text-danger">Over budget</span>}
        </div>
      )}
      <div
        className={`${height} rounded-full overflow-hidden`}
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={barStyle || defaultBarStyle}
          className="h-full rounded-full"
        />
      </div>
    </div>
  )
}
