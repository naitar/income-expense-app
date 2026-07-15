import { useState, useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/store/AuthContext'
import { Card, Button, Input } from '@/components/ui'

function ForgotPassword() {
  const { user, resetPassword } = useAuth()
  const [serverError, setServerError] = useState('')
  const [serverSuccess, setServerSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const cooldownTimer = useRef(null)

  useEffect(() => {
    if (cooldown > 0) {
      cooldownTimer.current = setTimeout(() => setCooldown((c) => c - 1), 1000)
      return () => clearTimeout(cooldownTimer.current)
    }
  }, [cooldown])

  function isRateLimitError(message) {
    const msg = (message || '').toLowerCase()
    return msg.includes('rate limit') || msg.includes('too many') || msg.includes('429')
  }

  const form = useForm({
    defaultValues: { email: '' },
  })

  if (user) {
    return <Navigate to="/" replace />
  }

  function translateError(message) {
    const msg = (message || '').toLowerCase()
    if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('429'))
      return 'ကြိုးစားမှု များလွန်းပါသည်။ ၆၀ စက္ကန့် စောင့်ပြီးမှ ထပ်ကြိုးစားပါ။'
    if (msg.includes('not found') || msg.includes('invalid email'))
      return 'အီးမေးလ် မတွေ့ပါ။ မှတ်ပုံတင်ထားသော အီးမေးလ်ကို ထည့်ပါ။'
    return message || 'တစ်ခုခု မှားယွင်းနေပါသည်။ ထပ်မံကြိုးစားပါ။'
  }

  async function onSubmit(data) {
    setServerError('')
    setServerSuccess('')
    setSubmitting(true)
    try {
      const { error } = await resetPassword(data.email)
      if (error) {
        setServerError(translateError(error.message))
        if (isRateLimitError(error.message)) setCooldown(60)
        return
      }
      setServerSuccess('စကားဝှက်ပြန်လည်သတ်မှတ်ရန် လင့်ခ်ကို သင့်အီးမေးလ်ထဲတွင် ပို့ပေးပါပြီ။ အီးမေးလ်ကို စစ်ဆေးပါ။')
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">စကားဝှက် ပြန်လည်သတ်မှတ်ရန်</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">သင့်အီးမေးလ်လိပ်စာကို ထည့်ပါ။</p>
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
              label="အီးမေးလ်"
              type="email"
              placeholder="you@example.com"
              error={form.formState.errors.email?.message}
              {...form.register('email', {
                required: 'အီးမေးလ် ထည့်ပါ။',
              })}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              disabled={cooldown > 0}
              className="w-full"
            >
              {cooldown > 0 ? `${cooldown} စက္ကန့် စောင့်ပါ...` : 'ပြန်လည်သတ်မှတ်ရန် လင့်ခ် ပို့ရန်'}
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

export default ForgotPassword
