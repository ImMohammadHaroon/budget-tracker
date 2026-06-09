import { Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

export default function Navbar({ onAddTransaction }) {
  const { user, signOut } = useAuth()

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex-1 lg:hidden" />

        <div className="lg:hidden">
          <span className="font-clash text-xl font-bold text-white">BudgetFlow</span>
        </div>

        <div className="hidden lg:block flex-1">
          <h2 className="text-lg font-semibold text-white">
            Welcome back
            {user?.user_metadata?.full_name
              ? `, ${user.user_metadata.full_name.split(' ')[0]}`
              : ''}
          </h2>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <button
            type="button"
            className="relative p-2 rounded-lg text-[#606060] hover:text-white hover:bg-white/5 transition-colors lg:hidden"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#808080]" />
          </button>

          <div className="hidden lg:flex items-center gap-3">
            <Button size="sm" onClick={onAddTransaction}>
              + Add Transaction
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
