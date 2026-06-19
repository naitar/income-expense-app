# Skill: error-handling

## Purpose
Supabase errors → မြန်မာ messages + toast notifications
consistent ဖြစ်အောင် define ထားသည်။

## When to use
- Supabase query try/catch ရေးသောအခါ
- Toast notification ထည့်သောအခါ

## Error Map
'23505' → 'ထပ်တူ ဒေတာ ရှိနှင့်ပြီ'
'23503' → 'ချိတ်ဆက်ထားသော ဒေတာ မတွေ့ပါ'
'42501' → 'ဆောင်ရွက်ခွင့် မရှိပါ'
'invalid_credentials' → 'အီးမေးလ် သို့ စကားဝှက် မှားနေသည်'
'user_already_exists' → 'ဤအီးမေးလ် ရှိနှင့်ပြီ'
'weak_password'       → 'စကားဝှက် အနည်းဆုံး ၆ လုံး ထည့်ပါ'
'network_error'       → 'ချိတ်ဆက်မှု ပြတ်တောက်နေသည်'

## Toast Duration
success → 3s (green)
error   → 5s (red)
warning → 4s (amber)

## Try/Catch Pattern
try {
  const { data, error } = await supabase...
  if (error) throw error
  toast.success('အောင်မြင်သည်')
} catch (err) {
  toast.error(mapError(err))
}

## Success Messages
TRANSACTION_ADDED:   'ငွေစာရင်း ထည့်သွင်းပြီး'
TRANSACTION_UPDATED: 'ငွေစာရင်း ပြင်ဆင်ပြီး'
TRANSACTION_DELETED: 'ငွေစာရင်း ဖျက်ပြီး'