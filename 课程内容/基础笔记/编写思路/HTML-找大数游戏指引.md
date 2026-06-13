# HTML 找大数游戏指引

这个练习刚好可以把 TS 基础串起来：类型、DOM、事件、状态、函数拆分。

## 练习方式

这个项目按“我提示，你来写”的方式推进。

每一步只完成一个小目标：

1. 先写 HTML 骨架。
2. 再写基础 CSS。
3. 再写 TS 类型和状态。
4. 再写生成随机数。
5. 再写找最大值。
6. 再写渲染页面。
7. 再写点击事件。
8. 最后补倒计时、结束统计和弹窗。

不要一开始就追求完整游戏。每完成一步，先运行页面确认这一小步没问题，再进入下一步。

记录规则：

- 每推进一步，都把目标、提示、完成标准补进这份 `练习指引.md`。
- 遇到这种较长、分步骤的项目，先更新指引，再继续下一步。
- 代码由自己写；文档用来记录思路、顺序和复盘重点。
- 如果某一步写错了，也把更正后的理解补进文档，方便回看。

## 编写顺序

做这个练习时，不要一上来就想完整代码。

先按这个顺序推进：

```txt
HTML 结构
  ↓
CSS 样式
  ↓
TS 类型
  ↓
状态对象
  ↓
纯逻辑函数
  ↓
DOM 查询
  ↓
render 渲染
  ↓
事件绑定
  ↓
倒计时、统计、弹窗等增强功能
```

每一步只解决一个问题：

| 步骤 | 解决的问题 |
| --- | --- |
| HTML | 页面上有什么 |
| CSS | 页面怎么摆、怎么看 |
| 类型 | 程序里有哪些固定概念 |
| 状态 | 程序要记住哪些会变化的数据 |
| 纯逻辑函数 | 随机数怎么生成、最大值怎么判断 |
| DOM 查询 | TS 怎么拿到页面元素 |
| `render()` | 状态怎么显示到页面 |
| 事件 | 用户操作后怎么修改状态 |

核心思路：

> 页面只是显示状态，事件只是修改状态，`render()` 负责把状态同步到页面。

所以事件函数通常可以按这个句式写：

```txt
用户触发事件
  ↓
修改 state
  ↓
调用 render()
```

## 第 1 步：只写 HTML 结构

目标：先把页面上的 2 个按钮和 5 个区域写出来，不写游戏逻辑。

需要有这些元素：

- 按钮 A：开始游戏。
- 按钮 B：结束游戏。
- 区域 A：显示随机数。
- 区域 B：显示随机数。
- 区域 C：显示随机数。
- 区域 D：显示随机数。
- 区域 E：显示统计信息。

建议给元素加上清晰的 `id`，方便后面 TS 获取 DOM：

```html
<button id="startButton">按钮A</button>
<button id="endButton">按钮B</button>

<div id="zoneA">区域A</div>
<div id="zoneB">区域B</div>
<div id="zoneC">区域C</div>
<div id="zoneD">区域D</div>

<div id="statusPanel">区域E</div>
```

这一阶段先不要写随机数，也不要写事件。

完成标准：

- 浏览器能看到按钮 A、按钮 B。
- 浏览器能看到区域 A、B、C、D、E。
- HTML 里正确引入编译后的 JS：

```html
<script src="./dist/main.js"></script>
```

## 第 2 步：写最小样式

目标：让页面看起来接近题图，但不用追求完全一致。

建议：

- 先新建或编辑 `max-number-game/style.css`。
- `body` 设置基础字体、页面宽度和外边距。
- `button` 设置边框、内边距、字号和鼠标样式。
- 区域 A、B、C、D 设置宽高、边框、居中显示。
- 区域 E 设置稍宽一点，用来显示题数、得分、正确率。

建议先写这些选择器：

```css
body {
}

button {
}

#zoneA,
#zoneB,
#zoneC,
#zoneD {
}

#statusPanel {
}
```

区域 A-D 可以先这样起步：

```css
#zoneA,
#zoneB,
#zoneC,
#zoneD {
  width: 160px;
  height: 80px;
  border: 1px solid #999;
}
```

如果想让它们有一点布局，可以用 `display: inline-flex`：

```css
#zoneA,
#zoneB,
#zoneC,
#zoneD {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 12px;
}
```

这一阶段仍然不写游戏逻辑。

完成标准：

- 页面布局大致分成两行。
- 每个区域都能看清楚边界。
- 按钮和区域不会挤在一起。
- 区域 E 能单独看出来，后面可以放统计信息。

## 第 3 步：写 TS 类型和状态

目标：只写类型，不写完整游戏。

先定义区域类型：

```ts
type Zone = "A" | "B" | "C" | "D";
```

再定义游戏状态：

```ts
type GameState = {
  playing: boolean;
  round: number;
  score: number;
  numbers: Record<Zone, number>;
};
```

然后创建初始状态：

```ts
const state: GameState = {
  playing: false,
  round: 0,
  score: 0,
  numbers: {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  }
};
```

完成标准：

- `main.ts` 可以通过 TypeScript 编译。
- 暂时不用让页面变化。

本步检查点：

- `Zone` 只允许 `"A" | "B" | "C" | "D"`。
- `numbers` 用 `Record<Zone, number>`，表示 A-D 每个区域都有一个数字。
- 初始 `round` 和 `score` 都从 `0` 开始。
- 初始 `playing` 建议是 `false`，因为游戏要等点击按钮 A 后才开始。

## 后续路线

先这样思考整个练习：

```text
┌─ 这个练习的核心 ─────────────┐
│ 状态：题数、得分、当前4个数、是否游戏中 │
│ 操作：开始、生成题目、选择答案、结束游戏 │
│ 显示：A-D数字、E统计、倒计时、弹窗       │
└──────────────────────────┘
```

后面会继续补这些内容。

### 第 4 步：生成随机数

写 `generateNumbers()`。

目标：

- 生成 A-D 四个随机数。
- 先不用考虑重复。
- 返回 `Record<Zone, number>`。

先把函数写在 `state` 下面：

```ts
function generateNumbers(): Record<Zone, number> {
  return {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };
}
```

然后把每个 `0` 换成随机数。

生成 1 到 100 的随机整数：

```ts
Math.floor(Math.random() * 100) + 1
```

所以这一小步只做一件事：

> 让 `generateNumbers()` 能返回 4 个随机数。

暂时不要写点击事件，也不要写页面渲染。

可以临时加一句测试：

```ts
console.log(generateNumbers());
```

期望看到类似：

```ts
{ A: 23, B: 88, C: 7, D: 61 }
```

完成标准：

- `generateNumbers()` 有明确返回值类型：`Record<Zone, number>`。
- A、B、C、D 四个字段都有数字。
- 每次调用时，数字可能不同。
- `main.ts` 可以通过 TypeScript 编译。

### 第 5 步：找最大值

写 `getMaxZone(numbers)`。

目标：

- 从 A-D 四个数字里找出最大值所在区域。
- 返回类型是 `Zone`。
- 这是 `Zone`、`Record`、函数返回值的综合练习。

函数签名先这样写：

```ts
function getMaxZone(numbers: Record<Zone, number>): Zone {
}
```

思路：

1. 先假设 `A` 是最大值所在区域。
2. 依次比较 `B`、`C`、`D`。
3. 如果发现某个区域的数字更大，就更新最大区域。
4. 最后返回最大区域。

可以先用最直白的写法，不要急着写循环：

```ts
function getMaxZone(numbers: Record<Zone, number>): Zone {
  let maxZone: Zone = "A";

  if (numbers.B > numbers[maxZone]) {
    maxZone = "B";
  }

  if (numbers.C > numbers[maxZone]) {
    maxZone = "C";
  }

  if (numbers.D > numbers[maxZone]) {
    maxZone = "D";
  }

  return maxZone;
}
```

临时测试：

```ts
const testNumbers: Record<Zone, number> = {
  A: 10,
  B: 80,
  C: 30,
  D: 20
};

console.log(getMaxZone(testNumbers)); // 应该输出 "B"
```

完成标准：

- `getMaxZone()` 接收 `Record<Zone, number>`。
- `getMaxZone()` 返回 `Zone`。
- 给定测试数据时，能正确返回最大数字所在区域。
- `main.ts` 可以通过 TypeScript 编译。

### 第 6 步：渲染页面

写 `render()`。

目标：

- 把 `state.numbers` 显示到 A-D。
- 把题数、得分、正确率显示到 E。

这一阶段先做 DOM 查询和显示，不绑定点击事件。

先获取页面元素：

```ts
const zoneA = document.querySelector("#zoneA");
const zoneB = document.querySelector("#zoneB");
const zoneC = document.querySelector("#zoneC");
const zoneD = document.querySelector("#zoneD");
const statusPanel = document.querySelector("#statusPanel");
```

为了让 TypeScript 知道这些是普通 HTML 元素，可以写成：

```ts
const zoneA = document.querySelector("#zoneA") as HTMLDivElement;
const zoneB = document.querySelector("#zoneB") as HTMLDivElement;
const zoneC = document.querySelector("#zoneC") as HTMLDivElement;
const zoneD = document.querySelector("#zoneD") as HTMLDivElement;
const statusPanel = document.querySelector("#statusPanel") as HTMLDivElement;
```

再写 `render()`：

```ts
function render(): void {
  zoneA.textContent = state.numbers.A.toString();
  zoneB.textContent = state.numbers.B.toString();
  zoneC.textContent = state.numbers.C.toString();
  zoneD.textContent = state.numbers.D.toString();
}
```

然后补区域 E 的统计信息。

正确率可以先这样算：

```ts
const accuracy = state.round === 0 ? 0 : Math.round((state.score / state.round) * 100);
```

然后显示：

```ts
statusPanel.textContent = `题数：${state.round}，得分：${state.score}，正确率：${accuracy}%`;
```

临时测试：

```ts
state.numbers = generateNumbers();
render();
```

完成标准：

- 页面 A-D 能显示 `state.numbers` 里的数字。
- 区域 E 能显示题数、得分、正确率。
- 不需要点击按钮，刷新页面后能看到一次渲染结果即可。
- `main.ts` 可以通过 TypeScript 编译。

### 第 7 步：绑定事件

目标：

- 点按钮 A：开始游戏、生成题目、渲染页面。
- 点区域 A-D：判断答案、更新分数、生成下一题、渲染页面。
- 点按钮 B：结束游戏。

先获取按钮：

```ts
const startButton = document.querySelector("#startButton") as HTMLButtonElement;
const endButton = document.querySelector("#endButton") as HTMLButtonElement;
```

再写开始游戏事件：

```ts
startButton.addEventListener("click", () => {
  state.playing = true;
  state.round = 0;
  state.score = 0;
  state.numbers = generateNumbers();
  render();
});
```

然后写一个选择答案函数：

```ts
function chooseZone(selectedZone: Zone): void {
  if (!state.playing) {
    return;
  }

  const correctZone = getMaxZone(state.numbers);

  state.round += 1;

  if (selectedZone === correctZone) {
    state.score += 1;
  } else {
    state.score -= 1;
  }

  state.numbers = generateNumbers();
  render();
}
```

再给 A-D 区域绑定点击事件：

```ts
zoneA.addEventListener("click", () => chooseZone("A"));
zoneB.addEventListener("click", () => chooseZone("B"));
zoneC.addEventListener("click", () => chooseZone("C"));
zoneD.addEventListener("click", () => chooseZone("D"));
```

最后写结束游戏事件：

```ts
endButton.addEventListener("click", () => {
  state.playing = false;
  render();
});
```

完成标准：

- 点击按钮 A 后，A-D 显示随机数。
- 点击 A-D 任意区域后，题数加 1。
- 如果选到最大数，得分加 1。
- 如果没选到最大数，得分减 1。
- 每次选择后，A-D 都刷新为新的随机数。
- 点击按钮 B 后，游戏停止；再点 A-D 不应该继续计分。

### 第 8 步：第二轮增强

目标：

- 增加 10 秒倒计时。
- 超时按选择错误处理。
- 结束时显示做题数和得分。
- 正确率超过 90% 时弹窗祝贺。

这一轮不要一次全写完，拆成 4 个小步骤。

#### 第 8.1 步：给状态增加倒计时

目标：让程序记住当前这一轮还剩几秒。

修改 `GameState`：

```ts
type GameState = {
  playing: boolean;
  round: number;
  score: number;
  numbers: Record<Zone, number>;
  timeLeft: number;
};
```

初始状态补上：

```ts
timeLeft: 10
```

然后在 `render()` 的区域 E 中显示倒计时：

```ts
statusPanel.textContent = `题数：${state.round}，得分：${state.score}，正确率：${accuracy}%，剩余时间：${state.timeLeft}s`;
```

完成标准：

- 页面 E 区域能显示剩余时间。
- 先不用让时间真的减少。

#### 第 8.2 步：写计时器变量和两个函数

目标：能启动和停止倒计时。

先定义计时器变量：

```ts
let timerId: number | undefined;
```

写停止计时器函数：

```ts
function stopTimer(): void {
  if (timerId !== undefined) {
    clearInterval(timerId);
    timerId = undefined;
  }
}
```

写开始计时器函数：

```ts
function startTimer(): void {
  stopTimer();

  state.timeLeft = 10;
  render();

  timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    render();

    if (state.timeLeft <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 1000);
}
```

这里先会用到一个还没写的函数：

```ts
handleTimeout()
```

下一小步再写它。

完成标准：

- 调用 `startTimer()` 后，E 区域的剩余时间会从 10 开始减少。
- 调用 `stopTimer()` 后，倒计时停止。

#### 第 8.3 步：写超时处理

目标：超时按选择错误处理。

超时意味着：

- 如果游戏已经结束，什么都不做。
- 如果游戏正在进行，题数加 1。
- 得分减 1。
- 生成下一轮随机数。
- 重新开始 10 秒倒计时。
- 渲染页面。

函数可以这样设计：

```ts
function handleTimeout(): void {
  if (!state.playing) {
    return;
  }

  state.round += 1;
  state.score -= 1;
  state.numbers = generateNumbers();
  startTimer();
  render();
}
```

完成标准：

- 倒计时到 0 后，题数加 1。
- 得分减 1。
- A-D 刷新成新的随机数。
- 倒计时重新从 10 开始。

#### 第 8.4 步：把倒计时接到现有事件里

目标：开始、选择、结束都正确控制计时器。

开始游戏时：

```ts
startButton.addEventListener("click", () => {
  state.playing = true;
  state.round = 0;
  state.score = 0;
  state.numbers = generateNumbers();
  startTimer();
  render();
});
```

选择答案时，在生成下一题后重新开始倒计时：

```ts
state.numbers = generateNumbers();
startTimer();
render();
```

结束游戏时：

```ts
endButton.addEventListener("click", () => {
  state.playing = false;
  stopTimer();
  render();
});
```

完成标准：

- 点按钮 A 后开始倒计时。
- 每选择一次答案，倒计时重新从 10 开始。
- 点按钮 B 后倒计时停止。
- 超时会按错误处理。

#### 第 8.5 步：结束统计和祝贺弹窗

目标：游戏结束时显示结果；正确率超过 90% 时弹窗。

先写一个计算正确率的函数：

```ts
function getAccuracy(): number {
  return state.round === 0 ? 0 : Math.round((state.score / state.round) * 100);
}
```

然后结束游戏时：

```ts
endButton.addEventListener("click", () => {
  state.playing = false;
  stopTimer();
  render();

  const accuracy = getAccuracy();

  if (accuracy > 90) {
    alert("恭喜，正确率超过 90%！");
  }
});
```

完成标准：

- 点击按钮 B 后游戏结束。
- E 区域保留题数、得分、正确率。
- 正确率超过 90% 时弹窗祝贺。

第 8 步建议按 8.1 到 8.5 顺序写，不要跳着写。
