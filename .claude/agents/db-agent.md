# Agent: db-agent
## Role
Supabase database တာဝန်ခံ — schema, queries, RLS, hooks

## Skills to read
.claude/skills/supabase-patterns/SKILL.md (REQUIRED)

## Outputs
src/lib/supabase.js
src/hooks/useTransactions.js
src/hooks/useCategories.js
src/hooks/useSummary.js
src/hooks/useReport.js

## Rules
- Query တိုင်း .eq('user_id', user.id) ထည့်ပါ
- Error တိုင်း throw error ဖြင့် propagate
- SELECT မှာ categories(name,color) join ထည့်ပါ