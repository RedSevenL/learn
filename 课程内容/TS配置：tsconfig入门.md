# TS 配置：tsconfig 入门

## tsconfig.json 是什么

`tsconfig.json` 是 TypeScript 编译器的配置文件。

它主要告诉 `tsc`：

- 要编译哪些 `.ts` 文件。
- 编译后的 `.js` 文件放到哪里。
- 按什么 JavaScript 版本输出。
- 是否开启严格类型检查。
- 当前代码运行在浏览器还是 Node.js 环境。

有了 `tsconfig.json` 后，就可以在对应目录运行：

```bash
tsc
```

或者在项目根目录运行：

```bash
tsc -p ts-practice/tsconfig.json
```

## 当前练习场景

你现在的练习目录是：

```text
ts-practice/
  index.html
  tsconfig.json
  src/
    index.ts
  dist/
    index.js
```

这是一个浏览器页面练习，所以重点是：

1. 浏览器不能直接运行 `.ts` 文件。
2. 需要先把 `src/index.ts` 编译成 `dist/index.js`。
3. `index.html` 应该引入编译后的 `.js` 文件。

推荐把文件分成三类：

- `index.html`：页面入口，负责展示页面。
- `src/`：源码目录，自己主要写这里。
- `dist/`：编译输出目录，由 `tsc` 自动生成，不手动改。

## 推荐配置

当前推荐使用：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "Preserve",
    "lib": ["DOM", "ES2020"],
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "sourceMap": true,
    "noEmitOnError": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

## 关键字段解释

### target

```json
"target": "ES2020"
```

表示编译后的 JavaScript 使用 ES2020 语法。

### module

```json
"module": "Preserve"
```

表示保留源码里的模块写法。

当前 `src/index.ts` 没有写 `import` / `export`，编译出来就是普通 JS，可以直接被 HTML 加载。

对应 HTML 中建议这样引入：

```html
<script src="./dist/index.js"></script>
```

### lib

```json
"lib": ["DOM", "ES2020"]
```

表示当前代码可以使用：

- `DOM`：浏览器里的 `document`、`window`、`HTMLElement` 等。
- `ES2020`：ES2020 版本的 JavaScript API。

如果不加 `DOM`，写 `document.querySelector()` 时可能会出现类型提示问题。

### rootDir

```json
"rootDir": "./src"
```

表示 TypeScript 源码放在 `src/` 目录里。

### outDir

```json
"outDir": "./dist"
```

表示编译后的 JavaScript 输出到 `dist/` 文件夹。

例如：

```text
src/index.ts -> dist/index.js
```

### strict

```json
"strict": true
```

开启严格类型检查。

入门阶段可能会觉得更容易报错，但这是好事，可以帮助你更早发现类型问题。

### sourceMap

```json
"sourceMap": true
```

生成 `.js.map` 文件，方便浏览器开发者工具把 JS 错误定位回 TS 源码。

### noEmitOnError

```json
"noEmitOnError": true
```

如果 TypeScript 有类型错误，就不输出 JavaScript 文件。

这样可以避免错误代码被编译出来继续运行。

### include

```json
"include": ["src/**/*.ts"]
```

表示编译 `src/` 目录下所有 `.ts` 文件。

## HTML 需要注意

不要这样写：

```html
<script src="index.ts"></script>
```

浏览器不能直接执行 TypeScript。

应该写成：

```html
<script src="./dist/index.js"></script>
```

然后运行：

```bash
tsc -p ts-practice/tsconfig.json
```

TypeScript 会把：

```text
ts-practice/src/index.ts
```

编译成：

```text
ts-practice/dist/index.js
```

## 文件路径怎么写

路径要站在“当前文件的位置”去看。

当前 `index.html` 在 `ts-practice/` 目录下：

```text
ts-practice/
  index.html
  dist/
    index.js
```

所以 HTML 里引用 JS 要写：

```html
<script src="./dist/index.js"></script>
```

含义是：

- `./`：从当前 HTML 所在目录开始。
- `dist/`：进入 `dist` 文件夹。
- `index.js`：加载编译后的 JS 文件。

不要写：

```html
<script src="./src/index.ts"></script>
```

原因是浏览器不能直接运行 TypeScript，也不应该直接加载源码目录。

如果后面开始学习 `import` / `export`，再把 HTML 改成 `type="module"`，并配合本地开发服务器使用。

## 终端怎么配合 tsc

方式一：进入练习目录后运行。

```bash
cd ts-practice
tsc
```

方式二：站在项目根目录运行。

```bash
tsc -p ts-practice/tsconfig.json
```

更推荐练习时使用监听模式：

```bash
cd ts-practice
tsc --watch
```

这样你每次保存 `src/index.ts`，TypeScript 都会自动重新编译到 `dist/index.js`。

日常操作顺序：

1. 打开一个终端运行 `cd ts-practice && tsc --watch`。
2. 在 `src/index.ts` 写 TypeScript。
3. 保存文件后等待自动编译。
4. 浏览器打开或刷新 `index.html`。
5. 如果页面没变化，先看终端有没有 TypeScript 报错。

## 入门阶段记住

- `tsconfig.json` 是 TypeScript 的编译规则。
- 浏览器运行的是 JavaScript，不是 TypeScript。
- `.ts` 要先用 `tsc` 编译成 `.js`。
- HTML 引入编译后的 `.js` 文件。
- 自己写源码放 `src/`，编译结果放 `dist/`。
- 浏览器 DOM 练习要在 `lib` 里包含 `"DOM"`。
