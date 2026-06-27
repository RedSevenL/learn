# 第 14 课：SQLite 基础

## 本课目标

项目现在已经有了 API：

```txt
GET /api/health
GET /api/accounts
```

`/api/accounts` 目前返回的是假数据。

接下来要让账户、流水、负债这些数据能保存到本地文件里。

这一课先学习 SQLite 的基础概念，不急着接入 Next.js，也不急着写 Drizzle。

你会学到：

- 数据库是什么。
- 表、字段、记录、主键是什么。
- SQLite 为什么适合本地优先应用。
- 常见 SQLite 数据类型。
- 账户表、流水表、负债表之间是什么关系。
- 如何用 `sqlite3` 创建一个本地数据库文件。

学完本课后，你应该能够：

- 说清楚数据库和普通假数据数组的区别。
- 说清楚表、字段、记录、主键的含义。
- 创建一个 SQLite 数据库文件。
- 画出账户、流水、负债三张表的基础结构。
- 说明账户和流水为什么需要关联。

## 一、为什么需要数据库

前面的账户数据放在 `lib/mock-data.ts` 里。

这种方式适合搭页面和写 API 示例，但不适合真实使用。

因为假数据有几个问题：

- 用户新增的数据不能长期保存。
- 重启项目后数据仍然是写死的内容。
- 数据越来越多时不好查询。
- 账户、流水、负债之间的关系不好维护。
- 后续 AI 问答和财务计算需要稳定的数据来源。

数据库的作用是：

> 用结构化方式保存、查询和管理数据。

后续项目的数据流会逐步变成：

```txt
前端页面
  ↓
API
  ↓
数据库
  ↓
API 返回 JSON
  ↓
前端展示
```

这一课先只学习数据库本身。

## 二、SQLite 是什么

SQLite 是一种轻量级数据库。

它最大的特点是：

> 数据库就是一个本地文件。

例如后续项目里可以有一个文件：

```txt
ai-finance-cfo/data/dev.db
```

这个文件里保存账户、流水、负债等数据。

SQLite 适合本项目的原因：

- 不需要单独安装数据库服务器。
- 适合本地优先的个人财务应用。
- 数据默认保存在用户自己的电脑上。
- 学习成本比大型数据库低。
- 后续可以通过 Drizzle 在 TypeScript 中访问它。

现在先用 SQLite 理解数据库基本概念。

## 三、表、字段、记录、主键

数据库里最重要的是表。

可以把表理解成一张 Excel 表格。

例如账户表：

| id | name | type | balance |
| --- | --- | --- | --- |
| account_001 | 工资卡 | bank | 20000 |
| account_002 | 现金 | cash | 1000 |
| account_003 | 信用卡 | credit | -3500 |

这里有几个概念：

| 概念 | 含义 | 例子 |
| --- | --- | --- |
| 表 | 保存同一类数据的地方 | `accounts` |
| 字段 | 每条数据有哪些属性 | `name`、`type`、`balance` |
| 记录 | 表里的一行数据 | 工资卡这一行 |
| 主键 | 每条记录的唯一标识 | `account_001` |

主键很重要。

如果两个账户都叫“工资卡”，名字就不能唯一识别账户。

所以需要 `id`：

```txt
account_001
account_002
account_003
```

后续流水、负债也都需要自己的 `id`。

## 四、常见 SQLite 数据类型

SQLite 常用数据类型不多。

当前先记住这些：

| 类型 | 含义 | 例子 |
| --- | --- | --- |
| `TEXT` | 文本 | `"工资卡"` |
| `INTEGER` | 整数 | `1700000000000` |
| `REAL` | 小数 | `3.5` |
| `BLOB` | 二进制数据 | 文件内容 |
| `NULL` | 空值 | 暂无备注 |

本项目里会经常用：

- `TEXT` 保存名称、类型、金额字符串。
- `INTEGER` 保存时间戳、还款日。
- `TEXT` 保存 JSON 字符串。

金额字段建议先用 `TEXT`。

不要急着用 `REAL` 存金额。

原因是财务金额需要精确，普通小数容易出现精度问题。

例如 JavaScript 里：

```js
0.1 + 0.2
```

结果不是严格的 `0.3`。

所以后续项目会用：

```txt
数据库中用 TEXT 保存金额
TypeScript 计算时用 decimal.js 处理金额
```

例如：

```txt
"20000"
"1000"
"-3500"
```

## 五、账户表

账户表保存用户有哪些账户。

表名可以叫：

```txt
accounts
```

基础字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `id` | `TEXT` | 账户唯一 ID |
| `name` | `TEXT` | 账户名称 |
| `type` | `TEXT` | 账户类型 |
| `currency` | `TEXT` | 币种 |
| `balance` | `TEXT` | 当前余额 |
| `created_at` | `INTEGER` | 创建时间 |
| `updated_at` | `INTEGER` | 更新时间 |

账户类型可以先用：

```txt
cash
bank
credit
investment
```

示例记录：

| id | name | type | currency | balance |
| --- | --- | --- | --- | --- |
| account_001 | 工资卡 | bank | CNY | 20000 |
| account_002 | 现金 | cash | CNY | 1000 |
| account_003 | 信用卡 | credit | CNY | -3500 |

## 六、流水表

流水表保存每一笔收入、支出或转账。

表名可以叫：

```txt
transactions
```

基础字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `id` | `TEXT` | 流水唯一 ID |
| `account_id` | `TEXT` | 关联哪个账户 |
| `occurred_at` | `INTEGER` | 发生时间 |
| `amount` | `TEXT` | 金额 |
| `direction` | `TEXT` | 方向 |
| `category` | `TEXT` | 分类 |
| `merchant` | `TEXT` | 商户 |
| `note` | `TEXT` | 备注 |
| `source` | `TEXT` | 来源 |
| `raw_payload` | `TEXT` | 原始数据 |
| `created_at` | `INTEGER` | 创建时间 |

`direction` 可以先用：

```txt
income
expense
transfer
```

`source` 可以先用：

```txt
manual
csv
api
```

流水必须知道属于哪个账户。

所以 `transactions` 里有一个字段：

```txt
account_id
```

它保存的是 `accounts.id`。

关系可以这样理解：

```txt
accounts.id
  ↓
transactions.account_id
```

例如：

| id | account_id | amount | direction | category |
| --- | --- | --- | --- | --- |
| tx_001 | account_001 | 30000 | income | 工资 |
| tx_002 | account_001 | -6000 | expense | 房租 |
| tx_003 | account_002 | -100 | expense | 餐饮 |

这样就能查出：

> 工资卡下面有哪些流水。

## 七、负债表

负债表保存贷款、信用卡分期、消费贷等数据。

表名可以叫：

```txt
liabilities
```

基础字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `id` | `TEXT` | 负债唯一 ID |
| `name` | `TEXT` | 负债名称 |
| `principal` | `TEXT` | 原始本金 |
| `remaining_principal` | `TEXT` | 剩余本金 |
| `annual_rate` | `TEXT` | 年利率 |
| `minimum_payment` | `TEXT` | 最低还款额 |
| `due_day` | `INTEGER` | 每月还款日 |
| `start_date` | `INTEGER` | 开始日期 |
| `end_date` | `INTEGER` | 结束日期 |
| `created_at` | `INTEGER` | 创建时间 |

示例记录：

| id | name | remaining_principal | annual_rate | due_day |
| --- | --- | --- | --- | --- |
| liability_001 | 信用卡分期 | 12000 | 0.12 | 15 |
| liability_002 | 房贷 | 800000 | 0.042 | 20 |

负债可以先独立建表。

后续如果需要把还款流水和某笔负债关联起来，再增加关联字段。

## 八、三张表的关系

当前阶段先理解这三张表：

```txt
accounts
transactions
liabilities
```

基础关系：

```txt
一个账户可以有多条流水
一条流水通常属于一个账户
负债先独立保存
```

可以画成：

```txt
accounts
  id
  name
  type
  balance
    │
    │ 一个账户对应多条流水
    ↓
transactions
  id
  account_id
  amount
  direction
  category

liabilities
  id
  name
  remaining_principal
  annual_rate
```

这个关系会支撑后续功能：

- 查看某个账户的流水。
- 统计每月收入和支出。
- 计算月结余和储蓄率。
- 评估负债还款压力。
- 回答 AI 财务问题。

## 九、创建本地 SQLite 数据库

进入项目目录：

```bash
cd ai-finance-cfo
```

创建一个保存练习数据库的目录：

```bash
mkdir -p data
```

创建并打开 SQLite 数据库：

```bash
sqlite3 data/dev.db
```

进入 SQLite 后，会看到类似提示：

```txt
sqlite>
```

输入：

```sql
.databases
```

可以看到当前数据库文件路径。

输入：

```sql
.tables
```

现在应该还没有表。

退出 SQLite：

```sql
.quit
```

此时项目里会出现：

```txt
ai-finance-cfo/data/dev.db
```

这个文件就是本地 SQLite 数据库。

练习数据库文件不需要提交到 Git。

## 十、创建一张练习表

再次打开数据库：

```bash
sqlite3 data/dev.db
```

输入：

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

查看表：

```sql
.tables
```

查看表结构：

```sql
.schema accounts
```

应该能看到刚才创建的 `accounts` 表。

插入一条练习数据：

```sql
INSERT INTO accounts (
  id,
  name,
  type,
  currency,
  balance,
  created_at,
  updated_at
) VALUES (
  'account_001',
  '工资卡',
  'bank',
  'CNY',
  '20000',
  1700000000000,
  1700000000000
);
```

查询账户：

```sql
SELECT * FROM accounts;
```

退出：

```sql
.quit
```

这一步不是最终项目写法。

最终项目会通过 Drizzle 创建表和查询数据。

现在手动写 SQL，是为了看清楚数据库实际保存了什么。

## 十一、表结构草图

把三张表先设计成草图：

```txt
accounts
- id: TEXT, primary key
- name: TEXT
- type: TEXT
- currency: TEXT
- balance: TEXT
- created_at: INTEGER
- updated_at: INTEGER

transactions
- id: TEXT, primary key
- account_id: TEXT, references accounts.id
- occurred_at: INTEGER
- amount: TEXT
- direction: TEXT
- category: TEXT
- merchant: TEXT
- note: TEXT
- source: TEXT
- raw_payload: TEXT
- created_at: INTEGER

liabilities
- id: TEXT, primary key
- name: TEXT
- principal: TEXT
- remaining_principal: TEXT
- annual_rate: TEXT
- minimum_payment: TEXT
- due_day: INTEGER
- start_date: INTEGER
- end_date: INTEGER
- created_at: INTEGER
```

当前只需要能读懂这份草图。

下一课会把其中的账户表转换成 Drizzle schema，让 TypeScript 代码也能理解数据库结构。

## 十二、常见问题

### 1. 数据库文件在哪里

本课建议放在：

```txt
ai-finance-cfo/data/dev.db
```

它是本地练习文件。

### 2. 为什么金额用 TEXT

金额需要精确。

数据库先保存字符串，计算时再交给专门的金额计算工具处理。

不要用普通小数直接承担财务计算。

### 3. 为什么流水要有 account_id

因为一条流水需要知道属于哪个账户。

例如房租支出是从工资卡扣的，还是从现金支付的，这会影响账户余额和财务分析。

### 4. SQLite 和 API 是什么关系

API 负责接收前端请求。

SQLite 负责保存数据。

后续关系会变成：

```txt
GET /api/accounts
  ↓
查询 SQLite
  ↓
返回账户 JSON
```

## 十三、实践任务

完成下面任务：

1. 进入 `ai-finance-cfo` 目录。
2. 创建 `data/dev.db`。
3. 用 `.databases` 查看数据库路径。
4. 创建 `accounts` 练习表。
5. 用 `.schema accounts` 查看表结构。
6. 插入一条账户记录。
7. 用 `SELECT * FROM accounts;` 查询记录。
8. 在纸上或 Markdown 笔记里画出 `accounts`、`transactions`、`liabilities` 三张表草图。

## 十四、验收标准

完成后检查：

- 能说出 SQLite 数据库是一个本地文件。
- 能解释表、字段、记录、主键。
- 能创建 `data/dev.db`。
- 能在 SQLite 里看到 `accounts` 表。
- 能查询出一条账户记录。
- 能说明 `transactions.account_id` 为什么要关联 `accounts.id`。
- 能说明金额为什么先用 `TEXT` 保存。

## 十五、复习问题

1. 数据库和 `mock-data.ts` 里的数组有什么区别？
2. 什么是表？
3. 什么是主键？
4. 为什么账户表需要 `id`，不能只用账户名称？
5. `accounts` 和 `transactions` 是什么关系？
6. `liabilities` 表适合保存哪些数据？
7. 为什么 SQLite 适合本地优先应用？
8. 为什么本课只手写 SQL，不直接写 Drizzle？

## 十六、本课小结

这一课把数据从“写死在代码里”推进到了“保存在本地数据库文件里”。

现在你已经知道：

- SQLite 是一个本地数据库文件。
- 表用来保存同一类数据。
- 字段描述每条数据有哪些属性。
- 主键用来唯一识别一条记录。
- 账户和流水之间需要通过 `account_id` 关联。
- 金额字段先用字符串保存更稳妥。

下一步会学习 Drizzle ORM。

到那时，我们不再手写 SQL 创建账户表，而是用 TypeScript 代码描述数据库结构，并让 API 逐步从数据库读取账户数据。
