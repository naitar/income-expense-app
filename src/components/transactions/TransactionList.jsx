import TransactionItem from './TransactionItem'
import { EmptyState } from '@/components/ui'

function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="ငွေလွှဲမှတ်တမ်း မရှိသေးပါ"
        description="အပေါ်ရှိ &quot;အသစ်ထည့်ရန်&quot ခလုတ်ကို နှိပ်ပြီး ဝင်ငွေ နှင့် အသုံးစာရင်း စတင်မှတ်တမ်းတင်ပါ။"
        size="lg"
      />
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default TransactionList
