# 第 5 课：Git 与项目管理基础

## 本课目标

前几课我们已经完成了开发环境准备，并学习了 JavaScript 和 TypeScript 的基础。

从这一课开始，我们要学习如何管理项目文件。

写代码不是只把功能写出来就结束。一个真实项目还需要知道：

- 哪些文件发生了变化。
- 每次修改解决了什么问题。
- 如果代码改坏了，如何回头查看历史。
- 如何给项目留下说明文档。
- 如何把阶段性成果保存下来。

这些事情主要由 Git 和项目文档习惯来完成。

本课目标是让你掌握 Git 的最基础用法：

- 理解 Git 的作用。
- 理解 commit 是什么。
- 学会查看代码变化。
- 学会管理项目文件。
- 写一个基础 README。
- 初始化 Git 仓库并提交第一版项目。

学完本课后，你应该能够：

- 在项目中初始化 Git 仓库。
- 使用 `git status` 查看文件状态。
- 使用 `git diff` 查看具体修改。
- 使用 `git add` 选择要提交的文件。
- 使用 `git commit` 保存一次项目快照。
- 写出一个简单但有用的 `README.md`。

## 一、为什么需要 Git

刚开始写代码时，你可能会直接这样管理文件：

```txt
项目最终版
项目最终版2
项目最终版真的最终版
项目最终版不要改这个
```

这种方式在写普通文档时都容易混乱，写代码时更容易出问题。

因为代码项目里通常有很多文件：

- 页面文件。
- 组件文件。
- API 文件。
- 数据库 schema。
- 工具函数。
- 配置文件。
- 文档文件。

当项目变大后，你会经常遇到这些问题：

- 不知道自己改了哪些文件。
- 不知道某段代码什么时候加入的。
- 改坏了功能，却不知道怎么恢复。
- 想尝试新写法，又怕破坏原来的版本。
- 多人协作时不知道谁改了什么。

Git 就是为了解决这些问题而存在的。

你可以把 Git 理解成：

> 项目代码的时间机器和变更记录系统。

它可以记录项目在不同时间点的状态。

每次完成一个阶段性修改，就可以提交一次记录。以后如果需要查看历史，就能知道当时改了什么、为什么改。

## 二、Git 和 GitHub 是一回事吗

很多初学者会把 Git 和 GitHub 混在一起。

它们不是一回事。

### 1. Git

Git 是一个本地版本管理工具。

它运行在你的电脑上，用来记录项目文件变化。

即使完全不上网，也可以使用 Git。

### 2. GitHub

GitHub 是一个代码托管网站。

它可以把本地 Git 仓库上传到远程服务器，方便：

- 备份代码。
- 多台电脑同步。
- 多人协作。
- 创建 Pull Request。
- 管理 issue。

本课先只学习本地 Git。

后面真正需要远程协作或发布代码时，再学习 GitHub。

## 三、什么是仓库

Git 管理的项目叫仓库，也就是 repository。

当你在项目目录中运行：

```bash
git init
```

Git 会在当前项目里创建一个隐藏目录：

```txt
.git/
```

这个 `.git` 目录用来保存版本历史。

只要一个项目里有 `.git`，它就是一个 Git 仓库。

对于我们的课程项目，仓库目录应该是：

```txt
ai-finance-cfo/
```

也就是说，你应该进入项目根目录后再初始化 Git。

## 四、什么是 commit

commit 是 Git 中最重要的概念。

你可以把一次 commit 理解成：

> 给当前项目拍一张带说明的快照。

例如你完成了第一版项目初始化，可以提交一次：

```txt
初始化 Next.js 项目
```

后面完成账户列表页面，可以再提交一次：

```txt
实现账户列表页面
```

完成新增账户表单，可以再提交一次：

```txt
实现新增账户表单
```

每次 commit 通常包含两部分：

- 本次保存了哪些文件变化。
- 一句说明这次变化做了什么。

提交说明叫 commit message。

它应该简洁、具体。

推荐：

```txt
初始化 Next.js 项目
新增账户基础类型
实现月度结余计算函数
```

不推荐：

```txt
改了点东西
更新
111
final
```

好的 commit message 能让未来的你快速看懂项目变化。

## 五、安装和检查 Git

先在终端中输入：

```bash
git --version
```

如果看到类似输出：

```txt
git version 2.45.0
```

说明 Git 已经安装。

如果提示找不到 `git`，需要先安装 Git。

macOS 上通常安装 Xcode Command Line Tools 后会自带 Git。

Windows 可以安装 Git for Windows。

安装地址：

```txt
https://git-scm.com/
```

本课不展开安装细节。只要 `git --version` 能正常输出版本号，就可以继续。

## 六、配置用户名和邮箱

第一次使用 Git 时，需要配置用户名和邮箱。

它们会写入 commit 记录里，用来说明是谁提交的。

运行：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

例如：

```bash
git config --global user.name "Zhang San"
git config --global user.email "zhangsan@example.com"
```

查看配置：

```bash
git config --global user.name
git config --global user.email
```

如果能输出刚才设置的内容，说明配置成功。

这里的名字和邮箱不影响代码运行，只影响 Git 历史记录。

## 七、初始化 Git 仓库

进入你的项目目录。

例如：

```bash
cd ai-finance-cfo
```

确认当前目录中有 `package.json`。

可以运行：

```bash
ls
```

如果能看到：

```txt
package.json
app
public
```

说明你在项目根目录。

然后运行：

```bash
git init
```

如果成功，会看到类似输出：

```txt
Initialized empty Git repository in ...
```

这表示当前项目已经变成 Git 仓库。

## 八、查看文件状态

初始化仓库后，运行：

```bash
git status
```

你会看到很多文件处于未跟踪状态。

未跟踪的英文通常是：

```txt
Untracked files
```

意思是：

> 这些文件在项目目录里，但还没有被 Git 纳入版本管理。

常见文件包括：

```txt
app/
public/
package.json
tsconfig.json
next.config.ts
```

`git status` 是最常用的 Git 命令之一。

以后每次准备提交前，都应该先运行它。

它可以告诉你：

- 哪些文件是新文件。
- 哪些文件被修改过。
- 哪些文件已经准备提交。
- 当前是否有未提交变化。

## 九、理解工作区、暂存区和提交历史

Git 有三个非常重要的位置。

### 1. 工作区

工作区就是你正在编辑的项目文件。

例如你在 VS Code 中修改了 `app/page.tsx`，这个修改首先发生在工作区。

### 2. 暂存区

暂存区是准备提交的文件清单。

运行：

```bash
git add 文件名
```

就是把文件加入暂存区。

### 3. 提交历史

运行：

```bash
git commit
```

会把暂存区里的变化保存到提交历史中。

可以用一个流程理解：

```txt
修改文件
  ↓
git add
  ↓
进入暂存区
  ↓
git commit
  ↓
进入提交历史
```

这也是 Git 最基础的工作流程。

## 十、把文件加入暂存区

如果要把所有当前变化加入暂存区，可以运行：

```bash
git add .
```

这里的 `.` 表示当前目录下的所有变化。

然后再运行：

```bash
git status
```

你会看到文件状态变成：

```txt
Changes to be committed
```

意思是：

> 这些变化已经准备好提交。

### 什么时候不要直接 git add .

初学阶段为了简单，可以先使用 `git add .`。

但真实项目中，如果你只想提交一部分文件，就应该精确添加。

例如：

```bash
git add app/page.tsx
git add README.md
```

这样可以避免把临时文件、测试文件、无关修改一起提交进去。

## 十一、提交第一版项目

当文件进入暂存区后，就可以提交。

运行：

```bash
git commit -m "初始化 Next.js 项目"
```

其中：

- `git commit`：创建一次提交。
- `-m`：后面跟提交说明。
- `"初始化 Next.js 项目"`：本次提交的说明。

提交成功后，会看到类似输出：

```txt
[main abc1234] 初始化 Next.js 项目
```

这表示第一版项目已经保存到 Git 历史中。

提交后再次运行：

```bash
git status
```

如果看到：

```txt
nothing to commit, working tree clean
```

表示当前没有未提交变化。

## 十二、查看提交历史

可以用下面命令查看提交记录：

```bash
git log
```

它会显示：

- commit id。
- 作者。
- 时间。
- commit message。

初学阶段也可以使用更简洁的写法：

```bash
git log --oneline
```

输出可能类似：

```txt
abc1234 初始化 Next.js 项目
```

每一行就是一次提交。

## 十三、查看代码变化

当你修改文件后，可以用：

```bash
git diff
```

查看当前工作区和上次提交之间有什么不同。

例如你修改了 `app/page.tsx`，`git diff` 会显示：

- 哪些行被删除。
- 哪些行被新增。
- 修改发生在哪个文件。

如果你已经 `git add` 了文件，想查看暂存区变化，可以用：

```bash
git diff --staged
```

这两个命令很重要。

提交前建议先看一眼：

```bash
git status
git diff
```

这样可以确认自己没有把不该提交的内容放进去。

## 十四、.gitignore 是什么

不是所有文件都应该交给 Git 管理。

例如 Next.js 项目里通常会有：

```txt
node_modules/
.next/
.env.local
```

这些文件不适合提交。

原因分别是：

- `node_modules/`：依赖包目录，体积很大，可以通过 `npm install` 重新生成。
- `.next/`：Next.js 构建缓存，可以重新生成。
- `.env.local`：本地环境变量，可能包含 API Key 等敏感信息。

这些应该写进 `.gitignore`。

`.gitignore` 的意思是：

> 告诉 Git 哪些文件或目录不要纳入版本管理。

Next.js 脚手架通常已经自动创建了 `.gitignore`。

可以打开看看，常见内容包括：

```txt
node_modules
.next
out
.env*.local
```

如果你后面接入 DeepSeek API，API Key 绝对不能提交到 Git。

它应该放在 `.env.local` 里，并确保 `.env.local` 被 `.gitignore` 忽略。

## 十五、如何管理项目文件

一个项目不只是代码文件。

它通常还包括：

- 配置文件。
- 文档文件。
- 测试文件。
- 数据库迁移文件。
- 静态资源。

初学阶段建议保持项目目录清晰。

例如 Next.js 项目常见结构：

```txt
ai-finance-cfo/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
└── .gitignore
```

后面项目变复杂后，可能会继续加入：

```txt
components/
lib/
db/
types/
tests/
```

当前阶段先记住一个原则：

> 文件应该按用途放在清晰的位置，不要把所有东西都堆在项目根目录。

## 十六、README 是什么

`README.md` 是项目说明文档。

别人第一次打开项目时，通常会先看 README。

未来的你隔一段时间回来继续做项目，也会感谢过去的自己写了 README。

一个基础 README 至少应该说明：

- 项目是什么。
- 使用了什么技术。
- 如何安装依赖。
- 如何启动开发服务器。
- 当前完成了什么。

文件名通常固定为：

```txt
README.md
```

`.md` 表示 Markdown 文件。

Markdown 是一种轻量文档格式。

例如：

```md
# AI 个人财务 CFO

这是一个本地版 AI 个人财务管理项目。

## 技术栈

- Next.js
- React
- TypeScript
- TailwindCSS

## 本地运行

```bash
npm install
npm run dev
```
```

注意：上面只是 README 示例，不是终端命令。

## 十七、为课程项目写基础 README

可以在 `ai-finance-cfo` 项目根目录创建 `README.md`。

内容可以先写成：

```md
# AI 个人财务 CFO

这是一个用于学习和实践的本地版 AI 个人财务管理项目。

项目目标是构建一个可以记录财务数据、计算现金流、分析储蓄目标，并通过 AI 对话辅助理解财务问题的应用。

## 当前阶段

阶段一：编程与 Web 基础。

目前已完成：

- 创建 Next.js 项目。
- 学习 JavaScript 基础。
- 学习 TypeScript 基础。
- 准备使用 Git 管理项目。

## 技术栈

- Next.js
- React
- TypeScript
- TailwindCSS

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

浏览器打开：

```txt
http://localhost:3000
```

## 项目说明

本项目会逐步加入：

- 账户管理。
- 流水管理。
- 负债管理。
- 财务仪表盘。
- CSV 导入。
- AI 财务问答。
- What-if 场景模拟。
```

这个 README 不需要一次写完。

随着课程推进，你可以持续更新它。

## 十八、一次完整的 Git 提交流程

当你创建或修改了 README 后，可以按下面流程提交。

### 1. 查看状态

```bash
git status
```

确认有哪些文件变化。

### 2. 查看具体修改

```bash
git diff
```

如果是新文件，`git diff` 可能不会显示所有内容，这很正常。

### 3. 加入暂存区

```bash
git add README.md
```

如果是第一次提交整个项目，也可以：

```bash
git add .
```

### 4. 查看暂存区状态

```bash
git status
```

确认要提交的文件正确。

### 5. 提交

```bash
git commit -m "添加项目 README"
```

如果是第一版项目，可以使用：

```bash
git commit -m "提交第一版项目"
```

### 6. 再次确认

```bash
git status
```

如果看到工作区干净，说明提交完成。

## 十九、常见 Git 状态

运行 `git status` 时，你可能会看到不同提示。

### 1. Untracked files

表示新文件还没有被 Git 管理。

解决方式：

```bash
git add 文件名
```

### 2. Changes not staged for commit

表示文件已经被 Git 管理，但当前修改还没有进入暂存区。

解决方式：

```bash
git add 文件名
```

### 3. Changes to be committed

表示文件已经进入暂存区，准备提交。

解决方式：

```bash
git commit -m "提交说明"
```

### 4. nothing to commit, working tree clean

表示当前没有未提交变化。

这是一个很好的状态。

## 二十、常见问题

### 1. git init 运行错目录了怎么办

如果你在错误的目录初始化了 Git，不要急着乱删。

先确认当前目录：

```bash
pwd
```

再查看是否有 `.git`：

```bash
ls -a
```

如果确实是在错误目录创建了 `.git`，可以先暂停，确认目录后再处理。

初学阶段最好的做法是：

> 每次运行 `git init` 前，都先确认当前目录里有 `package.json`。

### 2. git status 显示很多 node_modules 文件

这通常说明 `.gitignore` 没有正确忽略 `node_modules/`。

检查 `.gitignore` 里是否有：

```txt
node_modules
```

如果没有，添加进去。

`node_modules` 不应该提交到 Git。

### 3. 提交说明写错了怎么办

如果只是本地刚提交，后面可以学习修改 commit message。

本课先不用处理这个问题。

更重要的是从现在开始养成写清楚提交说明的习惯。

### 4. 提交后还能继续修改吗

可以。

commit 不是项目结束，而是保存一个阶段性状态。

后续你可以继续修改文件，然后再次：

```bash
git add .
git commit -m "新的提交说明"
```

## 二十一、不要提交敏感信息

这个项目后面会接入 DeepSeek API。

API Key 属于敏感信息。

不要把它写进：

- 代码文件。
- README。
- Git 提交历史。
- 截图。
- 公开仓库。

正确做法通常是放在：

```txt
.env.local
```

并确认 `.gitignore` 里有：

```txt
.env*.local
```

这条原则非常重要：

> 任何 API Key、密码、数据库密钥，都不要提交到 Git。

## 二十二、本课实践任务

请完成以下任务。

### 任务 1：检查 Git 是否可用

在终端运行：

```bash
git --version
```

确认可以输出 Git 版本号。

### 任务 2：配置 Git 用户信息

如果你还没有配置过，运行：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 任务 3：进入项目根目录

进入 `ai-finance-cfo` 项目目录。

确认当前目录中有：

```txt
package.json
```

### 任务 4：初始化 Git 仓库

运行：

```bash
git init
```

### 任务 5：创建或更新 README.md

在项目根目录创建：

```txt
README.md
```

写入项目说明、技术栈和本地运行方式。

### 任务 6：查看文件状态

运行：

```bash
git status
```

观察哪些文件还没有提交。

### 任务 7：提交第一版项目

运行：

```bash
git add .
git commit -m "提交第一版项目"
```

### 任务 8：查看提交历史

运行：

```bash
git log --oneline
```

确认能看到刚才的提交记录。

## 二十三、本课验收标准

完成本课后，你应该做到：

- 能用 `git --version` 确认 Git 可用。
- 能用 `git status` 查看文件状态。
- 能用 `git diff` 查看文件修改。
- 能完成一次 `git add` 和 `git commit`。
- 能创建基础 `README.md`。
- 能说明 `.gitignore` 为什么不能缺少。

## 二十四、检查清单

完成本课后，你应该能回答：

- Git 是用来做什么的？
- Git 和 GitHub 有什么区别？
- 什么是 Git 仓库？
- `.git` 目录有什么作用？
- commit 可以理解成什么？
- 好的 commit message 应该是什么样？
- `git status` 的作用是什么？
- `git diff` 的作用是什么？
- `git add` 做了什么？
- `git commit` 做了什么？
- `.gitignore` 用来解决什么问题？
- 为什么不能提交 `node_modules/`？
- 为什么不能提交 API Key？
- README 应该包含哪些基础内容？

## 二十五、本课小结

这一课我们完成了阶段一最后一个新的基础工具：项目管理。

你需要记住三句话：

1. Git 用来记录项目文件变化，不是只有高手才需要用。
2. commit 是一次带说明的项目快照，应该小而清楚。
3. README 和 `.gitignore` 是项目从一开始就应该认真维护的基础文件。

到这里，阶段一的主要知识已经学完。

但在进入 React 之前，我们还需要做一次阶段一复盘，把 JavaScript、TypeScript 和 Git 合在一起完成一个小型财务计算脚本。

你已经具备继续进入前端开发的基础：

- 能启动 Next.js 项目。
- 能看懂基础 JavaScript。
- 能写基础 TypeScript 类型。
- 能用 Git 保存项目进度。

下一课是阶段一复盘：基础脚本与项目提交。完成复盘后，再正式进入 React 组件入门。
