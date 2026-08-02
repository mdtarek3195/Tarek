const Transfer = (() => {

    function init() {

        loadAccounts();

        loadTransfers();
    }

    function loadAccounts() {

        const accounts =
            Storage.getAccounts();

        const from =
            document.getElementById(
                "fromAccount"
            );

        const to =
            document.getElementById(
                "toAccount"
            );

        from.innerHTML = "";
        to.innerHTML = "";

        accounts.forEach(a => {

            from.innerHTML += `

                <option>
                    ${a.name}
                </option>

            `;

            to.innerHTML += `

                <option>
                    ${a.name}
                </option>

            `;
        });
    }

    function saveTransfer() {

        const fromAccount =
            document.getElementById(
                "fromAccount"
            ).value;

        const toAccount =
            document.getElementById(
                "toAccount"
            ).value;

        const amount =
            Number(
                document.getElementById(
                    "transferAmount"
                ).value
            );

        const note =
            document.getElementById(
                "transferNote"
            ).value;

        if (
            fromAccount === toAccount
        ) {

            alert(
                "Accounts cannot be same."
            );

            return;
        }

        if (
            amount <= 0
        ) {

            alert(
                "Invalid amount."
            );

            return;
        }

        // Deduct

        Storage.updateAccountBalance(

            fromAccount,

            amount,

            "expense"

        );

        // Add

        Storage.updateAccountBalance(

            toAccount,

            amount,

            "income"

        );

        Storage.addTransfer({

            date:
                new Date()
                .toISOString()
                .split("T")[0],

            fromAccount,

            toAccount,

            amount,

            note

        });

        loadTransfers();

		alert(
			"Transfer Completed"
		);
    }

    function loadTransfers() {

        const tbody =
            document.getElementById(
                "transferTableBody"
            );

        const transfers =
            Storage.getTransfers();

        tbody.innerHTML = "";

        transfers.forEach(t => {

            tbody.innerHTML += `

                <tr>

                    <td>${t.date}</td>

                    <td>${t.fromAccount}</td>

                    <td>${t.toAccount}</td>

                    <td>
                        ${App.formatCurrency(
                            t.amount
                        )}
                    </td>

                    <td>
                        ${t.note || "-"}
                    </td>

                </tr>

            `;
        });
    }

    return {

        init,

        saveTransfer

    };

})();

document.addEventListener(

    "DOMContentLoaded",

    Transfer.init

);