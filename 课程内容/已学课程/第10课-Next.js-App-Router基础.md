# 第 10 课：Next.js App Router 基础

## 本课目标

前面几课我们一直在一个页面里练习：

```txt
app/page.tsx
```

这个页面已经可以展示账户列表、提交新增账户表单，并用 TailwindCSS 做基础样式。

但真实项目不会只有一个页面。

AI 个人财务 CFO 至少会有这些页面：

- 首页。
- 财务面板页。
- AI 对话页。
- CSV 导入页。
- 场景模拟页。

这一课要解决的问题是：

> 如何用 Next.js App Router 创建多个页面，并在页面之间跳转。

你会学到：

- `app/` 目录的作用。
- `page.tsx` 的作用。
- 文件夹如何变成页面路径。
- `layout.tsx` 的作用。
- 如何使用 `Link` 做页面导航。
- 服务端组件和客户端组件的基本区别。
- 如何创建首页、财务面板页、场景模拟页、导入页。

学完本课后，你应该能够：

- 看懂 Next.js App Router 的基础目录结构。
- 创建新的页面路径。
- 使用 `Link` 在页面之间切换。
- 知道 `page.tsx` 和 `layout.tsx` 分别负责什么。
- 初步判断什么时候需要写 `"use client"`。

## 一、什么是 App Router

Next.js 是一个 React 全栈框架。

它不仅能写 React 组件，还能处理：

- 页面路由。
- 布局。
- API。
- 服务端渲染。
- 静态页面生成。
- 前后端代码组织。

App Router 是 Next.js 现在推荐的路由组织方式。

它的核心规则是：

> `app/` 目录里的文件夹结构，会变成网站的页面路径。

例如：

```txt
app/
  page.tsx
  dashboard/
    page.tsx
  import/
    page.tsx
  scenarios/
    page.tsx
```

对应的浏览器路径是：


| 文件                       | 浏览器路径        |
| ------------------------ | ------------ |
| `app/page.tsx`           | `/`          |
| `app/dashboard/page.tsx` | `/dashboard` |
| `app/import/page.tsx`    | `/import`    |
| `app/scenarios/page.tsx` | `/scenarios` |


这就是 App Router 最重要的规则：

> 文件夹表示路径，`page.tsx` 表示这个路径下的页面。

## 二、app 目录是什么

在 Next.js 项目里，`app/` 是页面和路由的主要目录。

你可以先把它理解成：

> 网站页面地图。

例如我们的项目可以逐步变成：

```txt
app/
  layout.tsx
  page.tsx
  dashboard/
    page.tsx
  chat/
    page.tsx
  import/
    page.tsx
  scenarios/
    page.tsx
```

它表示网站有这些页面：

```txt
/             首页
/dashboard    财务面板
/chat         AI 对话
/import       CSV 导入
/scenarios    场景模拟
```

本课先创建四个页面：

- `/`
- `/dashboard`
- `/import`
- `/scenarios`

AI 对话页会在后续课程中再展开。

## 三、page.tsx 是什么

`page.tsx` 是一个特殊文件名。

在 App Router 中：

> 只有包含 `page.tsx` 的目录，才会变成一个可以访问的页面。

例如：

```txt
app/dashboard/page.tsx
```

表示：

```txt
/dashboard
```

页面文件通常默认导出一个 React 组件：

```tsx
export default function DashboardPage() {
  return (
    <main>
      <h1>财务面板</h1>
    </main>
  );
}
```

函数名不一定必须叫 `DashboardPage`，但建议起一个有意义的名字。

例如：

- `HomePage`
- `DashboardPage`
- `ImportPage`
- `ScenariosPage`

这样阅读代码时更清楚。

## 四、创建首页

`app/page.tsx` 目前还是账户管理页，不是首页。

不要把这段账户管理代码丢掉，而是把它迁移到 `app/dashboard/page.tsx`，继续承接账户管理功能。

操作顺序：

1. 创建 `app/dashboard/` 文件夹。
2. 把当前 `app/page.tsx` 内容复制到 `app/dashboard/page.tsx`。
3. 再把 `app/page.tsx` 改成下面的首页入口。

调整后：


| 文件                       | 作用                    |
| ------------------------ | --------------------- |
| `app/page.tsx`           | 首页，负责导航到各功能页          |
| `app/dashboard/page.tsx` | 财务面板页，先承接第 9 课的账户管理功能 |


首页路径是：

```txt
/
```

对应文件是：

```txt
app/page.tsx
```

可以先把首页改成项目入口。

```tsx
import Link from "next/link";

const links = [
  {
    href: "/dashboard",
    title: "财务面板",
    description: "查看账户、流水、负债和月度摘要。"
  },
  {
    href: "/import",
    title: "CSV 导入",
    description: "后续用于导入银行、支付宝或微信账单。"
  },
  {
    href: "/scenarios",
    title: "场景模拟",
    description: "模拟收入、支出、储蓄目标变化带来的影响。"
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">AI 个人财务 CFO</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            本地优先的个人财务助手
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            从账户、流水和场景模拟开始，逐步构建可追溯的财务决策工具。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300"
            >
              <h2 className="font-semibold text-gray-900">{link.title}</h2>
              <p className="mt-2 text-sm text-gray-500">{link.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
```

这里的：

```tsx
links.map((link) => (...))
```

和第 7 课的账户列表是同一种模式：

```txt
数组.map((单个元素) => 返回一段 JSX)
```

区别只是数组从 `accounts` 变成了 `links`，单个元素从 `account` 变成了 `link`。

这里引入了：

```tsx
import Link from "next/link";
```

`Link` 是 Next.js 提供的页面跳转组件。

不要优先使用普通的：

```html
<a href="/dashboard">财务面板</a>
```

在 Next.js 应用内跳转时，更推荐：

```tsx
<Link href="/dashboard">财务面板</Link>
```

## 五、Link 导航是什么

`Link` 用来在 Next.js 页面之间跳转。

基础写法：

```tsx
import Link from "next/link";

export default function HomePage() {
  return <Link href="/dashboard">进入财务面板</Link>;
}
```

它最终会渲染成可以点击的链接。

使用 `Link` 的好处是：

- 页面跳转更适合 Next.js 应用。
- 用户体验更顺滑。
- Next.js 可以提前处理一些页面资源。
- 不需要整页刷新。

简单理解：

> 站内页面跳转，用 `Link`；跳到外部网站，才用普通 `<a>`。

例如：

```tsx
<Link href="/dashboard">财务面板</Link>
```

适合站内跳转。

```tsx
<a href="https://nextjs.org" target="_blank">
  Next.js 官网
</a>
```

适合外部链接。

## 六、创建财务面板页

创建文件：

```txt
app/dashboard/page.tsx
```

这一步先不要重新写一个全新的财务面板。

因为第 9 课已经做出了账户管理页，所以第 10 课可以先把它迁移过来：

```txt
把原来的 app/page.tsx 内容
  ↓
复制到 app/dashboard/page.tsx
```

复制后建议做一个小调整：

```tsx
export default function DashboardPage() {
  ...
}
```

原来函数名可能是：

```tsx
export default function Home() {
  ...
}
```

函数名不是路由必须要求的，但改成 `DashboardPage` 更容易看懂：

```txt
app/dashboard/page.tsx
  ↓
DashboardPage
```

注意：

- 第 9 课账户管理页用了 `useState`、`onChange`、`onSubmit`。
- 所以迁移到 `app/dashboard/page.tsx` 后，文件顶部仍然要保留 `"use client"`。
- `Account` 类型、`initialAccounts`、`AccountCard`、`AccountList`、`handleSubmit` 都先保留。

当前阶段重点是学习页面路由。

所以 `/dashboard` 先承接“账户管理”功能即可，后面再逐步扩展成真正的财务面板。

## 七、创建 CSV 导入页

创建文件：

```txt
app/import/page.tsx
```

写入：

```tsx
import Link from "next/link";

export default function ImportPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          返回首页
        </Link>

        <header className="mt-6 mb-8">
          <p className="text-sm font-medium text-gray-500">Import</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">CSV 导入</h1>
          <p className="mt-2 text-sm text-gray-600">
            后续这里会用于导入银行、支付宝或微信账单。
          </p>
        </header>

        <section className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">导入功能占位</h2>
          <p className="mt-2 text-sm text-gray-500">
            当前课程只搭建页面路径，CSV 解析会在后续课程实现。
          </p>
        </section>
      </div>
    </main>
  );
}
```

这个页面先做占位。

真实项目开发中，经常会先搭页面骨架，再逐步填充功能。

## 八、创建场景模拟页

创建文件：

```txt
app/scenarios/page.tsx
```

写入：

```tsx
import Link from "next/link";

export default function ScenariosPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          返回首页
        </Link>

        <header className="mt-6 mb-8">
          <p className="text-sm font-medium text-gray-500">Scenarios</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">场景模拟</h1>
          <p className="mt-2 text-sm text-gray-600">
            模拟收入、支出、储蓄目标变化对未来财务状态的影响。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">买车计划</h2>
            <p className="mt-2 text-sm text-gray-500">
              模拟一次性大额支出对现金流的影响。
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">提前还贷</h2>
            <p className="mt-2 text-sm text-gray-500">
              对比不同还款策略下的利息和现金压力。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
```

场景模拟是后面项目的重要能力。

这一课先让它有一个页面入口。

## 九、目录结构检查

完成后，你的 `app/` 目录应该类似：

```txt
app/
  layout.tsx
  page.tsx
  dashboard/
    page.tsx
  import/
    page.tsx
  scenarios/
    page.tsx
```

如果你还没有某些文件夹，就手动创建。

注意：

- 文件夹名会影响 URL。
- `page.tsx` 文件名不能随便改。
- `dashboard/page.tsx` 对应 `/dashboard`。
- `import/page.tsx` 对应 `/import`。
- `scenarios/page.tsx` 对应 `/scenarios`。

## 十、layout.tsx 是什么

`layout.tsx` 也是 App Router 的特殊文件。

它表示一组页面共享的外壳。

例如：

- HTML 结构。
- 全局样式。
- 顶部导航。
- 页面共同布局。
- 字体设置。

项目创建后，通常已经有：

```txt
app/layout.tsx
```

它可能长这样：

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Finance CFO",
  description: "Local-first personal finance assistant"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

这里最重要的是：

```tsx
{children}
```

它表示当前页面内容会被放到这里。

例如访问 `/dashboard` 时：

```txt
RootLayout
  └── DashboardPage
```

访问 `/import` 时：

```txt
RootLayout
  └── ImportPage
```

所以可以把 `layout.tsx` 理解成：

> 所有页面共同套用的外层结构。

## 十一、给 layout 添加公共导航

如果每个页面都单独写返回首页链接，会有重复。

更好的方式是把导航放进 `layout.tsx`。

可以把 `app/layout.tsx` 改成：

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Finance CFO",
  description: "Local-first personal finance assistant"
};

const navItems = [
  { href: "/", label: "首页" },
  { href: "/dashboard", label: "财务面板" },
  { href: "/import", label: "CSV 导入" },
  { href: "/scenarios", label: "场景模拟" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
```

这样每个页面都会自动拥有同一组导航。

这里的：

```tsx
{ href: "/", label: "首页" }
```

就是回到首页的导航入口。

页面文件里就不必再单独重复写：

```tsx
<Link href="/">返回首页</Link>
```

本课你可以二选一：

- 简单做法：每个页面写“返回首页”。
- 更推荐做法：在 `layout.tsx` 中写公共导航。

如果你刚开始不熟悉 `layout.tsx`，可以先用简单做法。

等理解后再抽到布局里。

## 十二、服务端组件和客户端组件

Next.js App Router 中，组件默认是服务端组件。

也就是说，如果你写：

```tsx
export default function DashboardPage() {
  return <h1>财务面板</h1>;
}
```

它默认是服务端组件。

服务端组件适合：

- 展示静态内容。
- 读取服务端数据。
- 组合页面结构。
- 不需要浏览器交互的页面。

如果组件需要使用浏览器交互，就要写：

```tsx
"use client";
```

客户端组件适合：

- 使用 `useState`。
- 使用 `useEffect`。
- 处理点击事件。
- 处理输入框变化。
- 使用浏览器 API。

简单判断规则：


| 场景               | 是否需要 `"use client"` |
| ---------------- | ------------------- |
| 只展示标题和文字         | 不需要                 |
| 使用 `Link` 跳转     | 不需要                 |
| 使用 `.map()` 渲染列表 | 不需要                 |
| 使用 `useState`    | 需要                  |
| 使用 `onClick`     | 需要                  |
| 使用输入框 `onChange` | 需要                  |
| 使用表单提交交互         | 需要                  |


上一课的账户表单用了 `useState` 和 `onChange`，所以需要 `"use client"`。

本课新建的占位页面大多只是展示内容，所以不需要。

## 十三、为什么先搭页面骨架

真实项目开发时，不建议一开始就直接写复杂业务。

更稳妥的顺序是：

```txt
先搭页面路径
  ↓
再放页面占位内容
  ↓
再抽公共导航和布局
  ↓
再接入真实数据
  ↓
最后完善交互细节
```

这样做的好处是：

- 先确认产品结构是否合理。
- 方便看到整个项目长什么样。
- 后续功能可以逐页填充。
- 不会把所有代码堆在首页。

本课创建的页面虽然内容简单，但很重要。

它意味着项目开始从一个练习页面，变成一个真正的多页面应用。

## 十四、运行和检查

启动开发服务器：

```bash
npm run dev
```

浏览器打开：

```txt
http://localhost:3000
```

然后依次检查：

```txt
http://localhost:3000/
http://localhost:3000/dashboard
http://localhost:3000/import
http://localhost:3000/scenarios
```

每个路径都应该能打开。

如果出现 404，优先检查：

- 文件夹名字是否正确。
- 文件是否叫 `page.tsx`。
- 文件是否放在 `app/` 目录下。
- 开发服务器是否需要重启。

## 十五、常见错误

### 1. 把文件命名成 dashboard.tsx

错误结构：

```txt
app/
  dashboard.tsx
```

在 App Router 中，这不会自动变成 `/dashboard` 页面。

正确结构：

```txt
app/
  dashboard/
    page.tsx
```

### 2. 忘记默认导出组件

错误写法：

```tsx
function DashboardPage() {
  return <h1>财务面板</h1>;
}
```

正确写法：

```tsx
export default function DashboardPage() {
  return <h1>财务面板</h1>;
}
```

`page.tsx` 需要默认导出页面组件。

### 3. href 写错

错误写法：

```tsx
<Link href="dashboard">财务面板</Link>
```

更推荐：

```tsx
<Link href="/dashboard">财务面板</Link>
```

站内路径一般从 `/` 开始写，更清楚。

### 4. 不该写 use client 的地方都写了

初学时为了省事，可能每个文件都写：

```tsx
"use client";
```

这能跑，但不是好习惯。

如果页面只是展示内容，没有状态和事件，可以不写。

先记住：

> 需要浏览器交互时再写 `"use client"`。

### 5. 公共导航重复写在每个页面里

刚开始可以重复写。

但当多个页面都有同样导航时，应该考虑放到 `layout.tsx`。

这能减少重复代码，也能保证页面风格一致。

## 十六、本课实践任务

请在你的 `ai-finance-cfo` 项目中完成以下任务。

### 任务 1：创建首页入口

修改：

```txt
app/page.tsx
```

让首页展示项目介绍和三个入口：

- 财务面板。
- CSV 导入。
- 场景模拟。

每个入口使用 `Link` 跳转。

### 任务 2：创建财务面板页

创建：

```txt
app/dashboard/page.tsx
```

把第 9 课结束后的账户管理页迁移到这里。

要求：

- 保留 `"use client"`。
- 保留账户列表状态和新增账户表单。
- 可以把默认导出的函数名从 `Home` 改成 `DashboardPage`。
- 先让 `/dashboard` 能打开原来的账户管理功能。

### 任务 3：创建 CSV 导入页

创建：

```txt
app/import/page.tsx
```

页面内容包括：

- 页面标题。
- 简短说明。
- 一个导入功能占位区域。

### 任务 4：创建场景模拟页

创建：

```txt
app/scenarios/page.tsx
```

页面内容包括：

- 页面标题。
- 简短说明。
- 两个场景占位卡片。

### 任务 5：添加导航

选择一种方式完成导航：

- 在每个页面添加“返回首页”链接。
- 或在 `app/layout.tsx` 中添加公共导航。

推荐尝试第二种。

### 任务 6：检查路径

运行项目后，确认下面路径都能访问：

```txt
/
/dashboard
/import
/scenarios
```

## 十七、验收标准

完成本课后，请检查：

- `app/page.tsx` 可以作为首页打开。
- `/dashboard` 可以打开从第 9 课迁移过来的账户管理页。
- `/import` 可以打开 CSV 导入页。
- `/scenarios` 可以打开场景模拟页。
- 首页可以点击进入其他页面。
- 其他页面可以返回首页，或通过公共导航切换。
- 能说出 `page.tsx` 的作用。
- 能说出 `layout.tsx` 的作用。
- 能初步判断什么时候需要 `"use client"`。

## 十八、检查清单

完成本课后，你应该能回答：

- `app/` 目录是做什么的？
- 为什么 `app/dashboard/page.tsx` 对应 `/dashboard`？
- `page.tsx` 为什么是特殊文件？
- `Link` 和普通 `<a>` 有什么区别？
- `layout.tsx` 中的 `children` 是什么？
- 哪些内容适合放到 `layout.tsx`？
- 服务端组件默认能不能使用 `useState`？
- 什么情况下需要写 `"use client"`？
- 为什么项目要先搭页面骨架？

## 十九、本课小结

这一课我们把项目从单页面练习，推进成了多页面应用。

你需要记住三句话：

1. App Router 用 `app/` 目录结构表示页面路径。
2. `page.tsx` 表示一个具体页面，`layout.tsx` 表示共享外壳。
3. 页面跳转优先使用 Next.js 的 `Link` 组件。

本课最重要的实践成果是：

> 创建首页、财务面板页、CSV 导入页和场景模拟页，并让它们可以互相导航。

这一步完成后，项目结构会更接近最终产品。

下一课会继续搭建项目页面骨架。我们会进一步整理顶部导航、页面容器、假数据展示和核心页面占位，让项目从“能跳转”变成“结构更完整”。
