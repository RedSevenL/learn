import { isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { scenarios } from "@/lib/db/schema";
import type { CreateWhatIfScenarioInput } from "@/schemas/scenario";

export async function listScenarios() {
  return db
    .select()
    .from(scenarios)
    .where(isNull(scenarios.deletedAt));
}

export async function createScenario(input: CreateWhatIfScenarioInput) {
  const now = Date.now();

  const scenario = {
    id: crypto.randomUUID(),
    name: input.name,
    description: input.description,
    inputJson: JSON.stringify({
      baseline: input.baseline,
      changes: input.changes,
    }),
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(scenarios).values(scenario);

  return scenario;
}