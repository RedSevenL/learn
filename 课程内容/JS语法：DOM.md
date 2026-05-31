# JS 语法：DOM

## 1. DOM 是什么

DOM 可以理解为：浏览器把 HTML 文本读完后，在内存中生成的一棵“节点树”。

JavaScript 不能直接操作 HTML 文本，而是通过操作 DOM 节点对象，间接改变网页内容、样式和交互。

学习 DOM 可以按四步理解：

1. 建立模型：理解网页是一棵节点树。
2. 查找元素：先找到要操作的节点。
3. 修改元素：修改文字、样式、属性。
4. 监听事件：让网页响应用户操作。

## 2. 建立模型：树状思维

浏览器会把 HTML 转换成由 `Node` 组成的树状结构。

常见节点：

- `document`：根节点，代表整个网页。
- 元素节点：HTML 标签，例如 `<body>`、`<div>`、`<p>`。
- 文本节点：标签里的纯文字。
- 属性节点：标签上的属性，例如 `href`、`id`、`src`。

核心观念：

> DOM 操作的本质，不是直接改 HTML 文件，而是修改浏览器内存里的节点对象。

## 3. JavaScript 对象和 DOM 对象

在 JavaScript 里，除了 7 种基本数据类型，其余一切皆对象。

- 基本变量，例如数字、字符串、布尔值等，是最小的数据单元。
- `Object`、`Array`、`Map`、`Set` 是 JavaScript 语言自带的、用来组织这些单元的数据结构。
- `NodeList`、`Element`、`window` 是浏览器送给 JavaScript 的“外挂工具”。它们行为独特，例如 `NodeList` 像数组但不是数组，但底层依然是基于对象实现的。

所以操作 DOM 时，可以把 DOM 节点理解成“浏览器提供给 JS 操作的对象”。

## 4. 查找元素

想修改网页，第一步是先找到对应元素。

现代开发中最常用的是 `querySelector` 和 `querySelectorAll`。

### CSS 选择器速记

`querySelector` 和 `querySelectorAll` 的括号里写的是 CSS 选择器。

常见写法：

| 写法 | 含义 | 示例 |
| --- | --- | --- |
| `标签名` | 选择某类标签 | `p`、`button` |
| `.类名` | 选择指定 class | `.text`、`.active` |
| `#id名` | 选择指定 id | `#submit-btn` |
| `父 子` | 选择后代元素 | `ul li` |
| `父 > 子` | 选择子代元素 | `ul > li` |

示例：

```js
document.querySelector("p");
document.querySelector(".text");
document.querySelector("#color-btn");
document.querySelectorAll("ul > li");
```

### 查找第一个元素

```js
const box = document.querySelector(".my-box");
```

特点：

- 返回符合条件的第一个元素对象。
- 如果找不到，返回 `null`。
- 括号里写 CSS 选择器。

### 查找所有元素

```js
const items = document.querySelectorAll("ul > li");
```

特点：

- 返回所有符合条件的元素。
- 结果是一个节点列表，类似数组。
- 如果找不到，返回空列表。

### 传统查找方法：getElement 系列

除了 `querySelector`，你也会在很多教程或旧代码里看到 `getElement...` 系列方法。

常见写法：

```js
document.getElementById("color-btn");
document.getElementsByClassName("text");
document.getElementsByTagName("p");
```

简单对比：

| 方法 | 查找方式 | 返回结果 |
| --- | --- | --- |
| `getElementById` | 根据 `id` 查找 | 单个元素或 `null` |
| `getElementsByClassName` | 根据 class 查找 | 元素集合 |
| `getElementsByTagName` | 根据标签名查找 | 元素集合 |
| `querySelector` | 根据 CSS 选择器查找 | 第一个匹配元素或 `null` |
| `querySelectorAll` | 根据 CSS 选择器查找 | 节点列表 |

入门阶段建议：

- 新代码优先使用 `querySelector` 和 `querySelectorAll`，因为写法统一，能直接复用 CSS 选择器。
- 看到 `getElementById` 要能读懂，它在旧代码中非常常见。
- `getElementsByClassName` 和 `getElementsByTagName` 返回的是集合，不是单个元素。

### 变量声明建议：优先使用 const

现代 JavaScript 中，变量声明优先级建议是：

1. 优先使用 `const`。
2. 只有变量需要重新赋值时，才使用 `let`。
3. 不再使用 `var`。

例如：

```js
const nodes = document.querySelectorAll("p");
const arr = Array.from(nodes);
```

这里用 `const` 的意思是：`nodes` 和 `arr` 这两个变量名后面不会再指向别的东西。

注意：`const` 锁定的是“变量指向的地址”，不是对象内部的内容。

```js
const arr = [1, 2, 3];

arr.push(4); // 允许：数组本身还是原来的数组
arr[0] = 99; // 允许：修改数组内部内容

arr = [5, 6, 7]; // 报错：不允许重新赋值
```

所以操作 DOM 元素或数组时，即使会修改它们的属性或内容，只要不重新给变量赋值，就应该用 `const`。

```js
const textNode = document.querySelector(".text");

textNode.style.color = "red"; // 允许：修改对象内部属性
```

只有变量确实需要变化时，才使用 `let`：

```js
let count = 0;
count++;

let themeColor = "white";
if (isDarkMode) {
  themeColor = "black";
}
```

不推荐使用 `var`，因为它没有块级作用域，并且存在变量提升，容易造成难排查的问题。

## 5. 修改元素

拿到元素对象后，就可以像修改普通 JavaScript 对象一样修改它。

### 修改文字内容

```js
element.innerText = "新文字";
```

`innerText` 只修改纯文本。

```js
element.innerHTML = "<strong>加粗文字</strong>";
```

`innerHTML` 会解析 HTML 标签。

注意：

- 只需要改文字时，优先用 `innerText`。
- 需要插入 HTML 结构时，才使用 `innerHTML`。

## 6. 修改样式

修改样式有两种常见方式：

1. 直接改 `style`：适合临时修改少量样式。
2. 切换 `class`：适合实际开发中的状态变化，更推荐。

### 方式一：直接修改 style

```js
element.style.color = "red";
element.style.backgroundColor = "yellow";
```

`element.style.xxx = "..."` 的本质是给元素添加或修改行内样式：

```html
<div style="color: red;"></div>
```

使用时记住两个规则：

- CSS 中的 `background-color`，在 JS 中要写成小驼峰 `backgroundColor`。
- 长度值通常要带单位，例如 `"100px"`，不能只写 `100`。

常见转换：

| CSS 写法 | JS 写法 |
| --- | --- |
| `background-color` | `element.style.backgroundColor` |
| `font-size` | `element.style.fontSize` |
| `margin-left` | `element.style.marginLeft` |

```js
box.style.width = "100px"; // 正确
box.style.opacity = 0.5; // opacity 不需要单位
```

### 方式二：通过 class 修改样式

更推荐的做法是：先在 CSS 中写好样式，再用 JS 切换 class。

CSS：

```css
.text {
  color: #333;
}

.text.active {
  color: red;
  font-weight: bold;
}
```

JavaScript：

```js
const textNode = document.querySelector(".text");

textNode.classList.add("active");
textNode.classList.remove("active");
textNode.classList.toggle("active");
```

这种方式更适合实际开发：

- JS 负责切换状态。
- CSS 负责具体样式。
- 多个样式可以通过一个 class 一次性切换。
- 代码更清晰，也更容易维护。

### 补充注意

- `element.style` 只能读取行内样式，读不到 CSS 文件里写的样式。
- 如果要读取浏览器最终生效的样式，使用 `window.getComputedStyle(element)`。
- `style` 不能直接修改 `::before`、`::after` 伪元素，通常通过切换 class 间接控制。
- 不建议频繁使用 `!important`，否则样式会难维护。

## 7. 修改标准属性

DOM 元素的 HTML 属性，可以通过两种方式操作：

1. 直接操作 DOM property，例如 `img.src`。
2. 使用 Attribute 方法，例如 `getAttribute`、`setAttribute`。

### 常用 property

```js
img.src = "new-image.jpg";
input.value = "用户输入的值";
a.href = "https://example.com";
```

很多常见属性都可以直接通过 property 修改：

| 属性 | 用途 |
| --- | --- |
| `img.src` | 修改图片地址 |
| `input.value` | 修改输入框当前值 |
| `a.href` | 修改链接地址 |

### Attribute 方法

Attribute 指的是写在 HTML 标签上的原始属性。

```html
<img src="pic.png" alt="图片说明">
```

如果要明确读取、设置、判断或删除标签上的 attribute，可以使用：

```js
img.getAttribute("src");
img.setAttribute("src", "new-pic.png");
img.hasAttribute("alt");
img.removeAttribute("alt");
```

简单区分：

- property：DOM 对象上的属性，日常操作更常用。
- attribute：HTML 标签上的原始属性，需要精确操作标签属性时使用。

### property 和 attribute 的区别

大多数时候可以直接用 property，但表单元素要注意区别。

HTML：

```html
<input type="text" value="默认值">
```

JavaScript：

```js
const input = document.querySelector("input");

input.value = "用户输入的新值";

console.log(input.value); // "用户输入的新值"
console.log(input.getAttribute("value")); // "默认值"
```

原因是：

- `input.value` 表示输入框当前的值。
- `getAttribute("value")` 读取的是 HTML 标签上最初写的值。

### data-* 自定义属性

如果想在 HTML 上保存一些给 JS 使用的数据，推荐使用 `data-*`。

HTML：

```html
<button data-id="1001" data-role="delete">删除</button>
```

JavaScript：

```js
const btn = document.querySelector("button");

console.log(btn.dataset.id); // "1001"
console.log(btn.dataset.role); // "delete"
```

```js
btn.dataset.id = "1002";
btn.dataset.role = "edit";
```

如果属性名里有多个单词，`dataset` 会转成小驼峰：

```html
<button data-user-id="1001">用户</button>
```

```js
btn.dataset.userId; // "1001"
```

入门阶段记住：常见属性优先用 property，自定义数据优先用 `data-*` 和 `dataset`。

## 8. 监听事件

事件监听用于让网页响应用户操作，例如点击、输入、滚动、键盘按下等。

基本语法：

```js
元素.addEventListener("事件名称", 触发后执行的函数);
```

示例：

```js
const btn = document.querySelector("#submit-btn");

btn.addEventListener("click", function () {
  alert("按钮被点击了！");
});
```

含义：

- 找到按钮元素。
- 监听它的 `click` 点击事件。
- 当用户点击按钮时，执行回调函数里的代码。

## 9. 综合示例

需求：点击按钮后，让一段文字变成红色。

HTML：

```html
<p class="text">这是一段文字</p>
<button id="color-btn">变红</button>
```

JavaScript：

```js
const textNode = document.querySelector(".text");
const btnNode = document.querySelector("#color-btn");

btnNode.addEventListener("click", function () {
  textNode.style.color = "red";
});
```

执行流程：

1. 使用 `querySelector` 找到文字和按钮。
2. 给按钮绑定 `click` 事件。
3. 用户点击按钮后，修改文字颜色。

## 10. 本节重点

- DOM 是浏览器生成的节点树。
- JS 通过 DOM 节点对象修改网页。
- DOM 节点、`NodeList`、`Element`、`window` 都可以理解为浏览器提供的对象。
- 操作 DOM 通常分四步：建模、查找、修改、监听事件。
- 查找元素常用 `querySelector` 和 `querySelectorAll`。
- `getElementById` 等传统查找方法需要能读懂，但新代码优先用 `querySelector` 系列。
- 修改内容可用 `innerText` 或 `innerHTML`。
- 修改样式推荐使用 `classList`。
- 修改常见 DOM 属性可以直接用 property，例如 `img.src`、`input.value`。
- 读取或修改 HTML 标签上的 attribute，可以用 `getAttribute`、`setAttribute`、`removeAttribute`。
- 自定义数据推荐使用 `data-*`，在 JS 中可通过 `dataset` 读取。
- 网页交互通常通过 `addEventListener` 实现。
