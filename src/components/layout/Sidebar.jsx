import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart2,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ArrowLeftRight, label: 'Transactions', path: '/transactions' },
  { icon: BarChart2, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

function LiquidDropIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 4C16 4 8 14 8 20C8 24.4183 11.5817 28 16 28C20.4183 28 24 24.4183 24 20C24 14 16 4 16 4Z"
        fill="#606060"
      />
      <ellipse cx="13" cy="19" rx="2" ry="3" fill="rgba(255,255,255,0.15)" />
    </svg>
  )
}

function getInitials(user) {
  const name = user?.user_metadata?.full_name
  if (name) {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return (user?.email?.[0] || '?').toUpperCase()
}

function SidebarLink({ icon: Icon, label, path }) {
  return (
    <NavLink to={path} end={path === '/'} className="block">
      {({ isActive }) => (
        <motion.div
          className={`group relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl overflow-hidden ${
            isActive
              ? 'text-white'
              : 'text-[#606060] hover:text-[#A0A0A0]'
          }`}
          initial="rest"
          whileHover="hover"
        >
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute inset-0 rounded-xl border-l-[3px] border-white/80"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}

          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
            }}
            variants={{
              rest: { x: '-100%' },
              hover: { x: '100%', transition: { duration: 0.5, ease: 'easeInOut' } },
            }}
          />

          <Icon
            className={`relative z-10 w-5 h-5 shrink-0 mx-auto lg:mx-0 ${
              isActive ? 'text-white' : 'text-[#404040] group-hover:text-[#808080]'
            }`}
            strokeWidth={1.75}
          />
          <span className="relative z-10 hidden lg:block text-sm font-medium whitespace-nowrap">
            {label}
          </span>
        </motion.div>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.user_metadata?.full_name || 'User'
  const email = user?.email || ''
  const initials = getInitials(user)

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <aside
      className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:h-screen lg:w-[240px] shrink-0 flex-col"
      style={{
        background: '#111111',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-8 lg:px-6">
        <div className="mx-auto lg:mx-0 shrink-0">
          <LiquidDropIcon />
        </div>
        <span className="hidden font-clash text-xl font-bold text-white lg:block whitespace-nowrap">
          BudgetFlow
        </span>
      </div>

      <nav className="flex-1 space-y-1 pb-36">
        {NAV_LINKS.map((link) => (
          <SidebarLink key={link.path} {...link} />
        ))}
      </nav>

      <div
        className="absolute bottom-0 left-0 right-0 border-t px-3 py-4 lg:px-4"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex flex-col items-center gap-3 lg:items-stretch">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[#A0A0A0]"
              style={{
                background: '#1E1E1E',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              {initials}
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-xs text-[#606060]">{email}</p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-[#606060] transition-colors hover:text-white lg:justify-start"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="hidden lg:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </aside>
  )
}
