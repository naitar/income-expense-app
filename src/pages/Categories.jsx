import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import useCategories from '@/hooks/useCategories'
import { Card, Button, Input, Modal } from '@/components/ui'

// Quick color palette for the picker
const COLORS = [
  '#22c55e', '#16a34a', '#15803d', // greens
  '#ef4444', '#dc2626', '#b91c1c', // reds
  '#f97316', '#ea580c', '#c2410c', // oranges
  '#eab308', '#ca8a04', '#a16207', // yellows
  '#3b82f6', '#2563eb', '#1d4ed8', // blues
  '#8b5cf6', '#7c3aed', '#6d28d9', // purples
  '#ec4899', '#db2777', '#be185d', // pinks
  '#6366f1', '#4f46e5', '#4338ca', // indigos
  '#14b8a6', '#0d9488', '#0f766e', // teals
  '#64748b', '#475569', '#334155', // slates
]

function Categories() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories()

  const [catFormOpen, setCatFormOpen] = useState(false)
  const [editingCat, setEditingCat] = useState(null) // null = add mode
  const [catSaving, setCatSaving] = useState(false)
  const [catError, setCatError] = useState('')

  // ── Category form ────────────────────────────────────────────
  const catForm = useForm({
    defaultValues: { name: '', type: 'expense', color: '#6366f1' },
  })

  // ── Open category form (add or edit) ───────────────────────
  const openCatForm = useCallback((cat) => {
    setCatError('')
    if (cat) {
      setEditingCat(cat)
      catForm.reset({ name: cat.name, type: cat.type, color: cat.color })
    } else {
      setEditingCat(null)
      catForm.reset({ name: '', type: 'expense', color: '#6366f1' })
    }
    setCatFormOpen(true)
  }, [catForm])

  // ── Save category (add or update) ──────────────────────────
  async function onSaveCategory(data) {
    setCatError('')

    if (!data.name.trim()) {
      setCatError('အမျိုးအစား အမည် ထည့်ပါ။')
      return
    }

    setCatSaving(true)

    try {
      if (editingCat) {
        await updateCategory(editingCat.id, {
          name: data.name.trim(),
          type: data.type,
          color: data.color,
        })
      } else {
        await addCategory({
          name: data.name.trim(),
          type: data.type,
          color: data.color,
        })
      }

      setCatFormOpen(false)
      setEditingCat(null)
      catForm.reset({ name: '', type: 'expense', color: '#6366f1' })
    } catch {
      setCatError('သိမ်းဆည်း၍ မရပါ။ ထပ်မံကြိုးစားပါ။')
    } finally {
      setCatSaving(false)
    }
  }

  // ── Delete category ────────────────────────────────────────
  async function handleDeleteCategory(cat) {
    if (!confirm(`"${cat.name}" ကို ဖျက်မှာ သေချာပါသလား။`)) return
    await deleteCategory(cat.id)
  }

  // ── Split by type ──────────────────────────────────────────
  const incomeCats = categories.filter((c) => c.type === 'income')
  const expenseCats = categories.filter((c) => c.type === 'expense')

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">အမျိုးအစားများ</h1>
          <p className="text-gray-500 mt-1">ဝင်ငွေ နှင့် အသုံး အမျိုးအစားများ စီမံရန်</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => openCatForm(null)}>
          + အသစ်ထည့်မည်
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card title="📥 ဝင်ငွေ" subtitle={incomeCats.length > 0 ? `${incomeCats.length} ခု` : undefined}>
          {incomeCats.length === 0 && !loading && (
            <p className="text-sm text-gray-400 text-center py-4">မရှိသေးပါ</p>
          )}
          {incomeCats.length > 0 && (
            <div className="-mx-6 -my-5 divide-y divide-gray-50">
              {incomeCats.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  onEdit={() => openCatForm(cat)}
                  onDelete={() => handleDeleteCategory(cat)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Expense Categories */}
        <Card title="📤 အသုံး" subtitle={expenseCats.length > 0 ? `${expenseCats.length} ခု` : undefined}>
          {expenseCats.length === 0 && !loading && (
            <p className="text-sm text-gray-400 text-center py-4">မရှိသေးပါ</p>
          )}
          {expenseCats.length > 0 && (
            <div className="-mx-6 -my-5 divide-y divide-gray-50">
              {expenseCats.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  onEdit={() => openCatForm(cat)}
                  onDelete={() => handleDeleteCategory(cat)}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          စောင့်ပါ...
        </div>
      )}

      {/* ── Category Modal ───────────────────────────────────── */}
      <Modal
        isOpen={catFormOpen}
        onClose={() => setCatFormOpen(false)}
        title={editingCat ? `ပြင်ဆင်ရန် — ${editingCat.name}` : 'အမျိုးအစားအသစ်'}
        size="sm"
      >
        {catError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {catError}
          </div>
        )}

        <form onSubmit={catForm.handleSubmit(onSaveCategory)} className="space-y-4">
          <Input
            label="အမည်"
            placeholder="ဥပမာ — စားသောက်"
            error={catForm.formState.errors.name?.message}
            {...catForm.register('name', { required: 'အမည် ထည့်ပါ။' })}
          />

          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">အမျိုးအစား</label>
            <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
              {['expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => catForm.setValue('type', t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    catForm.watch('type') === t
                      ? t === 'income' ? 'bg-income text-white shadow-sm' : 'bg-expense text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'income' ? 'ဝင်ငွေ' : 'အသုံး'}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">အရောင်</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => catForm.setValue('color', color)}
                  className={`w-7 h-7 rounded-md transition-transform hover:scale-110 ${
                    catForm.watch('color') === color ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">စိတ်ကြိုက်:</span>
              <input
                type="color"
                value={catForm.watch('color')}
                onChange={(e) => catForm.setValue('color', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              />
              <span className="text-xs text-gray-400 font-mono">{catForm.watch('color')}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCatFormOpen(false)} className="flex-1">
              မလုပ်တော့
            </Button>
            <Button type="submit" variant="primary" loading={catSaving} className="flex-1">
              {editingCat ? 'သိမ်းဆည်းမည်' : 'ထည့်မည်'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Single category row ─────────────────────────────────────────

function CategoryRow({ cat, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 group transition-colors">
      <div className="flex items-center gap-3">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: cat.color }}
        />
        <span className="text-sm text-gray-900">{cat.name}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
          title="ပြင်ဆင်ရန်"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
          title="ဖျက်ရန်"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Categories
