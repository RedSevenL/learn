# AI 个人财务 CFO

一个本地优先的个人财务学习项目。

项目使用结构化账户、流水和负债数据进行确定性财务计算，使用
DeepSeek 把用户自然语言解析为受限业务意图。AI 不直接决定财务
金额，最终结果由 TypeScript 和 Decimal.js 计算，并保存可追溯的
输入、公式版本、步骤和输出。

## 核心原则

- AI 负责理解问题，不直接计算财务金额。
- 财务结果由确定性函数计算。
- 网络响应和模型输出都经过 Zod 校验。
- 金额计算使用 Decimal.js。
- 关键计算保存输入、公式版本、步骤和输出。
- 财务数据默认保存在本地 SQLite 数据库。

## 已实现功能

- 账户创建、查询、余额更新和软删除。
- 流水与负债数据 API。
- CSV 账单解析、字段映射、清洗、分类、疑似查重、预览和确认导入。
- 月收入、月支出、月结余、储蓄率和安全现金月数计算。
- 储蓄目标、债务偿还和 What-if 确定性计算引擎。
- DeepSeek 储蓄目标意图解析。
- Chat 页面展示自然语言回复、结构化结果、假设和计算步骤。
- 计算历史保存、安全解析和回看。
- 财务仪表盘核心指标、现金流趋势和分类支出。

债务偿还目前是计算引擎和测试能力，不是完整债务管理页面。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- SQLite / libSQL
- Drizzle ORM
- Zod
- Decimal.js
- Vitest
- Recharts
- Papa Parse
- DeepSeek API

## 系统数据流

```txt
用户问题
→ Chat API
→ DeepSeek 意图解析
→ Zod 意图校验
→ 读取账户和流水
→ 确定性财务函数
→ 保存 calculation_history
→ 返回自然语言和结构化结果
→ 前端展示计算步骤
```

```txt
CSV 文件
→ 浏览器解析和字段映射
→ 服务端预览与疑似重复检测
→ 用户确认
→ 批量写入 transactions
→ 仪表盘和 Chat 读取
```

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例文件：

```bash
cp .env.example .env.local
```

然后填写本地配置。真实 `.env.local` 不得提交到 Git。

### 3. 初始化数据库

确认 `data/` 目录存在：

```bash
mkdir -p data
```

把 Drizzle schema 推送到本地数据库：

```bash
npm run db:push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问：

- 首页：<http://localhost:3000>
- 仪表盘：<http://localhost:3000/dashboard>
- CSV 导入：<http://localhost:3000/import>
- AI 对话：<http://localhost:3000/chat>
- 储蓄目标：<http://localhost:3000/goals>
- 场景模拟：<http://localhost:3000/scenarios>
- 计算历史：<http://localhost:3000/history>

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DB_FILE_NAME` | 是 | SQLite/libSQL 数据库地址，例如 `file:./data/finance.db` |
| `DEEPSEEK_API_KEY` | Chat 必填 | DeepSeek API 密钥，只在服务端读取 |
| `DEEPSEEK_MODEL` | 否 | DeepSeek 模型名称；不填写时使用项目默认值 |
| `CHAT_SAVINGS_ANNUAL_RATE` | 否 | Chat 储蓄目标使用的名义年化收益率百分比，默认 `3` |

不要把 `DEEPSEEK_API_KEY` 写进 README、测试代码或 Git。可选的
`DEEPSEEK_MODEL` 如果不使用，应保持未设置，而不是设置为空字符串。

## 数据库初始化

数据库表结构定义在：

```txt
lib/db/schema.ts
```

初始化或同步本地开发数据库：

```bash
npm run db:push
```

日常数据库和演示数据库应使用不同文件。第 34 课端到端验收使用：

```dotenv
DB_FILE_NAME=file:./data/mvp-demo.db
```

不要为了演示删除原数据库。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 创建生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run test` | 监听模式运行测试 |
| `npm run test:run` | 单次运行全部测试 |
| `npm run lint` | 运行 ESLint |
| `npm run db:push` | 把 Drizzle schema 推送到本地数据库 |
| `npm run check` | 依次运行测试、lint 和构建 |

## 完整演示

1. 使用独立演示数据库启动项目。
2. 在仪表盘创建现金、银行卡和投资账户。
3. 通过负债 API 创建一条演示负债。
4. 在 CSV 导入页选择账户并上传 UTF-8 CSV。
5. 检查字段映射、格式错误、分类和疑似重复。
6. 确认后把流水写入数据库。
7. 在仪表盘选择演示月份，查看核心指标和趋势。
8. 在 Chat 页面提问“我两年内能攒够 50 万吗？”。
9. 查看结构化计算结果、假设和计算步骤。
10. 复制历史 ID。
11. 在计算历史页面确认记录已经持久化。

真实 DeepSeek 请求会访问外部服务并可能产生费用，只应在明确的人工
验收中执行。普通自动测试使用假 Key 和 mock，不访问真实 DeepSeek。

## 测试策略

项目检查分为四层：

1. 纯函数单元测试：金额、现金流、储蓄目标、债务、What-if、
   仪表盘和 CSV 规则。
2. 业务编排测试：Chat 上下文、服务错误、历史结构和回复格式。
3. API 和响应契约：请求校验、稳定错误码与客户端 Zod schema。
4. 人工端到端验收：独立数据库、浏览器和一次显式真实 AI 请求。

运行完整自动检查：

```bash
npm run check
```

## 数据与计算口径

- 默认业务时区为 `Asia/Shanghai`。
- 当前 MVP 只汇总 CNY。
- 流水金额保存为非负字符串，收支由 `direction` 表示。
- `transfer` 不计入月收入和月支出。
- Chat 当前金额只使用 `cash` 和 `bank` 账户余额。
- Chat 月储蓄使用上海当前月份的月结余。
- 仪表盘资产包含 `cash`、`bank` 和 `investment`，不包含 `credit`。
- 仪表盘历史月份筛选不会生成历史资产快照。
- 资产负债率等于当前总负债除以当前总资产。
- 储蓄目标默认使用名义年化收益率和月末投入假设。

## 当前限制

- Chat 目前只完成储蓄目标意图的完整计算闭环。
- Chat 页面消息保存在 React 内存中，不是真正持久多轮对话。
- CSV 重复检测属于疑似重复，不是数据库唯一约束。
- 当前不支持多币种汇率换算。
- 当前没有账户和负债余额历史快照。
- 历史解析暂时复用当前储蓄目标请求 schema，未来需要按公式版本解析。
- 当前没有用户鉴权和多用户数据隔离。
- SQLite 数据库当前未做应用级加密。
- 当前项目用于学习和个人决策辅助，不构成专业财务建议。

## 项目结构

```txt
app/
├── api/                  # Route Handlers
├── chat/                 # AI 财务对话
├── dashboard/            # 仪表盘与账户管理
├── history/              # 计算历史
├── import/               # CSV 导入
├── goals/                # 储蓄目标
└── scenarios/            # What-if 场景
components/               # 页面组件
lib/
├── ai/                   # DeepSeek 调用与意图解析
├── chat/                 # Chat 业务编排
├── db/                   # Drizzle 与 SQLite
├── finance/              # 确定性计算引擎
├── import/               # CSV 解析与清洗
└── services/             # 数据访问服务
schemas/                  # Zod 运行时契约
tests/                    # 自动测试
docs/                     # 验收与项目文档
```
