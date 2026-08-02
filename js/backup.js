/* ==========================================
   Expense Manager Pro
   File: js/backup.js
   ========================================== */

const Backup = (() => {

    // =========================
    // INIT
    // =========================

    function init() {

        updateStatistics();

        bindEvents();

        console.log(
            "Backup Module Loaded"
        );
    }

    // =========================
    // STATISTICS
    // =========================

    function updateStatistics() {

        document.getElementById(
            "backupTransactions"
        ).textContent =
            Storage.getTransactions()
            ?.length || 0;

        document.getElementById(
            "backupAccounts"
        ).textContent =
            Storage.getAccounts()
            ?.length || 0;

        document.getElementById(
            "backupCategories"
        ).textContent =
            Storage.getCategories()
            ?.length || 0;

        document.getElementById(
            "backupBudgets"
        ).textContent =
            Storage.getBudgets()
            ?.length || 0;
    }

    // =========================
    // EXPORT BACKUP
    // =========================

    function exportBackup() {

        const backupData = {

            exportedAt:
                new Date()
                .toISOString(),

            version: "1.0",

            transactions:
                Storage.getTransactions(),

            accounts:
                Storage.getAccounts(),

            categories:
                Storage.getCategories(),

            budgets:
                Storage.getBudgets(),
           
           transfers:
                Storage.getTransfers
              ? Storage.getTransfers()
              : [],

            goals:
                Storage.getGoals
                    ? Storage.getGoals()
                    : [],

            settings:
                localStorage.getItem(
                    "em_settings"
                )
                ? JSON.parse(
                    localStorage.getItem(
                        "em_settings"
                    )
                )
                : {}

        };

        const json =
            JSON.stringify(
                backupData,
                null,
                2
            );

        const blob =
            new Blob(
                [json],
                {
                    type:
                    "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                "a"
            );

        const date =
            new Date()
            .toISOString()
            .split("T")[0];

        a.href = url;

        a.download =
            `expense-manager-backup-${date}.json`;

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        App.showToast(
            "Backup Downloaded"
        );
    }

    // =========================
    // IMPORT BACKUP
    // =========================

    function importBackup() {

        const file =
            document.getElementById(
                "backupFile"
            ).files[0];

        if (!file) {

            alert(
                "Please select a backup file."
            );

            return;
        }

        const reader =
            new FileReader();

        reader.onload =
            function(event) {

            try {

                const data =
                    JSON.parse(
                        event.target.result
                    );

                if (
                    !data.transactions &&
                    !data.accounts
                ) {

                    throw new Error(
                        "Invalid Backup File"
                    );
                }

                const confirmRestore =
                    confirm(
                        "Restore backup and overwrite current data?"
                    );

                if (
                    !confirmRestore
                ) return;

                localStorage.setItem(
                    "em_transactions",
                    JSON.stringify(
                        data.transactions || []
                    )
                );

                localStorage.setItem(
                    "em_accounts",
                    JSON.stringify(
                        data.accounts || []
                    )
                );

                localStorage.setItem(
                    "em_categories",
                    JSON.stringify(
                        data.categories || []
                    )
                );

                localStorage.setItem(
                    "em_budgets",
                    JSON.stringify(
                        data.budgets || []
                    )
                );

               localStorage.setItem(

               "em_transfers",

               JSON.stringify(

               data.transfers || []

              )

             );

                localStorage.setItem(
                    "em_goals",
                    JSON.stringify(
                        data.goals || []
                    )
                );

                localStorage.setItem(
                    "em_settings",
                    JSON.stringify(
                        data.settings || {}
                    )
                );

                App.showToast(
                    "Backup Restored Successfully"
                );

                setTimeout(() => {

                    location.reload();

                }, 1000);

            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "Invalid backup file."
                );
            }
        };

        reader.readAsText(
            file
        );
    }

    // =========================
    // RESET ALL DATA
    // =========================

    function resetData() {

        const confirmed =
            confirm(
                "WARNING!\n\nAll data will be permanently deleted.\n\nContinue?"
            );

        if (!confirmed)
            return;

        localStorage.removeItem(
            "em_transactions"
        );

        localStorage.removeItem(
            "em_accounts"
        );

        localStorage.removeItem(
            "em_categories"
        );

        localStorage.removeItem(
            "em_budgets"
        );

       localStorage.removeItem(
    "em_transfers"
);

        localStorage.removeItem(
            "em_goals"
        );

        localStorage.removeItem(
            "em_settings"
        );

        App.showToast(
            "All Data Deleted"
        );

        setTimeout(() => {

            location.reload();

        }, 1000);
    }

    // =========================
    // EVENTS
    // =========================

    function bindEvents() {

        document
        .getElementById(
            "exportBackupBtn"
        )
        ?.addEventListener(
            "click",
            exportBackup
        );

        document
        .getElementById(
            "importBackupBtn"
        )
        ?.addEventListener(
            "click",
            importBackup
        );

        document
        .getElementById(
            "resetDataBtn"
        )
        ?.addEventListener(
            "click",
            resetData
        );
    }

    // =========================
    // PUBLIC API
    // =========================

    return {

        init,
        exportBackup,
        importBackup,
        resetData

    };

})();


// =============================
// AUTO LOAD
// =============================

document.addEventListener(
    "DOMContentLoaded",
    Backup.init
);
