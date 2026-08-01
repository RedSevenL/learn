import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { calculationHistory } from "@/lib/db/schema";
import { buildSavingsGoalHistory } from "@/lib/finance/calculation-history";
import type { ModelTrace } from "@/lib/finance/calculation-history";
import type {
  SavingsGoalInput,
  SavingsGoalResult,
} from "@/lib/finance/savings-goal";

export async function saveSavingsGoalCalculation(
  input: SavingsGoalInput,
  result: SavingsGoalResult,
  modelTrace?: ModelTrace,
) {
  const history = buildSavingsGoalHistory(
    input,
    result,
    crypto.randomUUID(),
    Date.now(),
    modelTrace,
  );

  await db.insert(calculationHistory).values(history);

  return history;
}

export async function listCalculationHistory(limit = 20) {
  return db
    .select()
    .from(calculationHistory)
    .orderBy(desc(calculationHistory.createdAt))
    .limit(limit);
}