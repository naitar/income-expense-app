import { useState, useEffect, useRef } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/store/AuthContext'
import { Card, Button, Input } from '@/components/ui'

/**
 * Login / Register combined page with tabs.
 * Redirects to "/" if the user is already logged in.
 * Error messages are displayed in မြန်မာဘာသာ (Myanmar).
 */
function Login() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [serverError, setServerError] = useState('')
  const [serverSuccess, setServerSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0) // seconds remaining
  const cooldownTimer = useRef(null)

  const from = location.state?.from?.pathname || '/'

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      cooldownTimer.current = setTimeout(() => setCooldown((c) => c - 1), 1000)
      return () => clearTimeout(cooldownTimer.current)
    }
  }, [cooldown])

  // ── Login form ──────────────────────────────────────────────
  const loginForm = useForm({
    defaultValues: { email: '', password: '' },
  })

  // ── Register form ───────────────────────────────────────────
  const registerForm = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  // ── Already logged in → redirect ────────────────────────────
  if (user) {
    return <Navigate to={from} replace />
  }

  // ── Check if error is rate-limiting ──────────────────────────
  function isRateLimitError(message) {
    const msg = (message || '').toLowerCase()
    return msg.includes('rate limit') || msg.includes('too many') || msg.includes('429')
  }

  // ── Translate Supabase errors → Myanmar ─────────────────────
  function translateError(message) {
    const msg = (message || '').toLowerCase()
    // Log the raw error so we can see what Supabase actually returned
    console.error('[Supabase Auth Error]', message)

    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials'))
      return 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။'
    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already'))
      return 'ဤအီးမေးလ်ဖြင့် မှတ်ပုံတင်ပြီးသား ဖြစ်ပါသည်။'
    if (msg.includes('email not confirmed'))
      return 'အီးမေးလ် အတည်မပြုရသေးပါ။ အီးမေးလ်ထဲတွင် အတည်ပြုလင့်ခ်ကို စစ်ဆေးပါ။'
    if (isRateLimitError(message))
      return 'ကြိုးစားမှု များလွန်းပါသည်။ ၆၀ စက္ကန့် စောင့်ပြီးမှ ထပ်ကြိုးစားပါ။'
    if (msg.includes('weak password'))
      return 'စကားဝှက် အားနည်းပါသည်။ အနည်းဆုံး အက္ခရာ ၆ လုံး ထည့်ပါ။'
    if (msg.includes('invalid email') || msg.includes('email format'))
      return 'အီးမေးလ် ပုံစံ မမှန်ကန်ပါ။'
    if (msg.includes('password'))
      return 'စကားဝှက် မမှန်ကန်ပါ။'
    // For unrecognized errors, show the original message so the user knows what happened
    return message || 'တစ်ခုခု မှားယွင်းနေပါသည်။ ထပ်မံကြိုးစားပါ။'
  }

  // ── Login submit ────────────────────────────────────────────
  async function onLogin(data) {
    setServerError('')
    setServerSuccess('')
    setSubmitting(true)
    try {
      const { data: result, error } = await signIn(data.email, data.password)
      if (error) {
        setServerError(translateError(error.message))
        if (isRateLimitError(error.message)) setCooldown(60)
        return
      }

      if (result?.session) {
        navigate(from, { replace: true })
      } else {
        setServerError('အကောင့် အတည်မပြုရသေးပါ။ အီးမေးလ် စစ်ဆေးပါ။')
      }
    } catch {
      setServerError('အင်တာနက်ချိတ်ဆက်မှု စစ်ဆေးပါ။')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Register submit ─────────────────────────────────────────
  async function onRegister(data) {
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
      const { data: result, error } = await signUp(data.email, data.password, {
        full_name: data.name || '',
      })

      if (error) {
        setServerError(translateError(error.message))
        if (isRateLimitError(error.message)) setCooldown(60)
        return
      }

      // If session exists → email confirmation is off, user is auto-logged in
      if (result?.session) {
        navigate(from, { replace: true })
        return
      }

      // No session → email confirmation is required
      setServerSuccess('မှတ်ပုံတင်ပြီးပါပြီ။ အီးမေးလ် ထဲတွင် အတည်ပြုလင့်ခ်ကို စစ်ဆေးပါ။')
      setTab('login')
    } catch {
      setServerError('အင်တာနက်ချိတ်ဆက်မှု စစ်ဆေးပါ။')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo192.png" alt="Logo" className="inline-flex w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-green-200 dark:shadow-green-900/30" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income Expense</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ဝင်ငွေ / အသုံးစာရင်း မှတ်တမ်း</p>
        </div>

        <Card>
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-700 -mx-6 -mt-5 mb-6">
            <button
              onClick={() => { setTab('login'); setServerError(''); setServerSuccess(''); setCooldown(0) }}
              className={`flex-1 py-3.5 text-sm font-medium text-center transition-colors ${
                tab === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              ဝင်ရန်
            </button>
            <button
              onClick={() => { setTab('register'); setServerError(''); setServerSuccess(''); setCooldown(0) }}
              className={`flex-1 py-3.5 text-sm font-medium text-center transition-colors ${
                tab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              မှတ်ပုံတင်ရန်
            </button>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-400">
              {serverError}
            </div>
          )}

          {/* Server success */}
          {serverSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-sm text-green-700 dark:text-green-400">
              {serverSuccess}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <Input
                label="အီးမေးလ်"
                type="email"
                placeholder="you@example.com"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email', {
                  required: 'အီးမေးလ် ထည့်ပါ။',
                })}
              />
              <Input
                label="စကားဝှက်"
                type="password"
                placeholder="••••••••"
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password', {
                  required: 'စကားဝှက် ထည့်ပါ။',
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
                {cooldown > 0 ? `${cooldown} စက္ကန့် စောင့်ပါ...` : 'ဝင်ရန်'}
              </Button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <Input
                label="အမည်"
                type="text"
                placeholder="မောင်မောင်"
                error={registerForm.formState.errors.name?.message}
                {...registerForm.register('name')}
              />
              <Input
                label="အီးမေးလ်"
                type="email"
                placeholder="you@example.com"
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email', {
                  required: 'အီးမေးလ် ထည့်ပါ။',
                })}
              />
              <Input
                label="စကားဝှက်"
                type="password"
                placeholder="အနည်းဆုံး ၆ လုံး"
                error={registerForm.formState.errors.password?.message}
                {...registerForm.register('password', {
                  required: 'စကားဝှက် ထည့်ပါ။',
                  minLength: { value: 6, message: 'အနည်းဆုံး အက္ခရာ ၆ လုံး ထည့်ပါ။' },
                })}
              />
              <Input
                label="စကားဝှက် အတည်ပြုရန်"
                type="password"
                placeholder="စကားဝှက်ကို ပြန်ရိုက်ပါ။"
                error={registerForm.formState.errors.confirmPassword?.message}
                {...registerForm.register('confirmPassword', {
                  required: 'စကားဝှက်ကို ပြန်ရိုက်ပါ။',
                  validate: (value) =>
                    value === registerForm.watch('password') || 'စကားဝှက်နှစ်ခု မတူညီပါ။',
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
                {cooldown > 0 ? `${cooldown} စက္ကန့် စောင့်ပါ...` : 'မှတ်ပုံတင်ရန်'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Income Expense App v1.0
        </p>
      </div>
    </div>
  )
}

export default Login
