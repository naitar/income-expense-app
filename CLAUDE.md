# Income/Expense App — Claude Guide

## Stack
- React 18 + Vite
- React Router v6
- Supabase (Auth + PostgreSQL + RLS)
- Tailwind CSS / Recharts

## Database Tables
transactions: id, user_id, category_id, amount, type, note, date
categories:   id, user_id, name, type, color

## Conventions
- Currency: MMK — မြန်မာဂဏန်း (၅,၀၀၀ ကျပ်)
- Date store: YYYY-MM-DD / Display: မြန်မာဘာသာ
- Income color: text-green-600
- Expense color: text-red-500
- Query တိုင်း .eq('user_id', user.id) ထည့်ပါ
- Import တိုင်း @/ alias သုံးပါ

## Routes
/             → Dashboard    (protected)
/transactions → Transactions (protected)
/reports      → Reports      (protected)
/categories   → Categories   (protected)
/login        → Login        (public)

## Agents
| Agent | File | တာဝန် |
|---|---|---|
| db-agent | .claude/agents/db-agent.md | Supabase, queries, hooks |
| frontend-agent | .claude/agents/frontend-agent.md | Components, pages |
| validator-agent | .claude/agents/validator-agent.md | Validation, errors |
| ai-agent | .claude/agents/ai-agent.md | AI Advisor |

## Skills
| Skill | ဘယ်အခါ |
|---|---|
| .claude/skills/data-validate/SKILL.md | Form/insert code |
| .claude/skills/supabase-patterns/SKILL.md | Supabase queries |
| .claude/skills/format-display/SKILL.md | Amount/date display |
| .claude/skills/auth-guard/SKILL.md | Auth/routes |
| .claude/skills/error-handling/SKILL.md | Try/catch/toast |
| .claude/skills/report-logic/SKILL.md | Charts/reports |
| .claude/skills/ai-advisor/SKILL.md | AI feature |