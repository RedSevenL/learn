# 第 8 课：React 状态与表单

## 本课目标

上一课我们学习了 React 组件、props 和列表渲染，并用假数据展示了账户列表。

但上一课的数据是写死的：

```tsx
const accounts = [...]
```

这意味着页面只能展示固定内容，用户不能新增账户。

这一课要解决的问题是：

> 如何让页面记住用户输入，并在提交表单后更新账户列表。

你会学到：

- `useState` 是什么。
- 为什么 Next.js 页面有时要写 `"use client"`。
- 如何把账户列表放进状态。
- 如何用按钮先新增一个测试账户。
- 如何读取输入框和下拉框内容。
- 什么是受控组件。
- 如何处理表单提交。
- 如何做基础表单校验。
- 如何显示错误提示和空状态。

学完本课后，你应该能够：

- 使用 `useState` 保存页面中会变化的数据。
- 用输入框、下拉框和按钮组成新增账户表单。
- 提交表单后把新账户添加到账户列表。
- 对空名称和非法金额显示错误提示。

## 一、为什么需要状态

React 页面中的数据大致可以分成两类。

第一类是固定数据。

例如：

```tsx
const appName = "AI 个人财务 CFO";
```

这种数据不会因为用户操作而改变。

第二类是会变化的数据。

例如：

- 用户正在输入的账户名称。
- 用户选择的账户类型。
- 用户输入的账户余额。
- 当前页面上的账户列表。
- 表单校验错误信息。

在 React 中，这类会影响页面显示、并且会变化的数据，通常叫做状态。

状态可以理解成：

> React 组件内部会变化的记忆。

例如账户列表最开始有 3 个账户，用户提交表单后变成 4 个账户。

这个账户列表就应该放进状态里。

## 二、useState 是什么

`useState` 是 React 提供的一个 Hook，用来在组件中保存状态。

基础写法：

```tsx
import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <p>当前数字：{count}</p>
      <button onClick={() => setCount(count + 1)}>加 1</button>
    </main>
  );
}
```

这一行：

```tsx
const [count, setCount] = useState(0);
```

可以读作：

```tsx
const [状态值, 修改状态的函数] = useState(初始值);
```

这里有三个重点：

- `count` 是当前状态值。
- `setCount` 是修改状态的函数。
- `useState(0)` 表示初始值是 `0`。

表面上看，`[count, setCount]` 是 JavaScript 数组解构。

真正特殊的是 `useState`：调用 `setCount(count + 1)` 时，React 会保存新状态，并通知组件重新渲染页面。

不要直接写：

```tsx
count = count + 1;
```

应该写：

```tsx
setCount(count + 1);
```

原因是：

> React 需要通过 set 函数知道状态变了，然后重新渲染页面。

按钮点击事件通常这样写：

```tsx
<button onClick={() => setCount(count + 1)}>加 1</button>
```

这里的：

```tsx
() => setCount(count + 1)
```

是一个箭头函数，意思是：

> 等按钮被点击时，再执行 `setCount(count + 1)`。

不要写成：

```tsx
<button onClick={setCount(count + 1)}>加 1</button>
```

这种写法会在页面渲染时就执行，不是等点击时再执行。

这里的关键不是“必须写箭头函数”，而是：

> `onClick` 需要拿到一个函数，等点击时再执行。

所以有两种正确写法。

第一种：临时写一个箭头函数。

```tsx
<button onClick={() => setCount(count + 1)}>加 1</button>
```

第二种：提前定义好函数，再把函数名传给 `onClick`。

```tsx
function addOne() {
  setCount(count + 1);
}

<button onClick={addOne}>加 1</button>
```

这两种本质一样，都是把“函数本身”交给 `onClick`。

错误写法：

```tsx
<button onClick={setCount(count + 1)}>加 1</button>
```

问题在于它会立刻执行 `setCount(count + 1)`，传给 `onClick` 的就不是“等点击时再执行的函数”了。

## 三、Next.js 中的 use client

如果你在 Next.js 的 `app/page.tsx` 中使用 `useState`、`onClick`、`onChange` 或表单输入，需要在文件最顶部加：

```tsx
"use client";
```

完整位置：

```tsx
"use client";

import { useState } from "react";
```

原因是 Next.js App Router 默认把页面组件当成服务端组件。

服务端组件适合读取数据库、渲染静态内容，但不能直接处理浏览器交互。

初学阶段先记住这个规则：

> 页面里用了 `useState` 或浏览器事件，就在文件第一行写 `"use client"`。

## 四、先准备账户类型和展示组件

正式做表单之前，先把上一课的账户列表整理一下。

先定义账户类型：

```tsx
type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "investment";
  balance: number;
};
```

这里的：

```tsx
type: "cash" | "bank" | "credit" | "investment";
```

表示账户类型只能是这四种之一。

再定义初始账户数据：

```tsx
const initialAccounts: Account[] = [
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
  },
  {
    id: "account_003",
    name: "信用卡",
    type: "credit",
    balance: -3500
  }
];
```

`Account[]` 表示：

> 这是一个数组，数组里的每一项都必须符合 `Account` 类型。

接着写两个展示组件。

`AccountCard` 展示单个账户：

```tsx
type AccountCardProps = {
  account: Account;
};

function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="rounded border p-4">
      <h2 className="font-semibold">{account.name}</h2>
      <p>类型：{account.type}</p>
      <p>余额：{account.balance} 元</p>
    </div>
  );
}
```

`AccountList` 展示账户数组：

```tsx
type AccountListProps = {
  accounts: Account[];
};

function AccountList({ accounts }: AccountListProps) {
  return (
    <section className="mt-6 space-y-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </section>
  );
}
```

组件关系是：

```txt
Home
  └── AccountList
        ├── AccountCard
        ├── AccountCard
        └── AccountCard
```

## 五、把账户列表放进状态

如果账户列表只是普通常量：

```tsx
const accounts = initialAccounts;
```

页面只能展示固定数据。

如果想让它能新增，就要放进 `useState`：

```tsx
const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
```

这里的意思是：

- `accounts`：当前账户列表。
- `setAccounts`：更新账户列表的函数。
- `useState<Account[]>(initialAccounts)`：初始值是账户数组。

先不用表单，做一个最简单的按钮测试。

```tsx
function addTestAccount() {
  const newAccount: Account = {
    id: `account_${Date.now()}`,
    name: "测试账户",
    type: "cash",
    balance: 500
  };

  setAccounts([...accounts, newAccount]);
}
```

这里第一次出现了 `newAccount`。

它不是 React 自动生成的，而是我们自己创建的一个普通账户对象。

然后在页面里放一个按钮：

```tsx
<button onClick={addTestAccount}>新增测试账户</button>
<AccountList accounts={accounts} />
```

这里可以直接写：

```tsx
onClick={addTestAccount}
```

是因为 `addTestAccount` 本身已经是一个函数。

它等价于前面这种写法：

```tsx
<button onClick={() => addTestAccount()}>新增测试账户</button>
```

只是这里没有必要再包一层箭头函数，所以直接传函数名更简洁。

点击按钮时，流程是：

```txt
创建 newAccount 对象
  ↓
用 setAccounts 创建新数组
  ↓
React 重新渲染页面
  ↓
账户列表多出一项
```

注意，不推荐这样写：

```tsx
accounts.push(newAccount);
```

因为 `push` 会直接修改原数组。

React 状态更新时，更推荐创建新数组：

```tsx
setAccounts([...accounts, newAccount]);
```

这里的：

```tsx
[...accounts, newAccount]
```

意思是：

> 创建一个新数组，先放入原来的所有账户，再把 `newAccount` 放到最后。

其中 `...accounts` 叫展开语法，意思是把 `accounts` 数组里的每一项展开。

如果少了 `...`，写成：

```tsx
[accounts, newAccount]
```

就会变成“数组里套一个数组”，不是我们想要的账户列表。

假设原来的 `accounts` 是：

```tsx
[
  { id: "account_001", name: "工资卡" },
  { id: "account_002", name: "现金" }
]
```

`newAccount` 是：

```tsx
{ id: "account_003", name: "测试账户" }
```

那么：

```tsx
[...accounts, newAccount]
```

结果就是：

```tsx
[
  { id: "account_001", name: "工资卡" },
  { id: "account_002", name: "现金" },
  { id: "account_003", name: "测试账户" }
]
```

所以这行代码：

```tsx
setAccounts([...accounts, newAccount]);
```

可以读作：

```txt
用“旧账户列表 + 新账户”组成一个新数组，
再把这个新数组交给 React 保存。
```

## 六、表单需要哪些状态

新增账户表单至少需要三个输入：

- 账户名称。
- 账户类型。
- 账户余额。

还需要一个错误提示。

对应到状态：

```tsx
const [name, setName] = useState("");
const [type, setType] = useState<Account["type"]>("bank");
const [balance, setBalance] = useState("");
const [error, setError] = useState("");
```

这四个状态分别负责：

| 状态 | 作用 |
| --- | --- |
| `name` | 保存账户名称输入框的内容 |
| `type` | 保存账户类型下拉框的选择 |
| `balance` | 保存账户余额输入框的内容 |
| `error` | 保存表单校验错误 |

这里的：

```tsx
Account["type"]
```

表示取出 `Account` 类型里的 `type` 字段类型。

因为 `Account["type"]` 等于：

```tsx
"cash" | "bank" | "credit" | "investment"
```

所以这行：

```tsx
const [type, setType] = useState<Account["type"]>("bank");
```

表示：

> type 状态只能是账户类型允许的值，初始值是 `"bank"`。

另外，余额状态先用字符串：

```tsx
const [balance, setBalance] = useState("");
```

虽然余额最终是数字，但输入框里的内容天然是字符串。

例如用户输入：

```txt
20000
```

浏览器读到的是字符串 `"20000"`，不是数字 `20000`。

所以更稳妥的做法是：

```txt
输入阶段先保存字符串
  ↓
提交时再转换成数字
  ↓
转换失败就显示错误
```

## 七、受控组件是什么

React 表单里常见这种写法：

```tsx
<input
  value={name}
  onChange={(event) => setName(event.target.value)}
/>
```

这叫受控组件。

可以理解成：

> 输入框显示什么，由 React 状态控制；用户输入时，再把新内容同步回状态。

数据流是：

```txt
React 状态 name
  ↓
input 的 value
  ↓
用户输入
  ↓
onChange
  ↓
setName 更新状态
  ↓
页面重新渲染
```

`value` 和 `onChange` 通常要一起写。

如果只写：

```tsx
<input value={name} />
```

输入框可能无法正常输入，因为 React 控制了它的值，但你没有告诉 React 用户输入后该怎么更新状态。

## 八、表单骨架

先看完整表单骨架，再逐块理解。

```tsx
<form onSubmit={handleSubmit} className="mt-6 space-y-4">
  <label className="block">
    <span className="block font-medium">账户名称</span>
    <input
      value={name}
      onChange={(event) => setName(event.target.value)}
      placeholder="例如：工资卡"
      className="mt-1 w-full rounded border px-3 py-2"
    />
  </label>

  <label className="block">
    <span className="block font-medium">账户类型</span>
    <select
      value={type}
      onChange={(event) => setType(event.target.value as Account["type"])}
      className="mt-1 w-full rounded border px-3 py-2"
    >
      <option value="bank">银行卡</option>
      <option value="cash">现金</option>
      <option value="credit">信用卡</option>
      <option value="investment">投资账户</option>
    </select>
  </label>

  <label className="block">
    <span className="block font-medium">账户余额</span>
    <input
      value={balance}
      onChange={(event) => setBalance(event.target.value)}
      placeholder="例如：20000"
      className="mt-1 w-full rounded border px-3 py-2"
    />
  </label>

  {error && <p className="text-red-600">{error}</p>}

  <button type="submit" className="rounded bg-black px-4 py-2 text-white">
    新增账户
  </button>
</form>
```

这里第一次出现了：

```tsx
onSubmit={handleSubmit}
```

意思是：

> 当表单提交时，执行 `handleSubmit` 函数。

这个函数下一节定义。

## 九、三个输入分别在做什么

### 1. 账户名称输入框

```tsx
<input
  value={name}
  onChange={(event) => setName(event.target.value)}
  placeholder="例如：工资卡"
/>
```

重点：

- `value={name}`：输入框显示 `name` 状态。
- `event.target.value`：当前输入框里的最新内容。
- `setName(...)`：把最新内容保存到状态中。

### 2. 账户类型下拉框

```tsx
<select
  value={type}
  onChange={(event) => setType(event.target.value as Account["type"])}
>
  <option value="bank">银行卡</option>
  <option value="cash">现金</option>
  <option value="credit">信用卡</option>
  <option value="investment">投资账户</option>
</select>
```

浏览器的 `select` 默认返回普通字符串。

但我们的 `type` 状态更严格，只能是：

```tsx
"cash" | "bank" | "credit" | "investment"
```

所以这里用：

```tsx
event.target.value as Account["type"]
```

告诉 TypeScript：

> 这个值会是 Account 类型中允许的账户类型。

初学阶段可以先照着写。

### 3. 账户余额输入框

```tsx
<input
  value={balance}
  onChange={(event) => setBalance(event.target.value)}
  placeholder="例如：20000"
/>
```

这里暂时不强制使用：

```tsx
type="number"
```

原因是初学阶段用普通文本输入更容易观察校验过程。

用户可能输入：

```txt
abc
```

提交时我们就可以判断它不是合法金额，并显示提示。

## 十、处理表单提交

表单提交函数写成这样：

```tsx
function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
  event.preventDefault();

  // 后面写校验、新增账户、清空表单
}
```

这里的：

```tsx
React.SubmitEvent<HTMLFormElement>
```

是 TypeScript 类型，表示：

> 这个 event 来自 HTML 表单提交事件。

`event.preventDefault()` 的作用是阻止浏览器默认刷新页面。

传统 HTML 表单提交后，浏览器可能会刷新页面。

但 React 应用通常希望：

- 页面不刷新。
- 在当前页面处理数据。
- 更新状态后自动重新渲染。

所以表单提交函数开头通常会写：

```tsx
event.preventDefault();
```

## 十一、表单校验

本课先做两个校验：

1. 账户名称不能为空。
2. 账户余额必须是合法数字。

代码如下：

```tsx
const trimmedName = name.trim();
const numericBalance = Number(balance);

if (trimmedName.length === 0) {
  setError("请输入账户名称。");
  return;
}

if (!Number.isFinite(numericBalance)) {
  setError("请输入合法的账户余额。");
  return;
}
```

说明：

- `name.trim()` 会去掉字符串前后的空格。
- `Number(balance)` 会把字符串余额转换成数字。
- `Number.isFinite(numericBalance)` 用来判断结果是不是有效数字。
- `return` 会提前结束提交函数，不继续新增账户。

例子：

```tsx
Number("20000"); // 20000
Number("abc"); // NaN
```

如果余额是 `"abc"`，就会进入错误提示：

```tsx
setError("请输入合法的账户余额。");
```

## 十二、创建新账户并更新列表

校验通过后，创建新账户对象：

```tsx
const newAccount: Account = {
  id: `account_${Date.now()}`,
  name: trimmedName,
  type,
  balance: numericBalance
};
```

这里的 `Date.now()` 用来临时生成 id。

它会返回当前时间戳，例如：

```txt
1760000000000
```

真实项目里，id 通常由数据库生成。

当前阶段还没有数据库，用时间戳做临时 id 足够练习。

然后更新账户列表：

```tsx
setAccounts([...accounts, newAccount]);
```

最后清空表单和错误：

```tsx
setName("");
setType("bank");
setBalance("");
setError("");
```

完整 `handleSubmit`：

```tsx
function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
  event.preventDefault();

  const trimmedName = name.trim();
  const numericBalance = Number(balance);

  if (trimmedName.length === 0) {
    setError("请输入账户名称。");
    return;
  }

  if (!Number.isFinite(numericBalance)) {
    setError("请输入合法的账户余额。");
    return;
  }

  const newAccount: Account = {
    id: `account_${Date.now()}`,
    name: trimmedName,
    type,
    balance: numericBalance
  };

  setAccounts([...accounts, newAccount]);
  setName("");
  setType("bank");
  setBalance("");
  setError("");
}
```

## 十三、错误提示和空状态

### 错误提示

错误提示用条件渲染：

```tsx
{error && <p className="text-red-600">{error}</p>}
```

意思是：

> 如果 `error` 有内容，就显示错误提示；如果 `error` 是空字符串，就什么都不显示。

### 空状态

空状态是指：

> 当列表没有数据时，页面应该给用户一个清楚提示。

可以把 `AccountList` 改成这样：

```tsx
function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <p className="mt-6 rounded border border-dashed p-4 text-gray-600">
        暂无账户，请先新增一个账户。
      </p>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </section>
  );
}
```

这段代码先判断：

```tsx
accounts.length === 0
```

如果没有账户，就提前返回空状态。

如果有账户，再渲染列表。

真实产品里，很多页面第一次打开时都可能没有数据，例如没有账户、没有流水、没有负债。空状态能让用户知道下一步该做什么。

## 十四、完整页面代码

可以把 `app/page.tsx` 改成下面这样：

```tsx
"use client";

import { useState } from "react";

type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "investment";
  balance: number;
};

const initialAccounts: Account[] = [
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
  },
  {
    id: "account_003",
    name: "信用卡",
    type: "credit",
    balance: -3500
  }
];

type AccountCardProps = {
  account: Account;
};

function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="rounded border p-4">
      <h2 className="font-semibold">{account.name}</h2>
      <p>类型：{account.type}</p>
      <p>余额：{account.balance} 元</p>
    </div>
  );
}

type AccountListProps = {
  accounts: Account[];
};

function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <p className="mt-6 rounded border border-dashed p-4 text-gray-600">
        暂无账户，请先新增一个账户。
      </p>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </section>
  );
}

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const numericBalance = Number(balance);

    if (trimmedName.length === 0) {
      setError("请输入账户名称。");
      return;
    }

    if (!Number.isFinite(numericBalance)) {
      setError("请输入合法的账户余额。");
      return;
    }

    const newAccount: Account = {
      id: `account_${Date.now()}`,
      name: trimmedName,
      type,
      balance: numericBalance
    };

    setAccounts([...accounts, newAccount]);
    setName("");
    setType("bank");
    setBalance("");
    setError("");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">账户管理</h1>
      <p className="mt-2 text-gray-600">
        新增账户，并在页面中查看当前账户列表。
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="block font-medium">账户名称</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：工资卡"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="block font-medium">账户类型</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as Account["type"])}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="bank">银行卡</option>
            <option value="cash">现金</option>
            <option value="credit">信用卡</option>
            <option value="investment">投资账户</option>
          </select>
        </label>

        <label className="block">
          <span className="block font-medium">账户余额</span>
          <input
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            placeholder="例如：20000"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        {error && <p className="text-red-600">{error}</p>}

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          新增账户
        </button>
      </form>

      <AccountList accounts={accounts} />
    </main>
  );
}
```

保存后运行：

```bash
npm run dev
```

浏览器打开：

```txt
http://localhost:3000
```

你应该能完成这些操作：

- 输入账户名称。
- 选择账户类型。
- 输入账户余额。
- 点击“新增账户”。
- 新账户出现在账户列表中。
- 空名称会显示错误提示。
- 非法余额会显示错误提示。

## 十五、代码结构说明

这一课的完整页面可以分成四块。

第一块：类型和初始数据。

```tsx
type Account = ...
const initialAccounts = ...
```

这部分定义账户长什么样，以及页面一开始显示哪些账户。

第二块：展示组件。

```tsx
function AccountCard() {}
function AccountList() {}
```

这部分只负责显示账户。

第三块：页面状态。

```tsx
const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
const [name, setName] = useState("");
const [type, setType] = useState<Account["type"]>("bank");
const [balance, setBalance] = useState("");
const [error, setError] = useState("");
```

这部分保存页面里会变化的数据。

第四块：表单提交。

```tsx
function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
  ...
}
```

这部分负责：

```txt
阻止默认提交
  ↓
校验输入
  ↓
创建 newAccount
  ↓
更新 accounts
  ↓
清空表单
```

## 十六、常见错误

### 1. 忘记写 use client

如果页面使用了 `useState`，但没有写：

```tsx
"use client";
```

Next.js 可能会报错。

正确写法是放在文件第一行：

```tsx
"use client";

import { useState } from "react";
```

### 2. 忘记导入 useState

错误写法：

```tsx
const [name, setName] = useState("");
```

但文件顶部没有：

```tsx
import { useState } from "react";
```

正确写法：

```tsx
import { useState } from "react";
```

### 3. 直接修改数组

不推荐：

```tsx
accounts.push(newAccount);
setAccounts(accounts);
```

推荐：

```tsx
setAccounts([...accounts, newAccount]);
```

### 4. 表单提交后页面刷新

如果点击提交后页面刷新，通常是忘记写：

```tsx
event.preventDefault();
```

### 5. 输入框不能输入

如果写了：

```tsx
<input value={name} />
```

但没有写 `onChange`，输入框可能不能正常输入。

受控输入框应该同时有：

```tsx
<input
  value={name}
  onChange={(event) => setName(event.target.value)}
/>
```

### 6. 金额校验不完整

本课只做最基础的合法数字校验。

后续真实项目里，金额还需要更严格的规则，例如：

- 是否允许负数。
- 最多保留几位小数。
- 是否允许 0。
- 信用卡余额用负数还是单独字段表示。
- 金额内部是否应该使用字符串和 decimal.js。

这些会在后面的数据校验和财务计算课程里继续处理。

## 十七、本课实践任务

请在你的 `ai-finance-cfo` 项目中完成以下任务。

1. 打开 `app/page.tsx`，在文件第一行添加 `"use client"`。
2. 导入 `useState`。
3. 定义 `Account` 类型和 `initialAccounts`。
4. 创建 `AccountCard` 和 `AccountList`。
5. 用 `useState` 保存 `accounts`。
6. 添加 `name`、`type`、`balance`、`error` 四个表单状态。
7. 创建新增账户表单。
8. 实现 `handleSubmit`。
9. 添加错误提示。
10. 添加账户列表空状态。

## 十八、验收标准

完成本课后，请检查：

- 页面可以正常打开。
- 可以输入账户名称。
- 可以选择账户类型。
- 可以输入账户余额。
- 点击提交后，新账户出现在列表中。
- 提交成功后，表单会清空。
- 名称为空时会显示错误提示。
- 金额不是数字时会显示错误提示。
- 列表为空时有空状态提示。
- 控制台没有明显 TypeScript 或 React 报错。

## 十九、检查清单

完成本课后，你应该能回答：

- React 状态是什么？
- `useState` 的返回值是什么？
- 为什么不能直接修改状态数组？
- 为什么表单提交时要写 `event.preventDefault()`？
- 什么是受控组件？
- 输入框的 `value` 和 `onChange` 分别负责什么？
- 为什么余额输入框里的值先用字符串保存？
- 如何把字符串余额转换成数字？
- 如何用条件渲染显示错误提示？
- 什么是空状态？
- 为什么使用 `useState` 的 Next.js 页面要写 `"use client"`？

## 二十、本课小结

这一课我们让页面从“只能展示假数据”变成了“可以响应用户输入”。

你需要记住三句话：

1. 状态是 React 组件中会变化的数据。
2. 表单输入通常用 `value` 和 `onChange` 做成受控组件。
3. 修改状态要用 set 函数，并优先创建新数组或新对象。

本课最重要的实践成果是：

> 实现一个可以新增账户、校验输入、更新列表的账户表单。

后面的流水录入、负债录入、储蓄目标设置、场景模拟参数输入，本质上都会反复使用这个模式：

```txt
定义表单状态
  ↓
绑定输入框
  ↓
提交时校验
  ↓
生成新数据
  ↓
更新页面状态
  ↓
显示结果或错误提示
```

下一课会学习 TailwindCSS 与基础 UI。我们会在当前账户列表和新增账户表单基础上，继续优化页面布局、按钮、输入框、卡片、空状态和错误状态。
