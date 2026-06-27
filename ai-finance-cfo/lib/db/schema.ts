import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  currency: text("currency").notNull().default("CNY"),
  balance: text("balance").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at")
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  accountId: text("account_id").references(() => accounts.id),
  occurredAt: integer("occurred_at").notNull(),
  amount: text("amount").notNull(),
  direction: text("direction").notNull(),
  category: text("category"),
  merchant: text("merchant"),
  note: text("note"),
  source: text("source").notNull(),
  rawPayload: text("raw_payload"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at")
});

export const liabilities = sqliteTable("liabilities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  principal: text("principal").notNull(),
  remainingPrincipal: text("remaining_principal").notNull(),
  annualRate: text("annual_rate").notNull(),
  minimumPayment: text("minimum_payment"),
  dueDay: integer("due_day"),
  startDate: integer("start_date"),
  endDate: integer("end_date"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at")
});

export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  targetAmount: text("target_amount").notNull(),
  currentAmount: text("current_amount").notNull(),
  targetDate: integer("target_date"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at")
});

export const scenarios = sqliteTable("scenarios", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  inputJson: text("input_json").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at")
});

export const calculationHistory = sqliteTable("calculation_history", {
  id: text("id").primaryKey(),
  intentType: text("intent_type").notNull(),
  inputJson: text("input_json").notNull(),
  formulaJson: text("formula_json").notNull(),
  outputJson: text("output_json").notNull(),
  modelTraceJson: text("model_trace_json"),
  createdAt: integer("created_at").notNull()
});