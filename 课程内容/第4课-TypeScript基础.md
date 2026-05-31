# 第 4 课：TypeScript 基础

## 本课目标

上一课我们学习了 JavaScript 基础，已经可以写出简单的变量、对象、数组、条件判断、循环和函数。

这一课要学习 TypeScript。

TypeScript 可以理解为：

> 给 JavaScript 加上类型规则，让代码在运行前更容易发现错误。

本课不会讲复杂类型技巧，只学习项目中马上会用到的基础能力：

- 为什么要用 TypeScript。
- 如何给变量加类型标注。
- 如何给函数输入和返回值加类型。
- 如何用 `interface` 和 `type` 描述对象结构。
- 如何使用可选字段。
- 如何使用联合类型限制可选值。
- 如何定义 `Account`、`Transaction`、`Liability` 三个基础类型。
- 当前简化类型和后续数据库正式模型有什么区别。

学完本课后，你应该能够：

- 看懂基础 TypeScript 代码。
- 理解类型错误和运行错误的区别。
- 给财务数据对象定义清晰结构。
- 写出带类型的月结余计算函数。
- 为后续数据库 schema、API、表单和计算引擎打基础。
- 理解本课类型只是前期简化版，后面会继续扩展成正式数据模型。

## 一、为什么要用 TypeScript

JavaScript 很灵活。

灵活的好处是上手快，但坏处是很多错误要等到程序运行时才会暴露。

例如：

```js
function calculateMonthlySurplus(income, expense) {
  return income - expense;
}

console.log(calculateMonthlySurplus("30000", 18000));
```

这段代码看起来可以运行，但第一个参数传的是字符串 `"30000"`，不是数字 `30000`。

在小练习里，这类问题可能不严重。

但在财务项目中，数据类型混乱会带来很大风险。

例如：

- 金额本来应该是数字，却传成了文本。
- 流水类型本来只能是收入或支出，却传成了其他值。
- 账户余额字段写错名字，导致页面显示空值。
- 负债利率漏填，导致还款计算不可信。

TypeScript 的价值就是提前提醒这些问题。

它不能保证业务逻辑一定正确，但能减少很多低级错误。

## 二、TypeScript 和 JavaScript 的关系

TypeScript 不是一门完全独立的新语言。

你可以把它理解成：

> TypeScript = JavaScript + 类型系统

例如 JavaScript 写法：

```js
const monthlyIncome = 30000;
```

TypeScript 可以写成：

```ts
const monthlyIncome: number = 30000;
```

多出来的 `: number` 就是类型标注。

它表示：

> monthlyIncome 必须是一个数字。

如果写成：

```ts
const monthlyIncome: number = "30000";
```

编辑器会提示错误，因为 `"30000"` 是字符串，不是数字。

## 三、在项目里写 TypeScript

上一课我们提到，Next.js 项目里常见两种 TypeScript 文件：

```txt
.ts
.tsx
```

其中：

- `.ts`：普通 TypeScript 逻辑文件。
- `.tsx`：包含 React JSX 的页面或组件文件。

本课先练习 `.ts` 文件。

你可以在 `ai-finance-cfo` 项目根目录下创建：

```txt
practice.ts
```

然后写入：

```ts
const monthlyIncome: number = 30000;
const monthlyExpense: number = 18000;

const surplus = monthlyIncome - monthlyExpense;

console.log(surplus);
```

如果你的项目是上一课用 `create-next-app` 创建的，通常已经带有 TypeScript 支持。

后续我们更多会在 Next.js 页面、组件和业务逻辑文件中直接使用 TypeScript。

## 四、基础类型标注

TypeScript 中最常见的基础类型包括：

- `string`
- `number`
- `boolean`

### 1. string

`string` 表示字符串，也就是文本。

```ts
const accountName: string = "工资卡";
const category: string = "餐饮";
```

如果写成：

```ts
const accountName: string = 123;
```

TypeScript 会报错。

因为 `123` 是数字，不是字符串。

### 2. number

`number` 表示数字。

```ts
const monthlyIncome: number = 30000;
const monthlyExpense: number = 18000;
```

可以做加减乘除：

```ts
const surplus: number = monthlyIncome - monthlyExpense;
```

本课先继续用 `number` 练习。

但要记住：真实金额计算后面会升级为更严谨的方式，避免小数精度问题。

### 3. boolean

`boolean` 表示布尔值，也就是 `true` 或 `false`。

```ts
const hasDebt: boolean = true;
const isDeficit: boolean = false;
```

也可以来自比较结果：

```ts
const surplus: number = -5000;
const isDeficit: boolean = surplus < 0;
```

## 五、TypeScript 可以自动推断类型

很多时候，你不需要给每个变量都手动写类型。

例如：

```ts
const monthlyIncome = 30000;
```

TypeScript 会自动推断：

> monthlyIncome 是 number 类型。

再比如：

```ts
const accountName = "工资卡";
```

TypeScript 会自动推断：

> accountName 是 string 类型。

这叫类型推断。

所以实际写代码时，不需要这样写得很啰嗦：

```ts
const monthlyIncome: number = 30000;
const accountName: string = "工资卡";
const hasDebt: boolean = true;
```

可以直接写：

```ts
const monthlyIncome = 30000;
const accountName = "工资卡";
const hasDebt = true;
```

但函数参数、复杂对象、API 数据、数据库数据，通常应该明确写类型。

## 六、给函数参数和返回值加类型

上一课我们写过月结余计算函数：

```js
function calculateMonthlySurplus(income, expense) {
  return income - expense;
}
```

改成 TypeScript 后，可以这样写：

```ts
function calculateMonthlySurplus(income: number, expense: number): number {
  return income - expense;
}
```

这里有三处类型：

- `income: number`：收入必须是数字。
- `expense: number`：支出必须是数字。
- `): number`：函数返回值必须是数字。

使用：

```ts
const surplus = calculateMonthlySurplus(30000, 18000);

console.log(surplus);
```

如果传入错误类型：

```ts
calculateMonthlySurplus("30000", 18000);
```

TypeScript 会提示错误。

这比等到运行后才发现问题更早、更安全。

## 七、函数返回对象

财务计算通常不只返回一个数字。

例如月度摘要需要返回：

- 收入。
- 支出。
- 结余。
- 是否超支。
- 提示文案。

可以先这样写：

```ts
function calculateMonthlySummary(income: number, expense: number) {
  const surplus = income - expense;
  const isDeficit = surplus < 0;

  let message = "";

  if (surplus > 0) {
    message = `本月结余 ${surplus} 元`;
  } else if (surplus === 0) {
    message = "本月收支平衡";
  } else {
    message = `本月超支 ${Math.abs(surplus)} 元`;
  }

  return {
    income,
    expense,
    surplus,
    isDeficit,
    message
  };
}
```

TypeScript 可以自动推断返回对象的结构。

但为了让函数更清楚，也可以单独定义返回类型。

```ts
type MonthlySummary = {
  income: number;
  expense: number;
  surplus: number;
  isDeficit: boolean;
  message: string;
};

function calculateMonthlySummary(
  income: number,
  expense: number
): MonthlySummary {
  const surplus = income - expense;
  const isDeficit = surplus < 0;

  let message = "";

  if (surplus > 0) {
    message = `本月结余 ${surplus} 元`;
  } else if (surplus === 0) {
    message = "本月收支平衡";
  } else {
    message = `本月超支 ${Math.abs(surplus)} 元`;
  }

  return {
    income,
    expense,
    surplus,
    isDeficit,
    message
  };
}
```

这样一眼就能看出函数会返回什么。

## 八、对象类型

上一课我们用对象表示账户：

```js
const account = {
  name: "工资卡",
  type: "cash",
  balance: 20000
};
```

在 TypeScript 中，我们可以给这个对象定义结构。

```ts
type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
};
```

然后使用：

```ts
const account: Account = {
  id: "account_001",
  name: "工资卡",
  type: "cash",
  balance: 20000
};
```

这表示：

> account 必须符合 Account 类型规定的结构。

如果少写一个字段：

```ts
const account: Account = {
  id: "account_001",
  name: "工资卡",
  type: "cash"
};
```

TypeScript 会提示错误，因为缺少 `balance`。

如果字段类型写错：

```ts
const account: Account = {
  id: "account_001",
  name: "工资卡",
  type: "cash",
  balance: "20000"
};
```

TypeScript 也会提示错误，因为 `balance` 应该是数字。

## 九、interface 和 type

TypeScript 中常用 `interface` 和 `type` 定义对象结构。

例如用 `interface`：

```ts
interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}
```

用 `type`：

```ts
type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
};
```

这两种写法在基础对象类型上都可以。

初学阶段可以先简单记住：

- `interface` 常用于描述对象结构。
- `type` 更灵活，除了对象，也能定义联合类型等。

本课程里两种都会见到。

为了降低理解成本，当前阶段可以优先使用 `type`。

## 十、可选字段

有些字段不是每个对象都有。

例如账户可以有备注，也可以没有备注。

这时可以使用 `?` 表示可选字段。

```ts
type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  note?: string;
};
```

这里的 `note?: string` 表示：

> note 字段可以存在，也可以不存在；如果存在，必须是字符串。

下面两种写法都合法：

```ts
const accountA: Account = {
  id: "account_001",
  name: "工资卡",
  type: "cash",
  balance: 20000
};
```

```ts
const accountB: Account = {
  id: "account_002",
  name: "备用金账户",
  type: "cash",
  balance: 5000,
  note: "用于短期应急"
};
```

可选字段很适合描述真实业务数据。

例如：

- 账户备注可选。
- 流水分类可选。
- 负债还款日可选。
- AI 解析结果中的某些参数可选。

## 十一、联合类型

如果一个字段只能从几个固定值里选择，可以使用联合类型。

例如账户类型不应该随便写。

不推荐：

```ts
type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
};
```

这里 `type: string` 太宽松。

别人可以写：

```ts
const account: Account = {
  id: "account_001",
  name: "工资卡",
  type: "随便写一个类型",
  balance: 20000
};
```

TypeScript 不会阻止，因为它确实是字符串。

更好的写法是：

```ts
type AccountType = "cash" | "bank" | "credit" | "investment";

type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
};
```

这表示 `type` 只能是四个值之一：

- `"cash"`
- `"bank"`
- `"credit"`
- `"investment"`

如果写成：

```ts
type: "other"
```

TypeScript 就会提示错误。

## 十二、为流水定义类型

流水是个人财务项目中非常核心的数据。

一条流水至少需要：

- 唯一 id。
- 标题。
- 金额。
- 类型。
- 分类。
- 日期。
- 所属账户。

可以先定义流水类型：

```ts
type TransactionType = "income" | "expense";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  accountId: string;
  note?: string;
};
```

然后创建一条流水：

```ts
const salary: Transaction = {
  id: "transaction_001",
  title: "工资",
  amount: 30000,
  type: "income",
  category: "工资",
  date: "2026-05-01",
  accountId: "account_001"
};
```

再创建一条支出：

```ts
const rent: Transaction = {
  id: "transaction_002",
  title: "房租",
  amount: 6000,
  type: "expense",
  category: "居住",
  date: "2026-05-03",
  accountId: "account_001",
  note: "每月固定支出"
};
```

这里 `type` 只能是 `"income"` 或 `"expense"`。

这可以避免把流水类型写成 `"支出"`、`"out"`、`"cost"` 等不统一的值。

统一的数据结构，是后面统计和计算的基础。

## 十三、为负债定义类型

负债也是本项目的重要数据。

例如：

- 房贷。
- 车贷。
- 信用卡欠款。
- 消费贷。

可以先定义负债类型：

```ts
type LiabilityType = "mortgage" | "car_loan" | "credit_card" | "consumer_loan" | "other";

type Liability = {
  id: string;
  name: string;
  type: LiabilityType;
  principal: number;
  annualInterestRate: number;
  monthlyPayment: number;
  remainingMonths?: number;
  dueDay?: number;
  note?: string;
};
```

字段含义：

| 字段 | 含义 |
| --- | --- |
| `id` | 负债唯一标识 |
| `name` | 负债名称 |
| `type` | 负债类型 |
| `principal` | 剩余本金 |
| `annualInterestRate` | 年化利率 |
| `monthlyPayment` | 每月还款额 |
| `remainingMonths` | 剩余还款月数 |
| `dueDay` | 每月还款日 |
| `note` | 备注 |

示例：

```ts
const mortgage: Liability = {
  id: "liability_001",
  name: "房贷",
  type: "mortgage",
  principal: 800000,
  annualInterestRate: 3.5,
  monthlyPayment: 4200,
  remainingMonths: 240,
  dueDay: 15
};
```

这里先用 `number` 表示金额和利率。

后面学习数据库和精确金额计算时，我们会进一步调整金额字段的存储方式。

## 十四、金额字段为什么后面会改成字符串

你可能会疑惑：

既然 TypeScript 里可以用 `number`，为什么后面课程还会说“金额用字符串存储”？

原因是 JavaScript 的 `number` 在小数计算上有精度问题。

例如：

```ts
console.log(0.1 + 0.2);
```

结果可能是：

```txt
0.30000000000000004
```

真实财务应用不能随便接受这种误差。

所以后面我们会学习：

- 数据库存储金额时使用字符串。
- 计算时使用 `decimal.js`。
- 展示时再格式化成人能读懂的金额。

本课为了降低难度，仍然先用 `number`。

你只需要先建立一个意识：

> TypeScript 类型能帮助我们约束数据结构，但金额精度问题还需要专门的计算方案解决。

## 十五、当前类型只是简化版

本课定义的 `Account`、`Transaction`、`Liability` 是前期学习用的简化类型。

它们的作用是帮助你先理解：

- 一个账户需要哪些基础字段。
- 一条流水如何表示收入或支出。
- 一笔负债如何记录本金、利率和还款额。

但它们还不是最终数据库模型。

后面进入数据库阶段时，正式模型会继续增加一些字段。

例如账户可能会增加：

- `currency`：币种。
- `createdAt`：创建时间。
- `updatedAt`：更新时间。
- `deletedAt`：软删除时间。
- `rawPayload`：原始导入数据。

流水可能会增加：

- `merchant`：商户。
- `source`：来源。
- `externalId`：外部账单 ID。
- `isIgnored`：是否忽略。

所以当前阶段不要把类型设计得过度复杂。

更重要的是先掌握一个方法：

> 用 TypeScript 类型把业务数据的结构说清楚。

## 十六、数组类型

如果要表示一组账户，可以写：

```ts
const accounts: Account[] = [
  {
    id: "account_001",
    name: "工资卡",
    type: "bank",
    balance: 20000
  },
  {
    id: "account_002",
    name: "现金",
    type: "cash",
    balance: 1000
  }
];
```

`Account[]` 表示：

> 这是一个数组，数组里的每一项都必须是 Account。

流水数组也一样：

```ts
const transactions: Transaction[] = [
  {
    id: "transaction_001",
    title: "工资",
    amount: 30000,
    type: "income",
    category: "工资",
    date: "2026-05-01",
    accountId: "account_001"
  },
  {
    id: "transaction_002",
    title: "房租",
    amount: 6000,
    type: "expense",
    category: "居住",
    date: "2026-05-03",
    accountId: "account_001"
  }
];
```

这样可以防止数组里混入错误结构的数据。

## 十七、用类型改写流水统计函数

上一课我们写过从流水数组统计收入和支出的函数。

现在可以给它加上类型。

```ts
type TransactionType = "income" | "expense";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  accountId: string;
  note?: string;
};

type MonthlySummary = {
  income: number;
  expense: number;
  surplus: number;
  isDeficit: boolean;
  message: string;
};

function calculateSummaryFromTransactions(
  transactions: Transaction[]
): MonthlySummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      totalIncome = totalIncome + transaction.amount;
    }

    if (transaction.type === "expense") {
      totalExpense = totalExpense + transaction.amount;
    }
  }

  const surplus = totalIncome - totalExpense;
  const isDeficit = surplus < 0;

  let message = "";

  if (surplus > 0) {
    message = `本月结余 ${surplus} 元`;
  } else if (surplus === 0) {
    message = "本月收支平衡";
  } else {
    message = `本月超支 ${Math.abs(surplus)} 元`;
  }

  return {
    income: totalIncome,
    expense: totalExpense,
    surplus,
    isDeficit,
    message
  };
}
```

这段代码比上一课更长，但更清楚。

函数现在明确表达：

- 输入必须是 `Transaction[]`。
- 输出必须是 `MonthlySummary`。
- 每一条流水的 `type` 只能是 `"income"` 或 `"expense"`。
- 返回结果必须包含收入、支出、结余、是否超支和提示文案。

## 十八、类型如何帮助编辑器提示

TypeScript 不只是用来报错，它还能让编辑器更聪明。

例如：

```ts
const transaction: Transaction = {
  id: "transaction_001",
  title: "工资",
  amount: 30000,
  type: "income",
  category: "工资",
  date: "2026-05-01",
  accountId: "account_001"
};

console.log(transaction.amount);
```

当你输入 `transaction.` 时，VS Code 会提示：

- `id`
- `title`
- `amount`
- `type`
- `category`
- `date`
- `accountId`
- `note`

这对真实项目很重要。

因为随着项目变大，你不可能记住每个对象有哪些字段。

类型定义越清楚，编辑器提示越可靠，写代码越不容易出错。

## 十九、常见错误

### 1. 字段类型不匹配

错误写法：

```ts
const account: Account = {
  id: "account_001",
  name: "工资卡",
  type: "bank",
  balance: "20000"
};
```

`balance` 应该是数字，不是字符串。

正确写法：

```ts
const account: Account = {
  id: "account_001",
  name: "工资卡",
  type: "bank",
  balance: 20000
};
```

### 2. 联合类型写了不允许的值

错误写法：

```ts
const transaction: Transaction = {
  id: "transaction_001",
  title: "午餐",
  amount: 35,
  type: "cost",
  category: "餐饮",
  date: "2026-05-01",
  accountId: "account_001"
};
```

如果 `TransactionType` 只允许 `"income"` 或 `"expense"`，那么 `"cost"` 就是不合法的。

正确写法：

```ts
type: "expense"
```

### 3. 少写必填字段

错误写法：

```ts
const liability: Liability = {
  id: "liability_001",
  name: "房贷",
  type: "mortgage",
  principal: 800000
};
```

如果 `annualInterestRate` 和 `monthlyPayment` 是必填字段，就不能省略。

### 4. 把可选字段当成一定存在

如果字段是可选的：

```ts
type Account = {
  id: string;
  name: string;
  note?: string;
};
```

那么 `note` 可能不存在。

使用前最好先判断：

```ts
if (account.note) {
  console.log(account.note);
}
```

后面课程会继续学习更完整的处理方式。

## 二十、完整练习代码

可以在项目中创建：

```txt
practice.ts
```

写入下面这段代码：

```ts
type AccountType = "cash" | "bank" | "credit" | "investment";

type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  note?: string;
};

type TransactionType = "income" | "expense";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  accountId: string;
  note?: string;
};

type LiabilityType = "mortgage" | "car_loan" | "credit_card" | "consumer_loan" | "other";

type Liability = {
  id: string;
  name: string;
  type: LiabilityType;
  principal: number;
  annualInterestRate: number;
  monthlyPayment: number;
  remainingMonths?: number;
  dueDay?: number;
  note?: string;
};

type MonthlySummary = {
  income: number;
  expense: number;
  surplus: number;
  isDeficit: boolean;
  message: string;
};

const accounts: Account[] = [
  {
    id: "account_001",
    name: "工资卡",
    type: "bank",
    balance: 20000
  },
  {
    id: "account_002",
    name: "现金",
    type: "cash",
    balance: 1000,
    note: "日常备用现金"
  }
];

const transactions: Transaction[] = [
  {
    id: "transaction_001",
    title: "工资",
    amount: 30000,
    type: "income",
    category: "工资",
    date: "2026-05-01",
    accountId: "account_001"
  },
  {
    id: "transaction_002",
    title: "房租",
    amount: 6000,
    type: "expense",
    category: "居住",
    date: "2026-05-03",
    accountId: "account_001"
  },
  {
    id: "transaction_003",
    title: "餐饮",
    amount: 2500,
    type: "expense",
    category: "餐饮",
    date: "2026-05-10",
    accountId: "account_001"
  }
];

const liabilities: Liability[] = [
  {
    id: "liability_001",
    name: "房贷",
    type: "mortgage",
    principal: 800000,
    annualInterestRate: 3.5,
    monthlyPayment: 4200,
    remainingMonths: 240,
    dueDay: 15
  }
];

function calculateSummaryFromTransactions(
  transactions: Transaction[]
): MonthlySummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      totalIncome = totalIncome + transaction.amount;
    }

    if (transaction.type === "expense") {
      totalExpense = totalExpense + transaction.amount;
    }
  }

  const surplus = totalIncome - totalExpense;
  const isDeficit = surplus < 0;

  let message = "";

  if (surplus > 0) {
    message = `本月结余 ${surplus} 元`;
  } else if (surplus === 0) {
    message = "本月收支平衡";
  } else {
    message = `本月超支 ${Math.abs(surplus)} 元`;
  }

  return {
    income: totalIncome,
    expense: totalExpense,
    surplus,
    isDeficit,
    message
  };
}

const summary = calculateSummaryFromTransactions(transactions);

console.log(accounts);
console.log(liabilities);
console.log(summary);
console.log(summary.message);
```

如果你想直接运行 `.ts` 文件，需要额外工具支持，例如 `tsx`。

后续课程会更多通过 Next.js 项目本身编译 TypeScript，所以本课重点不是运行命令，而是理解类型如何约束代码。

如果已经安装了 `tsx`，可以运行：

```bash
npx tsx practice.ts
```

## 二十一、本课实践任务

请完成以下任务。

### 任务 1：创建 TypeScript 练习文件

在 `ai-finance-cfo` 项目中创建：

```txt
practice.ts
```

### 任务 2：定义账户类型 Account

要求包含：

- `id`
- `name`
- `type`
- `balance`
- `note`

其中 `note` 是可选字段。

`type` 建议使用联合类型：

```ts
type AccountType = "cash" | "bank" | "credit" | "investment";
```

### 任务 3：定义流水类型 Transaction

要求包含：

- `id`
- `title`
- `amount`
- `type`
- `category`
- `date`
- `accountId`
- `note`

其中 `note` 是可选字段。

`type` 只能是：

```ts
"income" | "expense"
```

### 任务 4：定义负债类型 Liability

要求包含：

- `id`
- `name`
- `type`
- `principal`
- `annualInterestRate`
- `monthlyPayment`
- `remainingMonths`
- `dueDay`
- `note`

其中 `remainingMonths`、`dueDay`、`note` 可以设为可选字段。

### 任务 5：用类型创建示例数据

分别创建：

- 至少 2 个账户。
- 至少 3 条流水。
- 至少 1 条负债。

### 任务 6：给月度统计函数加类型

把上一课的流水统计函数改成 TypeScript 版本。

函数要求：

- 输入是 `Transaction[]`。
- 返回值包含收入、支出、结余、是否超支和提示文案。

## 二十二、本课验收标准

完成本课后，你应该做到：

- 能定义 `Account`、`Transaction`、`Liability` 三个简化类型。
- 能使用联合类型限制账户类型、流水类型和负债类型。
- 能使用 `?` 定义可选字段。
- 能给函数参数和返回值添加类型。
- 能说明本课类型是前期简化版，后续数据库阶段还会继续扩展。

## 二十三、检查清单

完成本课后，你应该能回答：

- TypeScript 和 JavaScript 是什么关系？
- 为什么财务项目适合使用 TypeScript？
- `string`、`number`、`boolean` 分别表示什么？
- 什么是类型推断？
- 函数参数类型写在哪里？
- 函数返回值类型写在哪里？
- `type` 可以用来做什么？
- `interface` 可以用来做什么？
- 可选字段 `?` 表示什么？
- 联合类型适合解决什么问题？
- 为什么 `TransactionType` 不应该直接写成 `string`？
- `Account[]` 表示什么？
- `Account`、`Transaction`、`Liability` 三个类型分别描述什么数据？

## 二十四、本课小结

这一课我们把上一课的 JavaScript 基础升级到了 TypeScript。

你需要记住三句话：

1. TypeScript 不是替代 JavaScript，而是给 JavaScript 加上类型规则。
2. 类型可以提前发现很多字段写错、类型传错、取值不统一的问题。
3. 财务项目的数据结构必须清晰，否则后面的数据库、API、计算和 AI 解析都会变得不可靠。

本课最重要的实践成果是定义三个基础类型：

- `Account`
- `Transaction`
- `Liability`

后面课程会不断使用它们。

下一课会学习 Git 与项目管理基础。我们会开始管理项目文件变化，并把阶段性代码提交下来。
