import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeftRight, Plus, BarChart2, User } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Home', path: '/', icon: Home, end: true },
  { id: 'transactions', label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { id: 'add', label: 'Add', isAdd: true },
  { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart2 },
  { id: 'profile', label: 'Profile', path: '/settings', icon: User },
]

function Ripple({ x, y }) {
  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: 24,
        height: 24,
        marginLeft: -12,
        marginTop: -12,
        background: 'rgba(255,255,255,0.20)',
      }}
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  )
}

function NavTab({ tab }) {
  const Icon = tab.icon

  return (
    <NavLink to={tab.path} end={tab.end} className="flex flex-1 justify-center">
      {({ isActive }) => (
        <div className="flex flex-col items-center gap-0.5 py-2 min-w-0">
          <Icon
            className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#404040]'}`}
            strokeWidth={1.75}
          />
          {isActive && (
            <motion.div
              layoutId="mobileTabDot"
              className="w-1 h-1 rounded-full bg-white"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <span
            className={`text-[10px] font-medium truncate ${
              isActive ? 'text-white' : 'text-[#404040]'
            }`}
          >
            {tab.label}
          </span>
        </div>
      )}
    </NavLink>
  )
}

export default function BottomNav({ onAddTransaction }) {
  const [ripples, setRipples] = useState([])

  const handleAddTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples((prev) => [...prev, { id, x, y }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
      onAddTransaction?.()
    }, 600)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-[72px] items-end lg:hidden"
      style={{
        background: 'rgba(13,13,13,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {TABS.map((tab) =>
        tab.isAdd ? (
          <div key={tab.id} className="flex flex-1 justify-center">
            <motion.button
              type="button"
              onClick={handleAddTap}
              whileTap={{ scale: 0.9 }}
              className="relative -mt-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full"
              style={{
                background: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
              }}
              aria-label="Add transaction"
            >
              {ripples.map((ripple) => (
                <Ripple key={ripple.id} x={ripple.x} y={ripple.y} />
              ))}
              <Plus className="h-6 w-6 text-[#0D0D0D]" strokeWidth={2.5} />
            </motion.button>
          </div>
        ) : (
          <NavTab key={tab.id} tab={tab} />
        )
      )}
    </nav>
  )
}
