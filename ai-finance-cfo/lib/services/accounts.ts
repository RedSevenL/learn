import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accounts } from "@/lib/db/schema";
import type {
  CreateAccountInput,
  UpdateAccountInput
} from "@/schemas/finance";

export async function listAccounts() {
  return db
    .select()
    .from(accounts)
    .where(isNull(accounts.deletedAt));
}

export async function createAccount(input: CreateAccountInput) {
  const now = Date.now();

  const account = {
    id: crypto.randomUUID(),
    name: input.name,
    type: input.type,
    currency: input.currency,
    balance: input.balance,
    createdAt: now,
    updatedAt: now
  };

  await db.insert(accounts).values(account);

  return account;
}

export async function getAccountById(id: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), isNull(accounts.deletedAt)))
    .limit(1);

  return account ?? null;
}

export async function updateAccount(id: string, input: UpdateAccountInput) {
  const existingAccount = await getAccountById(id);

  if (!existingAccount) {
    return null;
  }

  await db
    .update(accounts)
    .set({
      ...input,
      updatedAt: Date.now()
    })
    .where(eq(accounts.id, id));

  return getAccountById(id);
}

export async function deleteAccount(id: string) {
  const existingAccount = await getAccountById(id);

  if (!existingAccount) {
    return false;
  }

  await db
    .update(accounts)
    .set({
      deletedAt: Date.now(),
      updatedAt: Date.now()
    })
    .where(eq(accounts.id, id));

  return true;
}