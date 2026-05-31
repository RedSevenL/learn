# JS 语法提升：闭包与函数

## 1. 闭包是什么

闭包指的是：一个函数可以继续访问它定义时所在作用域里的变量，即使外层函数已经执行结束。

```js
function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2
```

在这个例子中：

- `count` 是 `createCounter()` 内部的局部变量。
- 外层函数执行结束后，`count` 没有消失。
- 返回出去的内层函数仍然可以访问并修改 `count`。

## 2. 闭包的核心机制

### 初始化阶段

```js
const counter = createCounter();
```

发生了这些事：

- `createCounter()` 执行，创建局部变量 `count = 0`。
- 内层函数引用了 `count`，闭包形成。
- 外层函数执行结束后，普通局部栈帧销毁。
- 但 `count` 因为仍被内层函数引用，会被保留下来。

### 调用阶段

```js
counter();
```

每次调用 `counter()` 时：

- 内层函数开始执行。
- 它自己的作用域里没有 `count`。
- JS 会沿着作用域链找到闭包保存的 `count`。
- 执行 `count++`，并保留修改后的值。

所以多次调用会得到连续结果：

```js
counter(); // 1
counter(); // 2
counter(); // 3
```

## 3. 闭包为什么能实现私有变量

```js
function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();
```

外部无法直接访问 `count`：

```js
console.log(count); // 报错：count is not defined
```

即使这样写，也不能修改闭包里的 `count`：

```js
counter.count = 100;

console.log(counter()); // 1，不是 101
```

原因是：

- `counter.count = 100` 只是给函数对象额外添加了一个属性。
- 闭包内部读取的仍然是被保存的局部变量 `count`。
- 外部没有直接访问这个局部变量的入口。

核心结论：

> 闭包的本质是延长局部变量的生命周期，并让函数成为访问这个变量的唯一接口。

## 4. 闭包的高级用法：保存旧参数，等待新参数

闭包常用于“先保存一部分数据，之后再传入另一部分数据”。

可以理解为：

- 外层函数先接收参数 A。
- 参数 A 被闭包保存下来。
- 以后内层函数再接收参数 B。
- 最终用 A 和 B 一起计算结果。

## 5. 柯里化 Currying

柯里化指的是：把一个接收多个参数的函数，拆成一串每次只接收一个参数的函数。
注：在 JavaScript 中，函数的形参（Parameter）在本质上与函数内部声明的局部变量（Variable）是一样的，它们都存在于该函数的执行上下文（Execution Context）中。

```js
function discount(rate) {
  return function (price) {
    return price * rate;
  };
}

const applyDiscount = discount(0.8);

console.log(applyDiscount(100)); // 80
console.log(applyDiscount(250)); // 200
```

这里的流程是：

- `discount(0.8)` 先保存折扣率。
- `applyDiscount(100)` 再传入商品价格。
- 闭包把折扣率和价格组合起来计算。

## 6. 偏函数 Partial Application

偏函数指的是：提前固定函数的一部分参数，返回一个接收剩余参数的新函数。

```js
function sendLog(api, page, eventType) {
  console.log(api, page, eventType);
}

const logHomePageEvent = function (eventType) {
  return sendLog("https://api.com", "HomePage", eventType);
};

logHomePageEvent("click_buy_button");
```

适合场景：

- 日志埋点。
- API 请求封装。
- 提前绑定环境、页面、用户等公共参数。

核心价值：

- 公共参数只传一次。
- 后续调用只需要传变化的参数。
- 逻辑可以先准备好，真正需要时再执行。

## 7. 回调函数 Callback

回调函数指的是：把一个函数作为参数传给另一个函数，由宿主函数在合适的时机调用它。

```js
function fetchUserData(userId, callback) {
  console.log(`正在获取用户 ${userId} 的数据...`);

  const user = { id: userId, name: "Alex" };

  callback(user);
}

fetchUserData(101, function (data) {
  console.log(`获取成功，用户名为: ${data.name}`);
});
```

在这个例子中：

- `fetchUserData` 是宿主函数。
- `callback` 是传入的回调函数。
- 数据准备好之后，宿主函数再执行 `callback(user)`。
- 回调函数可以现写现用，适合一次性逻辑。

## 8. 传入具名函数

如果处理逻辑会复用，可以先定义函数，再把函数名传进去。

```js
function handleUserData(data) {
  console.log(`获取成功，用户名为: ${data.name}`);
}

function fetchUserData(userId, callback) {
  const user = { id: userId, name: "Alex" };
  callback(user);
}

fetchUserData(101, handleUserData);
```

注意：作为参数传递时，传函数名，不要加括号。

```js
fetchUserData(101, handleUserData);   // 正确
fetchUserData(101, handleUserData()); // 错误
```

区别是：

- `handleUserData`：把函数本身传进去，等宿主函数需要时再调用。
- `handleUserData()`：立刻执行函数，并把返回值传进去。

如果 `handleUserData()` 的返回值是 `undefined`，宿主函数内部再执行 `callback(user)` 时就会报错，因为 `undefined` 不是函数。

## 9. 箭头函数基础

箭头函数是函数的一种简洁写法。

核心格式：

```js
const fn = (参数) => {
  函数体
};
```

## 10. 零参数箭头函数

没有参数时，左侧必须写 `()`。

```js
const sayHi = () => console.log("Hello Simon!");
```

等价于：

```js
function sayHi() {
  console.log("Hello Simon!");
}
```

## 11. 单参数箭头函数

只有一个参数时，参数外面的括号可以省略。

```js
const square = n => n * n;

console.log(square(5)); // 25
```

等价于：

```js
function square(n) {
  return n * n;
}
```

## 12. 多参数箭头函数

两个及以上参数时，必须写 `()`。

```js
const add = (a, b) => a + b;

console.log(add(10, 20)); // 30
```

## 13. 多行箭头函数

如果函数体有多行代码，需要写 `{}`，并且必须手动 `return`。

```js
const getRectArea = (width, height) => {
  let area = width * height;
  return area;
};

console.log(getRectArea(5, 4)); // 20
```

注意：

```js
const getRectArea = (width, height) => {
  width * height;
};

console.log(getRectArea(5, 4)); // undefined
```

只要用了 `{}`，就不会自动返回结果。

```js
const getRectArea = (width, height) => width * height;

console.log(getRectArea(5, 4)); // 输出: 20
```
不加`{}`，会自动补上return

## 14. 箭头函数与闭包结合

用箭头函数可以把闭包写得很简洁。

```js
const makeAdder = a => b => a + b;

const addFive = makeAdder(5);

console.log(addFive(6)); // 11
```

拆开理解：

```js
const makeAdder = function (a) {
  return function (b) {
    return a + b;
  };
};
```

执行流程：

- `makeAdder(5)`：保存参数 `a = 5`。
- 返回一个新函数。
- `addFive(6)`：传入 `b = 6`。
- 最终计算 `5 + 6`。

## 15. 速记口诀

> 一行代码无大括号，自动 return；一个参数无小括号，自由简写。多行代码请回 `{}`，也要请回 `return`。

## 16. 本节重点

- 闭包让函数可以记住外层变量。
- 闭包可以实现数据私有化和状态持久化。
- 柯里化是把多个参数拆成多次传入。
- 偏函数是提前固定一部分参数。
- 回调函数是把函数交给宿主函数，在特定时机执行。
- 箭头函数适合写短函数，尤其适合和闭包组合使用。
