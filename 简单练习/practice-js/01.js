const transactions = [
    {title: "salary", amount: 30000, type: "income"},
    {title: "rent", amount: 3000, type: "expense"},
    {title: "groceries", amount: 1000, type: "expense"},
    {title: "transportation", amount: 400, type: "expense"},
    {title: "entertainment", amount: 800, type: "expense"},
    {title: "other", amount: 500, type: "expense"},
]

function calculateSummary(transactions) {
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
    const isDeficit = surplus < 0;

    let message = "";
    if (surplus > 0) {
        message = `本月结余${surplus}元`;
    } else if (surplus === 0) {
        message = "本月收支平衡";
    } else {
        message = `本月超支${surplus}元`;
    }

    return {
        income: totalIncome,
        expense: totalExpense,
        surplus,
        isDeficit,
        message
    };
}

const summary = calculateSummary(transactions);

console.log(summary);
console.log(summary.message);