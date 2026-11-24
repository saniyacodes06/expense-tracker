# Expense Tracker

Simple app to log daily expenses and see a monthly summary.

Built with Next.js, Tailwind CSS, shadcn/ui, Node.js and PostgreSQL.

## Features

- Add an expense (title, amount, category)
- Delete an expense
- Monthly total, entry count and top category
- JSON API at `GET /api/expenses`

## Project structure

```
app/
  page.tsx              home page (server component)
  actions.ts            server actions: add / delete
  api/expenses/route.ts JSON endpoint
lib/
  db.ts                 pg pool + query helpers
  expenses.ts           all expense queries
  validation.ts         zod schema + form parsing
  format.ts             currency / date formatting
  constants.ts          categories, limits
components/
  expense-form.tsx      add form (client component)
  expense-table.tsx     list of expenses
  expense-row.tsx       single row
  summary-cards.tsx     top stats
  stat-card.tsx, section.tsx, form-field.tsx,
  category-select.tsx, category-badge.tsx,
  delete-button.tsx, form-message.tsx
  ui/                   shadcn components
db/schema.sql           table + seed data
```

## Setup

Needs Node.js 20.9+ and PostgreSQL.

```bash
npm install
createdb expense_tracker
cp .env.example .env.local   # then set your DB password
npm run db:setup
npm run dev
```

Open http://localhost:3000
