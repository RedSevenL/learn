import { eq } from "drizzle-orm";
import { db } from "../lib/db/client";
import { accounts } from "../lib/db/schema";

async function main() {
  const now = Date.now();
  const accountId = "account_demo_001";

  await db.delete(accounts).where(eq(accounts.id, accountId));

  await db.insert(accounts).values({
    id: accountId,
    name: "工资卡",
    type: "bank",
    currency: "CNY",
    balance: "20000",
    createdAt: now,
    updatedAt: now
  });

  const accountsList = await db.select().from(accounts);
  console.log("账户列表：", accountsList);

  await db
    .update(accounts)
    .set({
      balance: "21000",
      updatedAt: Date.now()
    })
    .where(eq(accounts.id, accountId));

  const updatedAccounts = await db.select().from(accounts);
  console.log("更新后：", updatedAccounts);

  await db.delete(accounts).where(eq(accounts.id, accountId));

  const finalAccounts = await db.select().from(accounts);
  console.log("删除后：", finalAccounts);
}

main();