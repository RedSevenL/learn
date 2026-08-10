# React Props 入门

## 一、核心理解

`props` 可以先理解为：

> React 组件的函数参数，只是它有一套固定传参规则。

如果类比 C++：

```txt
props 类似函数形参，作用域是函数内
父组件传入的数据类似实参，是具体内容
```

React 组件本质上也是函数：

```tsx
function AccountList(props) {
  return <div>{props.accounts.length}</div>;
}
```

当父组件写：

```tsx
<AccountList accounts={accounts} title="账户列表" />
```

React 会把组件标签上的属性打包成一个对象传进去：

```tsx
AccountList({
  accounts: accounts,
  title: "账户列表",
});
```

总结：

```txt
组件标签上的属性，最终都会变成子组件收到的 props 对象里的字段
此处结构是 props{accounts, title}
accounts 可以是对象数组 accounts[{id:1, name:"支付宝"}{id:2, name:"微信支付"}]
```

## 二、左右两个 accounts 的区别

```tsx
<AccountList accounts={accounts} />
```

这两个 `accounts` 角色不同：

```txt
左边 accounts：props 字段名，子组件用这个名字调用
右边 accounts：当前父组件里的真实变量
```

等价理解：

```tsx
<AccountList props字段名={真实数据变量} />
```

如果写成：

```tsx
const accountData = [...];

<AccountList accounts={accountData} />
```

就更清楚：

```txt
accounts：传给子组件后的名字
accountData：父组件里的数据变量
```



## 三、子组件的两种接收方式



### 方式一：用 props 对象接收

```tsx
function AccountList(props) {
  return (
    <div>
      {props.accounts.map((account) => (
        <p key={account.id}>{account.name}</p>
      ))}
    </div>
  );
}
```

这里用：

```tsx
props.accounts
```

读取父组件传入的 `accounts`。

### 方式二：解构接收

```tsx
function AccountList({ accounts }) {
  return (
    <div>
      {accounts.map((account) => (
        <p key={account.id}>{account.name}</p>
      ))}
    </div>
  );
}
```

它等价于：

```tsx
function AccountList(props) {
  const accounts = props.accounts;
}
```

所以：

```txt
不管传进去多少字段，React 最终都会先打包成一个 props 对象。
子组件可以直接用 props 接收，也可以用解构把字段单独拿出来。
```



## 四、TypeScript 里给 props 加类型

先定义数据类型：

```tsx
type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
};
```

再定义 props 类型：

```tsx
type AccountListProps = {
  accounts: Account[];
};
```

组件写法：

```tsx
function AccountList({ accounts }: AccountListProps) {
  return (
    <div>
      {accounts.map((account) => (
        <p key={account.id}>{account.name}</p>
      ))}
    </div>
  );
}
```

这里：

```txt
Account 表示一个账户对象
Account[] 表示账户对象数组
AccountListProps 表示 AccountList 组件接收的 props 结构
```



## 五、props 的重要规则



### 1. props 从父组件传给子组件

```txt
父组件 -> 子组件
```

例如：

```tsx
<AccountList accounts={accounts} />
```

是父组件把 `accounts` 传给 `AccountList`。

### 2. 子组件不能直接修改 props

props 应该当作只读数据。

不推荐：

```tsx
function AccountCard({ account }) {
  account.balance = 0;
  return <p>{account.balance}</p>;
}
```

如果需要修改页面数据，后面要用 `state` 和事件处理。

### 3. 左边 props 名和子组件接收名要对应

父组件写：

```tsx
<AccountList accounts={accounts} />
```

子组件就接：

```tsx
function AccountList({ accounts }) {}
```

如果父组件写：

```tsx
<AccountList data={accounts} />
```

子组件就应该接：

```tsx
function AccountList({ data }) {}
```

名字不对应，就拿不到想要的数据。

## 六、常见误区



### 误区一：以为左右两个 accounts 是同一个东西

```tsx
<AccountList accounts={accounts} />
```

不是。

```txt
左边 accounts：props 名字
右边 accounts：变量值
```



### 误区二：以为 React 会分别传多个参数

React 不是这样调用：

```tsx
AccountList(accounts, title, count);
```

而是这样：

```tsx
AccountList({
  accounts,
  title,
  count,
});
```

也就是说：

```txt
无论传进去多少个属性，最终都会被打包成一个 props 对象。
```



### 误区三：以为 props 只能传字符串

props 可以传多种数据：

```tsx
<UserCard name="张三" age={18} isVip={true} />
```

也可以传数组、对象、函数。

## 七、一句话总结

props 就是 React 组件的参数对象。

```tsx
<AccountList accounts={accounts} />
```

可以读作：

```txt
把父组件里的 accounts 变量，
用 accounts 这个 props 字段名，
传给 AccountList 组件。
```
