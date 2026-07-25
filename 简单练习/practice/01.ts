type TransactionType = "income" | "expense";

interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    category: string;
};

interface CashFlowSummary {
    totalIncome: number;
    totalExpense: number;
    surplus: number;
    savingsRate: number;
    message: string;
};

const transactions: Transaction[] = [
    {
        id: "transaction001",
        title: "工资",
        amount: 30000,
        type: "income",
        category: "工资"
    },
    {
        id: "transaction002",
        title: "副业",
        amount: 1000,
        type: "income",
        category: "副业"
    },
    {
        id: "transaction003",
        title: "房租",
        amount: 3000,
        type: "expense",
        category: "房租"
    },
    {
        id: "transaction004",
        title: "餐饮",
        amount: 1500,
        type: "expense",
        category: "餐饮"
    },
    {
        id: "transaction005",
        title: "交通",
        amount: 400,
        type: "expense",
        category: "交通"
    },
    {
        id: "transaction006",
        title: "娱乐",
        amount: 800,
        type: "expense",
        category: "娱乐"
    }
];

function calculateCashFlowSummary(transactions: Transaction[]): CashFlowSummary {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const transaction of transactions) {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    }

    const surplus = totalIncome - totalExpense;
    const savingsRate = totalIncome === 0 ? 0 : (surplus / totalIncome) * 100;

    let message = "";
    if (surplus > 0){
        message = `本月结余${surplus}元，储蓄率${savingsRate.toFixed(2)}%`;
    } else if (surplus === 0) {
        message = "本月收支平衡，储蓄率0%";
    } else {
        message = `本月超支${surplus}元，储蓄率${savingsRate.toFixed(2)}%`;
    }

    return {
        totalIncome,
        totalExpense,
        surplus,
        savingsRate,
        message
    };
}

const summary = calculateCashFlowSummary(transactions);
console.log(
    `本月总收入：${summary.totalIncome}元 \n
    总支出：${summary.totalExpense}元 \n
    结余：${summary.surplus}元 \n
    ${summary.message}
    `
);