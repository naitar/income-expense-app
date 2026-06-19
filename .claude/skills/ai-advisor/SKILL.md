# Skill: ai-advisor

## Purpose
User transaction data ကို Anthropic API ပို့ပြီး
မြန်မာဘာသာ spending insight + suggestions ပေးသည်။

## When to use
- AIAdvisor component ရေးသောအခါ
- useAIAdvisor hook ရေးသောအခါ

## API Details
endpoint: https://api.anthropic.com/v1/messages
model:    claude-sonnet-4-6
max_tokens: 1000
response: မြန်မာဘာသာ သာ

## Data to send (privacy-safe)
- totalIncome, totalExpense, balance
- category breakdown (name + amount only)
- month name
- user name/email မပို့ပါနဲ့

## AI Response format
1. 💡 Insight ၃ ချက်
2. ⚠️ သတိပြုသင့်သော ကုန်ကျစရိတ်
3. 💰 သိုလှောင်ငွေ တိုးဖို့ အကြံ ၂ ချက်

## System Prompt (မြန်မာဘာသာ)
မြန်မာနိုင်ငံသားများအတွက် ငွေကြေးအကြံပေး AI assistant။
ရိုးရှင်းသော မြန်မာဘာသာ + emoji သုံးပြီး
response ၃၀၀ စကားလုံး အောက် ထားပါ။

## UI
- "ဒီလ အကြံပေးပါ" button
- loading: "AI ကြည့်နေသည်..." spinner
- chat input: မေးချင်တာ မေးလို့ ရ
- placement: Dashboard page အောက်ဆုံး