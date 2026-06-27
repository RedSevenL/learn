# 第 15 课：Drizzle ORM 入门

## 本课目标

上一课已经手动创建了 SQLite 数据库，并用 SQL 创建了 `accounts` 表。

但真实项目里，如果每次都手写 SQL，后面会遇到几个问题：

- 表结构散落在 SQL 文件里，不方便和 TypeScript 代码对应。
- 字段名写错时，TypeScript 很难提前提醒。
- 项目变大后，不容易管理表结构变化。
- API 查询数据库时，代码可读性不够好。

这一课开始使用 Drizzle ORM。

Drizzle 的作用是：

> 用 TypeScript 代码描述数据库表，并用 TypeScript 代码查询数据库。

这一课只做账户表 `accounts`，不展开流水、负债和完整模型。

你会学到：

- ORM 是什么。
- Drizzle schema 是什么。
- Drizzle Kit 和 migration 是什么。
- 如何用 Drizzle 创建 `accounts` 表。
- 如何插入、查询、更新、删除账户记录。

学完本课后，你应该能够：

- 说清楚 SQL 和 ORM 的关系。
- 用 Drizzle schema 描述 `accounts` 表。
- 用 `drizzle-kit push` 创建数据库表。
- 写一个脚本插入账户。
- 写一个脚本查询账户列表。

## 一、ORM 是什么

ORM 的全称是 Object Relational Mapping。

初学阶段可以简单理解为：

> ORM 是 TypeScript 代码和数据库表之间的翻译层。

上一课手写 SQL：

```sql
SELECT * FROM accounts;
```

使用 Drizzle 后，可以写成：

```ts
const accountsList = await db.select().from(accounts);
```

两者做的事情类似：

```txt
查询 accounts 表里的所有账户
```

ORM 的好处是：

- 表结构可以写在 TypeScript 文件里。
- 查询代码更接近项目业务代码。
- 字段名和类型能得到更多编辑器提示。
- 后续 API、服务层、数据库层更容易连接。

ORM 不是用来完全替代 SQL 的。

学习 Drizzle 时，仍然要知道背后是在操作数据库表。

## 二、本课要做什么

本课只完成最小闭环：

```txt
Drizzle schema
  ↓
drizzle-kit push
  ↓
SQLite 里出现 accounts 表
  ↓
脚本插入账户
  ↓
脚本查询账户列表
```

暂时不做：

- 页面 fetch 数据库。
- API 写入数据库。
- Zod 校验。
- 完整流水表和负债表。
- AI 对话。

这些会在后续课程逐步接上。

## 三、安装 Drizzle 相关依赖

进入项目目录：

```bash
cd ai-finance-cfo
```

安装运行时依赖：

```bash
npm install drizzle-orm @libsql/client dotenv
```

安装开发依赖：

```bash
npm install -D drizzle-kit tsx
```

这些包的作用：

| 依赖 | 作用 |
| --- | --- |
| `drizzle-orm` | Drizzle ORM 核心库 |
| `@libsql/client` | 连接 SQLite 文件的客户端 |
| `dotenv` | 读取环境变量 |
| `drizzle-kit` | 根据 schema 创建或更新数据库表 |
| `tsx` | 直接运行 TypeScript 脚本 |

安装完成后，`package.json` 会多出这些依赖。

## 四、配置数据库文件路径

在 `ai-finance-cfo` 目录下创建：

```txt
.env.local
```

写入：

```env
DB_FILE_NAME=file:data/dev.db
```

这里的意思是：

```txt
使用 data/dev.db 这个本地 SQLite 数据库文件
```

前面的 `file:` 是 libSQL 连接本地 SQLite 文件时需要的写法。

`.env.local` 不需要提交到 Git。

当前项目的 `.gitignore` 已经忽略了 `.env*`。

如果还没有 `data/` 目录，可以创建：

```bash
mkdir -p data
```

## 五、创建 Drizzle schema

创建目录：

```txt
lib/db/
```

创建文件：

```txt
lib/db/schema.ts
```

写入：

```ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  currency: text("currency").notNull().default("CNY"),
  balance: text("balance").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
```

这段代码描述了数据库里的 `accounts` 表。

对照上一课的 SQL：

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT NOT NULL,
  balance TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

可以看到两者表达的是同一件事。

Drizzle schema 的优点是：

```txt
数据库表结构
  ↓
写成 TypeScript 代码
  ↓
后续查询时可以复用
```

## 六、字段写法说明

看几个常见写法。

```ts
id: text("id").primaryKey()
```

表示：

```txt
数据库字段名是 id
类型是 TEXT
它是主键
```

```ts
name: text("name").notNull()
```

表示：

```txt
name 不能为空
```

```ts
currency: text("currency").notNull().default("CNY")
```

表示：

```txt
币种不能为空
如果没有传，默认是 CNY
```

```ts
createdAt: integer("created_at").notNull()
```

表示：

```txt
TypeScript 里叫 createdAt
数据库字段里叫 created_at
保存整数时间戳
```

这是一种常见习惯：

| TypeScript | SQLite |
| --- | --- |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

TypeScript 里用驼峰命名。

数据库里用下划线命名。

## 七、创建 Drizzle 配置

在 `ai-finance-cfo` 目录下创建：

```txt
drizzle.config.ts
```

写入：

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!
  }
});
```

这个文件告诉 Drizzle Kit：

- schema 文件在哪里。
- migration 文件输出到哪里。
- 使用 SQLite。
- 数据库文件路径从 `DB_FILE_NAME` 读取。

其中：

```ts
config({ path: ".env.local" });
```

表示读取 `.env.local`。

如果没有这一行，普通 `dotenv/config` 默认会读取 `.env`，不一定会读取 `.env.local`。

## 八、用 Drizzle 创建表

运行：

```bash
npx drizzle-kit push
```

这个命令会读取：

```txt
lib/db/schema.ts
```

然后把表结构应用到：

```txt
data/dev.db
```

成功后，可以用 SQLite 查看：

```bash
sqlite3 data/dev.db
```

在 SQLite 里输入：

```sql
.tables
```

应该能看到：

```txt
accounts
```

再输入：

```sql
.schema accounts
```

应该能看到 `accounts` 表结构。

退出：

```sql
.quit
```

这说明 Drizzle 已经帮你创建了表。

## 九、push 和 migration 的区别

Drizzle Kit 常见有两种做法：

| 方式 | 命令 | 适合场景 |
| --- | --- | --- |
| 直接推送 | `drizzle-kit push` | 本地开发、快速练习 |
| 生成迁移 | `drizzle-kit generate` + `drizzle-kit migrate` | 团队协作、正式项目 |

`push` 的特点是：

- 简单。
- 快。
- 适合学习阶段。

`migration` 的特点是：

- 会生成迁移文件。
- 能记录表结构变化历史。
- 更适合多人协作和正式发布。

本课先用：

```bash
npx drizzle-kit push
```

后面项目稳定后，再逐步理解 migration 文件。

## 十、创建数据库连接

创建文件：

```txt
lib/db/client.ts
```

写入：

```ts
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";

config({ path: ".env.local" });

export const db = drizzle(process.env.DB_FILE_NAME!);
```

这个文件的作用是：

> 创建一个可以查询数据库的 db 对象。

后续插入、查询、更新、删除都会通过它完成。

## 十一、创建练习脚本

创建目录：

```txt
scripts/
```

创建文件：

```txt
scripts/accounts-demo.ts
```

写入：

```ts
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
```

这个脚本依次演示：

```txt
insert 插入
select 查询
update 更新
delete 删除
```

先放在脚本里练习，不接页面和 API。

## 十二、运行练习脚本

运行：

```bash
npx tsx scripts/accounts-demo.ts
```

运行后应该能看到类似输出：

```txt
账户列表： [ { id: 'account_001', name: '工资卡', ... } ]
更新后： [ { id: 'account_001', balance: '21000', ... } ]
删除后： []
```

脚本开头会先删除 `account_demo_001`，所以可以重复运行。

如果仍然报主键冲突，说明数据库里可能还有其他重复练习数据。

可以进入 SQLite 清空表：

```bash
sqlite3 data/dev.db
```

```sql
DELETE FROM accounts;
.quit
```

再运行脚本。

## 十三、查询结果是什么形状

这行代码：

```ts
const accountsList = await db.select().from(accounts);
```

返回的是数组。

数组里的每一项是一个账户对象。

形状大致是：

```ts
[
  {
    id: "account_001",
    name: "工资卡",
    type: "bank",
    currency: "CNY",
    balance: "20000",
    createdAt: 1700000000000,
    updatedAt: 1700000000000
  }
]
```

注意这里的字段名是：

```txt
createdAt
updatedAt
```

不是：

```txt
created_at
updated_at
```

因为 Drizzle 会按 schema 里的 TypeScript 字段名返回结果。

这就是 schema 的价值之一：

```txt
数据库字段名
  ↓
映射成 TypeScript 字段名
```

## 十四、和第 13 课 API 的关系

第 13 课的账户 API 现在大概是：

```txt
GET /api/accounts
  ↓
返回 mock-data.ts 里的假数据
```

学完本课后，后续可以变成：

```txt
GET /api/accounts
  ↓
调用 db.select().from(accounts)
  ↓
返回数据库里的账户
```

也就是说，API 路径不需要变。

变化的是 API 内部的数据来源：

```txt
从假数据
  ↓
换成 SQLite
```

这正是前面一直强调的分层：

```txt
页面只关心 API
API 决定数据从哪里来
数据库负责长期保存数据
```

## 十五、常见错误

### 1. 忘记安装依赖

如果运行时报：

```txt
Cannot find module 'drizzle-orm'
```

检查是否执行过：

```bash
npm install drizzle-orm @libsql/client dotenv
```

### 2. 没有配置 DB_FILE_NAME

如果提示数据库地址为空，检查：

```txt
.env.local
```

是否包含：

```env
DB_FILE_NAME=file:data/dev.db
```

### 3. schema 路径写错

如果 `drizzle-kit push` 找不到 schema，检查：

```ts
schema: "./lib/db/schema.ts"
```

是否和真实文件路径一致。

### 4. 重复插入同一个 id

`id` 是主键。

同一个 `id` 只能出现一次。

如果重复插入：

```txt
account_001
```

数据库会报错。

解决方法是换一个 `id`，或者先删除旧记录。

### 5. 金额写成 number

不推荐：

```ts
balance: 20000
```

推荐：

```ts
balance: "20000"
```

本项目金额字段先用字符串保存。

## 十六、实践任务

完成下面任务：

1. 安装 Drizzle 相关依赖。
2. 创建 `.env.local`，配置 `DB_FILE_NAME=file:data/dev.db`。
3. 创建 `lib/db/schema.ts`。
4. 用 Drizzle schema 描述 `accounts` 表。
5. 创建 `drizzle.config.ts`。
6. 运行 `npx drizzle-kit push`。
7. 用 `sqlite3 data/dev.db` 检查 `accounts` 表是否存在。
8. 创建 `lib/db/client.ts`。
9. 创建 `scripts/accounts-demo.ts`。
10. 运行脚本完成插入、查询、更新、删除。

## 十七、验收标准

完成后检查：

- `package.json` 中有 Drizzle 相关依赖。
- `data/dev.db` 中能看到 `accounts` 表。
- `.schema accounts` 能看到账户表字段。
- 脚本能插入一条账户记录。
- 脚本能查询账户列表。
- 脚本能更新账户余额。
- 脚本能删除账户记录。
- 能解释 `schema.ts`、`drizzle.config.ts`、`client.ts` 分别负责什么。

## 十八、复习问题

1. ORM 是什么？
2. Drizzle schema 和 SQL `CREATE TABLE` 有什么关系？
3. `drizzle-kit push` 做了什么？
4. `drizzle.config.ts` 负责什么？
5. `lib/db/client.ts` 负责什么？
6. 为什么 `id` 不能重复？
7. 为什么本项目金额字段仍然保存成字符串？
8. 第 13 课的 `/api/accounts` 后续如何从假数据切换到数据库？

## 十九、本课小结

这一课完成了数据库访问的第一条小闭环：

```txt
Drizzle schema
  ↓
SQLite accounts 表
  ↓
Drizzle 插入账户
  ↓
Drizzle 查询账户
```

现在项目已经具备把账户数据放进 SQLite 的基础能力。

本课仍然只是在脚本里操作数据库。

下一步会继续设计更完整的财务数据模型，区分前端类型、Zod schema、Drizzle schema，并为账户、流水、负债、目标、场景和计算历史打好结构基础。
