# 第 3 课：JavaScript 基础

## 本课目标

上一课我们已经创建并启动了第一个 Next.js 项目。

从这一课开始，我们正式进入编程基础。

本课要学习的是 JavaScript。它是 Web 开发中最重要的语言之一，也是后面学习 TypeScript、React、Next.js 的基础。

对于编程小白来说，这一课不要求你一次性掌握所有语法细节。你只需要先理解五件事：

- 如何用变量保存数据。
- 如何表示字符串、数字、布尔值。
- 如何用数组保存一组数据。
- 如何用对象描述一个具体事物。
- 如何用条件、循环和函数组织代码逻辑。

学完本课后，你应该能够：

- 看懂基础 JavaScript 代码。
- 写出简单的计算逻辑。
- 理解函数为什么适合承载财务计算。
- 写出一个“月收入、月支出、月结余”计算函数。

## 一、JavaScript 是什么

JavaScript 是一种编程语言。

在网页里，它最常见的作用是让页面具有交互能力。

例如：

- 点击按钮后显示新内容。
- 在输入框里输入金额后自动计算结果。
- 提交表单前检查数据是否完整。
- 根据用户数据展示不同提示。

在本课程项目中，JavaScript 和后面要学的 TypeScript 会承担更多业务逻辑。

例如：

- 计算每月结余。
- 统计收入和支出。
- 判断储蓄目标是否能达成。
- 把账户、流水、负债组织成结构化数据。
- 调用后端 API。
- 处理 AI 返回的结果。

你可以先把 JavaScript 理解成：

> 用来表达业务规则和计算过程的语言。

## 二、在项目里写 JavaScript 代码

我们上一课创建的是 Next.js 项目。它默认使用 TypeScript，所以文件后缀通常是：

```txt
.ts
.tsx
```

其中：

- `.ts`：一般用于普通逻辑代码。
- `.tsx`：一般用于 React 页面和组件。

虽然项目最终会使用 TypeScript，但 TypeScript 是 JavaScript 的增强版。

所以本课先学习 JavaScript 的基础概念，后面第 4 课再给这些代码加上类型。

如果你想临时练习 JavaScript，可以先在项目根目录里创建一个文件：

```txt
practice.js
```

然后写入：

```js
console.log("Hello JavaScript");
```

在终端中运行：

```bash
node practice.js
```

如果看到：

```txt
Hello JavaScript
```

说明这段 JavaScript 代码已经被 Node.js 成功执行。

### console.log 是什么

`console.log()` 的作用是把内容打印到终端或浏览器控制台。

初学阶段，它非常适合用来观察代码运行结果。

例如：

```js
const monthlyIncome = 30000;

console.log(monthlyIncome);
```

运行后会输出：

```txt
30000
```

后面我们会经常用它检查变量和函数结果。

## 三、变量：给数据起名字

写程序时，我们经常需要保存一些数据。

例如：

- 月收入是 30000。
- 月支出是 18000。
- 账户名称是“招商银行储蓄卡”。
- 是否有房贷是 true。

在 JavaScript 中，可以使用变量保存这些数据。

最常用的写法是：

```js
const monthlyIncome = 30000;
```

这句话可以读作：

> 创建一个名为 monthlyIncome 的变量，它的值是 30000。

### 1. const

`const` 用来声明一个不会被重新赋值的变量。

例如：

```js
const appName = "AI 个人财务 CFO";
const monthlyIncome = 30000;
```

如果一个值创建后不应该被改掉，优先使用 `const`。

在本课程里，大多数变量都可以先用 `const`。

### 2. let

`let` 用来声明后面可能会变化的变量。

例如：

```js
let balance = 10000;

balance = balance + 5000;

console.log(balance);
```

输出结果是：

```txt
15000
```

这里 `balance` 一开始是 10000，后来增加了 5000，所以变成 15000。

### 3. 变量命名

变量名应该让人一眼看懂它保存的是什么。

推荐：

```js
const monthlyIncome = 30000;
const monthlyExpense = 18000;
const accountName = "工资卡";
```

不推荐：

```js
const a = 30000;
const b = 18000;
const x = "工资卡";
```

财务项目尤其需要清晰命名，因为金额、账户、负债、流水很容易混淆。

## 四、基础数据类型

JavaScript 中有几种常见的数据类型。

本课先掌握三种：

- 字符串。
- 数字。
- 布尔值。

## 五、字符串：表示文本

字符串用来表示文字内容。

可以使用双引号、单引号或反引号。

```js
const accountName = "招商银行储蓄卡";
const category = '餐饮';
const message = `本月支出偏高`;
```

本课程建议初学阶段优先使用双引号或反引号。

### 字符串拼接

如果要把多个字符串组合起来，可以这样写：

```js
const name = "工资卡";
const message = "账户名称：" + name;

console.log(message);
```

输出：

```txt
账户名称：工资卡
```

更推荐使用反引号写模板字符串：

```js
const name = "工资卡";
const balance = 20000;

const message = `账户 ${name} 当前余额为 ${balance} 元`;

console.log(message);
```

输出：

```txt
账户 工资卡 当前余额为 20000 元
```

模板字符串在生成提示文案时很常用。

## 六、数字：表示金额和数量

数字用来表示可以计算的值。

例如：

```js
const monthlyIncome = 30000;
const monthlyExpense = 18000;
const monthCount = 12;
```

可以进行加减乘除：

```js
const surplus = monthlyIncome - monthlyExpense;
const yearlySurplus = surplus * 12;

console.log(surplus);
console.log(yearlySurplus);
```

输出：

```txt
12000
144000
```

这里：

- `surplus` 表示月结余。
- `yearlySurplus` 表示一年结余。

### 关于金额计算的提醒

JavaScript 的 `number` 可以处理普通数字，但在真实财务系统里，金额计算需要格外谨慎。

例如小数金额可能出现精度问题：

```js
console.log(0.1 + 0.2);
```

你可能会看到：

```txt
0.30000000000000004
```

这不是本项目现在要解决的问题。

后面课程会专门学习 `decimal.js`，用更可靠的方式处理金额。

本课先用整数金额练习基础逻辑。

## 七、布尔值：表示是或否

布尔值只有两个：

```js
true
false
```

它适合表示判断结果。

例如：

```js
const hasDebt = true;
const isOverspending = false;
```

也可以由比较表达式得到：

```js
const monthlyIncome = 30000;
const monthlyExpense = 35000;

const isDeficit = monthlyExpense > monthlyIncome;

console.log(isDeficit);
```

输出：

```txt
true
```

因为支出 35000 大于收入 30000，所以 `isDeficit` 是 `true`。

## 八、数组：保存一组数据

数组用来保存一组同类或相关的数据。

例如一组支出金额：

```js
const expenses = [3000, 1200, 500, 800];
```

数组里的每一项用逗号分隔。

可以通过位置读取某一项。

```js
console.log(expenses[0]);
console.log(expenses[1]);
```

输出：

```txt
3000
1200
```

注意：数组的位置从 `0` 开始，不是从 `1` 开始。

所以：

- `expenses[0]` 是第一项。
- `expenses[1]` 是第二项。
- `expenses[2]` 是第三项。

### 数组长度

可以用 `.length` 获取数组有多少项。

```js
const expenses = [3000, 1200, 500, 800];

console.log(expenses.length);
```

输出：

```txt
4
```

### 往数组里添加数据

可以使用 `.push()`。

```js
const expenses = [3000, 1200];

expenses.push(500);

console.log(expenses);
```

输出：

```txt
[3000, 1200, 500]
```

在财务项目中，数组很常见。

例如：

- 一组账户。
- 一组流水。
- 一组负债。
- 一组月度现金流结果。

## 九、对象：描述一个具体事物

对象用来描述一个具体事物的多个属性。

例如一个账户：

```js
const account = {
  name: "工资卡",
  type: "cash",
  balance: 20000
};
```

这个对象有三个属性：

- `name`：账户名称。
- `type`：账户类型。
- `balance`：账户余额。

读取对象属性有两种常见写法：

```js
console.log(account.name);
console.log(account["balance"]);
```

输出：

```txt
工资卡
20000
```

更常用的是点号写法：

```js
account.name
account.balance
```

### 用对象表示一条流水

财务项目里，一条流水可以这样表示：

```js
const transaction = {
  title: "午餐",
  amount: 35,
  type: "expense",
  category: "餐饮"
};
```

这比单独写几个变量更清晰。

不推荐：

```js
const title = "午餐";
const amount = 35;
const type = "expense";
const category = "餐饮";
```

推荐：

```js
const transaction = {
  title: "午餐",
  amount: 35,
  type: "expense",
  category: "餐饮"
};
```

因为这些数据本来就属于同一条流水。

## 十、数组和对象一起使用

真实项目里，数组和对象经常一起使用。

例如一组流水：

```js
const transactions = [
  {
    title: "工资",
    amount: 30000,
    type: "income",
    category: "工资"
  },
  {
    title: "房租",
    amount: 6000,
    type: "expense",
    category: "居住"
  },
  {
    title: "午餐",
    amount: 35,
    type: "expense",
    category: "餐饮"
  }
];
```

可以把它读成：

> transactions 是一个数组，数组里的每一项都是一条流水对象。

这就是后面数据库、API、页面列表中最常见的数据形态。

## 十一、条件判断：根据情况走不同逻辑

程序经常需要根据不同情况做不同事情。

这时可以使用 `if`。

例如判断本月是否结余：

```js
const monthlyIncome = 30000;
const monthlyExpense = 18000;
const surplus = monthlyIncome - monthlyExpense;

if (surplus > 0) {
  console.log("本月有结余");
}
```

如果 `surplus > 0` 成立，就会执行大括号里的代码。

### if else

如果要处理两种情况，可以使用 `if else`。

```js
const monthlyIncome = 30000;
const monthlyExpense = 35000;
const surplus = monthlyIncome - monthlyExpense;

if (surplus >= 0) {
  console.log(`本月结余 ${surplus} 元`);
} else {
  console.log(`本月超支 ${Math.abs(surplus)} 元`);
}
```

输出：

```txt
本月超支 5000 元
```

`Math.abs()` 用来取绝对值。

例如：

```js
Math.abs(-5000)
```

结果是：

```txt
5000
```

### 多个条件

如果有多个情况，可以使用 `else if`。

```js
const surplus = 12000;

if (surplus > 10000) {
  console.log("本月储蓄能力较强");
} else if (surplus > 0) {
  console.log("本月有结余");
} else if (surplus === 0) {
  console.log("本月刚好收支平衡");
} else {
  console.log("本月出现超支");
}
```

这里的 `===` 表示严格相等。

初学阶段可以先记住：

> 判断两个值是否相等时，优先使用 `===`。

## 十二、常见比较符号

条件判断里经常会用到比较符号。

| 符号 | 含义 | 示例 |
| --- | --- | --- |
| `>` | 大于 | `expense > income` |
| `<` | 小于 | `expense < income` |
| `>=` | 大于等于 | `surplus >= 0` |
| `<=` | 小于等于 | `debt <= 0` |
| `===` | 严格等于 | `type === "income"` |
| `!==` | 不等于 | `type !== "expense"` |

例如：

```js
const type = "expense";

if (type === "expense") {
  console.log("这是一笔支出");
}
```

## 十三、循环：重复执行同一段逻辑

如果要处理一组数据，就需要循环。

例如我们有一组支出：

```js
const expenses = [3000, 1200, 500, 800];
```

如果不用循环，计算总支出要这样写：

```js
const total = expenses[0] + expenses[1] + expenses[2] + expenses[3];
```

这不适合真实项目。

因为流水数量可能是 4 条，也可能是 400 条。

### for of 循环

更好的写法是使用 `for of`。

```js
const expenses = [3000, 1200, 500, 800];

let totalExpense = 0;

for (const expense of expenses) {
  totalExpense = totalExpense + expense;
}

console.log(totalExpense);
```

输出：

```txt
5500
```

这段代码可以读作：

> 对 expenses 数组里的每一个 expense，把它加到 totalExpense 上。

### 遍历流水对象

如果数组里保存的是对象，也可以循环。

```js
const transactions = [
  { title: "工资", amount: 30000, type: "income" },
  { title: "房租", amount: 6000, type: "expense" },
  { title: "午餐", amount: 35, type: "expense" }
];

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

console.log(totalIncome);
console.log(totalExpense);
```

输出：

```txt
30000
6035
```

这就是财务统计逻辑的雏形。

## 十四、函数：把一段逻辑封装起来

函数是本课最重要的内容。

它可以把一段代码封装成一个可以重复使用的逻辑单元。

例如：

```js
function calculateMonthlySurplus(income, expense) {
  return income - expense;
}
```

这段代码定义了一个函数：

- 函数名：`calculateMonthlySurplus`
- 输入：`income` 和 `expense`
- 输出：`income - expense`

使用函数时这样写：

```js
const result = calculateMonthlySurplus(30000, 18000);

console.log(result);
```

输出：

```txt
12000
```

### 为什么函数很重要

如果没有函数，计算逻辑会散落在很多地方。

例如页面里写一次，API 里写一次，测试里又写一次。

一旦公式要修改，很容易漏改。

函数的好处是：

- 同一段逻辑可以重复使用。
- 输入和输出更清楚。
- 后面可以为函数写测试。
- 财务计算过程更容易审计。

对于本项目来说，计算函数是确定性计算引擎的基础。

## 十五、函数返回对象

真实财务计算通常不只返回一个数字。

例如计算月度收支时，我们可能同时需要：

- 月收入。
- 月支出。
- 月结余。
- 是否超支。
- 提示文案。

函数可以返回一个对象。

```js
function calculateMonthlySummary(income, expense) {
  const surplus = income - expense;
  const isDeficit = surplus < 0;

  return {
    income: income,
    expense: expense,
    surplus: surplus,
    isDeficit: isDeficit
  };
}
```

使用：

```js
const summary = calculateMonthlySummary(30000, 18000);

console.log(summary);
console.log(summary.surplus);
```

输出：

```txt
{ income: 30000, expense: 18000, surplus: 12000, isDeficit: false }
12000
```

对象属性名和值相同的时候，可以简写。

```js
function calculateMonthlySummary(income, expense) {
  const surplus = income - expense;
  const isDeficit = surplus < 0;

  return {
    income,
    expense,
    surplus,
    isDeficit
  };
}
```

这两种写法效果一样。

## 十六、函数里加入提示文案

我们可以继续改进函数，让它返回更适合页面展示的结果。

```js
function calculateMonthlySummary(income, expense) {
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

测试一下：

```js
console.log(calculateMonthlySummary(30000, 18000).message);
console.log(calculateMonthlySummary(30000, 30000).message);
console.log(calculateMonthlySummary(30000, 35000).message);
```

你应该看到三种不同结果：

```txt
本月结余 12000 元
本月收支平衡
本月超支 5000 元
```

这里函数返回的是一个完整对象，但我们只想查看提示文案，所以用 `.message` 取出对象里的 `message` 字段。

这说明函数可以根据输入自动走不同逻辑。

## 十七、用流水数组计算收入和支出

前面的函数要求我们直接传入收入和支出。

但真实项目里，收入和支出往往来自一条条流水。

例如：

```js
const transactions = [
  { title: "工资", amount: 30000, type: "income" },
  { title: "副业收入", amount: 5000, type: "income" },
  { title: "房租", amount: 6000, type: "expense" },
  { title: "餐饮", amount: 2500, type: "expense" },
  { title: "交通", amount: 800, type: "expense" }
];
```

可以写一个函数，从流水数组中统计月度摘要：

```js
function calculateSummaryFromTransactions(transactions) {
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

  return {
    income: totalIncome,
    expense: totalExpense,
    surplus
  };
}
```

使用：

```js
const summary = calculateSummaryFromTransactions(transactions);

console.log(summary);
```

输出：

```txt
{ income: 35000, expense: 9300, surplus: 25700 }
```

这已经很接近后续项目中的财务计算逻辑了。

## 十八、把代码放到练习文件里

建议你在项目根目录下创建：

```txt
practice.js
```

然后放入下面这段完整代码：

```js
const transactions = [
  { title: "工资", amount: 30000, type: "income" },
  { title: "副业收入", amount: 5000, type: "income" },
  { title: "房租", amount: 6000, type: "expense" },
  { title: "餐饮", amount: 2500, type: "expense" },
  { title: "交通", amount: 800, type: "expense" }
];

function calculateSummaryFromTransactions(transactions) {
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

console.log(summary);
console.log(summary.message);
```

在终端运行：

```bash
node practice.js
```

你应该看到类似输出：

```txt
{
  income: 35000,
  expense: 9300,
  surplus: 25700,
  isDeficit: false,
  message: '本月结余 25700 元'
}
本月结余 25700 元
```

## 十九、常见错误

### 1. 少写引号

错误写法：

```js
const accountName = 工资卡;
```

正确写法：

```js
const accountName = "工资卡";
```

字符串必须用引号包起来。

### 2. 少写逗号

错误写法：

```js
const account = {
  name: "工资卡"
  balance: 20000
};
```

正确写法：

```js
const account = {
  name: "工资卡",
  balance: 20000
};
```

对象的多个属性之间需要逗号。

### 3. 把等号和判断相等混淆

赋值用一个等号：

```js
const type = "income";
```

判断相等用三个等号：

```js
if (type === "income") {
  console.log("收入");
}
```

### 4. 函数忘记 return

错误写法：

```js
function calculateMonthlySurplus(income, expense) {
  income - expense;
}
```

正确写法：

```js
function calculateMonthlySurplus(income, expense) {
  return income - expense;
}
```

如果函数需要输出结果，就要使用 `return`。

### 5. 数组下标从 0 开始

```js
const expenses = [3000, 1200, 500];

console.log(expenses[0]);
```

输出的是第一项：

```txt
3000
```

不是第零项。

## 二十、本课实践任务

请完成以下任务。

### 任务 1：创建练习文件

在你的 `ai-finance-cfo` 项目根目录中创建：

```txt
practice.js
```

### 任务 2：写一个月结余计算函数

写出下面这个函数：

```js
function calculateMonthlySurplus(income, expense) {
  return income - expense;
}
```

然后测试：

```js
console.log(calculateMonthlySurplus(30000, 18000));
console.log(calculateMonthlySurplus(30000, 30000));
console.log(calculateMonthlySurplus(30000, 35000));
```

### 任务 3：写一个月度摘要函数

继续写一个函数，返回收入、支出、结余和提示文案。

目标效果：

```js
const summary = calculateMonthlySummary(30000, 18000);

console.log(summary.message);
```

输出：

```txt
本月结余 12000 元
```

### 任务 4：用流水数组计算结果

创建一个 `transactions` 数组，至少包含：

- 2 条收入。
- 3 条支出。

然后写函数统计：

- 总收入。
- 总支出。
- 月结余。

## 二十一、本课验收标准

完成本课后，你应该做到：

- 能写出 `calculateMonthlySurplus(income, expense)`。
- 能用对象表示一条收入或支出流水。
- 能用数组保存多条流水。
- 能用循环统计总收入和总支出。
- 能根据结余结果输出不同提示文案。

## 二十二、检查清单

完成本课后，你应该能回答：

- `const` 和 `let` 分别适合什么场景？
- 字符串、数字、布尔值分别表示什么？
- 数组适合保存什么？
- 对象适合描述什么？
- 为什么财务流水适合用对象表示？
- `if else` 能解决什么问题？
- `for of` 循环适合处理什么数据？
- 函数的输入和返回值分别是什么？
- 为什么财务计算逻辑应该写成函数？
- 如何计算月收入、月支出和月结余？

## 二十三、本课小结

这一课我们学习了 JavaScript 最基础、也是后面最常用的一组能力：

- 变量。
- 字符串、数字、布尔值。
- 数组。
- 对象。
- 条件判断。
- 循环。
- 函数。

你已经可以写出一个简单的月度财务计算函数。

这件事看起来很小，但它是整个 AI 个人财务 CFO 的起点。

后面所有复杂能力，例如储蓄目标、债务还款、现金流预测，本质上都是在这个基础上继续扩展：

> 输入数据 → 执行确定性计算 → 返回可解释结果。

下一课会进入 TypeScript 基础。我们会学习如何给这些 JavaScript 数据和函数加上类型，让代码更清晰、更安全，也更适合构建长期维护的财务项目。
