# 第 8 课：React 状态与表单

## 本课目标

上一课我们学习了 React 组件、props 和列表渲染，并用假数据做出了账户列表。

但上一课的账户数据是写死的：

```tsx
const accounts = [...]
```

这意味着页面只能展示固定内容，用户不能新增账户。

这一课要解决的问题是：

> 如何让页面记住用户输入，并在提交表单后更新账户列表。

你会学到：

- `useState` 是什么。
- 什么是 React 状态。
- 如何读取输入框内容。
- 什么是受控组件。
- 如何处理表单提交。
- 如何做简单表单校验。
- 如何显示空状态和错误提示。
- 如何实现一个“新增账户”表单。

学完本课后，你应该能够：

- 使用 `useState` 保存页面数据。
- 用输入框、下拉框和按钮组成基础表单。
- 提交表单后把新账户添加到账户列表。
- 对空名称和非法金额显示错误提示。
- 理解为什么有些组件需要写 `"use client"`。

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

这些数据会随着用户操作改变。

在 React 中，这类会影响页面显示、并且会变化的数据，通常叫做状态。

状态可以理解成：

> React 组件内部会变化的记忆。

例如账户列表最开始有 3 个账户，用户提交表单后变成 4 个账户。

这个账户列表就应该放进状态里。

## 二、useState 是什么

`useState` 是 React 提供的一个 Hook。

它用来在组件中保存状态。

基础写法是：

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

这里有三个重点：

- `count` 是当前状态值。
- `setCount` 是修改状态的函数。
- `useState(0)` 表示初始值是 `0`。

你可以把这行代码读作：

```tsx
const [状态值, 修改状态的函数] = useState(初始值);
```

在 React 中，不要直接修改状态值。

不要这样写：

```tsx
count = count + 1;
```

应该这样写：

```tsx
setCount(count + 1);
```

原因是：

> React 需要通过 set 函数知道状态变了，然后重新渲染页面。

## 三、Next.js 中的 use client

如果你在 Next.js 的 `app/page.tsx` 中直接使用 `useState`，需要在文件最顶部加上：

```tsx
"use client";
```

完整位置如下：

```tsx
"use client";

import { useState } from "react";
```

原因是 Next.js App Router 默认把页面组件当成服务端组件。

服务端组件适合读取数据库、渲染静态内容，但不能直接使用浏览器交互能力。

`useState`、`onClick`、`onChange`、表单输入这些都属于客户端交互。

所以本课的页面需要声明：

> 这个组件在浏览器端运行。

初学阶段先记住一个简单规则：

> 只要页面里用了 `useState` 或按钮点击事件，就在文件顶部写 `"use client"`。

后面学习服务端组件和客户端组件时，会更系统地理解它。

## 四、把账户列表放进状态

上一课的账户数据可能是这样：

```tsx
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
  },
  {
    id: "account_003",
    name: "信用卡",
    type: "credit",
    balance: -3500
  }
];
```

如果要让账户列表可以新增，就应该把它放进 `useState`。

先定义初始数据：

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

然后在组件里使用：

```tsx
const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
```

这里的意思是：

- `accounts`：当前账户列表。
- `setAccounts`：用来更新账户列表。
- `useState<Account[]>(initialAccounts)`：初始值是账户数组。

当新增账户时，可以这样更新：

```tsx
setAccounts([...accounts, newAccount]);
```

这行代码的意思是：

> 创建一个新数组，里面包含原来的所有账户，再追加一个新账户。

注意不要直接写：

```tsx
accounts.push(newAccount);
```

因为 `push` 会直接修改原数组。

React 更推荐创建新数组，再交给 `setAccounts`。

## 五、表单需要哪些状态

新增账户表单至少需要三个输入：

- 账户名称。
- 账户类型。
- 账户余额。

对应到状态，可以写成：

```tsx
const [name, setName] = useState("");
const [type, setType] = useState<Account["type"]>("bank");
const [balance, setBalance] = useState("");
const [error, setError] = useState("");
```

这里有一个细节：

余额输入框的状态用字符串：

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

1. 输入阶段先保存字符串。
2. 提交时再转换成数字。
3. 转换失败就显示错误。

## 六、受控组件是什么

在 React 表单中，经常会看到这样的写法：

```tsx
<input
  value={name}
  onChange={(event) => setName(event.target.value)}
/>
```

这叫受控组件。

可以理解成：

> 输入框显示什么，由 React 状态控制；用户输入时，再把新内容同步回状态。

它的数据流是：

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

这种写法看起来比普通 HTML 麻烦一些，但好处是：

- React 随时知道输入框里是什么。
- 可以提交前做校验。
- 可以一键清空表单。
- 可以根据输入实时显示提示。

## 七、账户名称输入框

账户名称输入框可以这样写：

```tsx
<label>
  账户名称
  <input
    value={name}
    onChange={(event) => setName(event.target.value)}
    placeholder="例如：工资卡"
  />
</label>
```

几个重点：

- `value={name}`：输入框显示 `name` 状态。
- `onChange={...}`：用户输入时触发。
- `event.target.value`：当前输入框里的最新内容。
- `setName(...)`：把最新内容保存到状态中。

## 八、账户类型下拉框

账户类型适合用 `select`。

```tsx
<label>
  账户类型
  <select
    value={type}
    onChange={(event) => setType(event.target.value as Account["type"])}
  >
    <option value="bank">银行卡</option>
    <option value="cash">现金</option>
    <option value="credit">信用卡</option>
    <option value="investment">投资账户</option>
  </select>
</label>
```

这里出现了：

```tsx
event.target.value as Account["type"]
```

原因是浏览器的 `select` 默认返回普通字符串。

但我们的账户类型更严格：

```tsx
type Account = {
  type: "cash" | "bank" | "credit" | "investment";
};
```

所以这里告诉 TypeScript：

> 这个字符串会是 Account 类型中允许的 type 值。

初学阶段可以先照着写。

后面学习更完整的表单校验时，我们会用 Zod 来处理这类问题。

## 九、账户余额输入框

余额输入框可以这样写：

```tsx
<label>
  账户余额
  <input
    value={balance}
    onChange={(event) => setBalance(event.target.value)}
    placeholder="例如：20000"
  />
</label>
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

表单提交使用 `onSubmit`。

基础结构如下：

```tsx
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  // 这里写表单校验和新增账户逻辑
}
```

然后绑定到表单：

```tsx
<form onSubmit={handleSubmit}>
  ...
  <button type="submit">新增账户</button>
</form>
```

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

## 十一、简单表单校验

本课先做两个校验：

1. 账户名称不能为空。
2. 账户余额必须是合法数字。

校验代码如下：

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

这里的：

```tsx
name.trim()
```

会去掉字符串前后的空格。

例如：

```txt
"   工资卡   "
```

会变成：

```txt
"工资卡"
```

如果用户只输入空格，也会被当成空名称。

`Number(balance)` 会把字符串转换成数字。

例如：

```tsx
Number("20000"); // 20000
Number("abc"); // NaN
```

`Number.isFinite(numericBalance)` 用来判断转换结果是不是一个有效数字。

## 十二、新增账户

校验通过后，就可以创建新账户：

```tsx
const newAccount: Account = {
  id: `account_${Date.now()}`,
  name: trimmedName,
  type,
  balance: numericBalance
};
```

这里用：

```tsx
Date.now()
```

临时生成一个 id。

它会返回当前时间戳，例如：

```txt
1760000000000
```

在真实项目中，id 通常由数据库生成。

但当前阶段还没有接入数据库，所以用时间戳做临时 id 足够练习。

然后更新账户列表：

```tsx
setAccounts([...accounts, newAccount]);
```

最后清空表单：

```tsx
setName("");
setType("bank");
setBalance("");
setError("");
```

完整提交函数如下：

```tsx
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

## 十三、显示错误提示

错误提示可以用条件渲染：

```tsx
{error && (
  <p className="text-red-600">{error}</p>
)}
```

这段代码的意思是：

> 如果 error 有内容，就显示错误提示；如果 error 是空字符串，就什么都不显示。

例如：

```tsx
const error = "请输入账户名称。";
```

页面会显示：

```txt
请输入账户名称。
```

如果：

```tsx
const error = "";
```

页面不显示错误区域。

## 十四、显示空状态

空状态是指：

> 当列表没有数据时，页面应该给用户一个清楚提示。

比如账户列表为空时，不应该只显示一片空白。

可以这样写：

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

这种写法先判断：

```tsx
accounts.length === 0
```

如果没有账户，就提前返回空状态。

如果有账户，再渲染列表。

空状态非常重要。

真实产品里，很多页面第一次打开时都可能没有数据。

例如：

- 没有账户。
- 没有流水。
- 没有负债。
- 没有计算历史。
- 没有导入记录。

用户需要知道下一步该做什么。

## 十五、完整页面代码

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

## 十六、代码结构说明

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
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  ...
}
```

这部分负责校验输入、创建账户、更新列表、清空表单。

## 十七、常见错误

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

注意 `"use client"` 必须在 import 前面。

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

React 状态更新时，优先创建新数组或新对象。

### 4. 表单提交后页面刷新

如果点击提交后页面刷新，通常是忘记写：

```tsx
event.preventDefault();
```

表单提交函数开头应该写：

```tsx
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
}
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

## 十八、本课实践任务

请在你的 `ai-finance-cfo` 项目中完成以下任务。

### 任务 1：修改首页为客户端组件

打开：

```txt
app/page.tsx
```

在文件第一行添加：

```tsx
"use client";
```

并导入：

```tsx
import { useState } from "react";
```

### 任务 2：把账户列表放进状态

把上一课的 `accounts` 改成：

```tsx
const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
```

### 任务 3：新增表单状态

添加：

```tsx
const [name, setName] = useState("");
const [type, setType] = useState<Account["type"]>("bank");
const [balance, setBalance] = useState("");
const [error, setError] = useState("");
```

### 任务 4：创建新增账户表单

表单要包含：

- 账户名称输入框。
- 账户类型下拉框。
- 账户余额输入框。
- 新增账户按钮。

### 任务 5：实现提交逻辑

提交时要求：

- 阻止页面刷新。
- 校验账户名称不能为空。
- 校验余额必须是合法数字。
- 创建新账户对象。
- 使用 `setAccounts` 更新账户列表。
- 提交成功后清空表单。

### 任务 6：添加错误提示

当输入不合法时，在表单附近显示错误提示。

至少支持：

- 账户名称为空。
- 账户余额不是数字。

### 任务 7：添加空状态

修改 `AccountList`。

当 `accounts.length === 0` 时，显示：

```txt
暂无账户，请先新增一个账户。
```

## 十九、验收标准

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

## 二十、检查清单

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

## 二十一、本课小结

这一课我们让页面从“只能展示假数据”变成了“可以响应用户输入”。

你需要记住三句话：

1. 状态是 React 组件中会变化的数据。
2. 表单输入通常用 `value` 和 `onChange` 做成受控组件。
3. 修改状态要用 `setState` 函数，并优先创建新数组或新对象。

本课最重要的实践成果是：

> 实现一个可以新增账户、校验输入、更新列表的账户表单。

这一步很关键。

因为后面的流水录入、负债录入、储蓄目标设置、场景模拟参数输入，本质上都会反复使用这个模式：

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
显示成功结果或错误提示
```

下一课会学习 TailwindCSS 与基础 UI。我们会在当前账户列表和新增账户表单基础上，继续优化页面布局、按钮、输入框、卡片、空状态和错误状态。
