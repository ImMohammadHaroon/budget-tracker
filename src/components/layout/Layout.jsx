import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import LiquidBlob from '../ui/LiquidBlob'
import AddTransactionModal from '../modals/AddTransactionModal'

export default function Layout() {
  const [modalOpen, setModalOpen] = useState(false)
  const location = useLocation()

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  return (
    <div className="min-h-screen relative overflow-hidden bg-bg">
      <LiquidBlob color="#2A2A2A" size={400} top="-128px" left="-128px" opacity={0.6} />
      <LiquidBlob color="#1E1E1E" size={350} bottom="-128px" right="-128px" delay={3} opacity={0.6} blur={90} />
      <LiquidBlob color="#333333" size={280} top="50%" left="50%" delay={5} opacity={0.5} blur={80} />

      <Sidebar />

      <div className="flex flex-col min-h-screen lg:ml-[240px] relative z-10">
        <Navbar onAddTransaction={openModal} />

        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet context={{ openAddTransaction: openModal }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav onAddTransaction={openModal} />

      <AddTransactionModal
        open={modalOpen}
        onOpen={openModal}
        onClose={closeModal}
      />
    </div>
  )
}
