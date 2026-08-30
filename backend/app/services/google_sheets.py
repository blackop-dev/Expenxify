import gspread
from google.oauth2.service_account import Credentials


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets"
]

CREDENTIALS_FILE = "credentials/google-service-account.json"

SPREADSHEET_ID = "1rKJr2fkYdTHpMAeOxEMKMZ4l4R1RTaVRDihFdn554i8"


def get_sheet():
    credentials = Credentials.from_service_account_file(
        CREDENTIALS_FILE,
        scopes=SCOPES
    )

    client = gspread.authorize(credentials)

    spreadsheet = client.open_by_key(SPREADSHEET_ID)

    return spreadsheet.sheet1


# --------------------------------
# Convert Sheet Row → API Object
# --------------------------------

def format_expense(row):

    return {
        "id": int(row["ID"]),
        "amount": float(row["Amount"]),
        "date": str(row["Date"]),
        "remark": str(row["Remark"]),
        "category": str(row["Category"]),
        "payment_mode": str(row["Payment Mode"])
    }


# --------------------------------
# Get All Expenses
# --------------------------------

def get_all_expenses():

    sheet = get_sheet()

    records = sheet.get_all_records()

    expenses = []

    for record in records:

        try:
            expenses.append(format_expense(record))

        except (ValueError, KeyError, TypeError):
            continue

    return expenses


# --------------------------------
# Get One Expense
# --------------------------------

def get_expense_by_id(expense_id):

    sheet = get_sheet()

    records = sheet.get_all_records()

    for index, record in enumerate(records, start=2):

        try:

            if int(record["ID"]) == expense_id:

                return format_expense(record)

        except (ValueError, KeyError, TypeError):
            continue

    return None


# --------------------------------
# Add Expense
# --------------------------------

def add_expense(expense):

    sheet = get_sheet()

    row = [
        expense.id,
        str(expense.date),
        expense.amount,
        expense.remark,
        expense.category,
        expense.payment_mode
    ]

    sheet.append_row(row)

    return expense


# --------------------------------
# Update Expense
# --------------------------------

def update_expense(expense_id, expense):

    sheet = get_sheet()

    records = sheet.get_all_records()

    for index, record in enumerate(records, start=2):

        try:

            if int(record["ID"]) == expense_id:

                updated_row = [
                    expense_id,
                    str(expense.date),
                    expense.amount,
                    expense.remark,
                    expense.category,
                    expense.payment_mode
                ]

                sheet.update(
                    f"A{index}:F{index}",
                    [updated_row]
                )

                return {
                    "id": expense_id,
                    "amount": expense.amount,
                    "date": str(expense.date),
                    "remark": expense.remark,
                    "category": expense.category,
                    "payment_mode": expense.payment_mode
                }

        except (ValueError, KeyError, TypeError):
            continue

    return None


# --------------------------------
# Delete Expense
# --------------------------------

def delete_expense(expense_id):

    sheet = get_sheet()

    records = sheet.get_all_records()

    for index, record in enumerate(records, start=2):

        try:

            if int(record["ID"]) == expense_id:

                deleted_expense = format_expense(record)

                sheet.delete_rows(index)

                return deleted_expense

        except (ValueError, KeyError, TypeError):
            continue

    return None