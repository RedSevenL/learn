# 第 32 课：CSV 导入账单

## 本课目标

第 31 课已经把 Chat API 接到了真正可交互的对话页面。

项目现在能够：

```txt
输入财务问题
  ↓
调用 POST /api/chat
  ↓
展示自然语言回复
  ↓
展示结构化计算结果
  ↓
展开查看确定性计算过程
```

但是计算是否可信，最终取决于数据库中的账户和流水是否完整。

如果每一笔收入和支出都只能手动调用：

```txt
POST /api/transactions
```

真实账单会很难录入。

当前项目已经预留：

```txt
app/import/page.tsx
```

但它仍然只是一个静态占位页面。

这一课会把它改造成完整的 CSV 导入流程：

```txt
选择账户
  ↓
选择 CSV 文件
  ↓
浏览器读取文本
  ↓
解析表头和数据行
  ↓
映射到统一流水字段
  ↓
清洗日期、金额和收支方向
  ↓
自动建议分类
  ↓
服务端检查重复流水
  ↓
用户预览并手动修正
  ↓
用户确认
  ↓
服务端再次校验和查重
  ↓
批量写入 transactions
```

学完后，你应该能够：

- 说明 CSV 的基本结构以及它与 Excel 文件的区别。
- 解释为什么不能直接使用 `text.split(",")` 解析 CSV。
- 使用浏览器 `File` API 读取 UTF-8 文本。
- 使用成熟解析器处理引号、逗号、空行和表头。
- 把外部账单字段映射为项目内部字段。
- 区分原始行、待修正草稿、合法候选流水和数据库流水。
- 清洗日期、金额、收支方向和空白文本。
- 把负数金额转换为“正数金额 + expense 方向”。
- 使用确定性规则建议交易分类。
- 允许用户在导入前手动覆盖自动分类。
- 检查文件内部重复和数据库已有重复。
- 理解“疑似重复”与“数据库唯一约束”的区别。
- 在预览接口和确认接口中都执行服务端校验。
- 使用一次批量插入保存多笔流水。
- 保存 `source: "csv"` 和有限的 `rawPayload`。
- 对文件过大、缺少表头、字段无法识别和编码异常给出提示。
- 为解析、清洗、分类和重复键编写纯函数测试。
- 完成本课大纲要求的“上传、预览、确认、写库”闭环。

## 一、开始前先完成第 31 课

本课默认你已经完成：

```txt
课程内容/第30课-Chat-API闭环.md
课程内容/第31课-对话界面开发.md
```

并保留现有：

```txt
app/chat/page.tsx
app/api/chat/route.ts
components/chat/*
schemas/chat.ts
```

本课不会移动或重写聊天功能。

开始前进入项目：

```bash
cd ai-finance-cfo
npm run test:run
npm run lint
```

确认上一课没有遗留错误后再继续。

## 二、先确认当前流水模型

第 16 课已经建立 `transactions` 表：

```ts
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  accountId: text("account_id").references(() => accounts.id),
  occurredAt: integer("occurred_at").notNull(),
  amount: text("amount").notNull(),
  direction: text("direction").notNull(),
  category: text("category"),
  merchant: text("merchant"),
  note: text("note"),
  source: text("source").notNull(),
  rawPayload: text("raw_payload"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at")
});
```

第 17、18 课又建立了统一输入契约：

```ts
export const createTransactionSchema = z.object({
  accountId: z.string().trim().min(1, "账户 ID 不能为空"),
  occurredAt: z.number().int().positive("流水时间不能为空"),
  amount: positiveMoneyStringSchema,
  direction: transactionDirectionSchema,
  category: z.string().trim().optional(),
  merchant: z.string().trim().optional(),
  note: z.string().trim().optional(),
  source: transactionSourceSchema.default("manual"),
  rawPayload: z.string().optional()
});
```

CSV 导入不能绕过这套模型。

无论银行、支付宝或微信提供什么表头，进入数据库前都必须变成：

```txt
accountId
occurredAt
amount
direction
category
merchant
note
source
rawPayload
```

其中本课固定：

```txt
source = "csv"
```

## 三、本课边界

本课会完成：

- 选择一个已有账户。
- 选择一个 `.csv` 文件。
- 限制文件大小和最大数据行数。
- 解析 CSV 表头与数据行。
- 自动猜测常见中文和英文字段。
- 允许用户修正字段映射。
- 清洗每一行数据。
- 标记格式错误的行。
- 自动建议分类。
- 在预览中手动修改分类。
- 文件内重复检测。
- 数据库重复检测。
- 用户勾选要导入的行。
- 确认后批量写入数据库。
- 显示成功、跳过和失败数量。

本课不会完成：

- 直接解析 `.xlsx` 或 `.xls`。
- 为每一家银行编写永久专用适配器。
- 自动识别任意未知日期格式。
- 处理外币换算。
- 自动拆分一笔复合交易。
- 根据余额反推缺失流水。
- 用 LLM 猜测金额或日期。
- 后台异步导入任务。
- 百万行文件的流式处理。
- 导入撤销。
- 永久保存字段映射模板。
- 在数据库中增加正式的唯一指纹列。

这些能力可以在后续产品化阶段补充。

## 四、当前导入页是什么状态

当前：

```txt
app/import/page.tsx
```

只展示：

```txt
页面标题
上传区域占位
导入流程说明
```

它还没有：

```txt
"use client"
账户选择
文件 input
File.text()
CSV 解析
字段映射
数据预览
错误行
重复检测
确认导入
```

本课会替换这个占位页。

不要修改：

```txt
app/layout.tsx
```

现有导航已经包含 `/import`。

## 五、最终职责划分

最终结构建议为：

```txt
app/import/page.tsx
  ├── 选择账户和文件
  ├── 调用浏览器文件读取
  ├── 展示字段映射
  ├── 展示预览表
  ├── 允许手动修正
  └── 调用预览与确认 API

lib/import/csv-parser.ts
  └── CSV 文本 → 表头和原始行

lib/import/normalize-csv-row.ts
  └── 原始行 + 字段映射 → 候选流水或行错误

lib/import/infer-category.ts
  └── 商户和备注 → 建议分类

lib/import/duplicate-key.ts
  └── 流水关键字段 → 疑似重复键

schemas/csv-import.ts
  └── 预览和确认接口的运行时契约

lib/services/csv-import.ts
  ├── 查询已有流水
  ├── 标记重复
  └── 批量写入新流水

app/api/imports/csv/preview/route.ts
  └── 服务端校验并检查重复

app/api/imports/csv/confirm/route.ts
  └── 再次校验、再次查重并写入
```

这里最重要的边界是：

```txt
浏览器预览
不等于
服务端已经接受
```

浏览器负责交互体验，服务端仍然拥有最终决定权。

## 六、CSV 到底是什么

CSV 是：

```txt
Comma-Separated Values
```

最简单的文件可能是：

```csv
交易日期,金额,收支类型,交易对象,分类,备注
2026-07-01,-36.50,支出,早餐店,餐饮,早餐
2026-07-05,20000.00,收入,某某公司,工资,七月工资
```

第一行通常是表头，后续每一行是一条记录。

但真实 CSV 还可能出现：

```csv
交易日期,金额,交易对象,备注
2026-07-01,-88.00,"便利店,人民广场店","购买饮料,纸巾"
```

引号内部的逗号不是字段分隔符。

还可能出现：

```csv
交易日期,金额,备注
2026-07-01,-120.00,"聚餐
朋友已转回一半"
```

引号内部甚至可以包含换行。

因此下面的实现不可靠：

```ts
const rows = text.split("\n");
const cells = row.split(",");
```

它无法正确处理：

- 引号中的逗号。
- 引号中的换行。
- 转义引号。
- Windows 换行符。
- 空白行。
- UTF-8 BOM。

## 七、安装 CSV 解析器

本课使用 `papaparse` 处理 CSV 语法：

```bash
npm install papaparse
npm install -D @types/papaparse
```

Papa Parse 官方文档说明：启用 `header` 后，重复表头会被自动重命名，原表头会记录在 `meta.renamedHeaders`；`skipEmptyLines: "greedy"` 会跳过只包含分隔符、引号或空白的空行。[查看 Papa Parse 官方文档](https://www.papaparse.com/docs)

这里使用第三方库不是为了跳过学习，而是为了把精力放在本课真正重要的业务问题上：

```txt
字段映射
数据清洗
重复检测
预览确认
可靠写库
```

不要为了这节课自己实现一套完整 CSV 标准解析器。

安装完成后检查：

```bash
npm run lint
```

## 八、先准备一份练习文件

在你方便的位置创建：

```txt
transactions-demo.csv
```

内容如下：

```csv
交易日期,金额,收支类型,交易对象,分类,备注
2026-07-01,-36.50,支出,早餐店,,早餐
2026-07-02,-128.00,支出,盒马鲜生,,日用品
2026-07-03,-35.00,支出,地铁,,通勤
2026-07-05,20000.00,收入,某某公司,工资,七月工资
2026-07-06,-199.00,支出,中国移动,,手机话费
2026-07-06,-199.00,支出,中国移动,,手机话费
错误日期,-20.00,支出,未知商户,,这一行应报错
```

这份文件故意包含：

- 正常支出。
- 正常收入。
- 空分类。
- 两条相同流水。
- 一条错误日期。

这样可以同时验证成功、自动分类、重复和格式错误。

## 九、先定义支持的字段

创建：

```txt
lib/import/csv-types.ts
```

写入：

```ts
import type { z } from "zod";
import { transactionDirectionSchema } from "@/schemas/finance";

type TransactionDirection = z.infer<
  typeof transactionDirectionSchema
>;

export type CsvRawRow = Record<string, string>;

export type CsvFieldMapping = {
  occurredAt: string;
  amount: string;
  direction?: string;
  category?: string;
  merchant?: string;
  note?: string;
};

export type CsvCandidate = {
  rowNumber: number;
  occurredAt: number;
  amount: string;
  direction: TransactionDirection;
  category?: string;
  merchant?: string;
  note?: string;
  rawPayload: string;
};

export type CsvRowIssue = {
  field: keyof CsvFieldMapping | "row";
  message: string;
};

export type CsvDraftRow =
  | {
      status: "valid";
      candidate: CsvCandidate;
    }
  | {
      status: "invalid";
      rowNumber: number;
      raw: CsvRawRow;
      issues: CsvRowIssue[];
    };
```

当前 `types/finance.ts` 只包含账户类型，还没有导出 `TransactionDirection`。

因此这里直接从现有 Zod schema 推导，不要复制一套容易漂移的联合类型：

```ts
import type { z } from "zod";
import { transactionDirectionSchema } from "@/schemas/finance";

export type TransactionDirection = z.infer<
  typeof transactionDirectionSchema
>;
```

关键原则是：

```txt
数据库方向枚举
CSV 候选方向枚举
API 方向枚举
```

应该来自同一个事实来源。

## 十、原始行、草稿行和数据库行不能混为一谈

原始 CSV 行可能是：

```ts
{
  交易日期: "2026/07/01",
  金额: "-36.5 元",
  收支类型: "支出",
  交易对象: " 早餐店 ",
  分类: "",
  备注: "早餐"
}
```

它不符合数据库输入。

清洗后的候选流水应该是：

```ts
{
  rowNumber: 2,
  occurredAt: 1782835200000,
  amount: "36.50",
  direction: "expense",
  category: "餐饮",
  merchant: "早餐店",
  note: "早餐",
  rawPayload: "{\"交易日期\":\"2026/07/01\",...}"
}
```

确认写库时才补上：

```ts
{
  id: crypto.randomUUID(),
  accountId,
  source: "csv",
  createdAt: Date.now(),
  updatedAt: Date.now()
}
```

分层以后，每一步都更容易测试。

## 十一、解析 CSV 文本

创建：

```txt
lib/import/csv-parser.ts
```

写入：

```ts
import Papa from "papaparse";
import type { CsvRawRow } from "@/lib/import/csv-types";

const MAX_CSV_ROWS = 1000;

export type ParsedCsv = {
  fields: string[];
  rows: CsvRawRow[];
};

export function parseCsvText(text: string): ParsedCsv {
  if (text.includes("\uFFFD")) {
    throw new Error("文件可能不是 UTF-8 编码，请转换编码后重试");
  }

  const result = Papa.parse<CsvRawRow>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim()
  });

  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    throw new Error(
      `CSV 第 ${firstError.row + 2} 行无法解析：${firstError.message}`
    );
  }

  const fields = result.meta.fields ?? [];

  if (fields.length === 0) {
    throw new Error("CSV 缺少表头");
  }

  const renamedHeaders = result.meta.renamedHeaders ?? {};

  if (Object.keys(renamedHeaders).length > 0) {
    const firstOriginalHeader =
      Object.values(renamedHeaders)[0];
    throw new Error(`CSV 存在重复表头：${firstOriginalHeader}`);
  }

  if (result.data.length === 0) {
    throw new Error("CSV 没有可导入的数据行");
  }

  if (result.data.length > MAX_CSV_ROWS) {
    throw new Error(`单次最多导入 ${MAX_CSV_ROWS} 行`);
  }

  return {
    fields,
    rows: result.data
  };
}
```

注意：

```txt
Papa Parse 的 error.row
```

通常是数据数组中的零基索引。

CSV 第一行又是表头，因此显示给用户时要转换成接近文件编辑器中的实际行号。

## 十二、读取浏览器文件

页面中的文件读取可以保持简单：

```ts
const MAX_FILE_BYTES = 2 * 1024 * 1024;

async function readCsvFile(file: File) {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("请选择 .csv 文件");
  }

  if (file.size === 0) {
    throw new Error("文件内容为空");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("文件不能超过 2 MB");
  }

  const text = await file.text();
  return parseCsvText(text);
}
```

文件扩展名检查只是友好提示，不是安全边界。

真正的数据仍然要经过：

```txt
CSV 解析
字段映射
逐行清洗
Zod 服务端校验
```

## 十三、字段映射是什么

不同来源可能使用不同表头：

```txt
交易日期
日期
交易时间
Date
Transaction Date
```

它们都可能对应内部：

```txt
occurredAt
```

类似地：

```txt
金额
交易金额
Amount
收支金额
```

都可能对应：

```txt
amount
```

字段映射就是明确告诉系统：

```ts
{
  occurredAt: "交易日期",
  amount: "金额",
  direction: "收支类型",
  category: "分类",
  merchant: "交易对象",
  note: "备注"
}
```

其中：

```txt
occurredAt
amount
```

是必填映射。

其余字段可以缺失。

## 十四、自动猜测字段映射

在：

```txt
lib/import/guess-field-mapping.ts
```

写入：

```ts
import type { CsvFieldMapping } from "@/lib/import/csv-types";

const FIELD_ALIASES = {
  occurredAt: ["交易日期", "交易时间", "日期", "date", "transaction date"],
  amount: ["金额", "交易金额", "收支金额", "amount"],
  direction: ["收支类型", "收支", "方向", "direction", "type"],
  category: ["分类", "交易分类", "category"],
  merchant: ["交易对象", "商户", "对方", "merchant", "payee"],
  note: ["备注", "说明", "摘要", "note", "description"]
} as const;

function findHeader(headers: string[], aliases: readonly string[]) {
  return headers.find((header) =>
    aliases.includes(header.trim().toLowerCase())
  );
}

export function guessFieldMapping(
  headers: string[]
): Partial<CsvFieldMapping> {
  const normalizedAliases = Object.fromEntries(
    Object.entries(FIELD_ALIASES).map(([field, aliases]) => [
      field,
      aliases.map((alias) => alias.toLowerCase())
    ])
  ) as Record<keyof CsvFieldMapping, string[]>;

  const mapping: Partial<CsvFieldMapping> = {};

  for (const field of Object.keys(
    normalizedAliases
  ) as Array<keyof CsvFieldMapping>) {
    const header = findHeader(headers, normalizedAliases[field]);

    if (header) {
      mapping[field] = header;
    }
  }

  return mapping;
}
```

自动猜测只是默认值。

页面必须允许用户通过 `<select>` 修改。

不要因为表头叫“金额”就假定：

```txt
负数一定是支出
正数一定是收入
```

这个规则要在下一步明确处理。

## 十五、字段映射表单

字段映射区域可以展示：

```txt
内部字段       CSV 表头          是否必填
交易日期       [交易日期 ▼]      是
金额           [金额 ▼]          是
收支方向       [收支类型 ▼]      否
分类           [分类 ▼]          否
商户           [交易对象 ▼]      否
备注           [备注 ▼]          否
```

可选字段的第一个选项应该是：

```txt
不导入此字段
```

保存映射前检查：

- 日期已映射。
- 金额已映射。
- 同一个 CSV 表头没有被映射到两个内部字段。
- 映射值确实存在于当前文件表头中。

不要把上一个文件的映射直接用于新文件。

用户重新选择文件时，应清空旧预览、旧重复状态和旧成功消息。

## 十六、先实现文本清洗

创建：

```txt
lib/import/normalize-csv-row.ts
```

先写一个辅助函数：

```ts
function optionalText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
```

这样：

```txt
" 早餐店 " → "早餐店"
""          → undefined
"   "       → undefined
```

数据库中就不会出现大量没有意义的空字符串。

## 十七、清洗日期

本课只接受明确格式：

```txt
YYYY-MM-DD
YYYY/MM/DD
```

实现：

```ts
function parseShanghaiDate(value: string) {
  const normalized = value.trim().replaceAll("/", "-");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error("日期必须是 YYYY-MM-DD 或 YYYY/MM/DD");
  }

  const timestamp = Date.parse(`${normalized}T00:00:00+08:00`);

  if (!Number.isFinite(timestamp)) {
    throw new Error("日期无效");
  }

  const [year, month, day] = normalized.split("-").map(Number);
  const shanghaiDate = new Date(timestamp + 8 * 60 * 60 * 1000);

  if (
    shanghaiDate.getUTCFullYear() !== year ||
    shanghaiDate.getUTCMonth() + 1 !== month ||
    shanghaiDate.getUTCDate() !== day
  ) {
    throw new Error(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} 不是有效日期`
    );
  }

  return timestamp;
}
```

为什么不直接写：

```ts
new Date(value).getTime()
```

因为模糊日期字符串在不同运行环境中的解释可能不同。

本项目的业务时区已经约定为：

```txt
Asia/Shanghai
```

所以日期转换也要明确使用 `+08:00`。

## 十八、清洗金额

外部金额可能是：

```txt
-36.5
20,000.00
￥128.00
128 元
(88.00)
```

本课支持：

- 千分位逗号。
- `¥`、`￥` 和“元”。
- 前导正负号。
- 括号负数。

使用项目已有 `decimal.js`：

```ts
import Decimal from "decimal.js";

type ParsedAmount = {
  absoluteAmount: string;
  sign: "positive" | "negative" | "zero";
};

function parseAmount(value: string): ParsedAmount {
  const trimmed = value.trim();
  const isParenthesized =
    trimmed.startsWith("(") && trimmed.endsWith(")");

  const cleaned = trimmed
    .replaceAll(",", "")
    .replace(/[¥￥元\s]/g, "")
    .replace(/^\((.*)\)$/, "-$1");

  if (!/^[+-]?\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("金额格式不正确");
  }

  const decimal = new Decimal(cleaned);

  if (decimal.isZero()) {
    throw new Error("金额不能为 0");
  }

  const negative = isParenthesized || decimal.isNegative();

  return {
    absoluteAmount: decimal.abs().toFixed(2),
    sign: negative ? "negative" : "positive"
  };
}
```

数据库约定：

```txt
amount 保存非负数字字符串
direction 单独保存 income / expense / transfer
```

因此：

```txt
-36.50
```

不是直接保存为负金额，而是转换成：

```ts
{
  amount: "36.50",
  direction: "expense"
}
```

## 十九、清洗收支方向

先定义外部值映射：

```ts
const DIRECTION_ALIASES = {
  income: ["收入", "入账", "income", "credit"],
  expense: ["支出", "出账", "expense", "debit"],
  transfer: ["转账", "内部转账", "transfer"]
} as const;

function parseDirection(
  value: string | undefined,
  amountSign: "positive" | "negative" | "zero"
) {
  const normalized = value?.trim().toLowerCase();

  if (normalized) {
    for (const [direction, aliases] of Object.entries(
      DIRECTION_ALIASES
    )) {
      if ((aliases as readonly string[]).includes(normalized)) {
        return direction as "income" | "expense" | "transfer";
      }
    }

    throw new Error(`无法识别收支方向：${value}`);
  }

  return amountSign === "negative" ? "expense" : "income";
}
```

规则是：

```txt
有方向列
  → 优先使用方向列

没有方向列
  → 负数推断为 expense
  → 正数推断为 income
```

如果方向列写“支出”，金额却是正数，不一定是错误。

很多账单会使用：

```txt
金额始终为正数
方向单独表示收支
```

因此本课不会因为符号与显式方向不同而拒绝，只把金额转成绝对值。

## 二十、自动建议分类

创建：

```txt
lib/import/infer-category.ts
```

写入：

```ts
type CategoryRule = {
  category: string;
  keywords: string[];
};

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "工资",
    keywords: ["工资", "薪资", "salary"]
  },
  {
    category: "餐饮",
    keywords: ["餐", "咖啡", "奶茶", "美团外卖", "饿了么"]
  },
  {
    category: "交通",
    keywords: ["地铁", "公交", "滴滴", "铁路", "航空"]
  },
  {
    category: "购物",
    keywords: ["淘宝", "天猫", "京东", "拼多多", "盒马"]
  },
  {
    category: "居住",
    keywords: ["房租", "物业", "燃气", "电费", "水费"]
  },
  {
    category: "通讯",
    keywords: ["移动", "联通", "电信", "话费"]
  }
];

export function inferCategory(input: {
  category?: string;
  merchant?: string;
  note?: string;
}) {
  const explicitCategory = input.category?.trim();

  if (explicitCategory) {
    return {
      category: explicitCategory,
      source: "csv" as const
    };
  }

  const searchableText = `${input.merchant ?? ""} ${input.note ?? ""}`
    .trim()
    .toLowerCase();

  const matchedRule = CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) =>
      searchableText.includes(keyword.toLowerCase())
    )
  );

  return {
    category: matchedRule?.category ?? "未分类",
    source: matchedRule ? ("rule" as const) : ("fallback" as const)
  };
}
```

为什么本课不调用 DeepSeek 分类？

因为基础分类规则：

- 可重复。
- 可测试。
- 无网络依赖。
- 无额外费用。
- 不会把完整账单发送给第三方。
- 用户可以明确修正。

未来可以增加 AI 建议，但 AI 仍然只能提供建议，不能跳过用户确认。

## 二十一、完成单行归一化

继续在：

```txt
lib/import/normalize-csv-row.ts
```

实现：

```ts
import { inferCategory } from "@/lib/import/infer-category";
import type {
  CsvDraftRow,
  CsvFieldMapping,
  CsvRawRow
} from "@/lib/import/csv-types";

function readMappedValue(
  row: CsvRawRow,
  header: string | undefined
) {
  return header ? row[header] : undefined;
}

export function normalizeCsvRow(input: {
  row: CsvRawRow;
  rowNumber: number;
  mapping: CsvFieldMapping;
}): CsvDraftRow {
  const { row, rowNumber, mapping } = input;
  const issues: Array<{
    field: keyof CsvFieldMapping | "row";
    message: string;
  }> = [];

  let occurredAt: number | undefined;
  let amount:
    | {
        absoluteAmount: string;
        sign: "positive" | "negative" | "zero";
      }
    | undefined;

  try {
    occurredAt = parseShanghaiDate(
      readMappedValue(row, mapping.occurredAt) ?? ""
    );
  } catch (error) {
    issues.push({
      field: "occurredAt",
      message:
        error instanceof Error ? error.message : "日期格式不正确"
    });
  }

  try {
    amount = parseAmount(
      readMappedValue(row, mapping.amount) ?? ""
    );
  } catch (error) {
    issues.push({
      field: "amount",
      message:
        error instanceof Error ? error.message : "金额格式不正确"
    });
  }

  let direction: "income" | "expense" | "transfer" | undefined;

  if (amount) {
    try {
      direction = parseDirection(
        readMappedValue(row, mapping.direction),
        amount.sign
      );
    } catch (error) {
      issues.push({
        field: "direction",
        message:
          error instanceof Error ? error.message : "收支方向不正确"
      });
    }
  }

  if (
    issues.length > 0 ||
    occurredAt === undefined ||
    amount === undefined ||
    direction === undefined
  ) {
    return {
      status: "invalid",
      rowNumber,
      raw: row,
      issues
    };
  }

  const merchant = optionalText(
    readMappedValue(row, mapping.merchant)
  );
  const note = optionalText(readMappedValue(row, mapping.note));
  const originalCategory = optionalText(
    readMappedValue(row, mapping.category)
  );
  const categoryResult = inferCategory({
    category: originalCategory,
    merchant,
    note
  });

  return {
    status: "valid",
    candidate: {
      rowNumber,
      occurredAt,
      amount: amount.absoluteAmount,
      direction,
      category: categoryResult.category,
      merchant,
      note,
      rawPayload: JSON.stringify(row)
    }
  };
}
```

批量处理时：

```ts
const drafts = parsed.rows.map((row, index) =>
  normalizeCsvRow({
    row,
    rowNumber: index + 2,
    mapping
  })
);
```

这里的 `+ 2` 表示：

```txt
数组索引 0
  +
CSV 表头占 1 行
  +
文件行号从 1 开始
  =
显示为第 2 行
```

## 二十二、为 API 建立 Zod 契约

创建：

```txt
schemas/csv-import.ts
```

写入：

```ts
import * as z from "zod";
import {
  positiveMoneyStringSchema,
  transactionDirectionSchema
} from "@/schemas/finance";

const optionalCsvTextSchema = z
  .string()
  .trim()
  .max(200, "文本字段不能超过 200 个字符")
  .optional();

export const csvImportCandidateSchema = z.object({
  rowNumber: z.number().int().min(2),
  occurredAt: z.number().int().positive(),
  amount: positiveMoneyStringSchema,
  direction: transactionDirectionSchema,
  category: optionalCsvTextSchema,
  merchant: optionalCsvTextSchema,
  note: z.string().trim().max(500).optional(),
  rawPayload: z.string().max(5000, "原始行内容过长")
});

export const csvImportRequestSchema = z.object({
  accountId: z.string().trim().min(1, "请选择账户"),
  rows: z
    .array(csvImportCandidateSchema)
    .min(1, "没有可处理的流水")
    .max(1000, "单次最多处理 1000 条流水")
});

export type CsvImportCandidate = z.infer<
  typeof csvImportCandidateSchema
>;

export type CsvImportRequest = z.infer<
  typeof csvImportRequestSchema
>;
```

客户端的 TypeScript 类型用于开发体验。

服务端的 Zod schema 才是运行时边界。

## 二十三、什么算疑似重复

本课使用以下字段构造重复键：

```txt
accountId
occurredAt
amount
direction
merchant
```

创建：

```txt
lib/import/duplicate-key.ts
```

写入：

```ts
import Decimal from "decimal.js";

type DuplicateKeyInput = {
  accountId: string;
  occurredAt: number;
  amount: string;
  direction: string;
  merchant?: string | null;
};

function normalizeMerchant(merchant?: string | null) {
  return merchant?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

export function buildTransactionDuplicateKey(
  input: DuplicateKeyInput
) {
  return [
    input.accountId,
    input.occurredAt,
    new Decimal(input.amount).toFixed(2),
    input.direction,
    normalizeMerchant(input.merchant)
  ].join("|");
}
```

例如：

```txt
account_001|1783267200000|199.00|expense|中国移动
```

金额统一为两位小数，商户统一大小写和连续空格。

## 二十四、为什么它只能叫“疑似重复”

两笔真实交易可能恰好满足：

```txt
同一账户
同一天
同一金额
同一方向
同一商户
```

例如同一天两次购买相同价格的咖啡。

因此本课的重复键不是数学意义上的交易身份证。

界面应该显示：

```txt
疑似重复
```

而不是：

```txt
绝对重复
```

生产系统更理想的做法是使用账单来源提供的：

```txt
外部交易 ID
```

并建立：

```txt
source + accountId + externalTransactionId
```

的数据库唯一约束。

当前表没有 `externalTransactionId`，所以本课先使用保守的候选重复检测。

## 二十五、检查文件内部重复

在发送预览请求前就可以标记文件内重复：

```ts
export function findDuplicateRowsInFile(input: {
  accountId: string;
  rows: CsvImportCandidate[];
}) {
  const firstRowByKey = new Map<string, number>();
  const duplicateOf = new Map<number, number>();

  for (const row of input.rows) {
    const key = buildTransactionDuplicateKey({
      accountId: input.accountId,
      ...row
    });
    const firstRowNumber = firstRowByKey.get(key);

    if (firstRowNumber !== undefined) {
      duplicateOf.set(row.rowNumber, firstRowNumber);
      continue;
    }

    firstRowByKey.set(key, row.rowNumber);
  }

  return duplicateOf;
}
```

后出现的相同行标记为：

```txt
与第 7 行疑似重复
```

第一行仍然可以保留。

## 二十六、服务端查询已有流水

在：

```txt
lib/services/transactions.ts
```

增加：

```ts
import { and, eq, isNull } from "drizzle-orm";
```

然后增加：

```ts
export async function listTransactionsByAccountId(
  accountId: string
) {
  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.accountId, accountId),
        isNull(transactions.deletedAt)
      )
    );
}
```

当前教程数据量较小，先读取这个账户的有效流水并在内存中构造键集合。

数据量变大后，应增加：

- 日期范围查询。
- 分页。
- 数据库索引。
- 正式指纹列或外部交易 ID。

## 二十七、实现重复检测服务

创建：

```txt
lib/services/csv-import.ts
```

写入：

```ts
import { buildTransactionDuplicateKey } from "@/lib/import/duplicate-key";
import {
  createTransactions,
  listTransactionsByAccountId
} from "@/lib/services/transactions";
import type {
  CsvImportCandidate,
  CsvImportRequest
} from "@/schemas/csv-import";

export type PreviewedCsvRow = CsvImportCandidate & {
  duplicate: boolean;
  duplicateReason?: "same_file" | "database";
  duplicateOfRowNumber?: number;
};

export async function previewCsvImport(
  input: CsvImportRequest
): Promise<PreviewedCsvRow[]> {
  const existingTransactions =
    await listTransactionsByAccountId(input.accountId);

  const databaseKeys = new Set(
    existingTransactions.map((transaction) =>
      buildTransactionDuplicateKey({
        accountId: input.accountId,
        occurredAt: transaction.occurredAt,
        amount: transaction.amount,
        direction: transaction.direction,
        merchant: transaction.merchant
      })
    )
  );

  const firstRowByKey = new Map<string, number>();

  return input.rows.map((row) => {
    const key = buildTransactionDuplicateKey({
      accountId: input.accountId,
      ...row
    });
    const firstRowNumber = firstRowByKey.get(key);

    if (firstRowNumber !== undefined) {
      return {
        ...row,
        duplicate: true,
        duplicateReason: "same_file",
        duplicateOfRowNumber: firstRowNumber
      };
    }

    firstRowByKey.set(key, row.rowNumber);

    if (databaseKeys.has(key)) {
      return {
        ...row,
        duplicate: true,
        duplicateReason: "database"
      };
    }

    return {
      ...row,
      duplicate: false
    };
  });
}
```

## 二十八、增加批量创建流水

继续修改：

```txt
lib/services/transactions.ts
```

增加：

```ts
export async function createTransactions(
  inputs: CreateTransactionInput[]
) {
  if (inputs.length === 0) {
    return [];
  }

  const now = Date.now();
  const newTransactions = inputs.map((input) => ({
    id: crypto.randomUUID(),
    accountId: input.accountId,
    occurredAt: input.occurredAt,
    amount: input.amount,
    direction: input.direction,
    category: input.category,
    merchant: input.merchant,
    note: input.note,
    source: input.source,
    rawPayload: input.rawPayload,
    createdAt: now,
    updatedAt: now
  }));

  await db.insert(transactions).values(newTransactions);

  return newTransactions;
}
```

为什么不在循环中调用一千次：

```ts
await createTransaction(row);
```

因为那会产生大量独立数据库往返，而且中途失败时更难解释已经写入了多少。

本课使用一次批量 `INSERT`。

## 二十九、预览接口还要确认账户存在

用户可能提交一个已经删除或不存在的 `accountId`。

所以 API route 不能只检查字符串非空。

预览和确认都要调用现有：

```ts
getAccountById(accountId)
```

不存在时返回：

```txt
404 ACCOUNT_NOT_FOUND
```

客户端账户下拉框只是用户体验，不是权限或完整性边界。

## 三十、实现预览接口

创建：

```txt
app/api/imports/csv/preview/route.ts
```

写入：

```ts
import { errorResponse, successResponse } from "@/lib/api/response";
import { getAccountById } from "@/lib/services/accounts";
import { previewCsvImport } from "@/lib/services/csv-import";
import { csvImportRequestSchema } from "@/schemas/csv-import";
import { formatZodError } from "@/schemas/format-zod-error";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "INVALID_JSON",
      "请求体不是合法 JSON",
      { status: 400 }
    );
  }

  const result = csvImportRequestSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "导入数据不合法",
      { status: 400 },
      { issues: formatZodError(result.error) }
    );
  }

  const account = await getAccountById(result.data.accountId);

  if (!account) {
    return errorResponse(
      "ACCOUNT_NOT_FOUND",
      "账户不存在或已删除",
      { status: 404 }
    );
  }

  const rows = await previewCsvImport(result.data);

  return successResponse({
    rows,
    summary: {
      total: rows.length,
      ready: rows.filter((row) => !row.duplicate).length,
      duplicate: rows.filter((row) => row.duplicate).length
    }
  });
}
```

预览接口不会写数据库。

它是只读操作。

## 三十一、实现确认导入服务

继续在：

```txt
lib/services/csv-import.ts
```

增加：

```ts
export async function confirmCsvImport(
  input: CsvImportRequest
) {
  const previewedRows = await previewCsvImport(input);
  const readyRows = previewedRows.filter((row) => !row.duplicate);
  const duplicateRows = previewedRows.filter((row) => row.duplicate);

  const created = await createTransactions(
    readyRows.map((row) => ({
      accountId: input.accountId,
      occurredAt: row.occurredAt,
      amount: row.amount,
      direction: row.direction,
      category: row.category,
      merchant: row.merchant,
      note: row.note,
      source: "csv" as const,
      rawPayload: row.rawPayload
    }))
  );

  return {
    created,
    skippedRows: duplicateRows.map((row) => ({
      rowNumber: row.rowNumber,
      reason: row.duplicateReason
    }))
  };
}
```

注意这里没有相信浏览器传来的：

```txt
duplicate: false
```

确认时重新调用了：

```txt
previewCsvImport
```

因为用户预览后到点击确认前，数据库可能已经发生变化。

## 三十二、实现确认接口

创建：

```txt
app/api/imports/csv/confirm/route.ts
```

写入：

```ts
import { errorResponse, successResponse } from "@/lib/api/response";
import { getAccountById } from "@/lib/services/accounts";
import { confirmCsvImport } from "@/lib/services/csv-import";
import { csvImportRequestSchema } from "@/schemas/csv-import";
import { formatZodError } from "@/schemas/format-zod-error";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "INVALID_JSON",
      "请求体不是合法 JSON",
      { status: 400 }
    );
  }

  const result = csvImportRequestSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "导入数据不合法",
      { status: 400 },
      { issues: formatZodError(result.error) }
    );
  }

  const account = await getAccountById(result.data.accountId);

  if (!account) {
    return errorResponse(
      "ACCOUNT_NOT_FOUND",
      "账户不存在或已删除",
      { status: 404 }
    );
  }

  try {
    const resultData = await confirmCsvImport(result.data);

    return successResponse(
      {
        imported: resultData.created.length,
        skipped: resultData.skippedRows.length,
        transactions: resultData.created,
        skippedRows: resultData.skippedRows
      },
      { status: 201 }
    );
  } catch {
    return errorResponse(
      "CSV_IMPORT_FAILED",
      "保存流水失败，请稍后重试",
      { status: 500 }
    );
  }
}
```

不要把数据库原始错误直接返回给浏览器。

## 三十三、当前查重仍然存在什么并发边界

确认接口执行的是：

```txt
查询已有流水
  ↓
过滤重复
  ↓
批量 INSERT
```

在两个请求同时到达时，理论上可能出现：

```txt
请求 A 查询：不存在
请求 B 查询：不存在
请求 A 写入
请求 B 写入
```

这叫竞态条件。

当前项目是本地单用户学习应用，本课先接受这个限制。

生产方案应该增加：

- 稳定的外部交易 ID。
- 数据库指纹列。
- 唯一索引。
- 事务内的冲突处理。
- 幂等导入批次 ID。

教程中要明确限制，不能把“应用层查重”描述成绝对防重。

## 三十四、页面为什么必须是 Client Component

导入页需要使用：

```txt
useState
useEffect
文件 input
File.text()
change 事件
按钮事件
浏览器 fetch
```

因此：

```txt
app/import/page.tsx
```

第一行需要：

```ts
"use client";
```

数据库查询仍然不能直接写进这个组件。

客户端通过：

```txt
GET /api/accounts
POST /api/imports/csv/preview
POST /api/imports/csv/confirm
```

与服务端通信。

## 三十五、页面状态设计

导入页至少需要：

```ts
const [accounts, setAccounts] = useState<AccountOption[]>([]);
const [accountId, setAccountId] = useState("");
const [fileName, setFileName] = useState("");
const [headers, setHeaders] = useState<string[]>([]);
const [rawRows, setRawRows] = useState<CsvRawRow[]>([]);
const [mapping, setMapping] =
  useState<Partial<CsvFieldMapping>>({});
const [drafts, setDrafts] = useState<CsvDraftRow[]>([]);
const [previewRows, setPreviewRows] =
  useState<PreviewRow[]>([]);
const [selectedRows, setSelectedRows] =
  useState<Set<number>>(new Set());
const [stage, setStage] = useState<
  "idle" | "mapping" | "preview" | "done"
>("idle");
const [isPreviewing, setIsPreviewing] = useState(false);
const [isImporting, setIsImporting] = useState(false);
const [error, setError] = useState<string | null>(null);
const [result, setResult] = useState<ImportResult | null>(null);
```

不要只用一个：

```ts
const [loading, setLoading] = useState(false);
```

因为：

```txt
加载账户
解析文件
请求预览
确认导入
```

是不同状态。

## 三十六、推荐页面阶段

页面流程可以建模为：

```txt
idle
  ↓ 选择文件
mapping
  ↓ 应用映射并清洗
preview
  ↓ 确认导入
done
```

返回上一步时：

```txt
preview → mapping
```

要清空服务端重复检测结果。

重新选择文件时：

```txt
任意状态 → idle → mapping
```

要清空：

- 旧文件名。
- 旧表头。
- 旧原始行。
- 旧草稿。
- 旧勾选状态。
- 旧导入结果。
- 旧错误。

## 三十七、加载账户选项

页面挂载后调用：

```ts
useEffect(() => {
  let cancelled = false;

  async function loadAccounts() {
    const response = await fetch("/api/accounts");
    const body: unknown = await response.json();

    // 按第 31 课相同原则：
    // 使用 Zod 校验 body 后再写入状态。

    if (!cancelled) {
      setAccounts(parsed.data.accounts);
    }
  }

  void loadAccounts();

  return () => {
    cancelled = true;
  };
}, []);
```

如果没有账户，页面应提示：

```txt
请先到账户页面创建账户，再导入账单。
```

并禁用文件选择或下一步按钮。

不要给导入流水自动创建一个“默认账户”。

## 三十八、文件选择控件

使用原生输入：

```tsx
<input
  type="file"
  accept=".csv,text/csv"
  onChange={handleFileChange}
  disabled={isPreviewing || isImporting}
/>
```

`accept` 只影响选择器提示，不是服务端校验。

文件选择后：

```ts
async function handleFileChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  resetImportState();

  try {
    const parsed = await readCsvFile(file);
    setFileName(file.name);
    setHeaders(parsed.fields);
    setRawRows(parsed.rows);
    setMapping(guessFieldMapping(parsed.fields));
    setStage("mapping");
  } catch (error) {
    setError(
      error instanceof Error ? error.message : "无法读取 CSV 文件"
    );
  }
}
```

## 三十九、应用字段映射

用户点击“生成预览”时：

```ts
function buildDrafts() {
  if (!mapping.occurredAt || !mapping.amount) {
    setError("请先映射交易日期和金额");
    return;
  }

  const completeMapping: CsvFieldMapping = {
    occurredAt: mapping.occurredAt,
    amount: mapping.amount,
    direction: mapping.direction,
    category: mapping.category,
    merchant: mapping.merchant,
    note: mapping.note
  };

  const nextDrafts = rawRows.map((row, index) =>
    normalizeCsvRow({
      row,
      rowNumber: index + 2,
      mapping: completeMapping
    })
  );

  setDrafts(nextDrafts);
}
```

格式错误行仍然要展示，但不能发送到确认接口。

## 四十、请求服务端预览

提取合法候选：

```ts
const candidates = nextDrafts
  .filter((draft) => draft.status === "valid")
  .map((draft) => draft.candidate);
```

然后：

```ts
const response = await fetch("/api/imports/csv/preview", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    accountId,
    rows: candidates
  })
});
```

依照第 31 课的网络边界，处理顺序仍然是：

```txt
读取 unknown JSON
  ↓
Zod 校验响应外形
  ↓
判断 response.ok
  ↓
判断 body.ok
  ↓
写入页面状态
```

不要直接写：

```ts
const data = await response.json() as PreviewResponse;
```

类型断言不会验证真实网络数据。

## 四十一、预览表应该显示什么

建议列：

```txt
选择
CSV 行号
日期
方向
金额
商户
分类
备注
状态
```

状态至少包括：

```txt
可导入
格式错误
文件内疑似重复
数据库疑似重复
```

默认勾选：

```txt
所有合法且非重复的行
```

默认不勾选：

```txt
格式错误行
疑似重复行
```

格式错误行的复选框应禁用。

疑似重复行可以先保持禁用，避免本课引入“强制导入重复项”的额外语义。

## 四十二、预览中的手动分类修正

分类列不要只显示文本。

可以使用：

```tsx
<input
  value={row.category ?? ""}
  onChange={(event) =>
    updateRowCategory(row.rowNumber, event.target.value)
  }
  maxLength={200}
  disabled={isImporting || row.duplicate}
/>
```

更新时使用不可变写法：

```ts
function updateRowCategory(
  rowNumber: number,
  category: string
) {
  setPreviewRows((current) =>
    current.map((row) =>
      row.rowNumber === rowNumber
        ? { ...row, category }
        : row
    )
  );
}
```

这实现了：

```txt
规则自动建议
  +
用户最终修正
```

用户修正后的值会在确认请求中再次经过 Zod 长度校验。

## 四十三、确认前只提交选中的行

确认按钮点击时：

```ts
const rowsToImport = previewRows
  .filter(
    (row) =>
      selectedRows.has(row.rowNumber) &&
      !row.duplicate
  )
  .map(({ duplicate, duplicateReason, duplicateOfRowNumber, ...row }) => row);
```

然后调用：

```ts
await fetch("/api/imports/csv/confirm", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    accountId,
    rows: rowsToImport
  })
});
```

不要把服务端预览附加的：

```txt
duplicate
duplicateReason
duplicateOfRowNumber
```

发送回确认 schema。

确认接口只接收真正的候选流水字段。

## 四十四、为什么确认时还可能跳过流水

页面预览可能显示：

```txt
10 条可导入
```

但确认结果可能是：

```txt
导入 9 条
跳过 1 条
```

原因是确认接口会重新查重。

这不是前后矛盾，而是正确处理了：

```txt
预览之后数据库发生变化
```

成功提示应该以确认接口返回为准。

## 四十五、防止重复确认

与第 31 课一样，只依赖：

```ts
setIsImporting(true);
```

可能不足以阻止非常快的连续事件。

可以增加：

```ts
const importLockRef = useRef(false);
```

提交开始：

```ts
if (importLockRef.current) {
  return;
}

importLockRef.current = true;
setIsImporting(true);
```

结束：

```ts
finally {
  importLockRef.current = false;
  setIsImporting(false);
}
```

确认按钮也要禁用：

```tsx
disabled={isImporting || selectedRows.size === 0}
```

## 四十六、不要自动重试确认 POST

如果服务端已经写入成功，但响应在网络中丢失，浏览器自动重试可能再次提交相同数据。

虽然本课会重新查重，但查重不是数据库唯一约束。

因此不要对确认接口自动重试。

失败时提示：

```txt
无法确认本次导入。请先重新生成预览，检查数据库状态后再试。
```

## 四十七、导入完成后的页面行为

成功后建议显示：

```txt
导入完成
成功写入 5 条
跳过疑似重复 1 条
```

并提供：

```txt
继续导入另一个文件
```

点击后清空本次文件状态，但保留当前账户选择可以提升连续导入体验。

不要自动再次提交同一个文件。

## 四十八、格式错误应该显示到具体行

不够好的提示：

```txt
CSV 格式错误
```

更好的提示：

```txt
第 8 行 · 交易日期：日期必须是 YYYY-MM-DD 或 YYYY/MM/DD
```

如果一行有多个问题，应全部展示：

```txt
第 8 行
- 交易日期：日期格式不正确
- 金额：金额格式不正确
```

这样用户才能回到原始文件修正。

## 四十九、不要在日志中打印完整账单

账单可能包含：

- 商户。
- 消费习惯。
- 工资。
- 医疗信息。
- 位置线索。
- 备注中的个人信息。

不要写：

```ts
console.log(rawRows);
console.log(requestBody);
```

必要日志只记录：

```txt
文件行数
合法行数
错误行数
重复行数
导入行数
```

也不要把完整账单发送给 DeepSeek 做基础分类。

## 五十、rawPayload 保存什么

`rawPayload` 的作用是：

- 保留来源字段。
- 便于排查映射问题。
- 支持以后重新解释某些字段。

本课保存单行 JSON：

```ts
rawPayload: JSON.stringify(row)
```

不要保存：

- 整个 CSV 文件。
- 本地绝对路径。
- 浏览器文件对象。
- 账户密码。
- 银行登录信息。

服务端 schema 已把单行原始内容限制为：

```txt
5000 字符
```

## 五十一、为纯函数编写测试

创建：

```txt
tests/import/csv-parser.test.ts
tests/import/normalize-csv-row.test.ts
tests/import/infer-category.test.ts
tests/import/duplicate-key.test.ts
```

这些测试不需要数据库，也不需要网络。

### CSV 引号测试

```ts
import { describe, expect, it } from "vitest";
import { parseCsvText } from "@/lib/import/csv-parser";

describe("parseCsvText", () => {
  it("保留引号中的逗号", () => {
    const result = parseCsvText(
      [
        "交易日期,金额,交易对象",
        '2026-07-01,-88.00,"便利店,人民广场店"'
      ].join("\n")
    );

    expect(result.rows[0]["交易对象"]).toBe(
      "便利店,人民广场店"
    );
  });

  it("拒绝没有数据行的文件", () => {
    expect(() =>
      parseCsvText("交易日期,金额")
    ).toThrow("没有可导入的数据行");
  });
});
```

### 金额与方向测试

至少覆盖：

```txt
-36.5       → amount 36.50 + expense
20,000.00   → amount 20000.00 + income
￥128.00 + 支出 → amount 128.00 + expense
0           → 错误
abc         → 错误
```

### 日期测试

至少覆盖：

```txt
2026-07-01  → 成功
2026/07/01  → 成功
2026-02-30  → 错误
07/01/2026  → 错误
空字符串    → 错误
```

### 自动分类测试

```ts
import { describe, expect, it } from "vitest";
import { inferCategory } from "@/lib/import/infer-category";

describe("inferCategory", () => {
  it("优先保留 CSV 原分类", () => {
    expect(
      inferCategory({
        category: "自定义分类",
        merchant: "早餐店"
      })
    ).toEqual({
      category: "自定义分类",
      source: "csv"
    });
  });

  it("根据商户建议分类", () => {
    expect(
      inferCategory({
        merchant: "中国移动"
      }).category
    ).toBe("通讯");
  });

  it("没有命中时返回未分类", () => {
    expect(
      inferCategory({
        merchant: "未知商户"
      }).category
    ).toBe("未分类");
  });
});
```

### 重复键测试

验证：

- `199` 与 `199.00` 得到同一个键。
- 商户首尾空格不影响键。
- 商户英文大小写不影响键。
- 不同账户得到不同键。
- 不同方向得到不同键。

## 五十二、服务端测试重点

预览 route 至少测试：

- 非 JSON 请求返回 400。
- 空账户 ID 返回 400。
- 空 rows 返回 400。
- 超过 1000 行返回 400。
- 不存在账户返回 404。
- 正常请求返回 summary。
- 文件内重复被标记。
- 数据库已有重复被标记。
- 预览不会写入数据库。

确认 route 至少测试：

- 再次校验请求。
- 再次确认账户存在。
- 新流水使用 `source: "csv"`。
- 疑似重复被跳过。
- 返回 imported 和 skipped。
- 空候选不会误报成功导入。
- 数据库失败返回稳定错误码。

数据库测试要使用隔离的测试数据库，不要污染开发数据。

## 五十三、运行检查

实现到这里后运行：

```bash
npm run test:run
npm run lint
npm run build
```

为什么本课建议增加 `build`？

因为：

- Client Component 和服务端模块边界可能写错。
- Papa Parse 默认导入形式可能受 TypeScript 配置影响。
- route 和页面的类型问题有时只在完整构建中出现。

三个命令都通过后再做浏览器验收。

## 五十四、手动验收准备

启动：

```bash
npm run dev
```

先打开账户页面，确认至少存在一个账户。

然后打开：

```txt
http://localhost:3000/import
```

准备本课的：

```txt
transactions-demo.csv
```

## 五十五、手动验收成功路径

按顺序操作：

1. 选择一个账户。
2. 选择 `transactions-demo.csv`。
3. 确认自动识别了表头。
4. 检查日期和金额映射。
5. 点击生成预览。
6. 确认正常行显示日期、方向和金额。
7. 确认早餐店建议为“餐饮”。
8. 把其中一条分类手动改成其他值。
9. 确认重复的中国移动流水只有一条默认可导入。
10. 确认错误日期行显示具体错误。
11. 点击确认导入。
12. 查看成功和跳过数量。
13. 调用 `GET /api/transactions` 或后续页面查看写入结果。

数据库中的新流水应该满足：

```txt
accountId = 所选账户
amount = 非负两位小数字符串
direction = income / expense / transfer
source = csv
rawPayload = 对应原始行 JSON
```

## 五十六、手动验收重复导入

再次选择同一个账户和同一个文件。

预览应把刚才成功导入的行标记为：

```txt
数据库疑似重复
```

默认不应再次勾选。

确认时不应再次写入这些行。

然后选择另一个账户重新预览。

由于重复键包含：

```txt
accountId
```

同一文件对不同账户不应直接视为数据库重复。

## 五十七、手动验收错误路径

分别测试：

- 选择空文件。
- 选择非 `.csv` 文件。
- 选择大于 2 MB 的文件。
- CSV 只有表头。
- CSV 没有表头。
- 表头重复。
- 没有映射日期。
- 没有映射金额。
- 日期为 `2026-02-30`。
- 金额为 `abc`。
- 方向为无法识别的文本。
- 没有账户。
- 预览时停止开发服务器。
- 确认时停止开发服务器。

页面应保留足够上下文，让用户修正或重新尝试。

## 五十八、常见错误一：使用 split 解析 CSV

错误：

```ts
text.split("\n").map((row) => row.split(","));
```

问题：

- 无法处理引号中的逗号。
- 无法处理引号中的换行。
- 无法处理转义引号。

正确做法：

```txt
使用成熟 CSV 解析器
```

## 五十九、常见错误二：直接把原始金额写库

错误：

```ts
amount: row["金额"]
```

这样可能写入：

```txt
-36.5
￥128.00
20,000.00
```

它们不符合现有金额契约。

正确做法：

```txt
清洗符号和货币字符
  ↓
Decimal 解析
  ↓
绝对值
  ↓
toFixed(2)
```

## 六十、常见错误三：只在客户端校验

用户可以绕过页面直接调用 API。

确认接口必须重新执行：

```txt
Zod 校验
账户存在检查
重复检测
```

## 六十一、常见错误四：预览时就写数据库

预览的含义是：

```txt
用户还没有最终确认
```

所以：

```txt
POST /preview
```

只能查询和返回判断，不能插入流水。

## 六十二、常见错误五：确认时相信旧重复状态

错误：

```ts
if (!row.duplicate) {
  await insert(row);
}
```

`duplicate` 来自旧预览或客户端，可能已经过期，也可能被伪造。

正确做法：

```txt
确认接口重新查询数据库并重新查重
```

## 六十三、常见错误六：自动分类覆盖原分类

CSV 已经提供：

```txt
教育
```

规则却因为商户名命中“购物”，然后覆盖成：

```txt
购物
```

这会破坏来源数据。

优先级应该是：

```txt
用户手动修正
  >
CSV 明确分类
  >
规则建议
  >
未分类
```

## 六十四、常见错误七：把重复检测说成绝对唯一

当前规则可能误判，也可能漏判。

界面和文档都应该使用：

```txt
疑似重复
```

而不是承诺绝对去重。

## 六十五、常见错误八：逐行独立写入

错误：

```ts
for (const row of rows) {
  await createTransaction(row);
}
```

问题：

- 数据库往返次数多。
- 速度慢。
- 中途失败状态难解释。

本课使用一次批量插入。

## 六十六、常见错误九：把完整账单交给 LLM

基础分类不需要把完整财务记录发送给模型。

优先使用：

```txt
确定性规则
  +
用户确认
```

如果未来增加 AI 分类，需要单独设计：

- 用户知情。
- 最小化发送字段。
- 隐私策略。
- 超时和费用。
- AI 失败时的规则回退。

## 六十七、常见错误十：重新选文件却保留旧状态

新文件不应继承旧文件的：

- 映射。
- 预览。
- 勾选。
- 错误。
- 导入结果。

文件变化时要执行一次明确重置。

## 六十八、推荐文件结构

完成后建议拥有：

```txt
ai-finance-cfo/
├── app/
│   ├── api/
│   │   └── imports/
│   │       └── csv/
│   │           ├── preview/
│   │           │   └── route.ts
│   │           └── confirm/
│   │               └── route.ts
│   └── import/
│       └── page.tsx
├── components/
│   └── import/
│       ├── CsvFilePicker.tsx
│       ├── CsvFieldMappingForm.tsx
│       ├── CsvPreviewTable.tsx
│       └── CsvImportSummary.tsx
├── lib/
│   ├── import/
│   │   ├── csv-parser.ts
│   │   ├── csv-types.ts
│   │   ├── duplicate-key.ts
│   │   ├── guess-field-mapping.ts
│   │   ├── infer-category.ts
│   │   └── normalize-csv-row.ts
│   └── services/
│       ├── csv-import.ts
│       └── transactions.ts
├── schemas/
│   └── csv-import.ts
└── tests/
    └── import/
        ├── csv-parser.test.ts
        ├── duplicate-key.test.ts
        ├── infer-category.test.ts
        └── normalize-csv-row.test.ts
```

如果 `app/import/page.tsx` 变得太长，再拆到：

```txt
components/import/*
```

不要一开始为了文件数量而拆分没有独立职责的微小组件。

## 六十九、实践任务

### 必做任务一：文件读取和解析

实现：

- 只选择 `.csv`。
- 限制 2 MB。
- 使用 `File.text()`。
- 使用 Papa Parse。
- 处理表头、空文件和解析错误。

### 必做任务二：字段映射

实现：

- 日期映射。
- 金额映射。
- 可选方向、分类、商户和备注映射。
- 自动猜测常见表头。
- 用户可以修改映射。

### 必做任务三：清洗

实现：

- 上海时区日期。
- 金额绝对值和两位小数。
- 收支方向转换。
- 空字符串转换为 `undefined`。
- 原始行保存为 JSON。

### 必做任务四：分类

实现：

- CSV 原分类优先。
- 规则分类建议。
- 未命中为“未分类”。
- 预览中手动修改。

### 必做任务五：重复检测

实现：

- 文件内疑似重复。
- 数据库疑似重复。
- 默认不选择疑似重复行。
- 确认时重新查重。

### 必做任务六：确认写库

实现：

- 只提交用户选中的合法行。
- 服务端 Zod 校验。
- 确认账户存在。
- `source: "csv"`。
- 批量插入。
- 返回成功和跳过数量。

### 选做任务

- 下载标准 CSV 模板。
- 允许用户删除预览中的单行。
- 增加分类快捷选项。
- 增加金额和日期排序。
- 保存最近一次字段映射，但必须按表头集合隔离。
- 预览顶部显示收入合计和支出合计。

选做汇总金额也必须使用 `Decimal`，不要回到普通浮点数直接相加。

## 七十、推荐练习顺序

建议按下面顺序完成：

1. 安装 Papa Parse。
2. 写 `csv-types.ts`。
3. 写 `csv-parser.ts` 和测试。
4. 写 `guess-field-mapping.ts`。
5. 写日期、金额和方向清洗。
6. 写 `normalizeCsvRow` 和测试。
7. 写规则分类和测试。
8. 写重复键和测试。
9. 写 CSV 导入 Zod schema。
10. 为 transaction service 增加账户流水查询。
11. 为 transaction service 增加批量插入。
12. 写导入预览 service。
13. 写 preview route。
14. 写 confirm service 和 route。
15. 把导入页改成 Client Component。
16. 加载账户。
17. 实现文件选择。
18. 实现字段映射界面。
19. 实现预览表。
20. 实现分类编辑和行选择。
21. 实现确认导入。
22. 完成错误、loading 和成功状态。
23. 运行 test、lint、build。
24. 完成浏览器验收。

一次只完成一层，出现问题时更容易定位。

## 七十一、验收标准

### 文件读取

- 能选择 `.csv` 文件。
- 能读取 UTF-8 文本。
- 空文件有提示。
- 非 CSV 文件有提示。
- 超过大小限制有提示。
- CSV 语法错误能显示具体原因。
- 缺少表头有提示。
- 没有数据行有提示。

### 字段映射

- 能显示解析到的表头。
- 能自动猜测常见表头。
- 用户能修改映射。
- 日期和金额必须映射。
- 可选字段可以选择不导入。
- 新文件不会错误继承旧预览。

### 数据清洗

- 日期转为上海时区毫秒时间戳。
- 不接受模糊日期格式。
- 金额使用 Decimal 处理。
- 金额保存为非负两位小数字符串。
- 负数可推断为支出。
- 显式方向优先。
- 空文本不会大量保存为空字符串。
- 每个错误能对应 CSV 行号。

### 自动分类和手动修正

- CSV 原分类优先。
- 未提供分类时能按规则建议。
- 未命中时为“未分类”。
- 用户能在预览中修改分类。
- 修改值会进入最终确认请求。
- 基础分类不依赖真实 AI。

### 重复检测

- 能识别同一文件中的疑似重复。
- 能识别数据库已有疑似重复。
- 重复判断包含账户。
- 疑似重复默认不导入。
- 确认接口会再次查重。
- 文档和界面没有宣称绝对防重。

### 预览和确认

- 预览接口不写数据库。
- 格式错误行仍可见。
- 合法行可以勾选。
- 确认前用户可以取消某一行。
- 没有选择行时不能确认。
- 确认请求有 loading 状态。
- 快速重复点击不会普通重复提交。
- 确认失败不会显示伪成功。
- 确认成功显示 imported 和 skipped。

### 数据库结果

- 用户确认后才写入。
- 写入关联正确账户。
- `source` 为 `csv`。
- `rawPayload` 只保存单行原始 JSON。
- 使用批量插入。
- 已软删除流水不参与普通已有流水列表。
- 新流水能被现有现金流计算读取。

### 工程质量

- 网络响应作为 `unknown` 校验。
- 客户端类型不代替服务端 Zod。
- 没有用 `split(",")` 解析 CSV。
- 没有在日志打印完整账单。
- 没有把完整账单发给 LLM。
- 纯函数有测试。
- 自动测试不访问真实 DeepSeek。
- `npm run test:run` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。

## 七十二、复习问题

### 1. CSV 和 Excel 文件有什么区别？

CSV 主要是文本格式的表格数据；`.xlsx` 是包含工作表、样式、公式等结构的压缩文档格式。Papa Parse 不能直接解析 `.xlsx`。

### 2. 为什么不能使用 `split(",")`？

因为 CSV 字段可以使用引号包裹，字段内部可以包含逗号、换行和转义引号。

### 3. 字段映射解决什么问题？

它把不同账单来源的外部表头转换成项目统一的流水字段。

### 4. 为什么日期只接受有限格式？

明确格式比模糊猜测更可预测，也能避免不同运行环境采用不同解析规则。

### 5. 为什么金额不能直接使用普通 `number` 清洗？

项目已经建立 Decimal 金额边界，财务字符串解析和格式化应继续遵守这一约定。

### 6. 为什么负数金额写库后变成正数？

现有模型用 `amount` 保存绝对金额，用 `direction` 单独表达收入、支出和转账。

### 7. 没有方向列时如何判断收支？

本课用金额符号推断：负数为支出，正数为收入。

### 8. 有方向列时为什么优先使用它？

一些账单的金额始终为正数，真实方向只能从独立方向列确定。

### 9. 为什么优先保留 CSV 原分类？

来源文件已明确提供的信息不应被启发式规则无故覆盖。

### 10. 为什么自动分类不需要 AI？

基础关键词规则更稳定、可测试、便宜，也减少敏感账单外发。

### 11. 什么是文件内重复？

同一次上传中，后续行与更早一行生成了相同的疑似重复键。

### 12. 什么是数据库重复？

候选流水与所选账户中已有有效流水生成了相同的疑似重复键。

### 13. 为什么只能叫疑似重复？

两笔真实交易可能恰好发生在同一天、同一商户且金额相同。

### 14. 为什么重复键必须包含 accountId？

同一笔外部记录导入不同账户时，不能仅凭日期和金额就直接判成同一账户内的重复。

### 15. 为什么预览接口不能写数据库？

预览发生时用户尚未确认，写入会破坏“导入前确认”的产品承诺。

### 16. 为什么确认接口要再次 Zod 校验？

客户端数据可被伪造，预览后的状态也可能被修改或过期。

### 17. 为什么确认时还要再次查重？

预览和确认之间数据库可能出现新流水。

### 18. 为什么一次批量插入优于逐行插入？

它减少数据库往返，并让一次导入的写入边界更清晰。

### 19. 当前方案能绝对防止并发重复吗？

不能。缺少数据库唯一约束时，两个并发请求仍可能通过查询后同时写入。

### 20. rawPayload 有什么价值？

它保留来源行，便于审计映射和排查数据问题，但不应保存整个文件或敏感凭据。

### 21. 为什么确认 POST 不自动重试？

响应丢失不代表写入失败，自动重试可能造成重复提交。

### 22. 为什么页面要区分多个 loading 状态？

加载账户、解析文件、生成预览和确认写入是不同操作，禁用范围和错误恢复方式也不同。

### 23. 为什么格式错误行仍要展示？

用户需要知道具体哪一行、哪个字段需要回到源文件修正。

### 24. 导入的流水会怎样影响 Chat 计算？

新流水会进入现有 `transactions` 表，后续现金流和储蓄目标上下文就能读取更完整的数据。

## 七十三、本课小结

这一课把静态导入占位页变成了完整的数据入口：

```txt
CSV 文件
  ↓
File.text()
  ↓
Papa Parse
  ↓
表头 + 原始行
  ↓
字段映射
  ↓
日期、金额、方向清洗
  ↓
规则分类建议
  ↓
逐行格式错误
  ↓
POST /api/imports/csv/preview
  ↓
文件内重复 + 数据库重复
  ↓
用户预览、选择和修正
  ↓
POST /api/imports/csv/confirm
  ↓
服务端重新校验和查重
  ↓
批量写入 transactions
```

本课最重要的数据边界是：

```txt
外部账单不可信
  ↓
解析
  ↓
映射
  ↓
清洗
  ↓
运行时校验
  ↓
用户确认
  ↓
服务端再次校验
  ↓
数据库
```

还要记住：

```txt
自动分类是建议
用户确认是决定
应用层查重是风险提示
数据库唯一约束才是强一致边界
```

完成后，项目中的现金流数据不再只能逐笔手工创建。

下一课进入：

```txt
第 33 课：财务仪表盘与图表
```

第 33 课会使用现有：

```txt
accounts
transactions
liabilities
cash-flow
```

展示：

```txt
净资产
月收入
月支出
储蓄率
负债率
现金流趋势
分类支出
```

因此，本课导入数据的日期、方向、金额和分类质量，会直接决定下一课图表是否可信。
