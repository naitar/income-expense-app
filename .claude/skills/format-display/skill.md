# Skill: format-display

## Purpose
MMK currency, မြန်မာ date, income/expense colors တွေ
app တစ်ခုလုံး consistent ဖြစ်အောင် define ထားသည်။

## When to use
- Amount ပြသည့် code ရေးသောအခါ
- Date ပြသည့် code ရေးသောအခါ
- Income/expense color ထည့်သောအခါ

## Currency Format
5000    → '၅,၀၀၀ ကျပ်'
150000  → '၁၅၀,၀၀၀ ကျပ်'
1500000 → '၁,၅၀၀,၀၀၀ ကျပ်'

## Date Format
'2024-01-15' → '၁၅ ဇန်နဝါရီ ၂၀၂၄'  (full)
'2024-01-15' → '၁၅ ဇန်'              (short)

## Color Rules
income  → text-green-600 / bg-green-50 / badge: bg-green-100 text-green-700
expense → text-red-500   / bg-red-50   / badge: bg-red-100 text-red-600
balance positive → text-green-700
balance negative → text-red-600

## Amount with sign
income  → '+၅,၀၀၀ ကျပ်'  (green)
expense → '-၃,၀၀၀ ကျပ်'  (red)