# 第 9 课：TailwindCSS 与基础 UI

## 本课目标

上一课我们实现了“新增账户”表单。

页面已经可以：

- 输入账户名称。
- 选择账户类型。
- 输入账户余额。
- 提交后更新账户列表。
- 在输入不合法时显示错误提示。

但现在页面可能还比较粗糙。

这一课要解决的问题是：

> 如何让页面看起来清晰、有层级，并且让用户知道当前处于什么状态。

本课学习 TailwindCSS 与基础 UI。

你会学到：

- TailwindCSS 是什么。
- 如何用 `className` 写样式。
- 常见布局、间距、字体、颜色写法。
- 如何美化按钮、输入框、卡片和列表。
- 如何设计清晰的页面视觉层级。
- 什么是 `loading`、`empty`、`error` 三种基础状态。
- 如何把上一课的账户表单整理成更像产品界面的页面。

学完本课后，你应该能够：

- 看懂常见 TailwindCSS 类名。
- 用 TailwindCSS 调整页面布局和间距。
- 给表单、按钮、账户卡片添加基本样式。
- 写出清晰的空状态和错误状态。
- 知道 UI 样式不是装饰，而是帮助用户理解页面。

## 一、TailwindCSS 是什么

TailwindCSS 是一个 CSS 工具库。

它的特点是：

> 不先写 CSS 类，再去 CSS 文件里定义样式；而是直接在 `className` 里组合现成的工具类。

传统 CSS 可能这样写：

```tsx
<button className="primary-button">新增账户</button>
```

然后在 CSS 文件里写：

```css
.primary-button {
  background: black;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
}
```

TailwindCSS 会直接写成：

```tsx
<button className="rounded-md bg-black px-4 py-2 text-white">
  新增账户
</button>
```

这些类名的意思是：

| 类名 | 含义 |
| --- | --- |
| `rounded-md` | 中等圆角 |
| `bg-black` | 黑色背景 |
| `px-4` | 左右内边距 |
| `py-2` | 上下内边距 |
| `text-white` | 白色文字 |

TailwindCSS 的优点是：

- 写样式很快。
- 不需要一直给元素起 CSS 类名。
- 样式就在 JSX 旁边，修改方便。
- 适合组件化开发。

它的缺点是：

- 初看类名会比较多。
- 需要熟悉常见缩写。
- 如果不控制，会把 `className` 写得很乱。

本课只学习项目中最常用的一小部分。

## 二、确认项目是否已启用 TailwindCSS

如果你的 Next.js 项目是用官方脚手架创建的，并且创建时选择了 TailwindCSS，通常已经可以直接使用。

可以检查项目里是否有这些文件：

```txt
app/globals.css
tailwind.config.ts
postcss.config.mjs
```

不同 Next.js 版本生成的文件名可能略有不同。

如果 `app/page.tsx` 里写了：

```tsx
<main className="min-h-screen p-8">
```

并且页面确实出现了间距，说明 TailwindCSS 已经生效。

如果没有生效，本课先不要急着处理安装问题。

可以先继续理解写法，后面在项目环境整理时再统一检查。

## 三、TailwindCSS 类名怎么读

TailwindCSS 类名通常由几类组成。

### 1. 布局类

常见布局类：

| 类名 | 含义 |
| --- | --- |
| `min-h-screen` | 最小高度等于一屏 |
| `mx-auto` | 水平居中 |
| `max-w-4xl` | 最大宽度 |
| `grid` | 网格布局 |
| `flex` | 弹性布局 |
| `items-center` | 交叉轴居中 |
| `justify-between` | 两端对齐 |

例如：

```tsx
<main className="min-h-screen bg-gray-50 px-6 py-8">
  <div className="mx-auto max-w-4xl">
    页面内容
  </div>
</main>
```

可以读作：

> 页面至少一屏高，背景浅灰，内边距较大；内容区域居中，最大宽度固定。

### 2. 间距类

常见间距类：

| 类名 | 含义 |
| --- | --- |
| `p-4` | 四周内边距 |
| `px-4` | 左右内边距 |
| `py-2` | 上下内边距 |
| `mt-6` | 上外边距 |
| `mb-2` | 下外边距 |
| `gap-4` | 子元素之间的间距 |
| `space-y-4` | 子元素纵向间距 |

例如：

```tsx
<section className="mt-6 space-y-4">
  ...
</section>
```

表示：

- 这个区域距离上方有间距。
- 区域内部的子元素之间有纵向间距。

### 3. 字体类

常见字体类：

| 类名 | 含义 |
| --- | --- |
| `text-sm` | 小字号 |
| `text-base` | 默认字号 |
| `text-2xl` | 较大字号 |
| `font-medium` | 中等字重 |
| `font-semibold` | 半粗 |
| `font-bold` | 加粗 |
| `text-gray-500` | 浅灰文字 |
| `text-gray-900` | 深灰文字 |

例如：

```tsx
<h1 className="text-2xl font-bold text-gray-900">账户管理</h1>
<p className="mt-2 text-sm text-gray-500">
  管理你的现金、银行卡、信用卡和投资账户。
</p>
```

标题要更大、更重。

说明文字要更小、更浅。

这就是视觉层级。

### 4. 边框和背景类

常见类：

| 类名 | 含义 |
| --- | --- |
| `rounded-lg` | 大圆角 |
| `border` | 边框 |
| `border-gray-200` | 浅灰边框 |
| `bg-white` | 白色背景 |
| `bg-gray-50` | 浅灰背景 |
| `shadow-sm` | 轻微阴影 |

例如：

```tsx
<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  卡片内容
</div>
```

这就是一个基础卡片。

## 四、界面清晰的三个原则

本课程不是专门的 UI 设计课，但要做一个能用的产品，至少要做到清晰。

### 1. 页面要有主次

用户打开页面后，应先看到：

- 这是哪个页面。
- 这个页面能做什么。
- 主要操作在哪里。

例如账户管理页：

```txt
账户管理
管理你的现金、银行卡、信用卡和投资账户。

[新增账户表单]

账户列表
[账户卡片]
```

不要把所有文字、按钮、卡片都做成一样显眼。

### 2. 相关内容放在一起

表单字段应该放在同一个区域。

账户列表应该放在另一个区域。

可以用卡片或区块区分：

```txt
新增账户
  账户名称
  账户类型
  账户余额
  [新增账户]

账户列表
  工资卡
  现金
  信用卡
```

这样用户不会混淆“输入区”和“结果区”。

### 3. 状态要明确

页面不能只在成功时好看。

还要考虑：

- 正在加载时显示什么。
- 没有数据时显示什么。
- 出错时显示什么。

这就是本课后半部分要讲的 `loading`、`empty`、`error`。

## 五、美化页面容器

先把页面外层改清楚。

```tsx
<main className="min-h-screen bg-gray-50 px-6 py-8">
  <div className="mx-auto max-w-4xl">
    ...
  </div>
</main>
```

解释：

- `min-h-screen`：页面至少占满一屏。
- `bg-gray-50`：背景使用浅灰色。
- `px-6 py-8`：页面四周留白。
- `mx-auto`：内容水平居中。
- `max-w-4xl`：内容不要铺满宽屏。

为什么不让内容铺满整个屏幕？

因为财务应用里的文字、表单和列表如果太宽，会很难阅读。

限制内容宽度可以让页面更稳定。

## 六、美化页面标题

标题区域可以这样写：

```tsx
<header className="mb-8">
  <p className="text-sm font-medium text-gray-500">AI 个人财务 CFO</p>
  <h1 className="mt-2 text-3xl font-bold text-gray-900">账户管理</h1>
  <p className="mt-2 text-sm text-gray-600">
    新增账户，并查看当前资产、现金和信用账户。
  </p>
</header>
```

这里分成三层：

- 小字标签：说明属于哪个应用。
- 大标题：说明当前页面。
- 描述文字：说明这个页面的作用。

标题区不要放太多内容。

用户只需要快速知道自己在哪里。

## 七、美化表单区域

上一课的表单可以包成一个卡片：

```tsx
<section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900">新增账户</h2>
  <p className="mt-1 text-sm text-gray-500">
    先用本地状态保存，后续课程会接入 API 和数据库。
  </p>

  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
    ...
  </form>
</section>
```

这样用户会明确知道：

> 这一块是新增账户。

表单卡片的样式重点是：

- 白色背景。
- 浅灰边框。
- 合理内边距。
- 标题和说明分开。

## 八、美化输入框

输入框可以统一成这样的样式：

```tsx
className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
```

完整例子：

```tsx
<label className="block">
  <span className="text-sm font-medium text-gray-700">账户名称</span>
  <input
    value={name}
    onChange={(event) => setName(event.target.value)}
    placeholder="例如：工资卡"
    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
  />
</label>
```

几个重点：

- `w-full`：输入框占满父容器宽度。
- `rounded-md`：圆角适中。
- `border-gray-300`：边框不要太重。
- `text-sm`：表单文字不要太大。
- `focus:border-gray-900`：聚焦时边框变深。
- `focus:ring-2`：聚焦时有外圈提示。

聚焦状态很重要。

用户点击输入框后，应该能看出当前正在编辑哪个字段。

## 九、美化按钮

主按钮可以这样写：

```tsx
<button
  type="submit"
  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
>
  新增账户
</button>
```

解释：

- `bg-gray-900`：深色背景。
- `text-white`：白色文字。
- `font-medium`：按钮文字稍微加重。
- `hover:bg-gray-700`：鼠标悬停时变浅。

按钮要能看出“可以点击”。

如果按钮没有 hover 状态，用户体验会弱一些。

## 十、美化错误提示

错误提示应该明显，但不要吓人。

可以这样写：

```tsx
{error && (
  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
    {error}
  </p>
)}
```

它比单纯红色文字更清楚：

```tsx
<p className="text-red-600">{error}</p>
```

因为浅红背景可以让用户更快定位问题。

但注意：

- 错误提示要靠近表单。
- 错误文字要具体。
- 不要只写“错误”。

推荐：

```txt
请输入账户名称。
```

不推荐：

```txt
提交失败。
```

## 十一、美化账户卡片

账户卡片可以改成：

```tsx
function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{account.name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            类型：{getAccountTypeLabel(account.type)}
          </p>
        </div>

        <p className="text-right text-lg font-semibold text-gray-900">
          {account.balance.toLocaleString()} 元
        </p>
      </div>
    </div>
  );
}
```

这里用了：

```tsx
account.balance.toLocaleString()
```

它可以把数字格式化得更易读。

例如：

```tsx
20000.toLocaleString(); // "20,000"
```

金额显示清楚，对财务应用很重要。

## 十二、账户类型显示为中文

上一课账户类型直接显示：

```txt
bank
cash
credit
investment
```

这对开发者清楚，但对用户不够友好。

可以写一个函数：

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

然后在页面显示：

```tsx
类型：{getAccountTypeLabel(account.type)}
```

这个小改动很重要。

> 程序内部可以使用英文枚举，页面展示应该尽量使用用户能看懂的语言。

## 十三、账户列表区域

列表区域也应该有标题：

```tsx
<section className="mt-8">
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">账户列表</h2>
      <p className="mt-1 text-sm text-gray-500">
        当前共有 {accounts.length} 个账户。
      </p>
    </div>
  </div>

  <AccountList accounts={accounts} />
</section>
```

这样用户可以明确区分：

- 上面是新增账户。
- 下面是账户列表。

显示账户数量也很有用。

它让用户提交后能立刻感知结果变化。

## 十四、empty 空状态

空状态是指没有数据时的页面。

账户为空时，可以这样写：

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

空状态应该回答两个问题：

1. 当前为什么没有内容？
2. 用户下一步应该做什么？

所以不要只写：

```txt
暂无数据
```

更好的写法是：

```txt
暂无账户。先新增一个账户，用来记录现金、银行卡、信用卡或投资余额。
```

## 十五、error 错误状态

错误状态是指出现问题时的页面。

本课暂时只有表单错误。

但后面接入 API 后，常见错误会包括：

- 网络请求失败。
- API 返回错误。
- 数据格式不符合预期。
- 数据库写入失败。

可以先准备一个通用错误组件：

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

这样错误样式就不会散落在页面各处。

## 十六、loading 加载状态

加载状态是指页面正在等待数据或操作完成。

当前课程还没有 API 请求，所以表单提交是瞬间完成的。

为了理解 loading，可以先看一个模拟写法：

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);
```

提交开始时：

```tsx
setIsSubmitting(true);
```

提交结束后：

```tsx
setIsSubmitting(false);
```

按钮可以根据状态变化：

```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
>
  {isSubmitting ? "提交中..." : "新增账户"}
</button>
```

这里的重点是：

- `disabled={isSubmitting}`：提交中禁用按钮。
- `disabled:cursor-not-allowed`：禁用时鼠标样式变化。
- `disabled:bg-gray-400`：禁用时按钮变灰。
- 按钮文字从“新增账户”变成“提交中...”。

后面学习 API 时，loading 会更常用。

本课只需要先理解：

> 当操作需要等待时，界面要告诉用户正在处理。

## 十七、完整页面代码

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
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">{account.name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            类型：{getAccountTypeLabel(account.type)}
          </p>
        </div>

        <p className="text-right text-lg font-semibold text-gray-900">
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

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
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">AI 个人财务 CFO</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">账户管理</h1>
          <p className="mt-2 text-sm text-gray-600">
            新增账户，并查看当前资产、现金和信用账户。
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">新增账户</h2>
          <p className="mt-1 text-sm text-gray-500">
            先用本地状态保存，后续课程会接入 API 和数据库。
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
              disabled={isSubmitting}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? "提交中..." : "新增账户"}
            </button>
          </form>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">账户列表</h2>
              <p className="mt-1 text-sm text-gray-500">
                当前共有 {accounts.length} 个账户。
              </p>
            </div>
          </div>

          <AccountList accounts={accounts} />
        </section>
      </div>
    </main>
  );
}
```

## 十八、关于 isSubmitting 的说明

你可能会注意到：

```tsx
setIsSubmitting(true);
...
setIsSubmitting(false);
```

在当前代码中，提交操作没有真正等待网络请求，所以这个状态变化非常快。

这意味着你可能几乎看不到“提交中...”。

这没关系。

本课把它写出来，是为了提前建立一个习惯：

> 只要操作未来可能需要等待，就应该考虑 loading 状态。

等后面接入 API 后，`isSubmitting` 会变得非常有用。

## 十九、常见错误

### 1. className 太长，看不懂

TailwindCSS 的类名可能会比较长。

初学阶段不要试图一次记住所有类名。

先记住最常见的几类：

- `p`、`px`、`py`、`mt`、`mb`：间距。
- `text`、`font`：文字。
- `bg`：背景。
- `border`、`rounded`：边框和圆角。
- `flex`、`grid`：布局。

### 2. 页面所有东西都一样大

如果标题、说明、按钮、列表文字都一样大，页面会很难扫读。

应该有层级：

- 页面标题最大。
- 区块标题次之。
- 正文和说明更小。
- 辅助说明颜色更浅。

### 3. 表单字段之间太挤

表单字段之间需要间距。

可以给表单添加：

```tsx
className="space-y-4"
```

这样每个字段之间会自动有纵向间距。

### 4. 错误提示离输入框太远

错误提示应该出现在表单附近。

不要放到页面最顶部或最底部。

用户应该能快速知道哪里出了问题。

### 5. 没有空状态

如果列表为空时什么都不显示，用户会以为页面坏了。

至少要显示：

```txt
暂无账户，请先新增一个账户。
```

更好的空状态还会说明下一步动作。

## 二十、本课实践任务

请在你的 `ai-finance-cfo` 项目中完成以下任务。

### 任务 1：美化页面外层

给 `main` 添加：

```tsx
className="min-h-screen bg-gray-50 px-6 py-8"
```

再用一个内部容器限制宽度：

```tsx
<div className="mx-auto max-w-4xl">
  ...
</div>
```

### 任务 2：美化标题区域

添加页面标题、应用名和说明文字。

要求：

- 页面标题比普通文字更大。
- 说明文字颜色更浅。
- 标题区域和表单之间有间距。

### 任务 3：美化新增账户表单

要求：

- 表单外层是白色卡片。
- 输入框占满宽度。
- 输入框有边框、圆角和聚焦状态。
- 按钮有背景色、文字颜色和 hover 状态。

### 任务 4：美化账户列表

要求：

- 账户列表有标题。
- 显示当前账户数量。
- 每个账户用卡片展示。
- 账户余额靠右显示。
- 账户类型显示为中文。

### 任务 5：完善状态展示

至少实现：

- `empty`：账户为空时显示空状态。
- `error`：表单错误时显示错误提示。
- `loading`：提交中按钮禁用并显示“提交中...”。

## 二十一、验收标准

完成本课后，请检查：

- 页面背景、内容宽度和留白清晰。
- 页面标题、区块标题、说明文字有视觉层级。
- 新增账户表单看起来像一个独立区域。
- 输入框有清晰边框和聚焦状态。
- 按钮有正常状态、hover 状态和禁用状态。
- 账户列表使用卡片展示。
- 账户类型显示为中文。
- 账户余额显示为更易读的格式。
- 空账户列表时有空状态提示。
- 输入错误时有明显错误提示。

## 二十二、检查清单

完成本课后，你应该能回答：

- TailwindCSS 和普通 CSS 的写法有什么区别？
- `px-4`、`py-2`、`mt-6` 分别是什么意思？
- `bg-gray-50` 和 `text-gray-500` 分别控制什么？
- 为什么页面内容不应该铺满整个宽屏？
- 什么是视觉层级？
- 表单输入框为什么需要 focus 状态？
- 什么是 empty 状态？
- 什么是 error 状态？
- 什么是 loading 状态？
- 为什么用户界面要展示当前状态？

## 二十三、本课小结

这一课我们没有新增复杂业务逻辑，而是把已有账户表单和账户列表整理成更清晰的界面。

你需要记住三句话：

1. TailwindCSS 是通过 `className` 组合工具类来写样式。
2. 好的 UI 不是装饰，而是让用户更快理解页面。
3. 页面必须考虑 `loading`、`empty`、`error` 这些基础状态。

本课最重要的实践成果是：

> 美化账户列表和新增账户表单，让页面具备基本产品可用性。

后面的仪表盘、流水列表、负债列表、CSV 导入页，都会继续复用这些基础 UI 思路：

```txt
页面容器
  ↓
标题说明
  ↓
主要操作区
  ↓
数据展示区
  ↓
loading / empty / error 状态
```

下一课会学习 Next.js App Router 基础。我们会把单页内容扩展成多个页面，并学习 `app/` 目录、`page.tsx`、`layout.tsx` 和页面导航。
