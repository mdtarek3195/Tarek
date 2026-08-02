/* ==========================================
   Expense Manager Pro
   File: js/dashboard.js
   ========================================== */

	const Dashboard = (() => {
		
		 // Chart instances
		 
		let incomeExpenseChart = null;
		let expenseCategoryChart = null;

		// =========================
		// INIT
		// =========================

	function init() {

		loadKPIs();

		loadRecentTransactions();

		renderIncomeExpenseChart();

		renderExpenseCategoryChart();

		renderGoalWidget();
		
		loadFinancialHealth();

		console.log("Dashboard Loaded");
	}

    // =========================
    // KPI CARDS
    // =========================

    function loadKPIs() {

        const balance =
            Storage.getBalance();

        const monthlyIncome =
            Storage.getMonthlyIncome();

        const monthlyExpense =
            Storage.getMonthlyExpense();

        const monthlySavings =
            Storage.getMonthlySavings();

        document.getElementById(
            "currentBalance"
        ).textContent =
            App.formatCurrency(balance);

        document.getElementById(
            "monthlyIncome"
        ).textContent =
            App.formatCurrency(monthlyIncome);

        document.getElementById(
            "monthlyExpense"
        ).textContent =
            App.formatCurrency(monthlyExpense);

        document.getElementById(
            "monthlySavings"
        ).textContent =
            App.formatCurrency(monthlySavings);
			
		document.getElementById(
			"netWorth"
		).textContent =
			App.formatCurrency(
				balance
			);
 

	const savingsRate =

		monthlyIncome > 0

		? (
			monthlySavings /
			monthlyIncome
		  ) * 100

		: 0;

	const savingsRateEl =
		document.getElementById(
			"savingsRate"
		);

	if (savingsRateEl) {

		savingsRateEl.textContent =
			savingsRate.toFixed(1) + "%";

	}


	const transactions =
		Storage.getTransactions();

	const expenseMap = {};

	transactions
	.filter(
		t => t.type === "expense"
	)
	.forEach(t => {

		expenseMap[t.category] =

			(expenseMap[t.category] || 0)

			+ t.amount;

	});

	let topCategory = "-";

	let topAmount = 0;

	Object.entries(expenseMap)
	.forEach(([name, amount]) => {

		if (amount > topAmount) {

			topAmount = amount;

			topCategory = name;

		}

	});

	const topCategoryEl =
		document.getElementById(
			"topExpenseCategory"
		);

	if (topCategoryEl) {

		topCategoryEl.textContent =
			topCategory;

	}



document.getElementById(
    "monthlyComparison"
).innerHTML = `

    Income:
    ${App.formatCurrency(
        monthlyIncome
    )}

    <br><br>

    Expense:
    ${App.formatCurrency(
        monthlyExpense
    )}

    <br><br>

    Savings:
    ${App.formatCurrency(
        monthlySavings
    )}

`;
loadBudgetStatus();
loadBudgetAlerts();
loadTopExpenses();
loadForecastAnalytics();
loadGoalForecast();
loadCashFlow();
loadSpendingInsights();
renderExpenseDistribution();
renderSpendingTrend();
loadSmartInsights();

}
	 
	 
function loadBudgetStatus() {

    const tbody =

        document.getElementById(
            "dashboardBudgetBody"
        );

    if (!tbody)
        return;

    const budgets =
        Storage.getBudgets();

    const transactions =
        Storage.getTransactions();

    const currentMonth =

        new Date()
        .toISOString()
        .slice(0,7);

    tbody.innerHTML = "";

    budgets

    .filter(

        b =>

        b.month ===
        currentMonth

    )

    .forEach(budget => {

        const spent =

            transactions

            .filter(t => {

                return (

                    t.type ===
                    "expense"

                    &&

                    t.category ===
                    budget.category

                    &&

                    t.date.slice(0,7) ===
                    currentMonth

                );

            })

            .reduce(

                (sum, t) =>

                    sum + t.amount,

                0

            );

        const usage =

            budget.amount > 0

            ?

            (

                spent /
                budget.amount

            ) * 100

            :

            0;

        let status =

            "🟢 Within Budget";

        if (

            usage >= 100

        ) {

            status =
                "🔴 Over Budget";

        }

        else if (

            usage >= 80

        ) {

            status =
                "🟡 Near Limit";

        }

        tbody.innerHTML += `

            <tr>

                <td>
                    ${budget.category}
                </td>

                <td>
                    ${App.formatCurrency(
                        budget.amount
                    )}
                </td>

                <td>
                    ${App.formatCurrency(
                        spent
                    )}
                </td>

                <td>
                    ${usage.toFixed(0)}%
                </td>

                <td>
                    ${status}
                </td>

            </tr>

        `;

    });

}

function loadBudgetAlerts() {

    const container =

        document.getElementById(
            "budgetAlerts"
        );

    if (!container)
        return;

    const budgets =
        Storage.getBudgets();

    const transactions =
        Storage.getTransactions();

    const currentMonth =

        new Date()
        .toISOString()
        .slice(0,7);

    let html = "";

    budgets

    .filter(
        b =>
        b.month === currentMonth
    )

    .forEach(budget => {

        const spent =

            transactions

            .filter(t =>

                t.type === "expense"

                &&

                t.category === budget.category

                &&

                t.date.slice(0,7) === currentMonth

            )

            .reduce(
                (sum,t)=>
                sum+t.amount,
                0
            );

        const usage =

            (spent / budget.amount) * 100;

        if (usage >= 100) {

            html += `

                <p>

                    🔴
                    ${budget.category}

                    Over Budget

                </p>

            `;

        }

        else if (

            usage >= 80

        ) {

            html += `

                <p>

                    🟡
                    ${budget.category}

                    Near Limit

                </p>

            `;

        }

    });

    if (!html) {

        html =

        `<p>
            No Budget Alerts
        </p>`;

    }

    container.innerHTML = html;

}

function loadTopExpenses() {

    const container =

        document.getElementById(
            "topExpenseList"
        );

    if (!container)
        return;

    const expenses = {};

    Storage
    .getTransactions()

    .filter(
        t =>
        t.type === "expense"
    )

    .forEach(t => {

        expenses[t.category] =

            (expenses[t.category] || 0)

            + t.amount;

    });

    const top5 =

        Object.entries(expenses)

        .sort(
            (a,b)=>
            b[1]-a[1]
        )

        .slice(0,5);

    let html = "";

top5.forEach(item => {

    const maxAmount =

        top5[0][1];

    const percentage =

        (
            item[1] /
            maxAmount
        ) * 100;

    html += `

        <div
            style="
            margin-bottom:15px;
            ">

            <div
                style="
                display:flex;
                justify-content:space-between;
                margin-bottom:5px;
                ">

                <strong>
                    ${item[0]}
                </strong>

                <span>
                    ${App.formatCurrency(
                        item[1]
                    )}
                </span>

            </div>

            <div
                style="
                background:#eee;
                height:10px;
                border-radius:10px;
                overflow:hidden;
                ">

                <div
                    style="
                    width:${percentage}%;
                    height:100%;
                    background:#4caf50;
                    ">
                </div>

            </div>

        </div>

    `;

});

    container.innerHTML = html;

}

function loadForecastAnalytics() {

    const income =
        Storage.getMonthlyIncome();

    const expense =
        Storage.getMonthlyExpense();

    const forecastSavings =

        income - expense;

    const savingsEl =

        document.getElementById(
            "forecastSavings"
        );

    if (savingsEl) {

        savingsEl.textContent =

            App.formatCurrency(
                forecastSavings
            );

    }

}
function loadGoalForecast() {

    const container =

        document.getElementById(
            "goalForecast"
        );

    if (!container)
        return;

    const goals =
        Storage.getGoals();

    let html = "";

    goals.forEach(goal => {

        const monthlySaving =

            Storage.getMonthlySavings();

        if (
            monthlySaving <= 0
        ) {

            html += `

                <p>

                    ${goal.name}

                    :
                    Forecast Unavailable

                </p>

            `;

            return;

        }

        const remaining =

            goal.target -
            goal.saved;

        const monthsNeeded =

            Math.ceil(
                remaining /
                monthlySaving
            );

        html += `

            <p>

                ${goal.name}

                :

                ${monthsNeeded}

                month(s) remaining

            </p>

        `;

    });

    container.innerHTML =

        html ||

        "No Goals";

}
function loadCashFlow() {

    const income =
        Storage.getMonthlyIncome();

    const expense =
        Storage.getMonthlyExpense();

    const cashFlow =

        income - expense;

    const el =

        document.getElementById(
            "cashFlow"
        );

    if (el) {

        el.textContent =

            App.formatCurrency(
                cashFlow
            );

    }

}
function loadSpendingInsights() {

    const container =

        document.getElementById(
            "spendingInsights"
        );

    if (!container)
        return;

    const transactions =

        Storage.getTransactions()

        .filter(
            t =>
            t.type === "expense"
        );

    if (
        transactions.length === 0
    ) {

        container.innerHTML =

            "No expense data";

        return;

    }

    const categoryMap = {};

    transactions.forEach(t => {

        categoryMap[t.category] =

            (categoryMap[t.category] || 0)

            + t.amount;

    });

    const sorted =

        Object.entries(categoryMap)

        .sort(
            (a,b) =>
            b[1] - a[1]
        );

    const topCategory =
        sorted[0];

    container.innerHTML = `

        <p>

            🔥 Highest Spending:

            <strong>

                ${topCategory[0]}

            </strong>

        </p>

        <p>

            Amount:

            ${App.formatCurrency(
                topCategory[1]
            )}

        </p>
		
    `;
	const budgets =
    Storage.getBudgets();

const currentMonth =

    new Date()
    .toISOString()
    .slice(0,7);

budgets

.filter(
    b =>
    b.month === currentMonth
)

.forEach(b => {

    const spent =

        transactions

        .filter(t =>

            t.category ===
            b.category

        )

        .reduce(
            (sum,t)=>
            sum+t.amount,
            0
        );

    const usage =

        (spent / b.amount) * 100;

    if (usage >= 80) {

        container.innerHTML += `

            <p>

                ⚠

                ${b.category}

                at

                ${usage.toFixed(0)}%

                of budget

            </p>

        `;

    }

});

}
let expenseDistributionChart;

function renderExpenseDistribution() {

    const canvas =

        document.getElementById(
            "expenseDistribution"
        );

    if (!canvas)
        return;

    const expenses = {};

    Storage
    .getTransactions()

    .filter(
        t =>
        t.type === "expense"
    )

    .forEach(t => {

        expenses[t.category] =

            (expenses[t.category] || 0)

            + t.amount;

    });

    const labels =

        Object.keys(expenses);

    const data =

        Object.values(expenses);

    if (
        expenseDistributionChart
    ) {

        expenseDistributionChart
        .destroy();

    }

    expenseDistributionChart =

        new Chart(

            canvas,

            {

                type: "pie",

                data: {

                    labels,

                    datasets: [

                        {

                            data

                        }

                    ]

                }

            }

        );

}
		

		// =========================
		// RECENT TRANSACTIONS
		// =========================

		function loadRecentTransactions() {

			const tbody =
				document.getElementById(
					"recentTransactions"
				);

			if (!tbody) return;

			const transactions =
				Storage.getRecentTransactions(10);

			if (transactions.length === 0) {

				tbody.innerHTML = `
					<tr>
						<td colspan="4" class="text-center">
							No transactions found
						</td>
					</tr>
				`;

				return;
			}

			tbody.innerHTML = "";

			transactions.forEach(item => {

				const row =
					document.createElement("tr");

				row.innerHTML = `
					<td>
						${App.formatDate(item.date)}
					</td>

					<td>
						<span class="badge ${
							item.type === "income"
							? "badge-success"
							: "badge-danger"
						}">

							${item.type}

						</span>
					</td>

					<td>
						${item.category}
					</td>

					<td>
						${App.formatCurrency(item.amount)}
					</td>
				`;

				tbody.appendChild(row);

			});

		}
		function loadFinancialHealth() {

    const income =
        Storage.getMonthlyIncome();

    const expense =
        Storage.getMonthlyExpense();

    const savings =
        income - expense;

    let score = 0;

    if (income > 0) {

        const savingsRate =

            (
                savings /
                income
            ) * 100;

        if (savingsRate >= 30)
            score = 100;

        else if (
            savingsRate >= 20
        )
            score = 80;

        else if (
            savingsRate >= 10
        )
            score = 60;

        else
            score = 40;

    }

    let status =

        "🔴 Needs Attention";

    if (score >= 80)
        status = "🟢 Excellent";

    else if (
        score >= 60
    )
        status = "🟡 Good";

    document.getElementById(
        "healthScore"
    ).textContent =
        score + "/100";

    document.getElementById(
        "healthStatus"
    ).textContent =
        status;

}

		// =========================
		// REFRESH
		// =========================

		function refresh() {

			loadKPIs();

			loadRecentTransactions();

			renderIncomeExpenseChart();

			renderExpenseCategoryChart();

			renderGoalWidget();

		}

		// =========================
		// PUBLIC API
		// =========================

		return {

			init,

			refresh

		};


	function renderIncomeExpenseChart() {

		const transactions =
			Storage.getTransactions();

		const monthlyData = {};

		transactions.forEach(item => {

			const date =
				new Date(item.date);

			const month =
				date.toLocaleString(
					"en-US",
					{ month: "short" }
				);

			if (!monthlyData[month]) {

				monthlyData[month] = {
					income: 0,
					expense: 0
				};

			}

			if (item.type === "income") {

				monthlyData[month].income +=
					item.amount;

			} else {

				monthlyData[month].expense +=
					item.amount;

			}

		});

		const labels =
			Object.keys(monthlyData);

		const income =
			labels.map(
				m => monthlyData[m].income
			);

		const expense =
			labels.map(
				m => monthlyData[m].expense
			);

		const ctx =
			document
			.getElementById(
				"incomeExpenseChart"
			);

		if (!ctx) return;

		if (
			incomeExpenseChart &&
			typeof incomeExpenseChart.destroy === "function"
		) {
			incomeExpenseChart.destroy();
		}
		
		

		incomeExpenseChart =
			new Chart(ctx, {

				type: "bar",

				data: {

					labels,

					datasets: [

						{
							label: "Income",
							data: income
						},

						{
							label: "Expense",
							data: expense
						}

					]

				},

				options: {

					responsive: true,

					maintainAspectRatio: false

				}

			});

	}
	
	

	function renderExpenseCategoryChart() {

		const transactions =
			Storage.getTransactions();

		const categoryTotals = {};

		transactions
			.filter(
				t => t.type === "expense"
			)
			.forEach(item => {

				if (
					!categoryTotals[
						item.category
					]
				) {

					categoryTotals[
						item.category
					] = 0;

				}

				categoryTotals[
					item.category
				] += item.amount;

			});

		const labels =
			Object.keys(categoryTotals);

		const values =
			Object.values(categoryTotals);

		const ctx =
			document
			.getElementById(
				"expenseCategoryChart"
			);

		if (!ctx) return;
		
		 if (
			expenseCategoryChart &&
			typeof expenseCategoryChart.destroy === "function"
		) {
			expenseCategoryChart.destroy();
		}

		expenseCategoryChart =
			new Chart(ctx, {

				type: "pie",

				data: {

					labels,

					datasets: [

						{
							data: values
						}

					]

				},

				options: {

					responsive: true,

					maintainAspectRatio: false

				}

			});

	}





	})();


	// ===============================
	// AUTO LOAD
	// ===============================

	document.addEventListener(
		"DOMContentLoaded",
		Dashboard.init
	);


function renderGoalWidget() {

    const goals =
        Storage.getGoals
        ? Storage.getGoals()
        : [];

    const container =
        document.getElementById(
            "goalProgressWidget"
        );

    if (!container)
        return;

    if (goals.length === 0) {

        container.innerHTML =
            "<p>No Goals Found</p>";

        return;
    }

    container.innerHTML = "";

    goals.forEach(goal => {

        const progress =

            Math.min(
                (
                    goal.saved /
                    goal.target
                ) * 100,
                100
            );

        container.innerHTML += `

            <div
                style="
                margin-bottom:15px;
                ">

                <strong>
                    ${goal.name}
                </strong>

                <div
                    style="
                    background:#eee;
                    height:10px;
                    border-radius:5px;
                    overflow:hidden;
                    margin-top:5px;
                    ">

                    <div
                        style="
                        width:${progress}%;
                        height:100%;
                        background:#4caf50;
                        ">
                    </div>

                </div>

                <small>
                    ${App.formatCurrency(goal.saved)}
                    /
                    ${App.formatCurrency(goal.target)}
                </small>

            </div>

        `;

    });
}
let spendingTrendChart;

function renderSpendingTrend() {

    const canvas =

        document.getElementById(
            "spendingTrend"
        );

    if (!canvas)
        return;

const sixMonthsAgo =

    new Date();

sixMonthsAgo.setMonth(
    sixMonthsAgo.getMonth() - 5
);

const transactions =

    Storage.getTransactions()

    .filter(
        t =>
        t.type === "expense"
    )

    .filter(t => {

        const date =

            new Date(
                t.date
            );

        return (
            date >=
            sixMonthsAgo
        );

    });

    const categories = [

        ...new Set(

            transactions.map(
                t => t.category
            )

        )

    ];

    const months = [

        ...new Set(

            transactions.map(
                t => t.date.slice(0,7)
            )

        )

    ].sort();

    const datasets =

        categories.map(category => {

            const data =

                months.map(month => {

                    return transactions

                    .filter(t =>

                        t.category === category

                        &&

                        t.date.slice(0,7) === month

                    )

                    .reduce(
                        (sum,t)=>
                        sum+t.amount,
                        0
                    );

                });

            return {

                label:
                    category,

                data,

                tension:
                    0.3

            };

        });

    if (
        spendingTrendChart
    ) {

        spendingTrendChart
        .destroy();

    }

    spendingTrendChart =

        new Chart(

            canvas,

            {

                type: "line",

                data: {

                    labels:
                        months,

                    datasets

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }

        );

}

function getMonthTransactions(month) {

    return Storage
    .getTransactions()

    .filter(t =>

        t.date.slice(0,7)
        === month

    );

}

function loadSmartInsights() {

    const container =

        document.getElementById(
            "smartInsights"
        );

    if (!container)
        return;

    const insights = [];

    const currentMonth =

        new Date()
        .toISOString()
        .slice(0,7);

    const lastMonthDate =

        new Date();

    lastMonthDate.setMonth(
        lastMonthDate.getMonth() - 1
    );

    const lastMonth =

        lastMonthDate
        .toISOString()
        .slice(0,7);

    const currentTx =

        getMonthTransactions(
            currentMonth
        );

    const lastTx =

        getMonthTransactions(
            lastMonth
        );

    const currentIncome =

        currentTx

        .filter(
            t =>
            t.type === "income"
        )

        .reduce(
            (sum,t)=>
            sum+t.amount,
            0
        );

    const lastIncome =

        lastTx

        .filter(
            t =>
            t.type === "income"
        )

        .reduce(
            (sum,t)=>
            sum+t.amount,
            0
        );

    const currentExpense =

        currentTx

        .filter(
            t =>
            t.type === "expense"
        )

        .reduce(
            (sum,t)=>
            sum+t.amount,
            0
        );

    const lastExpense =

        lastTx

        .filter(
            t =>
            t.type === "expense"
        )

        .reduce(
            (sum,t)=>
            sum+t.amount,
            0
        );

    // Income comparison

    if (
        currentIncome >
        lastIncome
    ) {

        insights.push(

            `📈 Income increased by ${App.formatCurrency(currentIncome-lastIncome)}`

        );

    }

    else if (
        currentIncome <
        lastIncome
    ) {

        insights.push(

            `📉 Income decreased by ${App.formatCurrency(lastIncome-currentIncome)}`

        );

    }

    // Expense comparison

    if (
        currentExpense >
        lastExpense
    ) {

        insights.push(

            `⚠ Expense increased by ${App.formatCurrency(currentExpense-lastExpense)}`

        );

    }

    else if (
        currentExpense <
        lastExpense
    ) {

        insights.push(

            `✅ Expense reduced by ${App.formatCurrency(lastExpense-currentExpense)}`

        );

    }

    // Savings

    const currentSavings =

        currentIncome -
        currentExpense;

    const lastSavings =

        lastIncome -
        lastExpense;

    if (
        currentSavings >
        lastSavings
    ) {

        insights.push(

            `💰 Savings improved by ${App.formatCurrency(currentSavings-lastSavings)}`

        );

    }

    // Budget alerts

    const budgets =

        Storage.getBudgets()

        .filter(
            b =>
            b.month === currentMonth
        );

    budgets.forEach(b => {

        const spent =

            currentTx

            .filter(t =>

                t.type === "expense"

                &&

                t.category ===
                b.category

            )

            .reduce(
                (sum,t)=>
                sum+t.amount,
                0
            );

        const usage =

            (
                spent /
                b.amount
            ) * 100;

        if (
            usage > 100
        ) {

            insights.push(

                `🔴 ${b.category} exceeded budget`

            );

        }

        else if (
            usage >= 80
        ) {

            insights.push(

                `🟡 ${b.category} reached ${usage.toFixed(0)}% of budget`

            );

        }

    });

    container.innerHTML =

        insights.length

        ?

        insights.map(

            item =>

            `<p>${item}</p>`

        ).join("")

        :

        "<p>No Insights Available</p>";

}