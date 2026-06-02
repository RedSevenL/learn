# TS 语法基础

## 1. TypeScript 是什么

TypeScript 可以理解为“带类型系统的 JavaScript”。

它的核心作用是：

- 在写代码阶段提前发现类型错误。
- 给变量、函数、对象规定更清晰的数据结构。
- 最终仍然会编译成 JavaScript 运行。

一句话理解：

> JavaScript 负责运行，TypeScript 负责在开发阶段帮你检查类型。

## 2. tsconfig 配置

`tsconfig.json` 是 TypeScript 项目的配置文件，用来告诉 TS 编译器怎么工作。

示例：

```json
{
  "compilerOptions": {
    "watch": true,
    "removeComments": true
  }
}
```

常见配置：

- `compilerOptions`：编译选项。
- `watch: true`：监听文件变化，自动重新编译。
- `removeComments: true`：编译后移除注释，减小 JS 文件体积。

## 3. 冒号指定类型

TypeScript 使用冒号 `:` 给变量指定类型。

```ts
let age: number = 18;
let name: string = "Simon";
let isStudent: boolean = true;
```

常见基础类型：

| 类型 | 含义 | 示例 |
| --- | --- | --- |
| `number` | 数字 | `18`、`3.14` |
| `string` | 字符串 | `"hello"` |
| `boolean` | 布尔值 | `true`、`false` |

## 4. 字面量类型

如果某个变量只能取固定的几个值，可以直接把值本身作为类型。

```ts
let gender: "male" | "female";

gender = "male";
gender = "female";
// gender = "other"; // 报错
```

这种写法适合限制明确选项。

例如：

```ts
let direction: "left" | "right" | "up" | "down";
```

## 5. 可选属性

问号 `?` 表示这个属性可有可无。

```ts
let user: {
  name: string;
  age?: number;
};

user = {
  name: "Alex"
};
```

这里的 `age?: number` 表示：

- 可以有 `age`。
- 也可以没有 `age`。
- 如果有，必须是 `number`。

## 6. 联合类型

竖线 `|` 表示“可以是其中一种类型”。

```ts
let id: number | string;

id = 101;
id = "user_101";
```

常见用途：

- 一个值可能来自不同来源。
- 某个参数支持多种类型。
- 某个字段只允许几个固定选项。

## 7. 数组与元组

### 数组

数组表示同一类数据的集合。

```ts
let scores: number[] = [90, 85, 100];
let names: string[] = ["Alex", "Simon"];
```

也可以这样写：

```ts
let scores: Array<number> = [90, 85, 100];
```

### 元组 Tuple

元组是一种“长度固定、每个位置类型固定”的数组。

```ts
let userInfo: [string, number] = ["Alex", 18];
```

含义：

- 第一个位置必须是 `string`。
- 第二个位置必须是 `number`。
- 顺序不能乱。

```ts
// let wrong: [string, number] = [18, "Alex"]; // 报错
```

## 8. 数组里的 ...

`...` 在数组相关代码里很常见，主要有两种用法：展开和收集剩余项。

### 展开数组

把数组里的元素拆开，放进新数组里。

```ts
const a = [1, 2];
const b = [3, 4];

const merged = [...a, ...b];

console.log(merged); // [1, 2, 3, 4]
```

常见用途：

```ts
const oldList = ["A", "B"];
const newList = [...oldList, "C"];
```

这样不会直接修改原数组，而是创建一个新数组。

### 收集剩余项 rest

在解构数组时，`...rest` 可以收集剩下的元素。

```ts
const nums = [10, 20, 30, 40];

const [first, second, ...rest] = nums;

console.log(first);  // 10
console.log(second); // 20
console.log(rest);   // [30, 40]
```

这里的 `rest` 只是变量名，也可以改成别的名字。

```ts
const [head, ...tail] = nums;
```

### 函数里的剩余参数

函数参数里也可以用 `...` 接收任意数量的参数。

```ts
function sum(...nums: number[]): number {
  return nums.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3)); // 6
```

这里的：

```ts
...nums: number[]
```

表示把所有传进来的数字收集成一个 `number[]` 数组。

## 9. interface 接口

`interface` 用来定义对象的标准结构。

```ts
interface User {
  id: number;
  name: string;
  age?: number;
}

const user: User = {
  id: 1,
  name: "Alex"
};
```

接口的作用：

- 规定对象必须有哪些属性。
- 规定每个属性是什么类型。
- 让数据结构更清晰。

## 10. 函数参数类型和返回值类型

函数也可以指定参数类型和返回值类型。

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

含义：

- `a: number`：参数 `a` 必须是数字。
- `b: number`：参数 `b` 必须是数字。
- `: number`：函数返回值必须是数字。

如果函数没有返回值，可以写 `void`。

```ts
function logMessage(message: string): void {
  console.log(message);
}
```

## 11. 函数泛型 Generic Function

泛型可以理解为“先不固定具体类型，等调用时再确定类型”。

普通函数如果写死类型，只能处理一种数据：

```ts
function getNumber(value: number): number {
  return value;
}
```

如果希望函数既能处理数字，也能处理字符串，同时保留输入和输出的类型关系，就可以使用泛型。

```ts
function identity<T>(value: T): T {
  return value;
}

const a = identity<number>(123);
const b = identity<string>("hello");
```

这里的 `T` 是一个类型变量：

- `T` 不是固定类型。
- 调用函数时，`T` 会变成具体类型。
- `value: T` 和返回值 `: T` 表示输入什么类型，就返回什么类型。

多数情况下，TS 可以自动推断泛型类型，不必手写 `<number>` 或 `<string>`。

```ts
const a = identity(123);     // 推断为 number
const b = identity("hello"); // 推断为 string
```

### 泛型数组

泛型常用于处理数组。

```ts
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const firstNumber = getFirst([1, 2, 3]);
const firstName = getFirst(["Alex", "Simon"]);
```

含义：

- 传入 `number[]`，返回 `number`。
- 传入 `string[]`，返回 `string`。
- 函数逻辑复用，但类型仍然准确。

### 多个泛型参数

函数也可以有多个泛型参数。

```ts
function makePair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const pair = makePair("age", 18);
```

这里的返回值类型是 `[string, number]`。

### 什么时候用泛型

适合使用泛型的场景：

- 函数逻辑相同，但参数类型不固定。
- 输入类型和输出类型之间有关联。
- 希望复用函数，同时保留准确的类型提示。

不需要泛型的场景：

- 函数只处理一种明确类型。
- 输入和输出类型没有关系。
- 直接写具体类型更清晰。

## 12. 类型断言 as

`as` 表示类型断言：告诉 TypeScript“我比你更清楚这个值的类型”。

```ts
let value: unknown = 123;

let num = value as number;
```

注意：

- `as` 本身常用，但 `as number` 不算特别高频。
- 普通函数返回值不优先写 `return value as number`。
- 更推荐直接在函数声明处标明返回值类型。

推荐写法：

```ts
function getScore(): number {
  return 100;
}
```

不推荐把 `as number` 当成普通返回值类型写法：

```ts
function getScore() {
  return 100 as number;
}
```

`as` 常见于这类场景：

```ts
const input = document.querySelector("input") as HTMLInputElement;

console.log(input.value);
```

这里是因为 `querySelector` 只能大概知道查到的是一个元素，但不知道它具体是不是输入框，所以可以用 `as HTMLInputElement` 告诉 TS 它的具体类型。

更准确地说：

- `as HTMLInputElement`、`as HTMLElement` 这类 DOM 类型断言更常见。
- `as number` 只有在值来自 `unknown`、外部数据或 TS 无法推断时才会用。
- 如果只是写普通函数返回数字，用 `function fn(): number` 更自然。

## 13. 回调函数签名

如果函数参数本身也是函数，就需要指定回调函数的类型。

```ts
function fetchUser(
  userId: number,
  callback: (name: string) => void
): void {
  callback("Alex");
}

fetchUser(101, function (name) {
  console.log(name);
});
```

这里的：

```ts
callback: (name: string) => void
```

表示：

- `callback` 是一个函数。
- 它接收一个 `string` 类型参数。
- 它没有返回值。

## 14. type 类型别名

`type` 可以给类型起别名，让复杂类型更好复用。

```ts
type UserId = number | string;

let id: UserId = 101;
id = "user_101";
```

也可以给对象结构起别名：

```ts
type Product = {
  id: number;
  name: string;
  price: number;
};

const product: Product = {
  id: 1,
  name: "Keyboard",
  price: 299
};
```

适合场景：

- 联合类型较长。
- 对象结构会重复使用。
- 函数签名较复杂。

## 15. interface 与 type 的简单区别

基础阶段可以先这样记：

- `interface`：常用于描述对象结构。
- `type`：常用于给任意类型起别名，比如联合类型、函数类型、对象类型。

示例：

```ts
interface User {
  name: string;
}

type Status = "loading" | "success" | "error";
```

## 16. 本节重点

- TS 是带类型检查的 JS。
- `tsconfig.json` 用来配置 TS 编译行为。
- 冒号 `:` 用来指定类型。
- `?` 表示属性可选。
- `|` 表示联合类型。
- 元组可以固定数组长度和每个位置的类型。
- 数组里的 `...` 可以用来展开数组，也可以收集剩余项。
- `interface` 用来定义对象结构。
- 函数可以指定参数类型和返回值类型。
- 泛型让函数在复用逻辑的同时保留准确的输入输出类型关系。
- `as` 是类型断言，DOM 类型断言比 `as number` 更常见。
- 回调函数也需要指定函数签名。
- `type` 可以给复杂类型起别名。
