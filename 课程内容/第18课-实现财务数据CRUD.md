# 第 18 课：实现财务数据 CRUD

## 本课目标

项目现在已经有了三层基础能力：

```txt
Route Handler
Zod schema
Drizzle + SQLite
```

这一课把它们串起来，完成财务数据的 CRUD。

CRUD 是四个基础操作：

| 操作 | 含义 | HTTP 方法示例 |
| --- | --- | --- |
| Create | 新增 | `POST /api/accounts` |
| Read | 查询 | `GET /api/accounts` |
| Update | 更新 | `PATCH /api/accounts/:id` |
| Delete | 删除 | `DELETE /api/accounts/:id` |

本课重点：

- 账户支持完整 CRUD。
- 流水和负债先支持新增和列表。
- API 使用 Zod 校验输入。
- service 层负责数据库读写。
- 前端通过 `fetch` 调用 API。
- 页面处理 loading、empty、error 状态。

学完本课后，你应该能够：

- 说清楚 CRUD 是什么。
- 说清楚 API 层和 service 层的区别。
- 实现账户新增、查询、编辑、删除。
- 实现流水和负债新增、查询。
- 让前端请求失败时显示错误提示。

## 一、为什么需要 service 层

现在如果把所有逻辑都写进 `route.ts`，文件会很快变乱。

例如一个账户新增接口可能要做：

- 解析请求体。
- Zod 校验。
- 生成 `id`。
- 设置创建时间。
- 写入数据库。
- 返回 JSON。
- 处理错误。

如果全部放在 Route Handler，API 文件会越来越长。

更清楚的分层是：

```txt
app/api/accounts/route.ts
  处理 HTTP 请求和响应

schemas/finance.ts
  校验输入是否合法

lib/services/accounts.ts
  处理账户业务逻辑

lib/db/schema.ts
  描述数据库表结构

lib/db/client.ts
  提供数据库连接
```

一句话：

> Route Handler 管 HTTP，service 管业务和数据库。

## 二、统一 API 返回格式

继续使用前面课程里的响应格式。

成功：

```json
{
  "ok": true,
  "data": {}
}
```

失败：

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求数据不合法"
  }
}
```

可以先创建一个小工具文件：

```txt
lib/api/response.ts
```

写入：

```ts
export function successResponse<T>(data: T, init?: ResponseInit) {
  return Response.json(
    {
      ok: true,
      data
    },
    init
  );
}

export function errorResponse(
  code: string,
  message: string,
  init?: ResponseInit,
  extra?: Record<string, unknown>
) {
  return Response.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...extra
      }
    },
    init
  );
}
```

这个文件不是必须的。

但它能减少 API 里重复写响应结构。

## 三、补充更新账户的 Zod schema

第 17 课已经有 `createAccountSchema`。

编辑账户时，用户可能只改一个字段。

所以需要一个更新 schema。

打开：

```txt
schemas/finance.ts
```

补充：

```ts
export const updateAccountSchema = createAccountSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "至少需要提供一个要更新的字段"
  });

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
```

`partial()` 的意思是：

```txt
原本必填的字段，更新时都变成可选
```

例如合法更新：

```json
{
  "balance": "21000"
}
```

非法更新：

```json
{}
```

空对象没有任何更新意义。

## 四、账户 service

创建文件：

```txt
lib/services/accounts.ts
```

写入：

```ts
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
```

这里的删除是软删除。

它不会真正删除数据库记录，而是写入：

```txt
deletedAt
```

查询账户列表时默认只查：

```txt
deletedAt 为空
```

## 五、账户列表和新增 API

打开：

```txt
app/api/accounts/route.ts
```

把假数据返回替换成数据库 service：

```ts
import { successResponse, errorResponse } from "@/lib/api/response";
import { createAccountSchema } from "@/schemas/finance";
import { formatZodError } from "@/schemas/format-zod-error";
import { createAccount, listAccounts } from "@/lib/services/accounts";

export async function GET() {
  const accounts = await listAccounts();

  return successResponse({
    accounts
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = createAccountSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "请求数据不合法",
      { status: 400 },
      {
        issues: formatZodError(result.error)
      }
    );
  }

  const account = await createAccount(result.data);

  return successResponse(
    {
      account
    },
    { status: 201 }
  );
}
```

现在：

```txt
GET /api/accounts
```

会从 SQLite 查询账户。

```txt
POST /api/accounts
```

会校验请求体，然后写入 SQLite。

## 六、账户编辑和删除 API

动态路由用来处理某个具体账户。

创建文件：

```txt
app/api/accounts/[id]/route.ts
```

写入：

```ts
import { errorResponse, successResponse } from "@/lib/api/response";
import { deleteAccount, updateAccount } from "@/lib/services/accounts";
import { formatZodError } from "@/schemas/format-zod-error";
import { updateAccountSchema } from "@/schemas/finance";

type AccountRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: AccountRouteContext
) {
  const { id } = await context.params;
  const body = await request.json();
  const result = updateAccountSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "请求数据不合法",
      { status: 400 },
      {
        issues: formatZodError(result.error)
      }
    );
  }

  const account = await updateAccount(id, result.data);

  if (!account) {
    return errorResponse("ACCOUNT_NOT_FOUND", "账户不存在", {
      status: 404
    });
  }

  return successResponse({
    account
  });
}

export async function DELETE(
  _request: Request,
  context: AccountRouteContext
) {
  const { id } = await context.params;
  const deleted = await deleteAccount(id);

  if (!deleted) {
    return errorResponse("ACCOUNT_NOT_FOUND", "账户不存在", {
      status: 404
    });
  }

  return successResponse({
    deleted: true
  });
}
```

访问路径示例：

```txt
PATCH /api/accounts/account_123
DELETE /api/accounts/account_123
```

`[id]` 表示这一段路径是动态的。

## 七、流水 service 和 API

流水本课先做新增和列表。

创建：

```txt
lib/services/transactions.ts
```

写入：

```ts
import { isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { transactions } from "@/lib/db/schema";
import type { CreateTransactionInput } from "@/schemas/finance";

export async function listTransactions() {
  return db
    .select()
    .from(transactions)
    .where(isNull(transactions.deletedAt));
}

export async function createTransaction(input: CreateTransactionInput) {
  const now = Date.now();

  const transaction = {
    id: crypto.randomUUID(),
    accountId: input.accountId,
    occurredAt: input.occurredAt,
    amount: input.amount,
    direction: input.direction,
    category: input.category,
    merchant: input.merchant,
    note: input.note,
    source: input.source,
    rawPayload: input.rawPayload,
    createdAt: now,
    updatedAt: now
  };

  await db.insert(transactions).values(transaction);

  return transaction;
}
```

创建：

```txt
app/api/transactions/route.ts
```

写入：

```ts
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  createTransaction,
  listTransactions
} from "@/lib/services/transactions";
import { formatZodError } from "@/schemas/format-zod-error";
import { createTransactionSchema } from "@/schemas/finance";

export async function GET() {
  const transactions = await listTransactions();

  return successResponse({
    transactions
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = createTransactionSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "请求数据不合法",
      { status: 400 },
      {
        issues: formatZodError(result.error)
      }
    );
  }

  const transaction = await createTransaction(result.data);

  return successResponse(
    {
      transaction
    },
    { status: 201 }
  );
}
```

## 八、负债 service 和 API

负债同样先做新增和列表。

创建：

```txt
lib/services/liabilities.ts
```

写入：

```ts
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
```

创建：

```txt
app/api/liabilities/route.ts
```

写入方式和流水类似：

```ts
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  createLiability,
  listLiabilities
} from "@/lib/services/liabilities";
import { formatZodError } from "@/schemas/format-zod-error";
import { createLiabilitySchema } from "@/schemas/finance";

export async function GET() {
  const liabilities = await listLiabilities();

  return successResponse({
    liabilities
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = createLiabilitySchema.safeParse(body);

  if (!result.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "请求数据不合法",
      { status: 400 },
      {
        issues: formatZodError(result.error)
      }
    );
  }

  const liability = await createLiability(result.data);

  return successResponse(
    {
      liability
    },
    { status: 201 }
  );
}
```

## 九、用 fetch 测试 API

启动项目：

```bash
npm run dev
```

新增账户：

```js
fetch("/api/accounts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "工资卡",
    type: "bank",
    balance: "20000"
  })
})
  .then((response) => response.json())
  .then(console.log);
```

查询账户：

```js
fetch("/api/accounts")
  .then((response) => response.json())
  .then(console.log);
```

更新账户：

```js
fetch("/api/accounts/这里换成真实账户ID", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    balance: "21000"
  })
})
  .then((response) => response.json())
  .then(console.log);
```

删除账户：

```js
fetch("/api/accounts/这里换成真实账户ID", {
  method: "DELETE"
})
  .then((response) => response.json())
  .then(console.log);
```

删除后再次请求：

```js
fetch("/api/accounts")
  .then((response) => response.json())
  .then(console.log);
```

列表里不应该再出现这个账户。

## 十、前端调用 API 的状态

前端请求 API 时至少要处理三种状态：

```txt
loading  正在请求
empty    请求成功但没有数据
error    请求失败
```

当前仪表盘页面原来使用本地 `useState` 和 `initialAccounts`。

现在可以改成从 API 加载：

```tsx
const [accounts, setAccounts] = useState<Account[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState("");
```

页面加载时请求：

```tsx
useEffect(() => {
  async function loadAccounts() {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/accounts");
      const result = await response.json();

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setAccounts(result.data.accounts);
    } catch {
      setError("账户数据加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  loadAccounts();
}, []);
```

注意：

```tsx
useEffect
```

只能在客户端组件里使用。

所以页面顶部需要：

```tsx
"use client";
```

## 十一、前端新增账户

表单提交时，不再直接更新本地数组。

而是请求 API：

```tsx
async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");

  const response = await fetch("/api/accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      type,
      balance
    })
  });

  const result = await response.json();

  if (!result.ok) {
    const firstIssue = result.error.issues?.[0];
    setError(firstIssue?.message ?? result.error.message);
    return;
  }

  setAccounts((currentAccounts) => [
    ...currentAccounts,
    result.data.account
  ]);

  setName("");
  setType("bank");
  setBalance("");
}
```

这里的数据流变成：

```txt
表单输入
  ↓
POST /api/accounts
  ↓
Zod 校验
  ↓
service 写入 SQLite
  ↓
返回新增账户
  ↓
前端更新列表
```

## 十二、前端删除账户

删除时调用：

```tsx
async function handleDeleteAccount(id: string) {
  const response = await fetch(`/api/accounts/${id}`, {
    method: "DELETE"
  });

  const result = await response.json();

  if (!result.ok) {
    setError(result.error.message);
    return;
  }

  setAccounts((currentAccounts) =>
    currentAccounts.filter((account) => account.id !== id)
  );
}
```

这只是最基础版本。

后续可以增加：

- 删除确认。
- 删除中状态。
- 删除失败后恢复按钮。

当前先跑通流程。

## 十三、前端编辑账户

编辑账户可以先从最小版本开始。

例如只更新余额：

```tsx
async function handleUpdateBalance(id: string, balance: string) {
  const response = await fetch(`/api/accounts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      balance
    })
  });

  const result = await response.json();

  if (!result.ok) {
    setError(result.error.message);
    return;
  }

  setAccounts((currentAccounts) =>
    currentAccounts.map((account) =>
      account.id === id ? result.data.account : account
    )
  );
}
```

实际 UI 可以先用一个简单按钮或输入框练习。

不必一次做复杂弹窗。

## 十四、loading、empty、error 展示

页面渲染时按顺序判断。

正在加载：

```tsx
if (isLoading) {
  return <p className="text-sm text-gray-500">正在加载账户数据...</p>;
}
```

请求失败：

```tsx
{error && (
  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
    {error}
  </p>
)}
```

空状态：

```tsx
{accounts.length === 0 ? (
  <EmptyAccounts />
) : (
  <AccountList accounts={accounts} />
)}
```

这三种状态要分清楚：

| 状态 | 含义 |
| --- | --- |
| loading | 还不知道有没有数据 |
| empty | 请求成功，但数据为空 |
| error | 请求失败，不能确定数据状态 |

## 十五、为什么本课仍然保留第 19 课

本课已经实现 CRUD 的主要代码。

第 19 课还会继续做阶段三整合。

两课区别是：

| 课程 | 重点 |
| --- | --- |
| 第 18 课 | 把 CRUD 能力写出来 |
| 第 19 课 | 把表单、API、Zod、service、Drizzle、SQLite 的完整链路复盘和整理稳定 |

也就是说，本课先把功能跑起来。

下一课会检查：

- 分层是否清楚。
- 错误是否好排查。
- 刷新后数据是否仍存在。
- 账户 CRUD 数据流是否能画出来。

## 十六、常见错误

### 1. 页面仍然使用 mock-data

如果页面新增账户后刷新就消失，检查是否还在使用：

```ts
initialAccounts
```

真正接入数据库后，页面应该请求：

```txt
GET /api/accounts
```

### 2. 忘记运行 drizzle-kit push

如果提示表不存在，运行：

```bash
npx drizzle-kit push
```

确保 SQLite 里有最新表结构。

### 3. Zod schema 和 Drizzle schema 不一致

例如 Zod 里没有 `currency` 默认值，但数据库要求 `currency` 不能为空。

这会导致写入失败。

解决方式是：

```ts
currency: z.string().trim().length(3).default("CNY")
```

### 4. 删除后列表仍然显示

如果使用软删除，列表查询必须排除：

```ts
deletedAt 不为空的数据
```

对应代码是：

```ts
where(isNull(accounts.deletedAt))
```

### 5. API 里混入太多数据库代码

如果 `route.ts` 很长，说明该抽 service 层。

API 文件应该更像：

```txt
解析请求
校验数据
调用 service
返回响应
```

## 十七、实践任务

完成下面任务：

1. 创建 `lib/api/response.ts`。
2. 创建 `lib/services/accounts.ts`。
3. 实现账户列表、新增、查询单个、更新、软删除。
4. 改造 `app/api/accounts/route.ts`。
5. 创建 `app/api/accounts/[id]/route.ts`。
6. 创建 `lib/services/transactions.ts` 和 `app/api/transactions/route.ts`。
7. 创建 `lib/services/liabilities.ts` 和 `app/api/liabilities/route.ts`。
8. 用浏览器 Console 测试账户 CRUD。
9. 在仪表盘页面用 `fetch` 请求账户列表。
10. 给页面补上 loading、empty、error 状态。

## 十八、验收标准

完成后检查：

- `GET /api/accounts` 能返回数据库账户列表。
- `POST /api/accounts` 能新增账户。
- `PATCH /api/accounts/:id` 能更新账户。
- `DELETE /api/accounts/:id` 能软删除账户。
- `GET /api/transactions` 能返回流水列表。
- `POST /api/transactions` 能新增流水。
- `GET /api/liabilities` 能返回负债列表。
- `POST /api/liabilities` 能新增负债。
- 非法请求会返回 `400 VALIDATION_ERROR`。
- 前端加载失败时有错误提示。
- 空列表时有空状态。

## 十九、复习问题

1. CRUD 分别代表什么？
2. 为什么要把数据库逻辑放进 service 层？
3. Route Handler 应该负责什么？
4. Zod 校验应该发生在数据库写入前还是后？
5. 为什么删除账户时优先使用软删除？
6. 前端 loading、empty、error 三种状态有什么区别？
7. `POST /api/accounts` 的完整数据流是什么？
8. 第 19 课还需要继续整理什么？

## 二十、本课小结

这一课把阶段三的主要能力连了起来：

```txt
前端 fetch
  ↓
Route Handler
  ↓
Zod 校验
  ↓
service 层
  ↓
Drizzle
  ↓
SQLite
```

现在账户已经可以完成新增、列表、编辑、删除。

流水和负债也可以先完成新增和列表。

前端不再只依赖本地假数据，而是开始通过 API 获取真实保存到 SQLite 的数据。

下一课会做阶段三整合，重点检查账户表单到数据库写入的完整链路，并把 API、schema、service、db 分层整理得更清楚。
