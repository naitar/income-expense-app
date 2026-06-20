---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- Slide 1 -->
# Income/Expense Manage App
#### React + Vite · Supabase · Claude Code · MCP · AI Agent

### Core Benefits
- Real-time Visibility: Understand exactly where your money goes.
- Better Control: Identify unnecessary spending patterns instantly. 
- Goal Setting: Build long-term savings habits effortlessly.

---

<!-- Slide 2 -->
# What Happens Without Tracking?
- Money Leaks: Small, unmonitored expenses add up to significant losses.
- Financial Stress: Uncertainty about your balance creates constant anxiety.
- Debt Risk: Without oversight, overspending becomes a dangerous cycle.

---

<!-- Slide 3 -->
## Why Use App
### Smart Tracking
- Digital tracking replaces mental guesswork. By logging expenses on your smartphone, you create a permanent record that empowers smarter financial decisions daily.

---

<!-- Slide 4 -->
## Our Idea
#### What We Built
- 💰 Record income & expense in Myanmar Kyat (MMK)
- 📊 Category-based charts & monthly reports
- 🔐 Supabase Auth — email + Google OAuth
- 🤖 AI Financial Advisor — Myanmar language insights
- 📁 Monthly report + CSV export

---

<!-- Slide 5 -->
## Architecture
- Claude Code + MCP
- AI Coder Supabase MCP
## How I built it: MCP, Skills, Agents
- **MCP:** Supabase MCP connected, DB schema check directly, Query/insert/migrate.
- **Skills:** data-validate, supabase-patterns, format-display, auth-guard, report-logic, ai-advisor.
- **Agents:** db-agent (DB), frontend-agent (UI), validator-agent (forms), ai-agent (Advisor).

---

<!-- Slide 6 -->
# Conclusion
# Done checklist
- [x] **Repo public** — [https://github.com/naitar/income-expense-app]
- [x] **MCP** — Supabase MCP for database, auth, storage, migrations
- [x] **Skill** — `code-review`, `verify`, `init` used
- [x] **Agent** — Plan agent, Explore agent
- [x] **report.md** — Full phase breakdown

**Tech stack:** React · TypeScript · Vite · Tailwind CSS v4 · Supabase