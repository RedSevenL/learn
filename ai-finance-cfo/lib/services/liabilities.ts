import { isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { liabilities } from "@/lib/db/schema";
import type { CreateLiabilityInput } from "@/schemas/finance";

export async function listLiabilities() {
  return db
    .select()
    .from(liabilities)
    .where(isNull(liabilities.deletedAt));
}

export async function createLiability(input: CreateLiabilityInput) {
  const now = Date.now();

  const liability = {
    id: crypto.randomUUID(),
    name: input.name,
    principal: input.principal,
    remainingPrincipal: input.remainingPrincipal,
    annualRate: input.annualRate,
    minimumPayment: input.minimumPayment,
    dueDay: input.dueDay,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: now,
    updatedAt: now
  };

  await db.insert(liabilities).values(liability);

  return liability;
}

