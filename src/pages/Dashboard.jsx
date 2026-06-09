import HeroCard from '../components/dashboard/HeroCard'
import TransactionList from '../components/dashboard/TransactionList'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <HeroCard />
      <TransactionList />
    </div>
  )
}
