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
button?.addEventListener<`click`>('click', getData);
```

这句表示：

- 如果按钮存在；
- 就给按钮绑定点击事件；
- 点击后执行 `getData`；
- `getData` 会请求新数据，并追加新表格行。

普通写法可以更简单：

```ts
button?.addEventListener('click', getData);
```

`addEventListener<\`click\`>` 这里虽然能表达事件类型，但入门阶段先用普通写法更清晰。

### 表格点击：删除图片行

```ts
tableBody?.addEventListener<`click`>('click', (ev: MouseEvent) => {
    WebDisplay.deleteData(<HTMLAnchorElement>ev.target);
});
```

这句表示：

- 如果 `tableBody` 存在；
- 就监听整个表格主体的点击事件；
- 点击后把 `ev.target` 当成 `HTMLAnchorElement`；
- 再交给 `WebDisplay.deleteData()` 删除对应行。

这属于一种常见写法：事件委托。

事件委托的意思是：不需要给每一个 `X` 单独绑定事件，而是把事件绑定在父元素 `tableBody` 上。后面动态新增的表格行，也能被这个事件监听到。

不过当前代码有一个需要注意的点：它没有判断用户点到的是不是 `X` 链接。也就是说，如果点到表格里的图片、文字或其他单元格，也会尝试执行删除逻辑。

更稳一点的写法是先判断目标元素：

```ts
tableBody?.addEventListener('click', (ev: MouseEvent) => {
  const target = ev.target;

  if (!(target instanceof HTMLAnchorElement)) {
    return;
  }

  WebDisplay.deleteData(target);
});
```

## 当前代码里的几个注意点

### 1. 命名已经统一成 dog

现在接口地址是：

```ts
https://api.thedogapi.com/v1/images/search
```

对应类型和类名也已经统一为：

```ts
DogType
Dog
dog
```

这样语义就一致了：请求狗狗图片，代码里也用狗狗相关命名。

### 2. 删除功能已经有了，但还可以更稳

表格行里有：

```html
<a href="#">X</a>
```

现在点击表格区域时会调用：

```ts
WebDisplay.deleteData(<HTMLAnchorElement>ev.target);
```

问题是：当前代码直接把点击目标当作删除按钮，没有先判断它是不是 `<a>`。

更安全的做法是：

- 先判断 `ev.target instanceof HTMLAnchorElement`。
- 确认点到的是删除链接后，再执行删除。

### 3. 初始 HTML 里有一行占位数据

`index.html` 的 `tbody` 里现在自带了一行：

```html
<tr>
    <td>idxxx</td>
    ...
</tr>
```

所以页面刚打开时会显示一行假数据。后面如果想让表格一开始为空，可以删掉这行。

### 4. `innerHTML` 适合练习，但要知道风险

你现在用：

```ts
tableRow.innerHTML = `...`;
```

练习阶段没问题，写起来直观。

但真实项目里，如果内容来自用户输入，直接拼 `innerHTML` 可能有安全风险。后面可以练习用 `createElement()` 和 `textContent` 更安全地生成 DOM。

### 5. `<HTMLAnchorElement>` 和 `as HTMLAnchorElement` 是同类写法

当前代码里有：

```ts
WebDisplay.deleteData(<HTMLAnchorElement>ev.target);
```

这也是类型断言，和下面写法意思接近：

```ts
WebDisplay.deleteData(ev.target as HTMLAnchorElement);
```

在 `.tsx` 文件里通常不能用 `<HTMLAnchorElement>` 这种写法，因为容易和 JSX 标签冲突。普通 `.ts` 文件里可以用，但入门阶段建议优先记 `as HTMLAnchorElement`，可读性更好。

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
