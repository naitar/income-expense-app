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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        {/* Type toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => {
                register('type').onChange({ target: { value: 'expense', name: 'type' } })
                register('category').onChange({ target: { value: '', name: 'category' } })
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedType === 'expense'
                  ? 'bg-expense text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Expense
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
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Income
            </button>
          </div>
          <input type="hidden" {...register('type', { required: true })} />
        </div>

        {/* Amount */}
        <Input
          label="Amount"
          type="number"
          step="1"
          min="1"
          placeholder="Enter amount"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 1, message: 'Must be at least 1' },
            valueAsNumber: false,
          })}
        />

        {/* Category */}
        <div className="w-full overflow-hidden">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            className={`w-full max-w-full px-3 py-2 text-sm border rounded-lg text-gray-900 bg-white
              truncate
              focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
              ${errors.category
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            {...register('category', { required: 'Category is required' })}
          >
            <option value="">Select a category</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Description */}
        <Input
          label="Description"
          placeholder="What was this for? (optional)"
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Date */}
        <Input
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date', { required: 'Date is required' })}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            variant={selectedType === 'income' ? 'income' : 'expense'}
            loading={isSubmitting}
            className="flex-1"
          >
            {isEdit ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TransactionForm
