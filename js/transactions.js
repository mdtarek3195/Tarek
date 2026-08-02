/* ==========================================
   Expense Manager Pro
   File: js/transactions.js
   ========================================== */

const Transactions = (() => {

    let transactions = [];
	let editingTransactionId = null;

    // =========================
    // INIT
    // =========================

    function init() {
		filterCategories();

        loadCategories();

        loadAccounts();

        loadTransactions();

        bindEvents();

        setDefaultDate();

        console.log("Transactions Module Loaded");
    }

    // =========================
    // DEFAULT DATE
    // =========================

    function setDefaultDate() {

        const today =
            new Date().toISOString().split('T')[0];

        const dateInput =
            document.getElementById("transactionDate");

        if (dateInput) {
            dateInput.value = today;
        }
    }




function searchTransactions() {

    const keyword =
        document.getElementById(
            "searchKeyword"
        )
        .value
        .toLowerCase();

    const type =
        document.getElementById(
            "searchType"
        )
        .value;

    const account =
        document.getElementById(
            "searchAccount"
        )
        .value;

    let filtered =
        Storage.getTransactions();

if (keyword) {

    filtered =
        filtered.filter(t =>

            (t.note || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (t.category || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (t.account || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (t.type || "")
                .toLowerCase()
                .includes(keyword)

        );
}

    if (type) {

        filtered =
            filtered.filter(
                t => t.type === type
            );
    }

    if (account) {

        filtered =
            filtered.filter(
                t =>
                t.account === account
            );
    }

    renderTable(filtered);
}



    // =========================
    // LOAD CATEGORIES
    // =========================


    function loadCategories() {

        const categorySelect =
            document.getElementById("transactionCategory");

        if (!categorySelect) return;

        const categories =
            Storage.getCategories();

        categorySelect.innerHTML = "";

        categories.forEach(category => {

            categorySelect.innerHTML += `
                <option value="${category}">
                    ${category}
                </option>
            `;

        });
    }

    // =========================
    // LOAD ACCOUNTS
    // =========================

    function loadAccounts() {

        const accountSelect =
            document.getElementById("transactionAccount");

        if (!accountSelect) return;

        const accounts =
            Storage.getAccounts();

        accountSelect.innerHTML = "";

        accounts.forEach(account => {

            accountSelect.innerHTML += `
                <option value="${account.name}">
                    ${account.name}
                </option>
            `;

        });
    }

    // =========================
    // SAVE TRANSACTION
    // =========================

    function saveTransaction() {
		if (editingTransactionId) {

			updateTransaction();

			return;
		}

        const type =
            document.getElementById("transactionType").value;

        const date =
            document.getElementById("transactionDate").value;

        const category =
            document.getElementById("transactionCategory").value;

        const account =
            document.getElementById("transactionAccount").value;

        const amount =
            document.getElementById("transactionAmount").value;

        const note =
            document.getElementById("transactionNote").value;

        if (!amount || Number(amount) <= 0) {

            alert("Please enter a valid amount.");

            return;
        }

Storage.addTransaction({

    type,
    date,
    category,
    account,
    amount: Number(amount),
    note

});

Storage.updateAccountBalance(

    account,

    Number(amount),

    type

);

        clearForm();

        loadTransactions();

        App.showToast(
            "Transaction Saved Successfully"
        );
    }

    // =========================
    // LOAD TABLE
    // =========================

    function loadTransactions() {

        transactions =
            Storage.getTransactions();

        renderTable(transactions);
    }


    // =========================
    // LOAD CATEGORIES
    // =========================

function loadCategories() {

    const select =
        document.getElementById(
            "transactionCategory"
        );

    if (!select) return;

    const categories =
        Storage.getCategories();

    select.innerHTML = "";

    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            category.name;

        option.textContent =
            `${category.name} (${category.type})`;

        select.appendChild(option);

    });

}


    // =========================
    // RENDER TABLE
    // =========================

    function renderTable(data) {

        const tbody =
            document.getElementById(
                "transactionTableBody"
            );

        if (!tbody) return;

        if (data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7"
                        class="text-center">
                        No transactions found
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = "";

        data
        .sort((a,b) =>
            new Date(b.date) -
            new Date(a.date)
        )
        .forEach(item => {

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
                    ${item.account}
                </td>

                <td>
                    ${App.formatCurrency(item.amount)}
                </td>

                <td>
                    ${item.note || "-"}
                </td>

				<td>

					<button
						class="btn btn-primary"
						onclick="Transactions.editTransaction(${item.id})">

						Edit

					</button>

					<button
						class="btn btn-danger"
						onclick="Transactions.deleteTransaction(${item.id})">

						Delete

					</button>

				</td>

            `;

            tbody.appendChild(row);

        });
    }

    // =========================
    // DELETE
    // =========================
function deleteTransaction(id) {

    const transaction =
        transactions.find(
            t => t.id === id
        );

    if (!transaction) return;

    if (
        transaction.type === "income"
    ) {

        Storage.updateAccountBalance(

            transaction.account,

            transaction.amount,

            "expense"

        );

    } else {

        Storage.updateAccountBalance(

            transaction.account,

            transaction.amount,

            "income"

        );

    }

    Storage.deleteTransaction(id);

    loadTransactions();

}
function editTransaction(id) {

    const transaction =
        transactions.find(
            t => t.id === id
        );

    if (!transaction)
        return;

    editingTransactionId = id;

    document.getElementById(
        "transactionType"
    ).value =
        transaction.type;

    document.getElementById(
        "transactionDate"
    ).value =
        transaction.date;

    document.getElementById(
        "transactionCategory"
    ).value =
        transaction.category;

    document.getElementById(
        "transactionAccount"
    ).value =
        transaction.account;

    document.getElementById(
        "transactionAmount"
    ).value =
        transaction.amount;

    document.getElementById(
        "transactionNote"
    ).value =
        transaction.note || "";

    App.showToast(
        "Editing Transaction"
    );
}
function updateTransaction() {

    const allTransactions =
        Storage.getTransactions();

    const oldTransaction =
        allTransactions.find(
            t => t.id === editingTransactionId
        );

    if (!oldTransaction)
        return;

    // Reverse old balance

    Storage.updateAccountBalance(

        oldTransaction.account,

        oldTransaction.amount,

        oldTransaction.type === "income"
            ? "expense"
            : "income"

    );

    // New values

    const type =
        document.getElementById(
            "transactionType"
        ).value;

    const date =
        document.getElementById(
            "transactionDate"
        ).value;

    const category =
        document.getElementById(
            "transactionCategory"
        ).value;

    const account =
        document.getElementById(
            "transactionAccount"
        ).value;

    const amount =
        Number(
            document.getElementById(
                "transactionAmount"
            ).value
        );

    const note =
        document.getElementById(
            "transactionNote"
        ).value;

    // Apply new balance

    Storage.updateAccountBalance(

        account,

        amount,

        type

    );

    // Update transaction

    Storage.updateTransaction(

        editingTransactionId,

        {
            type,
            date,
            category,
            account,
            amount,
            note
        }

    );

    editingTransactionId =
        null;

    clearForm();

    loadTransactions();

    Dashboard?.refresh?.();

    App.showToast(
        "Transaction Updated Successfully"
    );
}
    // =========================
    // SEARCH
    // =========================

    function searchTransactions() {
		console.log("Search Clicked");

        const keyword =
            document.getElementById("searchInput")
            .value
            .toLowerCase();

        const filtered =
            transactions.filter(item =>

                item.category
                    .toLowerCase()
                    .includes(keyword)

                ||

                item.note
                    .toLowerCase()
                    .includes(keyword)

                ||

                item.account
                    .toLowerCase()
                    .includes(keyword)

            );

        renderTable(filtered);

    }
	
	// =========================
    // FILTER CATEGORIES
    // =========================
	function filterCategories() {

    const type =
        document.getElementById(
            "transactionType"
        ).value;

    const select =
        document.getElementById(
            "transactionCategory"
        );

    const categories =
        Storage.getCategories();

    select.innerHTML = "";

    categories
    .filter(
        c => c.type === type
    )
    .forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            category.name;

        option.textContent =
            category.name;

        select.appendChild(option);

    });

}
	

    // =========================
    // FILTER TYPE
    // =========================

    function filterTransactions() {

        const type =
            document.getElementById("filterType").value;

        if (type === "all") {

            renderTable(transactions);

            return;
        }

        const filtered =
            transactions.filter(
                item => item.type === type
            );

        renderTable(filtered);
    }

    // =========================
    // CLEAR FORM
    // =========================

    function clearForm() {

        document.getElementById(
            "transactionAmount"
        ).value = "";

        document.getElementById(
            "transactionNote"
        ).value = "";
    }

    // =========================
    // EVENTS
    // =========================

    function bindEvents() {

        document
        .getElementById("saveTransactionBtn")
        ?.addEventListener(
            "click",
            saveTransaction
        );

        document
        .getElementById("searchInput")
        ?.addEventListener(
            "keyup",
            searchTransactions
        );

        document
        .getElementById("filterType")
        ?.addEventListener(
            "change",
            filterTransactions
        );
		document
		.getElementById(
			"transactionType"
		)
		?.addEventListener(
			"change",
			filterCategories
		);
    }

    // =========================
    // PUBLIC API
    // =========================

return {

    init,

    editTransaction,

    deleteTransaction,


};

})();


// =============================
// AUTO LOAD
// =============================

document.addEventListener(
    "DOMContentLoaded",
    Transactions.init
);