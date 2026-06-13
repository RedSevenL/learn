# 第 9 课：TailwindCSS 与基础 UI

## 本课目标

第 8 课已经完成了账户表单的核心功能：

- 用 `useState` 保存账户列表。
- 用 `name`、`type`、`balance` 保存表单输入。
- 用 `handleSubmit` 校验并新增账户。
- 用 `AccountCard` 和 `AccountList` 展示账户。

第 9 课不是重写功能，而是在第 8 课代码基础上做 UI 美化。

本课重点：

- 看懂 TailwindCSS 的常见类名。
- 用 `className` 调整布局、间距、字体、颜色。
- 美化页面容器、表单、按钮、账户卡片。
- 增加更清楚的错误状态和空状态。
- 把内部英文账户类型显示成中文。

## 一、这节课改什么

第 8 课代码已经能用，但页面比较基础：

```tsx
<main className="min-h-screen p-8">
```

表单、列表、卡片都只是简单加了边框和间距。

第 9 课要做的是：

```txt
保留第 8 课的数据和逻辑
  ↓
只增强页面 UI
  ↓
让页面更像一个财务产品界面
```

具体改动：


| 第 8 课           | 第 9 课              |
| --------------- | ------------------ |
| 页面只有基础留白        | 增加浅灰背景和居中内容区       |
| 账户类型直接显示 `bank` | 显示为“银行卡”           |
| 表单直接放在页面里       | 表单放进白色卡片           |
| 错误只是红色文字        | 错误变成浅红提示块          |
| 空列表只是普通文字       | 空状态变成虚线卡片          |
| 卡片样式简单          | 卡片增加白底、边框、阴影、金额格式化 |


## 二、TailwindCSS 是什么

TailwindCSS 是一个 CSS 工具库。

它不是先写 CSS 类，再去 CSS 文件里定义样式，而是直接在 JSX 的 `className` 里组合工具类。

例如按钮：

```tsx
<button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
  新增账户
</button>
```

这些类名可以拆开读：


| 类名            | 含义    |
| ------------- | ----- |
| `rounded-md`  | 中等圆角  |
| `bg-gray-900` | 深灰背景  |
| `px-4`        | 左右内边距 |
| `py-2`        | 上下内边距 |
| `text-sm`     | 小字号   |
| `font-medium` | 中等字重  |
| `text-white`  | 白色文字  |


TailwindCSS 的核心习惯是：

> 样式跟着元素写，看到 JSX 就能看到这个元素长什么样。

## 三、页面容器

第 8 课：

```tsx
<main className="min-h-screen p-8">
```

第 9 课改成：

```tsx
<main className="min-h-screen bg-gray-50 px-6 py-8">
  <div className="mx-auto max-w-4xl">
    ...
  </div>
</main>
```

逐层读：


| 类名             | 含义        |
| -------------- | --------- |
| `min-h-screen` | 页面至少一屏高   |
| `bg-gray-50`   | 浅灰背景      |
| `px-6 py-8`    | 页面左右、上下留白 |
| `mx-auto`      | 内容水平居中    |
| `max-w-4xl`    | 限制最大宽度    |


财务页面不适合内容铺满整屏。限制宽度后，表单和列表更容易阅读。

## 四、标题区域

第 9 课把标题区域改成三层：

```tsx
<header className="mb-8">
  <p className="text-sm font-medium text-gray-500">AI财务助手</p>
  <h1 className="mt-2 text-3xl font-bold text-gray-900">账户管理</h1>
  <p className="mt-2 text-sm text-gray-600">
    新增账户，并查看当前现金、银行卡、信用卡和投资账户。
  </p>
</header>
```

三层分别是：

1. 小字标签：属于哪个应用。
2. 大标题：当前页面是什么。
3. 描述文字：这个页面能做什么。

这就是基础视觉层级。

## 五、表单卡片

第 8 课的表单直接放在页面中。

第 9 课把它放进一个 `section`：

```tsx
<section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900">新增账户</h2>
  <p className="mt-1 text-sm text-gray-500">
    先用本地状态保存账户数据，后续课程再接入 API 和数据库。
  </p>

  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
    ...
  </form>
</section>
```

这里的作用：

- `bg-white`：表单区域从浅灰背景中凸显出来。
- `border border-gray-200`：有清楚边界。
- `p-6`：内部留白更舒服。
- `shadow-sm`：轻微阴影，层次更明显。
- `space-y-4`：表单字段之间保持纵向间距。

## 六、输入框样式

第 8 课输入框：

```tsx
className="mt-1 w-full rounded border px-3 py-2"
```

第 9 课改成：

```tsx
className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
```

新增重点：


| 类名                      | 含义        |
| ----------------------- | --------- |
| `border-gray-300`       | 边框颜色更柔和   |
| `text-sm`               | 表单文字更紧凑   |
| `outline-none`          | 去掉浏览器默认外框 |
| `focus:border-gray-900` | 聚焦时边框变深   |
| `focus:ring-2`          | 聚焦时出现外圈   |
| `focus:ring-gray-200`   | 外圈颜色为浅灰   |


`focus:` 是状态前缀。

可以读作：

```txt
当这个输入框处于聚焦状态时，应用后面的样式。
```

## 七、按钮样式

按钮改成：

```tsx
<button
  type="submit"
  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
>
  新增账户
</button>
```

这里：

- `bg-gray-900`：主按钮用深色背景。
- `text-white`：按钮文字用白色。
- `hover:bg-gray-700`：鼠标悬停时背景变浅。

`hover:` 也是状态前缀。

可以读作：

```txt
鼠标悬停时，应用后面的样式。
```

## 八、账户类型显示为中文

第 8 课直接显示：

```tsx
类型：{account.type}
```

页面上会看到：

```txt
bank
cash
credit
investment
```

第 9 课增加一个转换函数：

```tsx
function getAccountTypeLabel(type: Account["type"]) {
  if (type === "bank") {
    return "银行卡";
  }

  if (type === "cash") {
    return "现金";
  }

  if (type === "credit") {
    return "信用卡";
  }

  return "投资账户";
}
```

然后显示：

```tsx
类型：{getAccountTypeLabel(account.type)}
```

这体现一个常见原则：

> 程序内部可以用英文值，页面展示要尽量用用户看得懂的中文。

## 九、账户卡片

第 9 课的 `AccountCard`：

```tsx
function AccountCard({ account }: AccountCardProps) {
  const balanceClassName =
    account.balance < 0 ? "text-red-600" : "text-gray-900";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{account.name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            类型：{getAccountTypeLabel(account.type)}
          </p>
        </div>

        <p className={`text-right text-lg font-semibold ${balanceClassName}`}>
          {account.balance.toLocaleString()} 元
        </p>
      </div>
    </div>
  );
}
```

新增点：

- `flex justify-between`：左边显示账户信息，右边显示余额。
- `toLocaleString()`：把金额格式化成更易读的形式。
- 负数余额使用红色：信用卡欠款更容易被看出来。

例如：

```tsx
account.balance.toLocaleString()
```

会把 `20000` 显示成：

```txt
20,000
```

## 十、错误状态

第 8 课：

```tsx
{error && <p className="text-red-600">{error}</p>}
```

第 9 课提取成组件：

```tsx
function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}
```

使用：

```tsx
{error && <ErrorMessage message={error} />}
```

这样做的好处：

- 错误样式统一。
- JSX 更清楚。
- 后面如果多个地方显示错误，可以复用。

## 十一、空状态

第 8 课空列表是普通提示文字。

第 9 课改成：

```tsx
function EmptyAccounts() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
      <h3 className="text-sm font-semibold text-gray-900">暂无账户</h3>
      <p className="mt-2 text-sm text-gray-500">
        先新增一个账户，用来记录现金、银行卡、信用卡或投资余额。
      </p>
    </div>
  );
}
```

空状态要回答两个问题：

1. 当前为什么没有内容？
2. 用户下一步应该做什么？

所以不要只写“暂无数据”。

## 十二、账户列表区域

第 9 课在列表上方增加标题和数量：

```tsx
<section className="mt-8">
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-gray-900">账户列表</h2>
    <p className="mt-1 text-sm text-gray-500">
      当前共有 {accounts.length} 个账户。
    </p>
  </div>

  <AccountList accounts={accounts} />
</section>
```

这样用户提交后，可以直接看到账户数量变化。

## 十三、本课完整代码

`app/page.tsx` 更新后如下：

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

function getAccountTypeLabel(type: Account["type"]) {
  if (type === "bank") {
    return "银行卡";
  }

  if (type === "cash") {
    return "现金";
  }

  if (type === "credit") {
    return "信用卡";
  }

  return "投资账户";
}

type AccountCardProps = {
  account: Account;
};

function AccountCard({ account }: AccountCardProps) {
  const balanceClassName =
    account.balance < 0 ? "text-red-600" : "text-gray-900";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{account.name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            类型：{getAccountTypeLabel(account.type)}
          </p>
        </div>

        <p className={`text-right text-lg font-semibold ${balanceClassName}`}>
          {account.balance.toLocaleString()} 元
        </p>
      </div>
    </div>
  );
}

function EmptyAccounts() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
      <h3 className="text-sm font-semibold text-gray-900">暂无账户</h3>
      <p className="mt-2 text-sm text-gray-500">
        先新增一个账户，用来记录现金、银行卡、信用卡或投资余额。
      </p>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

type AccountListProps = {
  accounts: Account[];
};

function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) {
    return <EmptyAccounts />;
  }

  return (
    <section className="space-y-3">
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
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">AI 个人财务 CFO</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">账户管理</h1>
          <p className="mt-2 text-sm text-gray-600">
            新增账户，并查看当前现金、银行卡、信用卡和投资账户。
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">新增账户</h2>
          <p className="mt-1 text-sm text-gray-500">
            先用本地状态保存账户数据，后续课程再接入 API 和数据库。
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">账户名称</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例如：工资卡"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">账户类型</span>
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as Account["type"])
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              >
                <option value="bank">银行卡</option>
                <option value="cash">现金</option>
                <option value="credit">信用卡</option>
                <option value="investment">投资账户</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">账户余额</span>
              <input
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                placeholder="例如：20000"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </label>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              新增账户
            </button>
          </form>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">账户列表</h2>
            <p className="mt-1 text-sm text-gray-500">
              当前共有 {accounts.length} 个账户。
            </p>
          </div>

          <AccountList accounts={accounts} />
        </section>
      </div>
    </main>
  );
}
```

## 十四、本课核心结论

第 9 课的重点不是新增业务功能，而是学习：

```txt
同一套状态和逻辑
  ↓
通过 TailwindCSS 改善页面表达
  ↓
让用户更容易看懂、输入和判断结果
```

UI 不是单纯装饰。

好的基础 UI 应该让用户清楚知道：

- 当前页面是什么。
- 应该在哪里输入。
- 提交后发生了什么。
- 出错时该怎么修正。
- 没有数据时下一步做什么。

