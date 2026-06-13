# CFO 项目结构与运行关系

## 一、这个项目是什么

`ai-finance-cfo/` 是一个 Next.js + TypeScript 项目。

它不是普通空文件夹，而是一个已经可以运行的前端应用。

启动方式：

```bash
cd ai-finance-cfo
npm run dev
```

浏览器访问：

```txt
http://localhost:3000
```

## 二、几个工具分别负责什么

| 名称 | 作用 |
| --- | --- |
| Node.js | 让 JavaScript 工具能在电脑终端里运行 |
| npm | 安装依赖、执行项目命令 |
| npx | 临时运行 npm 包里的工具，例如创建项目 |
| Next.js | Web 项目框架，负责页面、路由、开发服务器和构建 |
| React | 界面库，用组件描述页面 |
| TypeScript | 类型系统，写代码时帮助减少错误 |

简单理解：

```txt
Node.js 是运行环境
npm 是命令入口
Next.js 是项目框架
React 是写界面的方式
TypeScript 是写代码时的类型检查
```

## 三、npm run dev 做了什么

当你运行：

```bash
npm run dev
```

实际流程是：

```txt
Node.js 启动 npm
  ↓
npm 读取 package.json
  ↓
npm 找到 scripts.dev
  ↓
执行 next dev
  ↓
Next.js 启动开发服务器
  ↓
编译 .ts / .tsx 文件
  ↓
浏览器访问 localhost:3000
```

所以不是 npm 自己在运行网页。

npm 只是帮你执行 `next dev`。

## 四、TypeScript 是怎么运行的

项目里可以直接写：

```txt
.ts
.tsx
```

其中：

- `.ts`：普通 TypeScript 文件。
- `.tsx`：可以写 JSX 的 TypeScript 文件，常用于 React 页面和组件。

浏览器不能直接运行 TypeScript 类型语法。

Next.js 会在开发服务器里自动处理：

```txt
你写 .ts / .tsx
  ↓
Next.js 编译
  ↓
去掉 TypeScript 类型
  ↓
转换成浏览器能运行的 JavaScript
  ↓
页面显示出来
```

所以日常开发不用手动执行：

```bash
tsc
node dist/index.js
```

Next.js 已经把这些步骤包起来了。

## 五、最重要的项目目录

当前项目可以先这样看：

```txt
ai-finance-cfo/
  app/                  页面和路由
  lib/                  可复用数据、工具和业务逻辑
  public/               静态资源
  package.json          项目命令和依赖
  tsconfig.json         TypeScript 配置
  next.config.ts        Next.js 配置
  eslint.config.mjs     代码检查配置
  postcss.config.mjs    CSS 工具配置
  node_modules/         本地依赖，不提交
  .next/                运行缓存，不提交
```

初学阶段，最常接触的是：

```txt
app/
lib/
package.json
```

## 六、app 目录

`app/` 是 Next.js App Router 的页面目录。

文件夹会对应浏览器路径：

```txt
app/page.tsx              -> /
app/dashboard/page.tsx    -> /dashboard
app/chat/page.tsx         -> /chat
```

常见文件：

| 文件 | 作用 |
| --- | --- |
| `app/page.tsx` | 首页 |
| `app/layout.tsx` | 所有页面共享的外壳 |
| `app/globals.css` | 全局样式 |
| `app/favicon.ico` | 浏览器标签页图标 |

`layout.tsx` 里的：

```tsx
{children}
```

表示当前页面内容会放到这里。

## 七、lib 目录

`lib/` 用来放页面之外的可复用内容。

例如当前项目里：

```txt
lib/mock-data.ts
```

它用来集中保存前端假数据。

页面中可以这样导入：

```tsx
import { featureCards } from "@/lib/mock-data";
```

这里的 `@/` 指项目根目录 `ai-finance-cfo/`。

所以：

```txt
@/lib/mock-data
```

对应的是：

```txt
ai-finance-cfo/lib/mock-data.ts
```

不是：

```txt
ai-finance-cfo/app/lib/mock-data.ts
```

## 八、package.json

`package.json` 是 npm 项目的核心配置文件。

它主要记录两类东西：

### 1. 项目命令

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

常用命令：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产版本 |
| `npm run lint` | 检查代码问题 |

### 2. 项目依赖

例如：

```json
"dependencies": {
  "next": "...",
  "react": "...",
  "react-dom": "..."
}
```

这些依赖会安装到：

```txt
node_modules/
```

`node_modules/` 不需要提交到 Git，删除后可以通过 `npm install` 重新生成。

## 九、常见配置文件

| 文件 | 作用 |
| --- | --- |
| `tsconfig.json` | TypeScript 配置 |
| `next.config.ts` | Next.js 配置 |
| `eslint.config.mjs` | ESLint 代码检查配置 |
| `postcss.config.mjs` | CSS 工具配置，当前用于 TailwindCSS |
| `next-env.d.ts` | Next.js 自动生成的类型声明，不手动修改 |
| `package-lock.json` | 锁定依赖版本，通常提交到 Git |

初学阶段不用深入修改这些文件。

知道它们负责什么即可。

## 十、本地生成目录

### `node_modules/`

依赖安装目录。

特点：

- 文件很多。
- 不手动修改。
- 不提交到 Git。
- 可以通过 `npm install` 重新生成。

### `.next/`

Next.js 运行或构建生成的目录。

特点：

- 存放编译缓存和运行产物。
- 不手动修改。
- 不提交到 Git。
- 删除后运行项目会重新生成。

## 十一、当前最该关注什么

现在学习时，建议按这个顺序看：

1. `package.json`：理解 `npm run dev` 为什么能启动项目。
2. `app/page.tsx`：理解首页从哪里来。
3. `app/layout.tsx`：理解公共导航和 `{children}`。
4. `app/xxx/page.tsx`：理解路径和页面文件的关系。
5. `lib/mock-data.ts`：理解假数据如何被页面导入。
6. `app/globals.css`：理解全局样式从哪里来。

## 十二、一句话总结

当前项目可以这样理解：

> Node.js 让工具能跑，npm 负责执行命令，Next.js 负责开发服务器和路由，React 负责页面组件，TypeScript 负责类型检查；我们主要在 `app/` 写页面，在 `lib/` 放可复用数据和逻辑。
