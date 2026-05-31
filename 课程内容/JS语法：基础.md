# JS 语法基础

## 1. 基础输出

```js
alert("Hello");
console.log("Hello");
```

- `alert()`：弹出浏览器提示框。
- `console.log()`：在控制台输出内容，适合调试。
- 不建议在 `console.log()` 里定义变量，应先定义，再输出。

```js
let name = "Simon";
console.log(name);
```

## 2. 判断与逻辑运算

### 等号判断

```js
1 === "1"; // false
1 == "1";  // true
```

- `===`：严格相等，值和类型都必须相同。
- `==`：宽松相等，会进行类型转换，不推荐日常使用。

示例：

```js
true == 1;  // true
1 == "1";  // true
```

### 逻辑运算

```js
true && false; // 逻辑与：false
true || false; // 逻辑或：true
!false;        // 逻辑非：true
```

- `&&`：两个条件都为真，结果才为真。
- `||`：任意一个条件为真，结果就为真。
- `!`：取反。

## 3. 变量：let 与 var

`let` 是比 `var` 更安全的变量创建方式。

```js
let age = 18;
```

`let` 的特点：

- 有严格的块级作用域。
- 必须先定义，再使用。
- 同一作用域内不能重复命名。

```js
let age = 18;
// let age = 20; // 报错：不能重复声明
```

## 4. 字符串与加法

`+` 运算遇到字符串时，会把其他值也转换成字符串。

```js
5 + "5"; // "55"
```

所以：

- 数字 + 数字：数学加法。
- 字符串 + 任意值：字符串拼接。

## 5. 条件表达式

三元表达式适合写简单判断。

```js
let allowed = age >= 18 ? "yes" : "no";
```

含义：

```js
如果 age >= 18，allowed 为 "yes"；
否则 allowed 为 "no"。
```

## 6. 循环语法

### while

```js
while (condition) {
  // 条件为 true 时重复执行
}
```

### do...while

```js
do {
  // 至少执行一次
} while (condition);
```

### for

```js
for (let i = 0; i < 5; i++) {
  console.log(i);
}
```

## 7. 对象基础

对象用于保存一组相关数据。

```js
let obj = {
  name: "Simon",
  age: 20,
  contact: {
    phone: "1234567",
    Telegram: "@Simon"
  }
};
```

注意：

- 对象属性之间用逗号分隔。
- 对象的属性值可以是另一个对象。

### 访问对象属性

```js
console.log(obj.name);             // "Simon"
console.log(obj.contact);          // { phone: "1234567", Telegram: "@Simon" }
console.log(obj.contact.phone);    // "1234567"
console.log(obj.contact.Telegram); // "@Simon"
```

## 8. 点符号与方括号

### 点符号

```js
obj.name;
```

特点：

- 最常用。
- 写法简洁。
- 适合访问固定、符合命名规范的属性。

### 方括号

```js
obj["name"];
```

方括号更灵活，适合以下场景。

### 场景一：属性名来自变量

```js
let key = "name";

console.log(obj[key]); // "Simon"
console.log(obj.key);  // 查找名为 key 的属性，不是变量 key 对应的属性
```

### 场景二：属性名包含特殊字符

```js
let user = {
  "first name": "Simon",
  "home-address": "Shanghai"
};

console.log(user["first name"]);
console.log(user["home-address"]);
```

记忆口诀：

> 平时优先点符号，干净利落敲得快；遇到变量或特殊字符，果断换成方括号。

## 9. 数组遍历方式

### for...in：不推荐遍历数组

```js
for (let i in arr) {
  console.log(i);
}
```

`for...in` 的本质是遍历对象的可枚举属性名。

问题：

- 遍历出来的索引是字符串，例如 `"0"`、`"1"`。
- 可能遍历出数组上的自定义属性。
- 更适合普通对象，不适合数组。

### for...of：推荐遍历数组

```js
for (let item of arr) {
  console.log(item);
}
```

特点：

- 直接拿到数组元素本身。
- 不会遍历自定义属性。
- 支持 `break` 和 `continue`。
- 如果数组中间有空洞，会读到 `undefined`。

### forEach：适合函数式遍历

```js
arr.forEach(function (item, index, array) {
  console.log(index, item);
});
```

特点：

- 可以同时拿到元素、索引和数组本身。
- 会自动跳过数组空洞。
- 不能使用 `break` 或 `continue` 中途退出。

### 遍历方式对比

| 遍历方式 | 变量代表什么 | 是否遍历空洞 | 是否遍历自定义属性 | 适合场景 |
| --- | --- | --- | --- | --- |
| `for...in` | 键名/索引字符串 | 否 | 是 | 遍历普通对象，不推荐遍历数组 |
| `for...of` | 元素值 | 是，得到 `undefined` | 否 | 现代 JS 数组遍历首选 |
| `forEach` | 元素值 | 否 | 否 | 需要索引且不需要中途退出 |

选择建议：

- 遍历数组优先用 `for...of`。
- 需要同时拿到元素和索引，且不需要中途退出时，用 `forEach`。
- 不要用 `for...in` 遍历数组。

## 10. 栈与双端队列

### 栈 Stack

核心特征：后进先出，LIFO。

JS 可以用数组模拟栈：

```js
let stack = [];

stack.push("A");
stack.push("B");

console.log(stack.pop()); // "B"
```

常用操作：

- `push()`：压入栈顶。
- `pop()`：弹出栈顶。

### 双端队列 Deque

双端队列表示两端都可以进出的队列。

```js
let deque = [];

deque.push("A");    // 从尾部进入
deque.pop();        // 从尾部移出
deque.unshift("B"); // 从头部进入
deque.shift();      // 从头部移出
```

模拟标准队列：

```js
let queue = [];

queue.push("A");  // 入队
queue.shift();    // 出队
```


## 11. 栈内存与堆内存

| 特性 | 栈内存 Stack | 堆内存 Heap |
| --- | --- | --- |
| 分配方式 | 自动分配与释放 | C++ 手动管理，JS 由垃圾回收器管理 |
| 空间特点 | 较小、连续、规整 | 较大、不连续、零散 |
| 执行速度 | 很快 | 相对较慢 |
| 常见内容 | 局部变量、基础值、引用地址 | 对象、数组、函数等实体 |

示例：

```js
let age = 20;
let obj = { name: "Simon" };
```

底层理解：

- `age` 是基础类型，值可以直接放在栈中。
- `obj` 是对象变量，栈中保存的是对象的引用地址。
- 真正的 `{ name: "Simon" }` 对象实体存放在堆中。

一句话理解：

> 栈像索引目录，存小值和地址，速度快，用完即释放；堆像大仓库，存对象、数组、函数等复杂数据，需要通过引用地址找到。

函数相关：

- 函数实体，也就是函数代码本身，存在堆内存中。
- 函数调用时的参数、局部变量、返回地址等，会进入栈内存。
- 函数执行结束后，调用栈中的数据会被销毁。

## 12. C++ 静态内存与 JS 动态对象的差异

C++ 和 JavaScript 的设计目标不同。

### C++：性能优先

- 编译时就能确定很多内存大小和位置。
- 读取属性时可以通过“首地址 + 偏移量”快速定位。
- 更贴合 CPU 缓存，因此速度快、空间利用率高。

### JavaScript：灵活优先

- 对象可以动态新增、删除属性。
- 运行时需要维护属性名、引用关系和查找结构。
- 为了支持灵活性，会消耗更多 CPU 和内存。

核心结论：

> C++ 的“严格和固定”换来更高性能；JS 的“动态和灵活”换来更高开发效率。
