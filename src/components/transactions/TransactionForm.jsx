import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Modal, Button, Input } from '@/components/ui'
import useCategories from '@/hooks/useCategories'

function TransactionForm({ isOpen, onClose, onSubmit, editTransaction }) {
  const isEdit = Boolean(editTransaction)
  const { categories } = useCategories()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const selectedType = watch('type')

  // Filter categories by selected type
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType]
  )

  useEffect(() => {
    if (editTransaction) {
      reset({
        type: editTransaction.type,
        amount: editTransaction.amount,
        category: editTransaction.category,
        description: editTransaction.description || '',
        date: editTransaction.date,
      })
    } else {
      reset({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      })
    }
  }, [editTransaction, isOpen, reset])

  const onFormSubmit = async (data) => {
    const payload = {
      ...data,
      amount: Number(data.amount),
    }
    await onSubmit(payload)
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'ပြင်ဆင်ရန်' : 'အသစ်ထည့်ရန်'}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        {/* Type toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">အမျိုးအစား</label>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700">
            <button
              type="button"
              onClick={() => {
                register('type').onChange({ target: { value: 'expense', name: 'type' } })
                register('category').onChange({ target: { value: '', name: 'category' } })
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedType === 'expense'
                  ? 'bg-expense text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              အသုံး
            </button>
            <button
              type="button"
              onClick={() => {
                register('type').onChange({ target: { value: 'income', name: 'type' } })
                register('category').onChange({ target: { value: '', name: 'category' } })
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedType === 'income'
                  ? 'bg-income text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              ဝင်ငွေ
            </button>
          </div>
          <input type="hidden" {...register('type', { required: true })} />
        </div>

        {/* Amount */}
        <Input
          label="ငွေပမာဏ"
          type="number"
          step="1"
          min="1"
          placeholder="ငွေပမာဏ ထည့်ပါ"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'ငွေပမာဏ ထည့်ပါ။',
            min: { value: 1, message: 'အနည်းဆုံး ၁ ဖြစ်ရပါမည်။' },
            valueAsNumber: false,
          })}
        />

        {/* Category */}
        <div className="w-full overflow-hidden">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            အမျိုးအစား
          </label>
          <select
            id="category"
            className={`w-full max-w-full px-3 py-2 text-sm border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700
              truncate
              focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
              ${errors.category
                ? 'border-red-300 dark:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              }`}
            {...register('category', { required: 'အမျိုးအစား ရွေးပါ။' })}
          >
            <option value="">အမျိုးအစား ရွေးပါ</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>
          )}
        </div>

        {/* Description */}
        <Input
          label="မှတ်ချက်"
          placeholder="ဘာအတွက်လဲ? (ရှိလျှင်)"
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Date */}
        <Input
          label="ရက်စွဲ"
          type="date"
          error={errors.date?.message}
          {...register('date', { required: 'ရက်စွဲ ထည့်ပါ။' })}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            မလုပ်တော့
          </Button>
          <Button
            type="submit"
            variant={selectedType === 'income' ? 'income' : 'expense'}
            loading={isSubmitting}
            className="flex-1"
          >
            {isEdit ? 'သိမ်းဆည်းမည်' : 'ထည့်မည်'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TransactionForm
