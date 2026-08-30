# HTML 常用标签笔记

> 配套知识：`课程内容/项目总览/知识/前端语法.md` 第 24 章（表单与事件）
> 项目位置：`ai-finance-cfo/`（示例均为项目真实代码）

HTML 标签就四大类：**骨架、文本、表单、表格**，掌握这四类等于掌握 95% 的日常使用。

---

## 一、文档骨架与语义布局

| 标签 | 作用 | 项目里的例子 |
|---|---|---|
| `<div>` | 万能容器，无含义，只用于布局 | 到处都是 |
| `<span>` | 行内容器，包一小段文字 | 按钮文字、徽标 |
| `<header>` | 页头 | 每个页面的标题区（`app/goals/page.tsx`） |
| `<nav>` | 导航菜单 | `app/layout.tsx` 顶部导航栏 |
| `<main>` | 页面主体 | Next.js 布局里包正文 |
| `<aside>` | 侧边栏 / 次要内容 | `app/chat/page.tsx` 聊天侧栏 |
| `<footer>` | 页脚 | 本项目用得少 |
| `<section>` / `<article>` | 语义分区 | 学习中可先忽略 |

**记忆法**：`div` 是"啥都不说"的容器，`header/nav/main/aside/footer` 是"带自我介绍"的容器。作用一样，后者更利于别人（和搜索引擎）读懂页面。

---

## 二、文本与内容

- `<h1>` ~ `<h6>`：标题，数字越小越大。每页只该有一个 `h1`。
- `<p>`：段落。
- `<a href="...">`：超链接。**点它浏览器会跳转**——这是它和按钮的本质区别（按钮不跳，靠代码干活）。
- `<strong>` 加粗、`<em>` 斜体。
- `<ul><li>` 无序列表、`<ol><li>` 有序列表（`ChatMessageList.tsx` 用 `ol` 按顺序渲染聊天消息）。
- `<img src alt>`：图片。`alt` 是图片加载失败或屏幕阅读器朗读时的替代文字。

---

## 三、表单控件 ⭐（重点）

表单 = `<form>` 大容器 + 各种输入控件 + `<button>` 提交。一个控件的"名字 + 值"就是一条要提交的数据。

### 3.1 `<input>` 按 `type` 变形

| type | 作用 | 项目用法 |
|---|---|---|
| `text` | 单行文本框 | 账户名 |
| `number` | 数字框 | 金额 |
| `password` | 密码框（显示圆点） | 登录 |
| `email` | 邮箱框（自带格式校验） | — |
| `date` | 日期选择器 | `app/goals/page.tsx` 目标日期 |
| `checkbox` | 勾选框（布尔状态） | CSV 行选择（Set 那节） |
| `radio` | 单选钮（一组只能选一个） | — |
| `file` | 文件选择 | `CsvFilePicker.tsx` 选 CSV |
| `hidden` | 隐藏字段（不显示但随表单提交） | — |
| `submit` | 提交按钮（老式写法） | 现在多用 `<button>` |

### 3.2 其他控件

- `<select><option>`：下拉选择（`CsvFieldMappingForm.tsx` 里选 CSV 列映射）。
- `<textarea>`：多行文本框（`ChatComposer.tsx` 聊天输入框）。
- `<label>`：控件标签。点击文字也能聚焦到控件，写法是 `<label>` 包 `<input>`（或 `htmlFor` 关联 `id`）。
- `<button>`：按钮，配 `type` 属性：
  - `type="submit"`：提交表单
  - `type="button"`：普通按钮，不提交（项目里默认用法）
  - `type="reset"`：清空表单

### 3.3 按钮 vs 勾选框（易混淆点）

- `<button>` 是**动作**：点击＝执行一件事，不持有数据。
- `<input type="checkbox">` 是**状态**：点击＝切换 `checked`（true/false），不执行动作。
- 点击勾选框时浏览器**同时触发 `click` 和 `change`**；勾选框用 `onChange` 更有意义（键盘空格切换时也触发 `change`，但不触发鼠标 `click`）。

---

## 四、表格

- `<table>` 表格容器 → `<thead>` 表头 → `<tbody>` 表体 → `<tr>` 行 → `<th>` 表头单元格 / `<td>` 普通单元格

项目范本：`CsvPreviewTable.tsx`——`table` 包着 `thead`（状态/日期/金额标题行）和 `tbody`（每条 CSV 记录一行）。

---

## 五、快速记忆法

1. **先认 `<input type>` 一家**：表单 80% 的需求靠它，换形态只改属性值。
2. **布局三件套**：`div`（容器）+ `label`（控件标签）+ `header/nav/main/aside`（语义容器）。
3. **看到就认得**：`a`（跳转）、`button`（动作）、`table`（表格）、`select`（下拉）、`textarea`（多行输入）。
4. 记不住就查 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element)，不用背。

---

## 关联知识点

- 勾选行的保存机制（浏览器只触发事件、保存靠 React state）→ 前端语法.md 第 9 节 Set
- 表单受控套路 → 前端语法.md 第 24 节、36 节