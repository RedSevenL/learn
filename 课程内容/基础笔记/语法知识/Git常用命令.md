项目快照：
npx madge --image graph.svg .

添加至暂存区：
git add .
提交至本地：
git commit -m "你的提交信息"
推送至云端：
git push origin main

## 提交规范：约定式提交前缀 (Conventional Commits)

在执行 `git commit -m "..."` 时，建议使用以下前缀，以便于后期维护和自动生成更新日志。

| 前缀 | 全称 | 使用场景 | 例子 |
|------|------|----------|------|
| `feat:` | Features | 引入了新功能 | `feat: 增加本地 CSV 缓存功能` |
| `fix:` | Bug Fixes | 修复了某个 Bug | `fix: 修复网络超时导致的程序崩溃` |
| `docs:` | Documentation | 仅仅改了文档/笔记 | `docs: 更新 Git 常用命令手册` |
| `style:` | Styles | 不影响逻辑的格式改动（如空格、缩进） | `style: 格式化代码缩进` |
| `refactor:` | Refactoring | 代码重构（既不修 Bug 也不加功能） | `refactor: 简化数据清洗函数逻辑` |
| `chore:` | Chores | 杂事（如改 .gitignore、配置工具） | `chore: 更新忽略清单` |
