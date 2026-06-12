# 第 7 课：React 组件入门

## 本课目标

从这一课开始，我们进入阶段二：React 与 Next.js 前端基础。

前面几课主要解决两个问题：

- 能写基础 JavaScript 和 TypeScript。
- 能用 Git 管理项目。

接下来要解决的是：

> 如何把数据展示成用户能看见、能操作的页面。

本课学习 React 组件入门。

你会学到：

- 组件是什么。
- JSX 是什么。
- 如何把数据写进页面。
- props 是什么。
- 为什么要拆分组件。
- 如何渲染列表。
- 如何制作一个账户列表组件。

学完本课后，你应该能够：

- 看懂简单的 React 组件。
- 在 `app/page.tsx` 中展示页面内容。
- 把账户数据传给子组件。
- 使用 `.map()` 渲染账户列表。
- 制作一个基础的 `AccountList` 组件。

## 一、React 是什么

React 是一个用来构建用户界面的 JavaScript 库。

你可以先把它理解成：

> React 帮我们把页面拆成一个个组件，再根据数据渲染出界面。

传统网页开发里，可能会直接写 HTML：

```html
<h1>AI 个人财务 CFO</h1>
<p>这是我的账户列表。</p>
```

React 里，我们通常会写成组件：

```tsx
function HomePage() {
  return (
    <main>
      <h1>AI 个人财务 CFO</h1>
      <p>这是我的账户列表。</p>
    </main>
  );
}
```

这段代码看起来像 HTML，但它其实是 JSX。

后面我们会详细讲。

## 二、组件是什么

组件是 React 里最核心的概念。

一个组件可以理解为：

> 一块可以复用的页面区域。

例如在 AI 个人财务 CFO 项目中，页面可以拆成很多组件：

- 顶部导航组件。
- 账户列表组件。
- 账户卡片组件。
- 流水列表组件。
- 财务摘要组件。
- 聊天消息组件。
- CSV 导入组件。

组件的好处是：

- 页面结构更清楚。
- 代码更容易维护。
- 相同界面可以重复使用。
- 每个组件只负责一小块功能。

例如账户列表页面可以拆成：

```txt
DashboardPage
  ├── SummaryCards
  ├── AccountList
  │   ├── AccountItem
  │   └── AccountItem
  └── TransactionList
```

本课先做最简单的账户列表组件。

## 三、一个最简单的 React 组件

打开上一课创建的 Next.js 项目。

找到：

```txt
app/page.tsx
```

你可能会看到类似代码：

```tsx
export default function Home() {
  return (
    <main>
      <h1>AI 个人财务 CFO</h1>
    </main>
  );
}
```

这就是一个 React 组件。

它有几个关键点：

- `function Home()` 定义了一个函数。
- 函数返回一段 JSX。
- `export default` 表示这是当前文件默认导出的组件。
- 在 Next.js 里，`app/page.tsx` 默认就是首页。

你可以把组件理解成：

> 一个返回页面结构的函数。

## 四、JSX 是什么

JSX 是 JavaScript 的语法扩展。

它让我们可以在 JavaScript 或 TypeScript 文件里写类似 HTML 的结构。

例如：

```tsx
const title = "AI 个人财务 CFO";

export default function Home() {
  return (
    <main>
      <h1>{title}</h1>
      <p>欢迎来到个人财务管理应用。</p>
    </main>
  );
}
```

这里的：

```tsx
<main>
  <h1>{title}</h1>
  <p>欢迎来到个人财务管理应用。</p>
</main>
```

就是 JSX。

它看起来像 HTML，但有几个 React 规则。

## 五、JSX 中使用变量

在 JSX 中使用 JavaScript 变量，需要用 `{}`。

例如：

```tsx
const appName = "AI 个人财务 CFO";

export default function Home() {
  return (
    <main>
      <h1>{appName}</h1>
    </main>
  );
}
```

页面会显示：

```txt
AI 个人财务 CFO
```

再比如：

```tsx
const monthlyIncome = 30000;
const monthlyExpense = 18000;
const surplus = monthlyIncome - monthlyExpense;

export default function Home() {
  return (
    <main>
      <h1>月度财务摘要</h1>
      <p>月收入：{monthlyIncome} 元</p>
      <p>月支出：{monthlyExpense} 元</p>
      <p>月结余：{surplus} 元</p>
    </main>
  );
}
```

这说明 JSX 不只是静态 HTML。

它可以根据 JavaScript 数据生成页面。

## 六、JSX 的几个基础规则

### 1. 只能返回一个根元素

错误写法：

```tsx
export default function Home() {
  return (
    <h1>标题</h1>
    <p>正文</p>
  );
}
```

这里同时返回了两个并列元素。

正确写法：

```tsx
export default function Home() {
  return (
    <main>
      <h1>标题</h1>
      <p>正文</p>
    </main>
  );
}
```

如果不想额外加真实标签，也可以使用空标签：

```tsx
export default function Home() {
  return (
    <>
      <h1>标题</h1>
      <p>正文</p>
    </>
  );
}
```

这个空标签叫 Fragment。

### 2. 标签要闭合

错误写法：

```tsx
<input>
```

正确写法：

```tsx
<input />
```

或者：

```tsx
<div></div>
```

JSX 中标签必须闭合。

### 3. class 要写成 className

HTML 中写：

```html
<div class="card"></div>
```

JSX 中要写：

```tsx
<div className="card"></div>
```

在 React 里，`className` 用来设置 CSS 类名。

后面学习 TailwindCSS 时，会经常使用它。

例如：

```tsx
<main className="min-h-screen p-8">
  <h1 className="text-3xl font-bold">AI 个人财务 CFO</h1>
</main>
```

## 七、在页面中展示账户数据

现在我们准备展示账户列表。

先在 `app/page.tsx` 中写一组账户数据：

```tsx
const accounts = [
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

然后先手动展示第一项：

```tsx
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">账户列表</h1>

      <section className="mt-6">
        <h2>{accounts[0].name}</h2>
        <p>类型：{accounts[0].type}</p>
        <p>余额：{accounts[0].balance} 元</p>
      </section>
    </main>
  );
}
```

这样可以显示第一张账户。

但真实项目里账户数量不是固定的，所以不能一直手写 `accounts[0]`、`accounts[1]`、`accounts[2]`。

这时需要列表渲染。

## 八、列表渲染

React 中渲染列表，常用数组的 `.map()`。

先看一个不涉及 React 的例子：

```ts
const names = ["工资卡", "现金", "信用卡"];

const displayNames = names.map((name) => `账户：${name}`);
```

这段代码的意思是：

> 对 names 里的每一个 name，都生成一个新的显示文本。

结果类似：

```ts
["账户：工资卡", "账户：现金", "账户：信用卡"]
```

所以 `.map()` 可以先理解为：

> 把一个数组，转换成另一个数组。

再看 React 里的写法：

例如：

```tsx
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">账户列表</h1>

      <section className="mt-6 space-y-4">
        {accounts.map((account) => (
          <div key={account.id} className="rounded border p-4">
            <h2 className="font-semibold">{account.name}</h2>
            <p>类型：{account.type}</p>
            <p>余额：{account.balance} 元</p>
          </div>
        ))}
      </section>
    </main>
  );
}
```

这段代码可以读作：

> 对 accounts 里的每一个 account，都渲染一个 div。

其中这一行最关键：

```tsx
{accounts.map((account) => (
```

可以拆开读：

| 片段 | 含义 |
| --- | --- |
| `{ ... }` | 在 JSX 里写 JavaScript 表达式 |
| `accounts.map(...)` | 遍历 accounts 数组，并生成一组新内容 |
| `(account) => (...)` | 箭头函数：每次拿到一个 account，返回后面的 JSX |
| `<div>...</div>` | 每个账户对应的一块页面结构 |

这里的箭头函数也可以粗略理解成：

```tsx
function renderAccount(account) {
  return <div>{account.name}</div>;
}
```

只是 React 中经常把它写得更短：

```tsx
(account) => <div>{account.name}</div>
```

如果 `accounts` 有 3 项，就渲染 3 个账户卡片。

如果以后变成 10 项，就自动渲染 10 个。

### key 是什么

你会注意到这里有：

```tsx
key={account.id}
```

React 渲染列表时，每一项都需要一个稳定的 `key`。

它帮助 React 判断：

- 哪一项是新加的。
- 哪一项被删除了。
- 哪一项只是内容变了。

通常我们会用数据里的唯一 `id` 做 key。

不要优先用数组下标做 key。

例如不推荐：

```tsx
accounts.map((account, index) => (
  <div key={index}>{account.name}</div>
))
```

当列表顺序变化时，下标可能导致界面更新不准确。

## 九、props 是什么

现在账户列表代码都写在 `Home` 组件里。

随着页面变复杂，这个文件会越来越长。

更好的方式是把账户卡片拆成单独组件。

组件之间传数据，需要使用 props。

props 可以理解成：

> 父组件传给子组件的数据。

例如：

```tsx
function AccountCard(props: { name: string; type: string; balance: number }) {
  return (
    <div className="rounded border p-4">
      <h2 className="font-semibold">{props.name}</h2>
      <p>类型：{props.type}</p>
      <p>余额：{props.balance} 元</p>
    </div>
  );
}
```

使用时：

```tsx
<AccountCard name="工资卡" type="bank" balance={20000} />
```

这表示把三个 props 传给 `AccountCard`：

- `name`
- `type`
- `balance`

注意：

- 字符串可以直接用引号。
- 数字要用 `{}`。

## 十、props 解构写法

上面的写法每次都要写 `props.name`、`props.type`。

更常见的是解构 props。

```tsx
function AccountCard({
  name,
  type,
  balance
}: {
  name: string;
  type: string;
  balance: number;
}) {
  return (
    <div className="rounded border p-4">
      <h2 className="font-semibold">{name}</h2>
      <p>类型：{type}</p>
      <p>余额：{balance} 元</p>
    </div>
  );
}
```

这段代码的意思是：

> 从 props 中取出 name、type、balance 三个字段直接使用。

初学时如果觉得这段类型写法有点长，可以先接受它。

后面我们会把 props 类型单独提出来，让代码更清楚。

## 十一、定义组件 Props 类型

可以先定义一个类型：

```tsx
type AccountCardProps = {
  name: string;
  type: string;
  balance: number;
};
```

再写组件：

```tsx
function AccountCard({ name, type, balance }: AccountCardProps) {
  return (
    <div className="rounded border p-4">
      <h2 className="font-semibold">{name}</h2>
      <p>类型：{type}</p>
      <p>余额：{balance} 元</p>
    </div>
  );
}
```

这样比把类型直接写在参数里更清晰。

但账户本身已经有一个类型时，更推荐直接传整个账户对象。

## 十二、传整个账户对象

先定义账户类型：

```tsx
type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "investment";
  balance: number;
};
```

再定义组件 props：

```tsx
type AccountCardProps = {
  account: Account;
};
```

然后写组件：

```tsx
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

使用：

```tsx
<AccountCard account={account} />
```

这种写法更适合本项目。

因为一个账户往往不只有三个字段，后面可能还会有：

- 备注。
- 创建时间。
- 更新时间。
- 是否隐藏。
- 是否删除。

传整个对象更容易扩展。

## 十三、拆分账户列表组件

现在可以创建一个 `AccountList` 组件。

它负责接收账户数组，并渲染多个 `AccountCard`。

```tsx
type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "investment";
  balance: number;
};

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
  return (
    <section className="mt-6 space-y-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </section>
  );
}
```

这里有两个组件：

- `AccountCard`：负责展示单个账户。
- `AccountList`：负责展示账户列表。

这种拆分方式比把所有 JSX 都写在 `Home` 里更清晰。

## 十四、完整页面代码

可以把 `app/page.tsx` 改成下面这样：

```tsx
type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "investment";
  balance: number;
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
  return (
    <section className="mt-6 space-y-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">账户列表</h1>
      <p className="mt-2 text-gray-600">
        这里展示 AI 个人财务 CFO 的基础账户数据。
      </p>

      <AccountList accounts={accounts} />
    </main>
  );
}
```

保存后，启动开发服务器：

```bash
npm run dev
```

浏览器打开：

```txt
http://localhost:3000
```

你应该能看到三个账户：

- 工资卡。
- 现金。
- 信用卡。

## 十五、为什么现在先用假数据

你可能会问：

> 这些账户数据为什么直接写在页面文件里，不从数据库读取？

原因是课程需要一步步来。

当前阶段重点是学习 React 组件。

所以先使用写死的假数据：

```tsx
const accounts = [...]
```

这样可以专注理解：

- JSX。
- props。
- 组件拆分。
- 列表渲染。

等后面学习 API 和数据库时，我们会把这些假数据替换成真实数据。

这也是常见开发方式：

> 先用假数据做界面，再接入真实数据。

## 十六、组件拆分到单独文件

当前课程可以先把组件都写在 `app/page.tsx` 里。

但项目变大后，应该把组件拆到单独文件。

例如后面可以创建：

```txt
components/
  AccountList.tsx
  AccountCard.tsx
```

然后在页面里引入：

```tsx
import { AccountList } from "@/components/AccountList";
```

本课暂时不要求完成这一步。

因为过早拆文件会增加初学者的理解负担。

先在一个文件里看清楚组件之间的关系更重要。

## 十七、常见错误

### 1. JSX 标签没有闭合

错误写法：

```tsx
<AccountCard account={account}>
```

正确写法：

```tsx
<AccountCard account={account} />
```

如果组件没有子内容，使用自闭合标签。

### 2. map 里忘记 return

下面这种写法容易出错：

```tsx
{accounts.map((account) => {
  <AccountCard key={account.id} account={account} />;
})}
```

因为使用 `{}` 函数体时，需要显式 `return`。

正确写法一：

```tsx
{accounts.map((account) => (
  <AccountCard key={account.id} account={account} />
))}
```

正确写法二：

```tsx
{accounts.map((account) => {
  return <AccountCard key={account.id} account={account} />;
})}
```

初学阶段推荐第一种。

### 3. 列表项忘记 key

错误写法：

```tsx
{accounts.map((account) => (
  <AccountCard account={account} />
))}
```

正确写法：

```tsx
{accounts.map((account) => (
  <AccountCard key={account.id} account={account} />
))}
```

渲染列表时，每一项都应该有稳定的 `key`。

### 4. props 名字不一致

组件定义：

```tsx
function AccountCard({ account }: AccountCardProps) {
  return <div>{account.name}</div>;
}
```

使用时应该写：

```tsx
<AccountCard account={account} />
```

如果写成：

```tsx
<AccountCard item={account} />
```

就不匹配。

props 名字必须和组件定义一致。

### 5. className 写成了 class

错误写法：

```tsx
<main class="p-8">
```

正确写法：

```tsx
<main className="p-8">
```

JSX 中要使用 `className`。

## 十八、本课实践任务

请在你的 `ai-finance-cfo` 项目中完成以下任务。

### 任务 1：修改首页

打开：

```txt
app/page.tsx
```

把首页改成账户列表页面。

### 任务 2：定义 Account 类型

在 `app/page.tsx` 中定义：

```tsx
type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "credit" | "investment";
  balance: number;
};
```

### 任务 3：创建账户假数据

创建 `accounts` 数组，至少包含 3 个账户：

- 一个银行卡账户。
- 一个现金账户。
- 一个信用卡账户。

### 任务 4：创建 AccountCard 组件

要求：

- 接收一个 `account` prop。
- 显示账户名称。
- 显示账户类型。
- 显示账户余额。

### 任务 5：创建 AccountList 组件

要求：

- 接收 `accounts` 数组。
- 使用 `.map()` 渲染多个 `AccountCard`。
- 每一项使用 `account.id` 作为 `key`。

### 任务 6：在首页使用 AccountList

在 `Home` 组件中渲染：

```tsx
<AccountList accounts={accounts} />
```

### 任务 7：浏览器检查效果

运行：

```bash
npm run dev
```

打开：

```txt
http://localhost:3000
```

确认页面能显示账户列表。

## 十九、检查清单

完成本课后，你应该能回答：

- React 组件是什么？
- 为什么要把页面拆成组件？
- JSX 和 HTML 有什么相似和不同？
- JSX 中如何显示变量？
- 为什么 JSX 里要写 `className`？
- props 是什么？
- 父组件如何给子组件传数据？
- 为什么列表渲染常用 `.map()`？
- React 列表里的 `key` 有什么作用？
- `AccountCard` 和 `AccountList` 分别负责什么？
- 为什么当前阶段可以先使用假数据？

## 二十、本课小结

这一课我们进入了 React 的核心世界：组件。

你需要记住三句话：

1. React 页面是由组件组成的。
2. JSX 让我们可以用类似 HTML 的方式描述界面。
3. props 让父组件可以把数据传给子组件。

本课最重要的实践成果是：

> 制作一个可以渲染账户假数据的 `AccountList` 组件。

这一步很关键。

因为后面的账户管理、流水列表、负债列表、财务仪表盘，本质上都会不断重复这个模式：

```txt
定义数据类型
  ↓
准备数据
  ↓
拆分组件
  ↓
通过 props 传递数据
  ↓
在组件里用 map 渲染列表
```

下一课会学习 React 状态与表单。我们会在账户列表基础上继续前进，实现“新增账户”表单。
