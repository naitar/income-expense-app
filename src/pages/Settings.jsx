import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/store/AuthContext'
import { Card, Button, Input } from '@/components/ui'

function Settings() {
  const { user } = useAuth()

  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  const profileForm = useForm({
    defaultValues: { name: user?.user_metadata?.full_name || '' },
  })

  const pwForm = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onSaveProfile(data) {
    setProfileError('')
    setProfileSuccess('')
    setProfileSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: data.name || '' },
      })
      if (error) throw error
      setProfileSuccess('ပရိုဖိုင်း အချက်အလက်များ သိမ်းဆည်းပြီးပါပြီ။')
    } catch (err) {
      setProfileError(translateProfileError(err.message))
    } finally {
      setProfileSaving(false)
    }
  }

  async function onChangePassword(data) {
    setPwError('')
    setPwSuccess('')
    if (data.newPassword !== data.confirmPassword) {
      setPwError('စကားဝှက်နှစ်ခု မတူညီပါ။')
      return
    }
    if (data.newPassword.length < 6) {
      setPwError('စကားဝှက် အနည်းဆုံး အက္ခရာ ၆ လုံး ထည့်ပါ။')
      return
    }
    setPwSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword })
      if (error) throw error
      setPwSuccess('စကားဝှက် ပြောင်းလဲပြီးပါပြီ။')
      pwForm.reset({ newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwError(translatePasswordError(err.message))
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ဆက်တင်များ</h1>
        <p className="text-gray-500 mt-1">ပရိုဖိုင်း နှင့် စကားဝှက် ပြင်ဆင်ရန်</p>
      </div>

      <Card title="ပရိုဖိုင်း" subtitle="သင့်အမည် ပြင်ဆင်ရန်">
        {profileError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            {profileSuccess}
          </div>
        )}
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
          <Input
            label="အမည်"
            placeholder="သင့်အမည်"
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register('name')}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">အီးမေးလ်</label>
            <input
              type="email"
              className="w-full px-3 py-2 text-sm border rounded-lg text-gray-500 bg-gray-50 cursor-not-allowed"
              value={user?.email || ''}
              disabled
              readOnly
            />
            <p className="mt-1 text-xs text-gray-400">
              အီးမေးလ် ပြောင်းလဲလိုပါက Supabase Dashboard တွင် ပြောင်းပါ။
            </p>
          </div>
          <Button type="submit" variant="primary" loading={profileSaving} className="w-full sm:w-auto">
            သိမ်းဆည်းမည်
          </Button>
        </form>
      </Card>

      <Card title="စကားဝှက် ပြောင်းရန်" subtitle="စကားဝှက် အသစ် သတ်မှတ်ပါ။">
        {pwError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {pwError}
          </div>
        )}
        {pwSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            {pwSuccess}
          </div>
        )}
        <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4">
          <Input
            label="စကားဝှက် အသစ်"
            type="password"
            placeholder="အနည်းဆုံး ၆ လုံး"
            error={pwForm.formState.errors.newPassword?.message}
            {...pwForm.register('newPassword', {
              required: 'စကားဝှက်အသစ် ထည့်ပါ။',
              minLength: { value: 6, message: 'အနည်းဆုံး အက္ခရာ ၆ လုံး ထည့်ပါ။' },
            })}
          />
          <Input
            label="စကားဝှက် အသစ် အတည်ပြုရန်"
            type="password"
            placeholder="စကားဝှက်ကို ပြန်ရိုက်ပါ။"
            error={pwForm.formState.errors.confirmPassword?.message}
            {...pwForm.register('confirmPassword', {
              required: 'စကားဝှက်ကို ပြန်ရိုက်ပါ။',
              validate: (value) =>
                value === pwForm.watch('newPassword') || 'စကားဝှက်နှစ်ခု မတူညီပါ။',
            })}
          />
          <Button type="submit" variant="outline" loading={pwSaving} className="w-full sm:w-auto">
            စကားဝှက် ပြောင်းမည်
          </Button>
        </form>
      </Card>
    </div>
  )
}

function translateProfileError(message) {
  const msg = (message || '').toLowerCase()
  if (msg.includes('email') && msg.includes('confirm'))
    return 'အီးမေးလ် အသစ် အတည်ပြုရန် လိုအပ်ပါသည်။ အီးမေးလ်ထဲတွင် စစ်ဆေးပါ။'
  if (msg.includes('email'))
    return 'အီးမေးလ် ပြောင်းလဲ၍ မရပါ။ ထပ်မံကြိုးစားပါ။'
  return 'တစ်ခုခု မှားယွင်းနေပါသည်။ ထပ်မံကြိုးစားပါ။'
}

function translatePasswordError(message) {
  const msg = (message || '').toLowerCase()
  if (msg.includes('same as old') || msg.includes('same password'))
    return 'စကားဝှက်အသစ်သည် အဟောင်းနှင့် မတူရပါ။'
  if (msg.includes('weak'))
    return 'စကားဝှက် အားနည်းပါသည်။ အနည်းဆုံး အက္ခရာ ၆ လုံး ထည့်ပါ။'
  if (msg.includes('recent') || msg.includes('recently'))
    return 'မကြာသေးခင်က စကားဝှက် ပြောင်းပြီးပါပြီ။ ခဏစောင့်ပြီးမှ ထပ်ကြိုးစားပါ။'
  return 'စကားဝှက် ပြောင်းလဲ၍ မရပါ။ ထပ်မံကြိုးစားပါ။'
}

export default Settings
