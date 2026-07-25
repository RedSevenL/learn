// alert("你好")

console.log("hello".length);
console.log("hello".charAt(0));
console.log("hello,world".replace("e","aaaa"));
console.log("hello,world".toUpperCase());

var a_name = "aha";
console.log(a_name);

if (a_name == "aha") {
    console.log("a_name is aha");
} else {
    console.log("a_name is not aha");
} 

var age = 19;
// console.log(age >= 18 ? "成年" : "未成年");

switch (age) {
    case 18:
        console.log("成年");
        break;
    case 17:
        console.log("未成年");
        break;
    default:
        console.log("年龄不合法");
        break;
}

var obj = new Object();
var obj2 = {};

obj = {
    name: "aha",
    age: 18,
};

obj.gender = "male";

console.log(obj);

var arr = new Array();
var arr2 = [];

arr[0] = 1;
arr[1] = 2;
arr[5] = "pig";
// console.log(arr);

// for (let i = 0; i < arr.length; i++) {
//     console.log(arr[i]);
// }

for (let i in arr) {
    console.log(arr[i]);
}

arr.push(3);

for (let i of arr) {
    console.log(i);
}

arr.pop();

arr.forEach(function(item) {
    console.log(item);
});

let a = 1;

function add() {
    let sum = 0;
    for (let i = 0; i < arguments.length; i++) {
        sum += arguments[i];
    }
    return sum;
}

console.log(a);
let sum = add(2,3,4,5);
console.log(sum);

function packBasket(color, ...fruits) {
    console.log("篮子的颜色是：" + color);
    console.log("里面装的水果有：", fruits); 
    console.log("一共装了 " + fruits.length + " 个水果");
}

// 调用函数
packBasket("红色", "苹果", "香蕉", "大西瓜");

function makeAdder(x){
    return function(y){
        return x + y;
    }
}

let x = makeAdder(10);
let y = x(20);
console.log(y);

// 1. 查找元素
const textNode = document.querySelectorAll("p");
const btnNode1 = document.querySelector('#color-btn');

// 2. 绑定事件
// btnNode.addEventListener('click', function() {
//     // 3. 遍历集合，修改每个元素的属性
//     textNode.forEach(function(item) {
//         // 判断当前文字颜色是否已经是红色
//         if (item.style.color === 'red') {
//             // 如果是红色，则清空属性（恢复元素原本的 CSS 样式）
//             item.style.color = '';            
//             item.style.backgroundColor = ''; 
//         } else {
//             // 如果不是红色（即初始状态），则设置为黑底红字
//             item.style.color = 'red';            
//             item.style.backgroundColor = 'black'; 
//         }
//     });
// });

// 2. 绑定事件
btnNode1.addEventListener('click', function() {
    // 遍历集合，直接用 toggle 切换类名
    textNode.forEach(function(item) {
        item.classList.toggle('dark-theme');
    });
});

// 1. 获取按钮和 h1 元素
const btnNode2 = document.querySelector('#fixed');
const h1Node = document.querySelector('.box2 h1');

// 2. 绑定点击事件
btnNode2.addEventListener('click', function() {
    // 3. 修改文本内容
    h1Node.textContent = '再见';
});