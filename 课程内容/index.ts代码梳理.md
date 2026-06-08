# index.ts 代码梳理

## 这段代码整体在做什么

当前 `ts-practice/src/index.ts` 是一个浏览器端 TypeScript 练习。

整体流程是：

1. 找到页面里的按钮和表格主体。
2. 点击按钮时，请求 Dog API 图片数据。
3. 从接口返回结果里取第一条图片数据。
4. 把图片 id、预览图、高度、宽度、地址追加到表格中。
5. 点击表格里的 `X` 时，删除对应的表格行。

对应页面结构来自 `ts-practice/index.html`：

- 按钮：`<button class="remind">随机一只土豆</button>`
- 表格主体：`<tbody id="tableBody">`
- 编译后的 JS：`<script src="./dist/index.js"></script>`

## 1. 页面元素和接口地址

```ts
const url: string = 'https://api.thedogapi.com/v1/images/search';
const button: HTMLButtonElement | null = document.querySelector('button');
const tableBody: HTMLTableSectionElement | null = document.querySelector('#tableBody');
```

这里做了三件事：

- `url` 保存 Dog API 请求地址。
- `button` 获取页面上的第一个 `button`。
- `tableBody` 获取 `id="tableBody"` 的表格主体。

类型里带了 `| null`，因为 `document.querySelector()` 不一定能找到元素。

所以后面使用了可选链：

```ts
tableBody?.appendChild(tableRow);
button?.addEventListener('click', getData);
```

意思是：如果元素存在，就执行；如果是 `null`，就跳过。

## 2. 用 interface 描述数据结构

```ts
interface DogType {
    id: string;
    url: string;
    height: number;
    width: number;
    test?: boolean;
}
```

`DogType` 描述了一条狗狗图片数据应该有什么字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `id` | `string` | 图片 id |
| `url` | `string` | 图片地址 |
| `height` | `number` | 图片高度 |
| `width` | `number` | 图片宽度 |
| `test?` | `boolean` | 可选字段，可有可无 |

`test?: boolean` 里的 `?` 表示这个字段不是必须的。

## 3. 用 class 实现接口

```ts
class Dog implements DogType {
    test?: boolean;
  
    constructor(
      public id: string,
      public url: string,
      public height: number,
      public width: number
    ) {}
}
```

这里定义了一个 `Dog` 类，并要求它符合 `DogType` 这个接口。

关键点是构造函数参数前面的 `public`：

```ts
constructor(public id: string)
```

它等价于手动写：

```ts
id: string;

constructor(id: string) {
  this.id = id;
}
```

所以你下面注释掉的那段代码，就是展开写法。

## 4. WebDisplay.addData 负责把数据渲染到页面

```ts
class WebDisplay {
    public static addData(data: DogType) :void {
        const dog: Dog = new Dog(data.id, data.url, data.height, data.width);
        const tableRow: HTMLTableRowElement = document.createElement('tr');
        tableRow.innerHTML = `
        <td>${dog.id}</td>
        <td><img src="${dog.url}" /></td>
        <td>${dog.height.toString()}</td>
        <td>${dog.width.toString()}</td>
        <td>${dog.url}</td>
        <td><a href="#">X</a></td>
        `;
        tableBody?.appendChild(tableRow); 
    }
}
```

`WebDisplay.addData()` 的作用是：

1. 接收一条狗狗图片数据。
2. 用这条数据创建一个 `Dog` 实例。
3. 创建一个新的 `<tr>`。
4. 用模板字符串拼出表格行内容。
5. 把这一行追加到 `tableBody` 里。

`static` 表示这个方法属于类本身，不需要先创建 `new WebDisplay()`。

所以可以直接调用：

```ts
WebDisplay.addData(data);
```

## 5. WebDisplay.deleteData 负责删除表格行

```ts
public static deleteData(deleteButton: HTMLAnchorElement): void {
    const td = deleteButton.parentElement as HTMLTableCellElement;
    const tr = td.parentElement as HTMLTableRowElement;
    tr.remove();
}
```

这段代码的作用是：根据被点击的删除按钮，找到它所在的表格行，然后删除整行。

DOM 结构大概是：

```html
<tr>
  <td><a href="#">X</a></td>
</tr>
```

所以查找顺序是：

1. `deleteButton` 是被点击的 `<a>`。
2. `deleteButton.parentElement` 找到外层 `<td>`。
3. `td.parentElement` 找到外层 `<tr>`。
4. `tr.remove()` 删除整行。

这里用了类型断言：

```ts
as HTMLTableCellElement
as HTMLTableRowElement
```

意思是告诉 TypeScript：这里拿到的父元素应该分别是表格单元格和表格行。

## 6. getJSON 是通用请求函数

```ts
async function getJSON<T>(url: string): Promise<T> {
    const response: Response = await fetch(url);
    const json: Promise<T> = await response.json();
    return json;
}
```

这个函数负责请求接口并返回 JSON。

这里用了泛型 `<T>`：

```ts
getJSON<DogType[]>(url)
```

意思是告诉 TypeScript：这次请求返回的数据应该被当作 `DogType[]`，也就是 `DogType` 数组。

一个小细节：

```ts
const json: Promise<T> = await response.json();
```

这里写成 `Promise<T>` 不太准确，因为 `await response.json()` 之后拿到的已经是解析后的结果。更自然的写法是：

```ts
const json: T = await response.json();
```

## 7. getData 是点击按钮后真正执行的流程

```ts
async function getData(): Promise<void> {
    try {
        const json: DogType[] = await getJSON<DogType[]>(url);
        const data: DogType = json[0];
        WebDisplay.addData(data);
    }
    catch (error: Error|unknown) {
        let message: string;
        if (error instanceof Error) {
            message = error.message;
        } else {
            message = String(error);
        }
        console.log(message);
        console.error(error);
    }
}
```

这段是新增图片的主逻辑：

1. 调用 `getJSON<DogType[]>(url)` 请求数据。
2. 接口返回数组，所以用 `json[0]` 取第一条。
3. 把这条数据交给 `WebDisplay.addData()` 渲染到页面。
4. 如果请求或渲染出错，就进入 `catch`。

`catch (error: Error | unknown)` 里用：

```ts
error instanceof Error
```

是为了判断错误对象是不是标准 `Error`，这样才能安全读取 `error.message`。

## 8. 绑定两个点击事件

### 按钮点击：新增图片

```ts
button?.addEventListener('click', getData);
```

这句表示：

- 如果按钮存在；
- 就给按钮绑定点击事件；
- 点击后执行 `getData`；
- `getData` 会请求新数据，并追加新表格行。

这里没有手写 `<\`click\`>` 和 `(ev: MouseEvent)`，因为 TypeScript 通常可以根据 `'click'` 自动推断事件类型。入门阶段优先记这种简单写法。

### addEventListener 的基本格式

```ts
元素.addEventListener('事件名', 事件触发后要执行的函数);
```

例如：

```ts
button?.addEventListener('click', getData);
```

意思是：

> 监听按钮的点击事件，点击后执行 `getData`。

常见事件名：

| 事件名 | 常见触发场景 |
| --- | --- |
| `'click'` | 鼠标点击按钮、链接、图片、表格等元素 |
| `'keydown'` | 键盘按下某个键 |
| `'input'` | 输入框内容发生变化 |
| `'submit'` | 表单提交 |

示例：

```ts
input.addEventListener('input', () => {
  console.log('输入框内容变了');
});

document.addEventListener('keydown', () => {
  console.log('按下了键盘');
});

form.addEventListener('submit', () => {
  console.log('提交了表单');
});
```

简单记：

> `addEventListener('click', ...)` 就是监听点击事件。  
> 第一个参数写“监听什么事件”，第二个参数写“事件发生后做什么”。

### 表格点击：删除图片行

```ts
tableBody?.addEventListener('click', (ev) => {
    const target = ev.target;

    if (!(target instanceof HTMLAnchorElement)) {
        return;
    }

    WebDisplay.deleteData(target);
});
```

这句表示：

- 如果 `tableBody` 存在；
- 就监听整个表格主体的点击事件；
- 点击后先取出真正被点击的元素 `ev.target`；
- 如果点到的不是 `<a>`，直接 `return`，不删除；
- 如果点到的是 `<a>`，再交给 `WebDisplay.deleteData()` 删除对应行。

这属于一种常见写法：事件委托。

事件委托的意思是：不需要给每一个 `X` 单独绑定事件，而是把事件绑定在父元素 `tableBody` 上。后面动态新增的表格行，也能被这个事件监听到。

这里最关键的是这句：

```ts
if (!(target instanceof HTMLAnchorElement)) {
    return;
}
```

它是在运行时判断：当前点到的元素到底是不是 `<a>`。

如果点到图片、文字、单元格空白处，就不会继续执行删除。

如果点到 `X` 链接，`target` 就是 `HTMLAnchorElement`，可以安全传给：

```ts
WebDisplay.deleteData(target);
```

### instanceof 的含义

`instanceof` 是 JavaScript 里的运行时判断，用来检查某个对象是不是由某个类、构造函数或 DOM 元素类型创建出来的。

格式：

```ts
对象 instanceof 类型
```

返回值是布尔值：

- 是这个类型：返回 `true`。
- 不是这个类型：返回 `false`。

例如：

```ts
target instanceof HTMLAnchorElement
```

意思是：

> 判断 `target` 是不是一个 `<a>` 元素。

配合取反 `!`：

```ts
if (!(target instanceof HTMLAnchorElement)) {
    return;
}
```

意思是：

> 如果 `target` 不是 `<a>`，就直接结束函数，不继续删除。

`instanceof` 和 `as` 的区别：

| 写法 | 作用 | 是否真的检查运行时对象 |
| --- | --- | --- |
| `target as HTMLAnchorElement` | 类型断言，告诉 TS 我认为它是 `<a>` | 否 |
| `target instanceof HTMLAnchorElement` | 运行时判断，检查它是不是真的是 `<a>` | 是 |

简单记：

> `as` 是“我告诉 TS 它是什么”。  
> `instanceof` 是“运行时真的检查它是不是”。

## 当前代码里的几个注意点


### 1. 删除功能已经做了目标判断

表格行里有：

```html
<a href="#">X</a>
```

现在点击表格区域时，会先判断点到的元素是不是 `<a>`：

```ts
if (!(target instanceof HTMLAnchorElement)) {
    return;
}
```

只有确认点到的是删除链接，才会执行删除。这样点图片、文字或其他单元格时，不会误删整行。

### 2. 初始 HTML 里有一行占位数据

`index.html` 的 `tbody` 里现在自带了一行：

```html
<tr>
    <td>idxxx</td>
    ...
</tr>
```

所以页面刚打开时会显示一行假数据。后面如果想让表格一开始为空，可以删掉这行。

### 3. `innerHTML` 适合练习，但要知道风险

你现在用：

```ts
tableRow.innerHTML = `...`;
```

练习阶段没问题，写起来直观。

但真实项目里，如果内容来自用户输入，直接拼 `innerHTML` 可能有安全风险。后面可以练习用 `createElement()` 和 `textContent` 更安全地生成 DOM。

### 4. 类型断言和运行时判断不一样

旧写法里可能会看到：

```ts
WebDisplay.deleteData(<HTMLAnchorElement>ev.target);
```

这也是类型断言，和下面写法意思接近：

```ts
WebDisplay.deleteData(ev.target as HTMLAnchorElement);
```

这两种都是类型断言，意思是告诉 TypeScript：“我认为它是 `<a>`”。

但类型断言只影响 TypeScript 检查，不会改变浏览器里真实的元素。

所以如果想防止点错地方，不能只靠断言，更应该用运行时判断：

```ts
if (!(target instanceof HTMLAnchorElement)) {
    return;
}
```

入门阶段可以这样记：

- `as HTMLAnchorElement`：告诉 TS 我认为它是 `<a>`。
- `target instanceof HTMLAnchorElement`：真的检查它是不是 `<a>`。

## 一句话总结

你这份 `index.ts` 主要练了这些 TypeScript 和浏览器基础：

- DOM 查询和 DOM 类型标注。
- `interface` 定义数据形状。
- `class implements interface`。
- 构造函数参数属性 `public id: string`。
- `static` 静态方法。
- `fetch` 请求接口。
- `async / await`。
- 泛型函数 `getJSON<T>()`。
- `try / catch` 错误处理。
- 点击事件绑定。
- 事件委托。
- 类型断言。
- DOM 父子节点查找和删除。
