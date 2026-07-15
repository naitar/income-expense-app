import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/store/AuthContext'
import { Card, Button, Input } from '@/components/ui'

function ResetPassword() {
  const { user, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [serverSuccess, setServerSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const form = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  })

  if (user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(data) {
    setServerError('')
    setServerSuccess('')

    if (data.password !== data.confirmPassword) {
      setServerError('စကားဝှက်နှစ်ခု မတူညီပါ။')
      return
    }

    if (data.password.length < 6) {
      setServerError('စကားဝှက် အနည်းဆုံး အက္ခရာ ၆ လုံး ထည့်ပါ။')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await updatePassword(data.password)
      if (error) {
        setServerError(error.message || 'စကားဝှက် ပြောင်းလဲ၍ မရပါ။')
        return
      }
      setServerSuccess('စကားဝှက် ပြောင်းလဲပြီးပါပြီ။')
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch {
      setServerError('အင်တာနက်ချိတ်ဆက်မှု စစ်ဆေးပါ။')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo192.png" alt="Logo" className="inline-flex w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-green-200 dark:shadow-green-900/30" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">စကားဝှက် အသစ် သတ်မှတ်ရန်</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">စကားဝှက် အသစ်ကို ထည့်ပါ။</p>
        </div>

        <Card>
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-400">
              {serverError}
            </div>
          )}

          {serverSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-sm text-green-700 dark:text-green-400">
              {serverSuccess}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="စကားဝှက် အသစ်"
              type="password"
              placeholder="အနည်းဆုံး ၆ လုံး"
              error={form.formState.errors.password?.message}
              {...form.register('password', {
                required: 'စကားဝှက် ထည့်ပါ။',
                minLength: { value: 6, message: 'အနည်းဆုံး အက္ခရာ ၆ လုံး ထည့်ပါ။' },
              })}
            />
            <Input
              label="စကားဝှက် အတည်ပြုရန်"
              type="password"
              placeholder="စကားဝှက်ကို ပြန်ရိုက်ပါ။"
              error={form.formState.errors.confirmPassword?.message}
              {...form.register('confirmPassword', {
                required: 'စကားဝှက်ကို ပြန်ရိုက်ပါ။',
                validate: (value) =>
                  value === form.watch('password') || 'စကားဝှက်နှစ်ခု မတူညီပါ။',
              })}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full"
            >
              စကားဝှက် ပြောင်းလဲရန်
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            <Link to="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
              ← ဝင်ရန် စာမျက်နှာသို့ ပြန်သွားရန်
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword
