# 第 13 课：HTTP 与 API 入门

## 本课目标

项目现在已经有了多个页面：

```txt
/
/chat
/dashboard
/scenarios
/import
```

页面里展示的数据仍然来自前端假数据。

接下来要让前端逐步从 API 读取数据。

API 可以先返回假数据，等数据库接入后，再把假数据替换成数据库查询结果。

这一课要解决的问题是：

> 前端页面如何向后端要数据，Next.js 项目里又该把 API 写在哪里。

你会学到：

- 前端和后端如何通信。
- HTTP 请求是什么。
- GET 和 POST 有什么区别。
- JSON 是什么。
- Next.js Route Handler 怎么写。
- API 成功响应和错误响应应该长什么样。
- 如何编写 `/api/health` 和 `/api/accounts`。

学完本课后，你应该能够：

- 在 `app/api/` 下创建 Route Handler。
- 访问 `/api/health` 并看到 JSON。
- 访问 `/api/accounts` 并看到假账户数据。
- 用浏览器控制台的 `fetch` 请求 API。
- 解释 GET 和 POST 的区别。
- 解释为什么 API 要返回统一格式。

## 一、前端和后端如何通信

浏览器里看到的页面属于前端。

保存数据、读取数据库、调用 AI、做权限检查这些工作更适合放在后端。

前端和后端之间通常通过 HTTP 通信。

可以把它理解成：

```txt
前端页面
  ↓ 发请求
API
  ↓ 处理请求
返回 JSON
  ↓
前端页面更新界面
```

在这个项目里，后续账户列表的数据流会变成：

```txt
用户打开仪表盘
  ↓
前端请求 GET /api/accounts
  ↓
API 返回账户 JSON
  ↓
前端把 JSON 渲染成账户列表
```

现在先不接数据库。

本课先让 API 返回假数据。

这样做的好处是：

- 先学会 API 文件怎么写。
- 先学会前端如何请求 API。
- 不被数据库、校验、错误处理一次性淹没。
- 后面接 SQLite 时，只需要替换 API 内部的数据来源。

## 二、HTTP 请求是什么

HTTP 是浏览器和服务器之间常用的通信规则。

你在浏览器里访问：

```txt
http://localhost:3000/dashboard
```

浏览器会向本地开发服务器发出一个请求。

服务器返回 HTML、CSS、JavaScript 等内容，浏览器再把页面显示出来。

访问 API 也是一样：

```txt
http://localhost:3000/api/health
```

只不过 API 通常不返回页面，而是返回 JSON 数据。

一次 HTTP 通信可以简单拆成：

```txt
请求地址
请求方法
请求头
请求体
响应状态码
响应内容
```

初学阶段先重点理解三个部分：

| 名称 | 例子 | 作用 |
| --- | --- | --- |
| 请求地址 | `/api/accounts` | 告诉服务器要访问哪个资源 |
| 请求方法 | `GET`、`POST` | 告诉服务器要做什么动作 |
| 响应内容 | JSON | 服务器返回给前端的数据 |

## 三、GET 和 POST 的区别

常见 HTTP 方法有很多，当前先掌握 `GET` 和 `POST`。

| 方法 | 用途 | 例子 |
| --- | --- | --- |
| `GET` | 获取数据 | 获取账户列表 |
| `POST` | 新增数据或提交数据 | 新增账户 |

在本项目里可以这样理解：

```txt
GET /api/accounts
```

意思是：

> 请把账户列表给我。

```txt
POST /api/accounts
```

意思是：

> 我要提交一个新账户，请保存它。

本课先写 `GET`。

新增账户需要表单提交、请求体解析、Zod 校验、数据库写入，后面会连起来做。

现在先把读取数据的链路跑通。

## 四、JSON 是什么

JSON 是前后端传数据时常用的文本格式。

它长得很像 JavaScript 对象：

```json
{
  "id": "account_001",
  "name": "工资卡",
  "type": "bank",
  "balance": 20000
}
```

注意 JSON 和 JavaScript 对象不完全一样。

JSON 里：

- key 必须用双引号。
- 字符串必须用双引号。
- 不能写函数。
- 不能写注释。

API 返回多个账户时，可以写成数组：

```json
[
  {
    "id": "account_001",
    "name": "工资卡",
    "type": "bank",
    "balance": 20000
  },
  {
    "id": "account_002",
    "name": "现金",
    "type": "cash",
    "balance": 1000
  }
]
```

但真实项目里，不建议直接把数组作为最外层返回。

更推荐用统一响应格式。

## 五、推荐的 API 响应格式

为了让前端更容易判断请求是否成功，可以约定成功响应长这样：

```json
{
  "ok": true,
  "data": {
    "accounts": []
  }
}
```

错误响应长这样：

```json
{
  "ok": false,
  "error": {
    "code": "ACCOUNTS_LOAD_FAILED",
    "message": "账户数据读取失败"
  }
}
```

这样前端收到响应后，可以先判断：

```ts
if (result.ok) {
  // 使用 result.data
} else {
  // 展示 result.error.message
}
```

统一格式的好处是：

- 前端不用猜数据在哪里。
- 错误信息有固定位置。
- 后续接入 Zod、数据库、AI 时更容易排查问题。
- 不同 API 看起来更一致。

本项目后续可以统一使用下面两种结构。

成功：

```ts
type ApiSuccess<T> = {
  ok: true;
  data: T;
};
```

失败：

```ts
type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};
```

当前课程里先不急着抽公共类型。

先在 API 返回值里直接写出这个结构。

## 六、Next.js Route Handler 放在哪里

Next.js App Router 里，API 使用 Route Handler。

Route Handler 文件必须叫：

```txt
route.ts
```

它放在 `app/` 目录下，通过目录结构决定访问路径。

例如：

```txt
app/api/health/route.ts
```

对应访问地址：

```txt
/api/health
```

再比如：

```txt
app/api/accounts/route.ts
```

对应访问地址：

```txt
/api/accounts
```

Route Handler 和页面文件不一样：

| 文件 | 作用 |
| --- | --- |
| `page.tsx` | 返回页面 UI |
| `layout.tsx` | 返回公共布局 |
| `route.ts` | 返回 API 响应 |

不要写成：

```txt
app/api/health/page.tsx
```

这会变成页面，不是 API。

也不要在同一个目录同时放：

```txt
page.tsx
route.ts
```

同一路径不能既是页面又是 API。

## 七、编写健康检查 API

健康检查 API 的作用是确认后端是否能正常响应。

创建文件：

```txt
ai-finance-cfo/app/api/health/route.ts
```

写入：

```ts
export async function GET() {
  return Response.json({
    ok: true,
    data: {
      service: "ai-finance-cfo",
      status: "healthy",
      timestamp: new Date().toISOString()
    }
  });
}
```

这里有几个重点：

```ts
export async function GET()
```

表示这个函数处理 `GET` 请求。

```ts
Response.json(...)
```

表示返回 JSON 响应。

```ts
new Date().toISOString()
```

表示返回当前时间，方便确认接口不是旧结果。

启动项目：

```bash
npm run dev
```

在浏览器打开：

```txt
http://localhost:3000/api/health
```

应该能看到类似内容：

```json
{
  "ok": true,
  "data": {
    "service": "ai-finance-cfo",
    "status": "healthy",
    "timestamp": "2026-06-13T08:00:00.000Z"
  }
}
```

时间不需要和示例一样。

只要 `ok` 是 `true`，`status` 是 `healthy`，说明 API 已经跑通。

## 八、准备账户假数据

账户 API 需要返回账户列表。

项目里已经有：

```txt
ai-finance-cfo/lib/mock-data.ts
```

这个文件目前用来集中存放前端假数据。

第 12 课已经把账户假数据整理成：

```txt
initialAccounts
```

本课直接复用它。

如果你的 `lib/mock-data.ts` 里还没有 `initialAccounts`，先按第 12 课的整理方式补上。

文件顶部加入：

```ts
import type { Account } from "@/types/finance";
```

文件中导出账户假数据：

```ts
export const initialAccounts: Account[] = [
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

不要再单独新增另一份账户数组。

否则页面用一份账户假数据，API 又用另一份账户假数据，后面会难维护。

现在的重点是理解：

```txt
假数据
  ↓
API
  ↓
前端 fetch
```

## 九、编写账户列表 API

创建文件：

```txt
ai-finance-cfo/app/api/accounts/route.ts
```

写入：

```ts
import { initialAccounts } from "@/lib/mock-data";

export async function GET() {
  return Response.json({
    ok: true,
    data: {
      accounts: initialAccounts
    }
  });
}
```

在浏览器打开：

```txt
http://localhost:3000/api/accounts
```

应该能看到类似内容：

```json
{
  "ok": true,
  "data": {
    "accounts": [
      {
        "id": "account_001",
        "name": "工资卡",
        "type": "bank",
        "balance": 20000
      },
      {
        "id": "account_002",
        "name": "现金",
        "type": "cash",
        "balance": 1000
      },
      {
        "id": "account_003",
        "name": "信用卡",
        "type": "credit",
        "balance": -3500
      }
    ]
  }
}
```

这说明：

```txt
浏览器
  ↓
GET /api/accounts
  ↓
app/api/accounts/route.ts
  ↓
读取 initialAccounts
  ↓
返回 JSON
```

这条链路已经跑通。

## 十、增加一个错误响应示例

真实项目里，API 不可能永远成功。

可能失败的原因包括：

- 数据库读取失败。
- 请求参数不合法。
- 用户没有权限。
- AI 服务调用失败。
- CSV 文件格式错误。

所以 API 需要有统一错误格式。

为了练习错误响应，可以临时让 `/api/accounts` 支持一个测试参数。

把 `app/api/accounts/route.ts` 改成：

```ts
import { initialAccounts } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shouldFail = url.searchParams.get("fail") === "1";

  if (shouldFail) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "ACCOUNTS_LOAD_FAILED",
          message: "账户数据读取失败"
        }
      },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    data: {
      accounts: initialAccounts
    }
  });
}
```

这里新增了一个参数：

```ts
request: Request
```

它代表浏览器发来的请求。

这一行：

```ts
const url = new URL(request.url);
```

把请求地址转换成可以读取参数的对象。

这一行：

```ts
url.searchParams.get("fail") === "1"
```

表示读取地址里的 `fail` 参数。

打开：

```txt
http://localhost:3000/api/accounts?fail=1
```

应该看到：

```json
{
  "ok": false,
  "error": {
    "code": "ACCOUNTS_LOAD_FAILED",
    "message": "账户数据读取失败"
  }
}
```

同时浏览器开发者工具的 Network 面板里，状态码会是：

```txt
500
```

状态码的含义是：

| 状态码 | 含义 |
| --- | --- |
| `200` | 请求成功 |
| `400` | 请求内容有问题 |
| `401` | 未登录或身份无效 |
| `403` | 没有权限 |
| `404` | 地址不存在 |
| `500` | 服务器内部错误 |

当前只是练习错误响应。

真正接数据库后，错误会来自数据库读写、校验失败或业务规则失败。

## 十一、用 fetch 请求 API

在浏览器里直接打开 API 地址，可以看到 JSON。

前端代码里通常用 `fetch` 请求 API。

打开浏览器开发者工具，进入 Console，输入：

```js
fetch("/api/health")
  .then((response) => response.json())
  .then((result) => console.log(result));
```

应该能看到：

```js
{
  ok: true,
  data: {
    service: "ai-finance-cfo",
    status: "healthy",
    timestamp: "..."
  }
}
```

再请求账户接口：

```js
fetch("/api/accounts")
  .then((response) => response.json())
  .then((result) => console.log(result));
```

应该能看到账户列表。

也可以测试错误：

```js
fetch("/api/accounts?fail=1")
  .then((response) => response.json())
  .then((result) => console.log(result));
```

这里要注意：

```js
fetch("/api/accounts")
```

使用的是相对路径。

当前页面在 `localhost:3000`，所以浏览器会自动请求：

```txt
http://localhost:3000/api/accounts
```

## 十二、fetch 的结果不是直接数据

很多初学者会写出这样的代码：

```js
const result = fetch("/api/accounts");
console.log(result);
```

然后发现打印出来的不是账户数组。

原因是 `fetch` 返回的是 Promise。

Promise 表示：

> 这个请求还在进行中，未来才会有结果。

所以需要：

```js
fetch("/api/accounts")
  .then((response) => response.json())
  .then((result) => {
    console.log(result.data.accounts);
  });
```

后续在 React 组件里请求 API 时，会更常见地写成：

```ts
const response = await fetch("/api/accounts");
const result = await response.json();
```

当前先在浏览器控制台练习，理解请求和响应即可。

## 十三、Route Handler 不是 React 组件

`route.ts` 文件里不要写 JSX。

不要这样写：

```tsx
export default function Page() {
  return <div>hello</div>;
}
```

Route Handler 应该返回响应：

```ts
export async function GET() {
  return Response.json({
    ok: true
  });
}
```

页面文件负责 UI。

API 文件负责数据。

可以这样分工：

```txt
app/dashboard/page.tsx
  展示仪表盘页面

app/api/accounts/route.ts
  返回账户数据

lib/mock-data.ts
  临时保存假数据
```

后续接数据库后，分工会变成：

```txt
app/dashboard/page.tsx
  请求 API 并展示页面

app/api/accounts/route.ts
  接收请求并调用服务层

lib/services/accounts.ts
  处理账户业务逻辑

lib/db/
  读取和写入 SQLite
```

## 十四、为什么本课不直接连接页面

现在可以在浏览器里访问 `/api/accounts`，但仪表盘页面仍然使用 `lib/mock-data.ts` 里的假数据。

这是刻意分开的。

学习顺序应该是：

```txt
先让 API 单独跑通
  ↓
再让页面 fetch API
  ↓
再让 API 读取数据库
  ↓
最后把表单提交也接入 API
```

如果同时做太多事情，出错时很难判断问题在哪里。

例如页面不显示账户，可能是：

- API 没写对。
- fetch 地址错了。
- JSON 格式错了。
- React 状态没更新。
- 组件 props 传错了。
- 数据库没查到数据。

本课只验证 API。

页面接 API 会在后续课程里做。

## 十五、项目里的 API 路径规划

本项目后续会逐步增加这些 API：

| 路径 | 方法 | 作用 |
| --- | --- | --- |
| `/api/health` | `GET` | 检查 API 是否正常 |
| `/api/accounts` | `GET` | 获取账户列表 |
| `/api/accounts` | `POST` | 新增账户 |
| `/api/transactions` | `GET` | 获取流水列表 |
| `/api/transactions` | `POST` | 新增流水 |
| `/api/liabilities` | `GET` | 获取负债列表 |
| `/api/liabilities` | `POST` | 新增负债 |
| `/api/chat` | `POST` | 提交财务问题 |
| `/api/scenarios` | `POST` | 提交场景模拟参数 |

从路径可以看出：

```txt
accounts      账户
transactions  流水
liabilities   负债
chat          AI 对话
scenarios     场景模拟
```

API 路径应该尽量像资源名称。

不要写成：

```txt
/api/getAccountList
/api/addNewAccount
```

更推荐：

```txt
GET /api/accounts
POST /api/accounts
```

同一个路径可以通过不同 HTTP 方法表达不同动作。

## 十六、常见错误

### 1. 文件名写错

错误：

```txt
app/api/health/routes.ts
```

正确：

```txt
app/api/health/route.ts
```

文件名必须是 `route.ts`。

### 2. 目录位置写错

错误：

```txt
api/health/route.ts
```

正确：

```txt
app/api/health/route.ts
```

Route Handler 必须放在 `app/` 目录下面。

### 3. 忘记导出 GET

错误：

```ts
function GET() {
  return Response.json({ ok: true });
}
```

正确：

```ts
export async function GET() {
  return Response.json({ ok: true });
}
```

Next.js 需要通过导出的 `GET` 函数找到处理逻辑。

### 4. 把 JSON 写成字符串

不推荐：

```ts
export async function GET() {
  return new Response("{ ok: true }");
}
```

推荐：

```ts
export async function GET() {
  return Response.json({ ok: true });
}
```

`Response.json` 会帮你设置合适的 JSON 响应。

### 5. 访问路径多写了 app

错误访问：

```txt
http://localhost:3000/app/api/health
```

正确访问：

```txt
http://localhost:3000/api/health
```

`app/` 是项目里的目录名，不是浏览器地址的一部分。

## 十七、实践任务

完成下面任务：

1. 创建 `app/api/health/route.ts`。
2. 让 `GET /api/health` 返回健康检查 JSON。
3. 在 `lib/mock-data.ts` 中准备账户假数据。
4. 创建 `app/api/accounts/route.ts`。
5. 让 `GET /api/accounts` 返回账户 JSON。
6. 给 `/api/accounts?fail=1` 加一个错误响应示例。
7. 在浏览器中分别访问 `/api/health` 和 `/api/accounts`。
8. 在浏览器 Console 中用 `fetch` 请求这两个 API。

## 十八、验收标准

完成后检查：

- `http://localhost:3000/api/health` 能返回 JSON。
- `http://localhost:3000/api/accounts` 能返回账户列表。
- `http://localhost:3000/api/accounts?fail=1` 能返回错误 JSON。
- 成功响应包含 `ok: true`。
- 错误响应包含 `ok: false`、`error.code`、`error.message`。
- 能说出 `GET /api/accounts` 是获取账户列表。
- 能说出 `POST /api/accounts` 未来会用于新增账户。
- 能说出 `page.tsx` 和 `route.ts` 的区别。

## 十九、复习问题

1. API 和页面有什么区别？
2. `GET` 和 `POST` 分别适合做什么？
3. JSON 和普通 JavaScript 对象有什么相似点和区别？
4. 为什么推荐 API 返回统一格式？
5. `app/api/accounts/route.ts` 对应的访问路径是什么？
6. `Response.json` 的作用是什么？
7. 为什么本课先让 API 返回假数据，而不是直接连数据库？
8. `fetch("/api/accounts")` 为什么不能直接得到账户数组？

## 二十、本课小结

这一课把项目从纯前端页面推进到了 API 层。

现在项目已经可以提供两个后端入口：

```txt
GET /api/health
GET /api/accounts
```

`/api/health` 用来确认 API 能正常响应。

`/api/accounts` 用来返回账户列表。

虽然账户数据仍然是假数据，但数据已经开始通过 API 暴露出来。

这一步很重要，因为后续数据库接入后，页面不需要关心数据到底来自假数据还是 SQLite。

页面只需要请求：

```txt
GET /api/accounts
```

API 内部再决定数据从哪里来。

下一步会学习 SQLite。账户、流水、负债这些数据会从临时假数据，逐步变成可以保存到本地文件里的真实数据。
