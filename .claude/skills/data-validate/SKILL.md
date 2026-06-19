# Skill: data-validate

## Purpose
Transaction/Category form data ကို Supabase insert မတိုင်ခင်
schema + business logic အတိုင်း validate လုပ်ပေးသည်။

## When to use
- TransactionForm / CategoryForm ရေးသောအခါ
- Supabase insert/update code ရေးသောအခါ

## Schema Rules (transactions)
| field       | type   | required | constraints             |
|-------------|--------|----------|-------------------------|
| amount      | number | yes      | > 0, max 999999999      |
| type        | string | yes      | 'income' or 'expense'   |
| date        | string | yes      | YYYY-MM-DD, not future  |
| category_id | uuid   | yes      | user's category only    |
| note        | string | no       | max 500 chars           |

## Sanity Checks
- amount: 0 မဖြစ်ရ၊ negative မဖြစ်ရ
- date: future date မဖြစ်ရ
- duplicate: same date+amount+category → warn
- category type = transaction type ဖြစ်ရမည်

## Validation Layers
1. React Hook Form  → frontend instant feedback
2. validateTransaction.js → sanity + duplicate
3. Supabase CHECK   → DB last defense

## Error Messages
AMOUNT_REQUIRED:   'ငွေပမာဏ ထည့်သွင်းပါ'
AMOUNT_NEGATIVE:   'ငွေပမာဏသည် သုညထက် ကြီးရမည်'
AMOUNT_TOO_LARGE:  'ငွေပမာဏ အများဆုံး ၉၉၉,၉၉၉,၉၉၉ ကျပ်'
TYPE_INVALID:      'ဝင်ငွေ သို့ ထွက်ငွေ ရွေးချယ်ပါ'
DATE_REQUIRED:     'နေ့စွဲ ထည့်သွင်းပါ'
DATE_FUTURE:       'နောင်ကာလ နေ့စွဲ ထည့်၍ မရပါ'
CATEGORY_REQUIRED: 'အမျိုးအစား ရွေးချယ်ပါ'
NOTE_TOO_LONG:     'မှတ်ချက် အများဆုံး ၅၀၀ လုံး'
DUPLICATE_FOUND:   'ထပ်တူ ငွေစာရင်း ရှိနှင့်ပြီ၊ ဆက်ထည့်မလား?'