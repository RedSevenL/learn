# 第 29 课：接入 DeepSeek API

## 本课目标

第 28 课已经完成了 AI 层最重要的设计：

```txt
用户自然语言
  ↓
受限的 FinanceIntent
  ↓
Zod 校验
  ↓
白名单路由
```

我们还使用固定假数据模拟了四类意图：

```txt
savings_goal
debt_payoff
cashflow_forecast
what_if
```

假模型的作用是先冻结契约：

```txt
意图名称
字段含义
金额格式
期限边界
错误处理
```

这一课开始替换：

```txt
mockIntentCall(...)
```

把它变成真正的：

```txt
DeepSeek API
```

但本课仍然不会实现完整的：

```txt
POST /api/chat
```

也不会读取数据库或调用财务计算器。

本课只完成一条最小且安全的真实链路：

```txt
服务端脚本
  ↓
读取环境变量
  ↓
fetch 调用 DeepSeek
  ↓
检查 HTTP 响应
  ↓
检查模型响应结构
  ↓
取得 JSON 字符串
  ↓
使用第 28 课的 Zod schema 校验
  ↓
得到 FinanceIntent
```

学完后，你应该能够：

- 说明 API、API Key、请求和响应分别是什么。
- 创建并安全保存 DeepSeek API Key。
- 区分服务端环境变量和浏览器公开环境变量。
- 使用 `.env.local` 保存本地密钥。
- 验证 `.env.local` 不会进入 Git。
- 使用原生 `fetch` 调用 DeepSeek Chat Completions API。
- 理解 `Authorization: Bearer ...`。
- 使用 `response_format: { type: "json_object" }` 请求 JSON。
- 显式关闭不需要的思考模式。
- 对外部 API 响应继续使用 Zod 校验。
- 处理缺少密钥、网络失败、超时和非 2xx 状态。
- 处理空内容、截断内容和非法意图。
- 区分 HTTP 成功、JSON 成功和业务成功。
- 避免在日志、页面、Git 或错误响应中泄露密钥。
- 只向意图解析模型发送最小必要信息。
- 使用服务端演示脚本验证一次真实意图解析。
- 为第 30 课的 Chat API 准备可复用 DeepSeek 客户端。

## 一、开始前先完成第 28 课

本课默认你已经完成：

```txt
课程内容/第28课-LLM在项目中的正确位置.md
```

并已经理解或练习过：

```txt
schemas/ai-intent.ts
lib/ai/parse-finance-intent.ts
lib/ai/prompts/finance-intent.ts
tests/ai/finance-intent.test.ts
tests/ai/parse-finance-intent.test.ts
```

如果这些文件还没有真正写入项目，也可以先按第 28 课完成最小版本。

本课不会重新设计另一套意图字段。

第 28 课确定的契约继续保持：

```ts
type FinanceIntent =
  | {
      type: "savings_goal";
      targetAmount: string;
      deadlineMonths: number;
    }
  | {
      type: "debt_payoff";
      strategy: "snowball" | "avalanche" | "compare";
      extraPayment: string;
    }
  | {
      type: "cashflow_forecast";
      months: number;
    }
  | {
      type: "what_if";
      monthlyIncomeChange: string;
      monthlyExpenseChange: string;
      horizonMonths: number;
    };
```

开始前运行：

```bash
cd ai-finance-cfo
npm run test:run
npm run lint
```

先确认已有代码仍处于可工作的基线。

## 二、本课的边界

本课会完成：

```txt
一句用户问题
  ↓
真实 DeepSeek API
  ↓
合法 FinanceIntent
```

本课不会完成：

- 聊天页面表单。
- `POST /api/chat`。
- 从 SQLite 读取账户和流水。
- 把意图转换为完整计算输入。
- 调用 `calculateSavingsGoal`。
- 保存 `calculation_history`。
- 第二次 LLM 调用组织最终回复。
- 多轮对话。
- 流式输出。
- Tool Calls。

这些内容如果提前混在 `deepseek.ts` 中，下一课会很难区分：

```txt
模型调用失败
API route 失败
数据库失败
计算失败
页面失败
```

本课坚持只打通一个小闭环。

## 三、课程使用的官方 API 状态

本课编写时间：

```txt
2026-07-28
```

DeepSeek 官方当前提供：

```txt
deepseek-v4-flash
deepseek-v4-pro
```

官方文档说明，旧模型名：

```txt
deepseek-chat
deepseek-reasoner
```

计划在：

```txt
2026-07-24 15:59 UTC
```

后停止使用。

因此本课不再把 `deepseek-chat` 当作默认示例。

本课选择：

```txt
deepseek-v4-flash
```

用于意图解析。

原因是意图分类和参数抽取属于相对简单、短输出任务，不需要默认使用更重的模型。

但模型名称属于会变化的外部配置，所以不要写死在多个业务文件中。

推荐放入：

```txt
DEEPSEEK_MODEL
```

以后官方更新模型时，只调整配置和兼容性测试。

> DeepSeek 模型、价格和能力可能继续变化。开始练习前应重新查看官方的 [Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing) 和 [Change Log](https://api-docs.deepseek.com/updates/)。

## 四、什么是 API

API 可以理解为两个程序之间约定好的通信入口。

本项目向 DeepSeek 发送：

```txt
HTTP 请求
```

DeepSeek 返回：

```txt
HTTP 响应
```

本课使用的入口是：

```txt
POST https://api.deepseek.com/chat/completions
```

请求中包含：

- 模型名称。
- system 消息。
- user 消息。
- JSON 输出设置。
- 最大输出长度。

响应中包含：

- 请求是否成功。
- 模型生成的内容。
- 停止原因。
- token 使用量等元数据。

## 五、什么是 API Key

API Key 是服务端识别调用者身份的秘密凭证。

它通常类似：

```txt
sk-这里是一段仅作说明的占位文本
```

不要在：

- 课程 Markdown。
- TypeScript 源码。
- Git commit。
- 截图。
- 聊天消息。
- 浏览器控制台。
- 前端网络请求。
- 错误响应。

中写入真实 Key。

真实 Key 一旦泄露，其他人可能使用你的账户余额调用 API。

如果怀疑已经泄露：

```txt
立即在 DeepSeek 平台撤销旧 Key
  ↓
创建新 Key
  ↓
检查 Git 历史和日志
  ↓
更新本地环境变量
```

只从文件中删除并不代表历史中的密钥已经消失。

## 六、创建 DeepSeek API Key

在 DeepSeek 官方平台登录后进入 API Keys 页面创建密钥。

课程中不记录真实 Key，只记录变量名：

```txt
DEEPSEEK_API_KEY
```

创建后通常只应在安全位置保存一次。

不要把密钥发给同学或粘贴到问题截图中。

调用可能产生费用，练习前应：

- 查看账户余额。
- 查看当前价格。
- 设置自己能接受的使用范围。
- 避免无限循环重试。
- 使用短 Prompt 和短输出。

## 七、环境变量是什么

环境变量让配置与源码分离。

错误做法：

```ts
const apiKey = "真实密钥";
```

正确思路：

```ts
const apiKey = process.env.DEEPSEEK_API_KEY;
```

源码只知道变量名。

真实值放在本机：

```txt
.env.local
```

这样同一份源码可以在不同环境使用不同配置：

```txt
本地开发
测试环境
生产环境
```

## 八、当前项目已经有 .env.local

项目当前已经使用：

```txt
ai-finance-cfo/.env.local
```

保存 SQLite 配置。

不要覆盖原有内容。

应该在现有文件中追加：

```dotenv
DB_FILE_NAME=file:data/dev.db
DEEPSEEK_API_KEY=你的真实密钥
DEEPSEEK_MODEL=deepseek-v4-flash
```

注意：

- 不要在值两侧随意加多余空格。
- 不要把说明文字写进真实值。
- 不要把真实 Key 复制回课程文档。
- 修改环境变量后重新启动开发进程。

课程代码和截图中统一使用：

```txt
你的真实密钥
```

作为占位说明。

## 九、为什么不能使用 NEXT_PUBLIC_DEEPSEEK_API_KEY

Next.js 会把以：

```txt
NEXT_PUBLIC_
```

开头的环境变量视为可以发送到浏览器的公开配置。

因此绝对不要写：

```txt
NEXT_PUBLIC_DEEPSEEK_API_KEY=...
```

也不要在 Client Component 中读取：

```ts
process.env.DEEPSEEK_API_KEY
```

DeepSeek 调用必须发生在服务端。

正确方向：

```txt
浏览器
  ↓
自己的 Next.js 服务端 API
  ↓
DeepSeek API
```

而不是：

```txt
浏览器
  ↓
携带秘密 Key 直接调用 DeepSeek
```

## 十、确认 .env.local 不进入 Git

当前项目的 `.gitignore` 已有：

```gitignore
.env*
```

它会忽略：

```txt
.env
.env.local
.env.development
.env.production
```

在 `ai-finance-cfo` 目录运行：

```bash
git check-ignore -v .env.local
```

应该看到 `.gitignore` 规则命中。

还可以运行：

```bash
git ls-files .env.local
```

正确结果应为空。

这表示 `.env.local` 当前没有被 Git 跟踪。

注意：

```txt
.gitignore 只阻止未跟踪文件以后被普通 git add 加入，
不会自动删除已经进入历史的秘密。
```

不要运行：

```bash
git add -f .env.local
```

## 十一、是否需要 .env.example

团队项目通常可以提交：

```txt
.env.example
```

它只包含变量名和安全占位值：

```dotenv
DB_FILE_NAME=file:data/dev.db
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
```

但当前 `.gitignore` 是：

```gitignore
.env*
```

它也会忽略 `.env.example`。

如果以后明确需要提交示例文件，可以增加例外：

```gitignore
.env*
!.env.example
```

本课不是必须创建 `.env.example`。

关键验收标准是：

```txt
真实密钥不进入 Git
```

## 十二、为什么选择原生 fetch

DeepSeek API 兼容常见的 Chat Completions HTTP 格式。

本项目运行在现代 Next.js 服务端环境，可以直接使用：

```ts
fetch(...)
```

因此本课不必为了一个请求再增加 SDK 依赖。

使用原生 `fetch` 的学习价值是可以直接看清：

```txt
URL
method
headers
body
status
response JSON
```

以后如果项目改用 SDK，底层概念仍然相同。

## 十三、先理解最小 HTTP 请求

请求地址：

```txt
https://api.deepseek.com/chat/completions
```

请求方法：

```txt
POST
```

请求头：

```http
Content-Type: application/json
Authorization: Bearer <DEEPSEEK_API_KEY>
```

请求体：

```json
{
  "model": "deepseek-v4-flash",
  "messages": [
    {
      "role": "system",
      "content": "你是财务意图解析器，只输出 JSON。"
    },
    {
      "role": "user",
      "content": "我两年内能攒够 50 万吗？"
    }
  ],
  "response_format": {
    "type": "json_object"
  },
  "thinking": {
    "type": "disabled"
  },
  "max_tokens": 800,
  "stream": false
}
```

`Authorization` 中的：

```txt
Bearer
```

是认证方案名称。

中间必须有一个空格：

```txt
Bearer + 空格 + API Key
```

## 十四、为什么使用 JSON Output

DeepSeek 官方提供：

```json
{
  "response_format": {
    "type": "json_object"
  }
}
```

用于要求模型返回合法 JSON 字符串。

官方同时要求：

- system 或 user Prompt 中出现 JSON 要求。
- Prompt 中给出期望 JSON 示例。
- `max_tokens` 足够容纳完整 JSON。

否则模型可能：

- 输出大量空白。
- 返回空内容。
- 因长度限制截断 JSON。

官方也提醒 JSON Output 偶尔可能出现空内容，因此代码仍要检查：

```txt
content === null
content.trim() === ""
```

> 参见 DeepSeek 官方 [JSON Output](https://api-docs.deepseek.com/guides/json_mode/) 和 [Chat Completion API](https://api-docs.deepseek.com/api/create-chat-completion)。

## 十五、JSON Output 不等于业务 schema 保证

`response_format: json_object` 主要保证：

```txt
输出是 JSON 对象
```

它不自动保证：

```txt
type 一定是四种白名单意图
金额一定是字符串
月数一定在范围内
字段一定完整
没有多余字段
```

例如下面是合法 JSON：

```json
{
  "type": "buy_stock",
  "amount": "全部存款"
}
```

但它不是合法的：

```txt
FinanceIntent
```

所以链路仍然必须是：

```txt
JSON Output
  ↓
JSON.parse
  ↓
financeIntentSchema.safeParse
```

## 十六、为什么显式关闭思考模式

DeepSeek V4 官方文档说明：

```txt
思考模式默认开启
```

本课任务是：

```txt
把一句短问题分类并抽取少量字段
```

它不需要模型生成长推理。

因此请求中显式设置：

```json
{
  "thinking": {
    "type": "disabled"
  }
}
```

好处包括：

- 响应更直接。
- 减少不必要输出。
- 更容易聚焦最终 JSON。
- 不需要处理 `reasoning_content`。

关闭思考模式不代表以后所有任务都必须关闭。

它只表示：

```txt
模型模式应根据任务选择，
不要无意识依赖服务端默认值。
```

> 当前开关和默认行为参见官方 [Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode)。

## 十七、把 Prompt 从代码调用中分离

推荐保留第 28 课规划的文件：

```txt
lib/ai/prompts/finance-intent.ts
```

例如：

```ts
export const FINANCE_INTENT_PROMPT = `
你是财务意图解析器，不是财务计算器。

把用户问题转换为 JSON 对象。

只允许以下四种 type：

1. savings_goal
   {
     "type": "savings_goal",
     "targetAmount": "500000",
     "deadlineMonths": 24
   }

2. debt_payoff
   {
     "type": "debt_payoff",
     "strategy": "snowball",
     "extraPayment": "2000"
   }

3. cashflow_forecast
   {
     "type": "cashflow_forecast",
     "months": 6
   }

4. what_if
   {
     "type": "what_if",
     "monthlyIncomeChange": "0",
     "monthlyExpenseChange": "3000",
     "horizonMonths": 24
   }

规则：
- 金额必须是十进制字符串，不带逗号、货币符号或中文单位。
- “万”转换为乘以 10000 后的金额字符串。
- “年”转换为整数月。
- 多赚为正收入变化，少赚为负收入变化。
- 多花为正支出变化，少花为负支出变化。
- 不变的收入或支出字段输出 "0"。
- 不计算财务结果。
- 不输出解释。
- 不输出 Markdown。
- 不输出契约之外的字段。
- 只输出一个 JSON 对象。
`.trim();
```

Prompt 和 API 客户端分开后：

- 更容易阅读和修改规则。
- 更容易给 Prompt 加版本。
- 更容易单独测试 Prompt 是否包含关键约束。
- `deepseek.ts` 不会变成巨大字符串文件。

## 十八、Prompt 不能包含真实财务明细

意图解析只需要：

```txt
用户当前问题
```

不要拼入：

- 完整账户余额。
- 全部交易明细。
- 身份证号。
- 银行卡号。
- 邮箱或手机号。
- 完整计算历史。
- API Key。

正确请求：

```ts
messages: [
  {
    role: "system",
    content: FINANCE_INTENT_PROMPT,
  },
  {
    role: "user",
    content: userMessage,
  },
]
```

不要写：

```ts
content: JSON.stringify({
  userMessage,
  allAccounts,
  allTransactions,
  apiKey,
})
```

## 十九、限制用户消息长度

即使本课只写服务端脚本，也应该给用户问题设置合理上限。

例如：

```ts
const MAX_USER_MESSAGE_LENGTH = 2000;
```

检查：

```ts
function assertUserMessage(userMessage: string) {
  const normalized = userMessage.trim();

  if (normalized.length === 0) {
    throw new Error("问题不能为空");
  }

  if (normalized.length > MAX_USER_MESSAGE_LENGTH) {
    throw new Error("问题不能超过 2000 个字符");
  }

  return normalized;
}
```

作用：

- 避免意外发送超长文本。
- 控制费用和延迟。
- 减少把整份敏感文档误发给模型的风险。
- 给后续 API route 一个明确输入边界。

这不是完整的安全方案，但属于必要的第一层约束。

## 二十、设计 deepseek.ts 的职责

推荐文件：

```txt
lib/ai/deepseek.ts
```

它负责：

- 读取 DeepSeek 环境变量。
- 组装 HTTP 请求。
- 设置超时。
- 检查 HTTP 状态。
- 校验 DeepSeek 响应结构。
- 检查停止原因。
- 返回模型最终内容。

它不负责：

- 查询数据库。
- 调用财务函数。
- 保存计算历史。
- 生成页面 JSX。
- 决定聊天 API 响应格式。

职责可以表示为：

```ts
requestDeepSeekJson(input): Promise<string>
```

输入是：

```txt
systemPrompt
userMessage
```

输出是：

```txt
模型 content 字符串
```

## 二十一、不要在模块加载时立刻读取密钥

可以在函数执行时读取：

```ts
function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("缺少 DEEPSEEK_API_KEY");
  }

  return {
    apiKey,
    model:
      process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
  };
}
```

而不是在文件顶部：

```ts
const apiKey = process.env.DEEPSEEK_API_KEY!;
```

函数内检查的好处：

- 错误信息更明确。
- 测试可以临时设置环境变量。
- 模块被导入时不会立刻失败。
- 不需要使用不安全的非空断言。

## 二十二、是否给模型名提供默认值

可以选择：

### 严格方案

两个变量都必须存在：

```txt
DEEPSEEK_API_KEY
DEEPSEEK_MODEL
```

### 教程方案

Key 必须存在，模型有当前默认值：

```ts
const model =
  process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
```

本课使用教程方案。

但模型名称会变化，所以 `.env.local` 仍建议明确填写：

```dotenv
DEEPSEEK_MODEL=deepseek-v4-flash
```

以后升级时更容易看到实际使用了什么。

## 二十三、为外部响应写 Zod schema

DeepSeek 返回的数据也是外部输入。

不要直接断言：

```ts
const data =
  (await response.json()) as DeepSeekChatCompletionResponse;
```

可以为本课真正使用的字段写一个最小 schema：

```ts
import * as z from "zod";

const deepSeekResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        finish_reason: z.string().nullable(),
        message: z.object({
          content: z.string().nullable(),
        }),
      }),
    )
    .min(1),
});
```

这里只验证本课使用的部分：

```txt
choices[0].finish_reason
choices[0].message.content
```

不必为了一个小功能复制整份官方响应类型。

如果以后使用：

- `usage`。
- `reasoning_content`。
- `tool_calls`。
- 多个 choices。

再扩展 schema。

## 二十四、为什么不能只看 response.ok

`response.ok === true` 只表示 HTTP 状态在：

```txt
200 到 299
```

它不表示：

- 响应一定符合预期结构。
- `choices` 一定非空。
- `content` 一定存在。
- 内容一定不是空字符串。
- 输出一定没有被截断。
- 内容一定符合 FinanceIntent。

完整成功需要经过多层判断：

```txt
网络请求成功
  ↓
HTTP 状态成功
  ↓
响应 JSON 可解析
  ↓
响应结构合法
  ↓
finish_reason 可接受
  ↓
content 非空
  ↓
FinanceIntent 校验成功
```

## 二十五、为错误建立明确分类

可以定义：

```ts
export type DeepSeekErrorCode =
  | "missing_api_key"
  | "timeout"
  | "network_error"
  | "http_error"
  | "invalid_response"
  | "empty_content"
  | "truncated_output";

export class DeepSeekError extends Error {
  constructor(
    public readonly code: DeepSeekErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "DeepSeekError";
  }
}
```

错误分类的作用不是让代码看起来复杂，而是让第 30 课能够区分：

```txt
配置错误
临时网络错误
认证错误
余额不足
模型输出错误
```

同时不能把内部细节或密钥原样返回给浏览器。

## 二十六、处理超时

外部 API 可能长时间没有响应。

不能无限等待。

可以使用 `AbortController`：

```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort();
}, 20_000);

try {
  const response = await fetch(url, {
    signal: controller.signal,
  });

  // 处理响应
} finally {
  clearTimeout(timeoutId);
}
```

为什么放在 `finally`：

```txt
无论成功还是失败都清理计时器
```

20 秒只是本地教程的示例，不是所有生产环境的唯一正确值。

真实项目需要根据：

- 模型。
- 是否思考。
- 输出长度。
- 用户体验。
- 上游平台限制。

选择超时策略。

## 二十七、区分超时和其他网络错误

`fetch` 抛错时可能是：

- 主动超时。
- DNS 问题。
- 无网络。
- TLS 问题。
- 连接被中断。

可以先判断：

```ts
if (
  error instanceof Error &&
  error.name === "AbortError"
) {
  throw new DeepSeekError(
    "timeout",
    "DeepSeek 请求超时",
  );
}
```

其他请求异常统一转换为：

```ts
throw new DeepSeekError(
  "network_error",
  "无法连接 DeepSeek",
);
```

不要直接把原始异常对象返回给前端。

## 二十八、处理 HTTP 错误

DeepSeek 官方列出的常见状态包括：

| 状态码 | 常见含义 |
| --- | --- |
| `400` | 请求格式错误 |
| `401` | 认证失败 |
| `402` | 余额不足 |
| `422` | 参数错误 |
| `429` | 请求过快或超过限制 |
| `500` | 服务端错误 |
| `503` | 服务过载 |

本课至少要检查：

```ts
if (!response.ok) {
  throw new DeepSeekError(
    "http_error",
    `DeepSeek 请求失败，状态码：${response.status}`,
    response.status,
  );
}
```

第 30 课再把内部状态映射为适合用户的错误：

```txt
401
  → 服务端 AI 配置错误

402
  → AI 服务暂时不可用

429 / 500 / 503
  → 请稍后重试
```

不要把供应商返回的所有内部文本直接展示给用户。

> 状态码含义参见 DeepSeek 官方 [Error Codes](https://api-docs.deepseek.com/quick_start/error_codes/)。

## 二十九、不要无限自动重试

错误处理不等于：

```ts
while (true) {
  await callDeepSeek();
}
```

无限重试可能：

- 重复扣费。
- 加重限流。
- 让请求永不结束。
- 放大服务故障。

第一版可以不自动重试。

以后如需重试，只考虑临时错误：

```txt
429
500
503
网络短暂失败
```

并设置：

- 最多重试次数。
- 退避时间。
- 总超时时间。
- 日志中的请求标识。

通常不应自动重试：

```txt
400
401
402
422
```

因为重复同一个错误请求不会自动修好配置或余额。

## 三十、检查 finish_reason

模型响应中包含停止原因。

对于本课，特别需要处理：

```txt
length
```

它表示输出可能因为长度限制被截断。

即使截断文本碰巧仍能 `JSON.parse`，也不应该轻易当作完整意图。

可以写：

```ts
if (choice.finish_reason === "length") {
  throw new DeepSeekError(
    "truncated_output",
    "DeepSeek 输出因长度限制被截断",
  );
}
```

其他停止原因也应记录在服务端诊断信息中。

对于意图解析，正常情况通常希望看到：

```txt
stop
```

## 三十一、检查空 content

官方 JSON Output 文档提醒：

```txt
模型偶尔可能返回空内容
```

因此不能直接：

```ts
return choice.message.content!;
```

应该：

```ts
const content = choice.message.content?.trim();

if (!content) {
  throw new DeepSeekError(
    "empty_content",
    "DeepSeek 没有返回可用内容",
  );
}

return content;
```

空内容不是合法意图，也不能用默认意图悄悄替代。

## 三十二、deepseek.ts 完整参考结构

下面代码展示文件结构和职责。

练习时应结合你第 28 课的真实文件名调整 import。

```ts
import * as z from "zod";

const DEEPSEEK_API_URL =
  "https://api.deepseek.com/chat/completions";

const DEFAULT_MODEL = "deepseek-v4-flash";
const REQUEST_TIMEOUT_MS = 20_000;

const deepSeekResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        finish_reason: z.string().nullable(),
        message: z.object({
          content: z.string().nullable(),
        }),
      }),
    )
    .min(1),
});

export type DeepSeekErrorCode =
  | "missing_api_key"
  | "timeout"
  | "network_error"
  | "http_error"
  | "invalid_response"
  | "empty_content"
  | "truncated_output";

export class DeepSeekError extends Error {
  constructor(
    public readonly code: DeepSeekErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "DeepSeekError";
  }
}

type RequestDeepSeekJsonInput = {
  systemPrompt: string;
  userMessage: string;
  fetcher?: typeof fetch;
};

function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new DeepSeekError(
      "missing_api_key",
      "缺少 DEEPSEEK_API_KEY",
    );
  }

  return {
    apiKey,
    model:
      process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL,
  };
}

export async function requestDeepSeekJson({
  systemPrompt,
  userMessage,
  fetcher = fetch,
}: RequestDeepSeekJsonInput): Promise<string> {
  const { apiKey, model } = getDeepSeekConfig();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    let response: Response;

    try {
      response = await fetcher(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          response_format: {
            type: "json_object",
          },
          thinking: {
            type: "disabled",
          },
          max_tokens: 800,
          stream: false,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new DeepSeekError(
          "timeout",
          "DeepSeek 请求超时",
        );
      }

      throw new DeepSeekError(
        "network_error",
        "无法连接 DeepSeek",
      );
    }

    if (!response.ok) {
      throw new DeepSeekError(
        "http_error",
        `DeepSeek 请求失败，状态码：${response.status}`,
        response.status,
      );
    }

    let responseValue: unknown;

    try {
      responseValue = await response.json();
    } catch {
      throw new DeepSeekError(
        "invalid_response",
        "DeepSeek 响应不是合法 JSON",
      );
    }

    const parsed =
      deepSeekResponseSchema.safeParse(responseValue);

    if (!parsed.success) {
      throw new DeepSeekError(
        "invalid_response",
        "DeepSeek 响应结构不符合预期",
      );
    }

    const choice = parsed.data.choices[0];

    if (choice.finish_reason === "length") {
      throw new DeepSeekError(
        "truncated_output",
        "DeepSeek 输出因长度限制被截断",
      );
    }

    const content = choice.message.content?.trim();

    if (!content) {
      throw new DeepSeekError(
        "empty_content",
        "DeepSeek 没有返回可用内容",
      );
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

## 三十三、为什么不读取错误响应正文

调试时可能想写：

```ts
console.error(await response.text());
```

它有时能提供帮助，但不能无条件把完整内容：

- 返回给浏览器。
- 写入公开日志。
- 保存进用户可见数据库。

错误正文可能包含：

- 请求参数片段。
- 供应商内部信息。
- 用户原始消息。

第一版先记录：

```txt
状态码
错误分类
内部请求标识
```

如果以后读取错误正文，也应：

- 限制长度。
- 仅保存在服务端。
- 避免写入 Key。
- 避免保存完整敏感用户内容。

## 三十四、连接第 28 课的解析器

`requestDeepSeekJson` 返回的是：

```txt
未经业务信任的字符串
```

继续使用第 28 课的：

```txt
parseFinanceIntent
```

可以新增一个很薄的组合函数：

```txt
lib/ai/parse-intent-with-deepseek.ts
```

示例：

```ts
import {
  requestDeepSeekJson,
} from "@/lib/ai/deepseek";
import {
  FINANCE_INTENT_PROMPT,
} from "@/lib/ai/prompts/finance-intent";
import {
  parseFinanceIntent,
} from "@/lib/ai/parse-finance-intent";
import type {
  FinanceIntent,
} from "@/schemas/ai-intent";

const MAX_USER_MESSAGE_LENGTH = 2000;

function normalizeUserMessage(userMessage: string) {
  const normalized = userMessage.trim();

  if (normalized.length === 0) {
    throw new Error("问题不能为空");
  }

  if (normalized.length > MAX_USER_MESSAGE_LENGTH) {
    throw new Error("问题不能超过 2000 个字符");
  }

  return normalized;
}

export async function parseIntentWithDeepSeek(
  userMessage: string,
): Promise<FinanceIntent> {
  const normalized =
    normalizeUserMessage(userMessage);

  const rawOutput = await requestDeepSeekJson({
    systemPrompt: FINANCE_INTENT_PROMPT,
    userMessage: normalized,
  });

  const parsed = parseFinanceIntent(rawOutput);

  if (!parsed.success) {
    throw new Error(
      `DeepSeek 意图解析失败：${parsed.reason}`,
    );
  }

  return parsed.intent;
}
```

完整职责现在是：

```txt
parseIntentWithDeepSeek
  ↓
校验用户消息
  ↓
requestDeepSeekJson
  ↓
parseFinanceIntent
  ↓
FinanceIntent
```

## 三十五、为什么保留两层函数

不要把所有内容塞入一个 300 行函数。

两层职责：

### requestDeepSeekJson

关心：

```txt
外部 HTTP 服务是否正常
```

### parseIntentWithDeepSeek

关心：

```txt
模型内容是否为合法 FinanceIntent
```

这样可以分别测试：

- DeepSeek 响应结构。
- 网络错误转换。
- FinanceIntent 业务规则。
- 用户消息长度。

以后第二次模型调用组织回复时，也可以复用：

```txt
requestDeepSeekJson
```

或进一步抽象为通用文本请求。

## 三十六、服务端演示脚本

本课不创建 `/api/chat`。

为了验证真实调用，可以增加：

```txt
scripts/deepseek-intent-demo.ts
```

示例：

```ts
import dotenv from "dotenv";
import {
  parseIntentWithDeepSeek,
} from "@/lib/ai/parse-intent-with-deepseek";

dotenv.config({
  path: ".env.local",
});

async function main() {
  const question =
    "我两年内能攒够 50 万吗？";

  const intent =
    await parseIntentWithDeepSeek(question);

  console.log(
    JSON.stringify(
      {
        question,
        intent,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : "未知错误";

  console.error("演示失败：", message);
  process.exitCode = 1;
});
```

当前项目已经安装：

```txt
dotenv
tsx
```

所以不需要为了这个脚本新增依赖。

## 三十七、为什么演示脚本需要 dotenv

Next.js 运行时会自动加载：

```txt
.env.local
```

但独立运行的普通 TypeScript 脚本不一定经过 Next.js 的环境加载流程。

因此演示脚本显式：

```ts
dotenv.config({
  path: ".env.local",
});
```

注意加载顺序：

```txt
调用 parseIntentWithDeepSeek 之前
必须完成 dotenv.config
```

由于本课的 `deepseek.ts` 在函数执行时读取环境变量，而不是模块加载时读取，演示脚本可以安全完成这一步。

## 三十八、运行真实演示

在 `ai-finance-cfo` 目录运行：

```bash
npx tsx scripts/deepseek-intent-demo.ts
```

可能得到：

```json
{
  "question": "我两年内能攒够 50 万吗？",
  "intent": {
    "type": "savings_goal",
    "targetAmount": "500000",
    "deadlineMonths": 24
  }
}
```

输出允许有 JSON 格式上的空格差异，但业务字段必须通过 Zod。

不要输出：

```ts
console.log(process.env.DEEPSEEK_API_KEY);
```

也不要为了调试打印完整请求 headers。

## 三十九、真实调用前的费用确认

运行演示脚本会向外部服务发送请求，可能产生费用。

运行前确认：

- Key 属于你自己的账户。
- 账户有可用余额。
- 模型名称当前可用。
- 只执行少量测试。
- 没有循环调用。
- `max_tokens` 已限制。

本课的单元测试不应自动执行真实调用。

真实演示由学习者明确手动运行。

## 四十、模型输出可能与期望不同

即使启用了 JSON Output，模型也可能返回：

```json
{
  "type": "savings_goal",
  "targetAmount": "500000元",
  "deadlineMonths": 24
}
```

或者：

```json
{
  "type": "saving_goal",
  "targetAmount": "500000",
  "deadlineMonths": 24
}
```

这时不要修改 Zod 让所有错误都通过。

先判断：

```txt
是 Prompt 不清楚
还是用户问题确实缺少信息
还是模型偶发漂移
还是契约设计不合理
```

正确调试顺序：

1. 保存脱敏后的用户问题。
2. 保存脱敏后的原始模型输出。
3. 查看 Zod 失败字段。
4. 检查 Prompt 是否有对应规则和示例。
5. 用多个问法验证。
6. 只在业务确实需要时修改 schema。

## 四十一、不要为了通过而盲目放宽 schema

假设模型返回：

```json
{
  "deadlineMonths": "24"
}
```

不要立刻把 schema 改成：

```ts
z.any()
```

可以有三种选择：

### 方案 A：严格要求模型输出 number

保留：

```ts
z.number().int()
```

并改进 Prompt。

### 方案 B：在可信归一化层显式转换

如果产品决定允许：

```txt
"24" → 24
```

要写明确转换和测试。

### 方案 C：让结构化输出工具强约束

以后可以研究 Tool Calls 的 JSON Schema strict 模式。

本课使用方案 A，保持第 28 课契约稳定。

## 四十二、是否应该自动重试非法模型输出

第一版可以：

```txt
不自动重试
  ↓
返回明确错误
  ↓
人工观察失败模式
```

以后可以对：

```txt
invalid_json
invalid_intent
empty_content
```

进行最多一次受控重试，并在第二次 Prompt 中说明：

```txt
上一次输出未通过 schema，
请只返回符合示例的 JSON。
```

但要避免：

- 无限重试。
- 每次都携带越来越长的错误。
- 把完整 Zod 内部结构发给模型。
- 重试后跳过最终校验。

无论第几次输出，都必须重新经过 Zod。

## 四十三、API Key 缺失时应该怎样失败

如果 `.env.local` 没有：

```txt
DEEPSEEK_API_KEY
```

应该立即得到明确错误：

```txt
缺少 DEEPSEEK_API_KEY
```

而不是继续发送：

```http
Authorization: Bearer undefined
```

也不要把它当成普通用户问题：

```txt
“抱歉，我不理解你的财务问题”
```

这是服务端配置错误，不是用户输入错误。

## 四十四、401 和 402 不应该怎样处理

### 401

通常表示认证失败。

应检查：

- Key 是否复制完整。
- 是否多了空格或引号。
- Key 是否已撤销。
- 是否使用正确平台的 Key。

不要在日志中打印 Key 进行比较。

### 402

通常表示余额不足。

应检查账户余额。

不要无限重试。

对最终用户可以统一显示：

```txt
AI 服务暂时不可用，请稍后再试。
```

服务端日志再保留状态码供维护者定位。

## 四十五、429、500 和 503

### 429

表示请求过快或达到并发限制。

### 500

表示供应商服务端发生问题。

### 503

表示服务过载。

这些通常属于可能恢复的临时错误。

第一版先清楚返回失败。

以后增加重试时应使用：

```txt
有限次数
指数退避
随机抖动
总超时
```

不能让用户一次点击产生无限请求。

## 四十六、最小化日志

可以记录：

```txt
请求发生时间
模型名
耗时
HTTP 状态
错误分类
意图类型
```

谨慎记录：

```txt
用户完整问题
模型完整输出
```

禁止记录：

```txt
Authorization header
DEEPSEEK_API_KEY
完整 .env.local
银行卡号等敏感数据
```

本地学习阶段也应养成这个习惯。

## 四十七、不要把环境变量返回给页面

错误：

```ts
return Response.json({
  apiKey: process.env.DEEPSEEK_API_KEY,
});
```

错误：

```tsx
<div>{process.env.DEEPSEEK_API_KEY}</div>
```

错误：

```ts
throw new Error(
  `调用失败，当前 Key 是 ${apiKey}`,
);
```

正确做法：

```txt
Key 只用于服务端 Authorization header
```

使用后不把它放入业务返回值。

## 四十八、为什么不使用 curl 把 Key 写进命令历史

直接运行：

```bash
curl -H "Authorization: Bearer 真实密钥" ...
```

可能把密钥写入终端历史。

本课推荐：

- 把密钥放在 `.env.local`。
- 使用服务端脚本读取。
- 不在命令参数中直接出现真实值。

如果确实使用官方 curl 示例，也应使用安全环境变量，并理解本机命令历史和进程信息的风险。

## 四十九、为 deepseek.ts 写测试时不要访问网络

单元测试不应真的请求：

```txt
https://api.deepseek.com
```

原因：

- 需要真实 Key。
- 产生费用。
- 受网络影响。
- 响应存在波动。
- CI 环境通常没有密钥。

推荐测试：

- 缺少 Key 时明确失败。
- `401` 转换为 `http_error`。
- `500` 转换为 `http_error`。
- 非 JSON 响应转换为 `invalid_response`。
- `choices` 为空时失败。
- `content` 为空时失败。
- `finish_reason === "length"` 时失败。
- 成功时返回 content。

这需要把：

```txt
fetch
```

作为可替换依赖，或使用 Vitest 的 mock。

## 五十、一个可测试的 fetch 设计

前面的完整参考代码已经把 `fetch` 设计成可注入依赖：

```ts
type FetchLike = typeof fetch;

type RequestDeepSeekJsonInput = {
  systemPrompt: string;
  userMessage: string;
  fetcher?: FetchLike;
};

export async function requestDeepSeekJson({
  systemPrompt,
  userMessage,
  fetcher = fetch,
}: RequestDeepSeekJsonInput) {
  const response = await fetcher(
    DEEPSEEK_API_URL,
    {
      // 请求配置
    },
  );

  // 响应处理
}
```

测试时传入假 `fetcher`。

生产代码不传，使用真实 `fetch`。

初学阶段也可以使用：

```ts
vi.stubGlobal("fetch", vi.fn())
```

但每个测试后要恢复：

```ts
vi.unstubAllGlobals()
```

无论选择哪种，目标都是：

```txt
测试错误处理逻辑
而不是测试 DeepSeek 官方服务
```

## 五十一、测试缺少 API Key

示例思路：

```ts
import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  requestDeepSeekJson,
} from "@/lib/ai/deepseek";

const originalApiKey =
  process.env.DEEPSEEK_API_KEY;

afterEach(() => {
  if (originalApiKey === undefined) {
    delete process.env.DEEPSEEK_API_KEY;
  } else {
    process.env.DEEPSEEK_API_KEY =
      originalApiKey;
  }
});

it("缺少 API Key 时明确失败", async () => {
  delete process.env.DEEPSEEK_API_KEY;

  await expect(
    requestDeepSeekJson({
      systemPrompt: "只输出 JSON",
      userMessage: "测试",
    }),
  ).rejects.toMatchObject({
    code: "missing_api_key",
  });
});
```

测试中也不要使用真实 Key。

可以设置安全假值：

```ts
process.env.DEEPSEEK_API_KEY =
  "test-api-key";
```

## 五十二、测试成功响应

假响应只需要包含本课使用字段：

```ts
const fakeFetcher = async () =>
  new Response(
    JSON.stringify({
      choices: [
        {
          finish_reason: "stop",
          message: {
            content: JSON.stringify({
              type: "cashflow_forecast",
              months: 6,
            }),
          },
        },
      ],
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
```

断言：

```ts
const content = await requestDeepSeekJson({
  systemPrompt: "只输出 JSON",
  userMessage: "预测未来半年现金流",
  fetcher: fakeFetcher,
});

expect(JSON.parse(content)).toEqual({
  type: "cashflow_forecast",
  months: 6,
});
```

这和前面 `deepseek.ts` 的完整参考签名一致，不需要再维护第二套实现。

## 五十三、测试 HTTP 错误

```ts
const fakeFetcher = async () =>
  new Response(
    JSON.stringify({
      error: {
        message: "Unauthorized",
      },
    }),
    {
      status: 401,
    },
  );

await expect(
  requestDeepSeekJson({
    systemPrompt: "只输出 JSON",
    userMessage: "测试",
    fetcher: fakeFetcher,
  }),
).rejects.toMatchObject({
  code: "http_error",
  status: 401,
});
```

这个测试不需要真实网络。

## 五十四、测试空内容和截断

空内容：

```json
{
  "choices": [
    {
      "finish_reason": "stop",
      "message": {
        "content": ""
      }
    }
  ]
}
```

期望：

```txt
empty_content
```

截断：

```json
{
  "choices": [
    {
      "finish_reason": "length",
      "message": {
        "content": "{\"type\":\"savings_goal\""
      }
    }
  ]
}
```

期望：

```txt
truncated_output
```

这两个测试保护官方文档已经提示的真实边界。

## 五十五、真实调用和自动测试分开

推荐：

```txt
tests/ai/deepseek.test.ts
  → 全部使用假 fetch

scripts/deepseek-intent-demo.ts
  → 学习者手动调用真实 API
```

运行：

```bash
npm run test:run
```

不应该产生 DeepSeek 费用。

只有明确运行：

```bash
npx tsx scripts/deepseek-intent-demo.ts
```

才调用真实服务。

## 五十六、不要把真实调用放进 npm test

不要写：

```json
{
  "scripts": {
    "test": "vitest && tsx scripts/deepseek-intent-demo.ts"
  }
}
```

否则：

- 每次测试都扣费。
- 无 Key 的环境全部失败。
- CI 可能泄露或滥用密钥。
- 网络波动影响普通测试。

真实服务验证属于：

```txt
手动 smoke test
```

它与可重复单元测试不是一回事。

## 五十七、一次调用中到底发送了什么

本课意图解析请求只发送：

```txt
system Prompt
用户当前问题
模型配置
```

不发送：

```txt
SQLite 文件
账户表
流水表
债务表
计算历史
API Key 作为消息内容
```

Key 只存在于：

```http
Authorization header
```

这就是“最小化发送给 LLM”的具体实现。

## 五十八、为什么不能把 Key 放进 messages

错误：

```ts
messages: [
  {
    role: "system",
    content:
      `我的 API Key 是 ${apiKey}`,
  },
]
```

API Key 用于认证请求，不是模型需要理解的内容。

正确位置：

```ts
headers: {
  Authorization: `Bearer ${apiKey}`,
}
```

## 五十九、当前项目最终会怎样使用 deepseek.ts

第 30 课的 Chat API 会形成：

```txt
POST /api/chat
  ↓
校验用户问题
  ↓
parseIntentWithDeepSeek
  ↓
FinanceIntent
  ↓
读取 SQLite
  ↓
构造确定性计算输入
  ↓
调用财务计算引擎
  ↓
保存 calculation_history
  ↓
组织用户回复
```

本课写好的：

```txt
deepseek.ts
Prompt
parseIntentWithDeepSeek
错误类型
单元测试
```

都可以继续复用。

## 六十、不要在 deepseek.ts 中提前实现 Chat API

错误职责：

```ts
export async function callDeepSeek() {
  // 读取 Request
  // 查询账户
  // 查询流水
  // 做储蓄目标计算
  // 保存数据库
  // 返回 Response
}
```

这会让一个文件同时承担：

- HTTP 入站。
- HTTP 出站。
- AI。
- 数据库。
- 财务计算。
- 响应格式。

正确拆分：

```txt
app/api/chat/route.ts
  → 接收和返回 HTTP

lib/ai/deepseek.ts
  → 调用外部模型

lib/ai/parse-intent-with-deepseek.ts
  → 组合模型调用和意图校验

lib/services/chat.ts
  → 编排数据、计算和历史

lib/finance/*
  → 确定性计算
```

## 六十一、常见错误一：把 Key 写死在源码

错误：

```ts
const apiKey = "sk-真实内容";
```

修正：

```ts
const apiKey =
  process.env.DEEPSEEK_API_KEY;
```

同时确认 `.env.local` 未被 Git 跟踪。

## 六十二、常见错误二：浏览器直接调用 DeepSeek

错误：

```tsx
"use client";

await fetch(
  "https://api.deepseek.com/chat/completions",
  {
    headers: {
      Authorization:
        `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
    },
  },
);
```

这会把密钥暴露给浏览器用户。

修正：

```txt
Client Component
  ↓
自己的 /api/chat
  ↓
服务端调用 DeepSeek
```

## 六十三、常见错误三：只用类型断言解析响应

错误：

```ts
const data =
  (await response.json()) as DeepSeekResponse;
```

修正：

```txt
response.json()
  ↓
unknown
  ↓
Zod
  ↓
可信响应结构
```

模型 content 还要再次经过：

```txt
FinanceIntent Zod schema
```

## 六十四、常见错误四：HTTP 200 就认为业务成功

HTTP 200 后仍可能：

- `choices` 为空。
- `content` 为空。
- 输出被截断。
- 意图 type 未知。
- 金额格式错误。
- 必要字段缺失。

必须完成所有层次的校验。

## 六十五、常见错误五：把模型原始错误返回给用户

错误：

```ts
return Response.json({
  error,
});
```

原始错误可能包含不适合公开的内部信息。

正确方向：

```txt
服务端保留安全诊断信息
  ↓
对用户返回稳定、简短的错误
```

例如：

```txt
AI 服务暂时不可用，请稍后再试。
```

## 六十六、常见错误六：不限制输出长度

不设置 `max_tokens` 可能导致：

- 响应变长。
- 费用增加。
- 等待变久。
- 模型输出无关解释。

本课意图 JSON 很短，示例使用：

```json
{
  "max_tokens": 800
}
```

它留有足够空间，又不是无限输出。

以后可以根据真实观测继续收紧。

## 六十七、常见错误七：仍使用过期模型名

旧教程可能写：

```txt
deepseek-chat
deepseek-reasoner
```

截至本课日期，官方已经宣布它们在 2026-07-24 退役。

本课使用：

```txt
deepseek-v4-flash
```

并把模型名放在：

```txt
DEEPSEEK_MODEL
```

看到模型不存在错误时，应先查官方当前模型列表，而不是盲目修改其他代码。

## 六十八、常见错误八：默认思考模式造成意外行为

DeepSeek V4 当前默认开启思考模式。

如果请求没有明确设置，服务端默认以后变化时，应用行为也可能变化。

意图抽取请求显式：

```json
{
  "thinking": {
    "type": "disabled"
  }
}
```

这是把关键行为写进请求契约。

## 六十九、实践任务

### 任务 1：确认密钥文件安全

检查：

```txt
.env.local 存在
.gitignore 包含 .env*
git check-ignore 能命中
git ls-files 不显示 .env.local
```

不要在作业截图中显示真实值。

### 任务 2：补充环境变量

在现有 `.env.local` 中保留数据库配置，并增加：

```dotenv
DEEPSEEK_API_KEY=你的真实密钥
DEEPSEEK_MODEL=deepseek-v4-flash
```

### 任务 3：整理意图 Prompt

确保包含：

- 四类意图。
- 每类 JSON 示例。
- 金额归一化规则。
- 年转月规则。
- What-if 正负号规则。
- 禁止计算。
- 只输出 JSON。

### 任务 4：编写 deepseek.ts

至少实现：

- 环境变量检查。
- `fetch` POST。
- Authorization header。
- JSON Output。
- 显式关闭思考模式。
- 超时。
- HTTP 错误。
- 响应结构校验。
- 空内容检查。
- 截断检查。

### 任务 5：连接 FinanceIntent 校验

模型 content 必须继续经过第 28 课的：

```txt
parseFinanceIntent
```

### 任务 6：编写服务端演示脚本

输入：

```txt
我两年内能攒够 50 万吗？
```

期望得到：

```json
{
  "type": "savings_goal",
  "targetAmount": "500000",
  "deadlineMonths": 24
}
```

### 任务 7：编写无网络单元测试

覆盖：

- 缺少 Key。
- HTTP 401。
- HTTP 500。
- 非法响应 JSON。
- 非法响应结构。
- 空 content。
- `finish_reason: "length"`。
- 合法 content。

### 任务 8：手动执行一次真实 smoke test

只在确认 Key、余额和费用后执行。

不要把它放进自动测试。

## 七十、推荐练习步骤

1. 完成第 28 课的四类意图契约。
2. 运行现有测试并确认绿色基线。
3. 阅读 DeepSeek 当前官方模型列表。
4. 确认不再使用已退役的旧模型名。
5. 在 DeepSeek 官方平台创建 API Key。
6. 不在任何课程或源码中粘贴真实 Key。
7. 检查现有 `.env.local` 内容。
8. 保留 `DB_FILE_NAME`。
9. 增加 `DEEPSEEK_API_KEY`。
10. 增加 `DEEPSEEK_MODEL`。
11. 检查 `.gitignore` 的 `.env*` 规则。
12. 运行 `git check-ignore -v .env.local`。
13. 运行 `git ls-files .env.local`。
14. 确认 Key 没有进入 Git。
15. 整理 `FINANCE_INTENT_PROMPT`。
16. 在 Prompt 中写四类 JSON 示例。
17. 在 Prompt 中写金额归一化规则。
18. 在 Prompt 中写年转月规则。
19. 在 Prompt 中禁止财务计算。
20. 在 Prompt 中要求只输出 JSON。
21. 规划 `lib/ai/deepseek.ts`。
22. 在函数执行时读取环境变量。
23. 为缺少 Key 建立明确错误。
24. 使用 `deepseek-v4-flash` 当前示例。
25. 使用 `fetch` 发送 POST 请求。
26. 设置 `Content-Type`。
27. 设置 `Authorization: Bearer ...`。
28. 设置 `response_format: json_object`。
29. 显式关闭 thinking。
30. 设置合理 `max_tokens`。
31. 设置请求超时。
32. 处理网络失败。
33. 处理非 2xx 状态。
34. 校验响应 JSON 结构。
35. 检查 `choices` 非空。
36. 检查 `finish_reason`。
37. 检查 content 非空。
38. 把 content 交给 `parseFinanceIntent`。
39. 限制用户问题长度。
40. 建立 `parseIntentWithDeepSeek`。
41. 编写本地演示脚本。
42. 确认脚本加载 `.env.local`。
43. 确认脚本不打印 API Key。
44. 用假 fetch 测试成功响应。
45. 测试缺少 API Key。
46. 测试 401。
47. 测试 500。
48. 测试非法响应 JSON。
49. 测试错误响应结构。
50. 测试空 content。
51. 测试截断输出。
52. 运行全部单元测试。
53. 运行 lint。
54. 确认自动测试没有真实网络请求。
55. 确认自动测试不会产生模型费用。
56. 确认真实演示不是 `npm test` 的一部分。
57. 确认当前请求只发送 Prompt 和用户问题。
58. 确认没有发送账户或流水明细。
59. 确认没有创建 `/api/chat`。
60. 在明确确认费用后手动运行一次真实演示。

## 七十一、验收标准

- 能解释 API 和 API Key 的作用。
- API Key 只保存在 `.env.local`。
- `.env.local` 保留已有数据库配置。
- `.gitignore` 会忽略 `.env.local`。
- `git ls-files .env.local` 结果为空。
- 没有使用 `NEXT_PUBLIC_DEEPSEEK_API_KEY`。
- 没有在 Client Component 中调用 DeepSeek。
- 没有在源码、日志或截图中出现真实 Key。
- 当前模型名通过环境变量配置。
- 当前示例不再依赖已退役旧模型名。
- 能说明为什么本课选择 `deepseek-v4-flash`。
- 能使用原生 `fetch` 发送 POST 请求。
- 请求使用正确的 `Content-Type`。
- 请求使用 `Authorization: Bearer ...`。
- 请求包含 system 和 user 消息。
- 请求启用了 JSON Output。
- Prompt 明确要求 JSON。
- Prompt 提供了 JSON 示例。
- 请求显式关闭思考模式。
- 请求设置了合理的 `max_tokens`。
- 用户问题有长度限制。
- DeepSeek 调用设置了超时。
- 缺少 API Key 时会明确失败。
- 网络错误会被转换为稳定错误。
- 非 2xx 状态不会继续解析为成功。
- 401、402、429、500、503 的含义清楚。
- 不会对不可恢复错误无限重试。
- DeepSeek 响应结构经过 Zod 校验。
- `choices` 为空时会失败。
- content 为空时会失败。
- 输出被截断时会失败。
- 模型 content 再经过 FinanceIntent schema。
- HTTP 200 不会被误认为完整业务成功。
- 模型不会直接计算储蓄目标结果。
- 意图解析不会发送完整财务明细。
- 单元测试不访问真实网络。
- 单元测试不需要真实 API Key。
- 单元测试不会产生 DeepSeek 费用。
- 能手动运行一次服务端 smoke test。
- 能把示例问题解析为 `savings_goal`。
- 本课没有提前实现 `/api/chat`。
- `npm run test:run` 全部通过。
- `npm run lint` 没有新增问题。

## 七十二、复习问题

### 1. 为什么 API Key 不能写在 TypeScript 源码中？

源码可能进入 Git、日志、截图或部署产物，导致密钥泄露和账户被滥用。

### 2. 为什么不能使用 `NEXT_PUBLIC_DEEPSEEK_API_KEY`？

`NEXT_PUBLIC_` 表示变量可以进入浏览器代码，任何用户都可能看到密钥。

### 3. `.gitignore` 为什么不能挽救已经提交的密钥？

`.gitignore` 只影响未被跟踪文件的普通新增，不会删除已有 commit 和历史记录。

### 4. 为什么模型名也放在环境变量中？

模型是会变化的外部配置。放在环境变量中可以减少硬编码，并让升级和回滚更清楚。

### 5. 本课为什么使用 `deepseek-v4-flash`？

意图分类和参数抽取是短小的结构化任务，当前 Flash 模型更适合作为轻量默认选择；实际使用前仍应查看官方最新能力和价格。

### 6. 为什么要显式关闭思考模式？

DeepSeek V4 当前默认开启思考模式，但简单意图抽取不需要长推理。显式关闭能稳定请求行为并减少不必要处理。

### 7. `response_format: json_object` 能代替 Zod 吗？

不能。它帮助模型输出合法 JSON，但不保证 JSON 符合项目的四类 FinanceIntent 业务契约。

### 8. 为什么 Prompt 中还要写“JSON”并给示例？

这是 DeepSeek 官方 JSON Output 使用要求的一部分，也能降低输出格式漂移。

### 9. `response.ok` 为 true 为什么还不能直接成功？

仍需检查响应结构、停止原因、空内容、JSON 内容和 FinanceIntent schema。

### 10. 为什么需要检查 `finish_reason === "length"`？

它表示模型输出可能被截断，不能把不完整内容当作完整意图。

### 11. 为什么要设置超时？

外部服务可能长时间无响应；超时能避免请求无限等待，并给上层稳定错误。

### 12. 哪些错误通常不应该自动重试？

400、401、402、422 等格式、认证、余额或参数错误，重复相同请求通常不会解决问题。

### 13. 为什么自动测试不能调用真实 DeepSeek？

真实调用依赖网络和密钥、会产生费用并且结果有波动，不适合作为快速可重复单元测试。

### 14. 为什么要保留手动 smoke test？

假 fetch 能验证本地代码逻辑，但不能证明真实 URL、认证、模型名和供应商响应当前可用，因此需要少量明确触发的真实验证。

### 15. 意图解析时应该向模型发送哪些数据？

只发送意图 Prompt 和当前用户问题；不需要发送完整账户、流水、债务或计算历史。

### 16. `deepseek.ts` 为什么不直接查询数据库？

它的职责是外部模型通信。数据库、计算和历史应由后续 service 编排，保持模块可测试和可替换。

### 17. 如果模型返回合法 JSON，但 `type` 是未知值怎么办？

FinanceIntent Zod 校验失败，停止流程，不调用计算引擎，也不使用默认意图替代。

### 18. 如果 Key 泄露，删除 `.env.local` 中那一行够吗？

不够。应立即在平台撤销旧 Key、创建新 Key，并检查 Git 历史、日志和其他泄露位置。

## 七十三、本课小结

这一课把第 28 课的假模型替换成了真实 DeepSeek API：

```txt
用户问题
  ↓
服务端环境变量
  ↓
DeepSeek Chat Completions
  ↓
JSON Output
  ↓
DeepSeek 响应 Zod
  ↓
content
  ↓
FinanceIntent Zod
  ↓
可信结构化意图
```

同时建立了密钥边界：

```txt
真实 Key
  → 只在 .env.local
  → 只在服务端读取
  → 只进入 Authorization header
  → 不进入浏览器
  → 不进入 Git
  → 不进入日志
```

并建立了失败边界：

```txt
缺少 Key
网络失败
超时
HTTP 错误
响应结构错误
空 content
输出截断
非法 FinanceIntent
```

需要始终记住：

```txt
HTTP 200
不等于
财务业务成功
```

完整成功必须经过：

```txt
HTTP
  ↓
响应结构
  ↓
模型 content
  ↓
FinanceIntent
```

下一课进入：

```txt
第 30 课：Chat API 闭环
```

下一课会把本课得到的：

```txt
FinanceIntent
```

连接到：

```txt
SQLite 财务数据
  ↓
确定性计算引擎
  ↓
calculation_history
  ↓
用户可读回复
```

并正式实现：

```txt
POST /api/chat
```

## 参考资料

以下链接在本课编写时核对过，外部 API 会变化，练习时以官方最新文档为准：

- [DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing)
- [DeepSeek Change Log](https://api-docs.deepseek.com/updates/)
- [DeepSeek Chat Completion API](https://api-docs.deepseek.com/api/create-chat-completion)
- [DeepSeek JSON Output](https://api-docs.deepseek.com/guides/json_mode/)
- [DeepSeek Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode)
- [DeepSeek Error Codes](https://api-docs.deepseek.com/quick_start/error_codes/)
