from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.expense import Expense

from app.services.google_sheets import (
    get_all_expenses,
    get_expense_by_id,
    add_expense,
    update_expense,
    delete_expense
)


app = FastAPI(title="Expenxify API")


# --------------------------------
# CORS
# --------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------
# Basic Routes
# --------------------------------

@app.get("/")
def root():
    return {
        "message": "Expenxify API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# --------------------------------
# Generate Next ID
# --------------------------------

def get_next_id():

    expenses = get_all_expenses()

    if not expenses:
        return 1

    ids = [
        expense["id"]
        for expense in expenses
    ]

    return max(ids) + 1


# --------------------------------
# CREATE
# --------------------------------

@app.post("/expenses")
def create_expense(expense: Expense):

    expense.id = get_next_id()

    created_expense = add_expense(expense)

    return {
        "message": "Expense added successfully",
        "expense": created_expense
    }


# --------------------------------
# READ ALL
# --------------------------------

@app.get("/expenses")
def get_expenses():

    expenses = get_all_expenses()

    return {
        "expenses": expenses
    }


# --------------------------------
# READ ONE
# --------------------------------

@app.get("/expenses/{expense_id}")
def get_expense(expense_id: int):

    expense = get_expense_by_id(expense_id)

    if expense is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return {
        "expense": expense
    }


# --------------------------------
# UPDATE
# --------------------------------

@app.put("/expenses/{expense_id}")
def update_expense_route(
    expense_id: int,
    updated_expense: Expense
):

    updated = update_expense(
        expense_id,
        updated_expense
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return {
        "message": "Expense updated successfully",
        "expense": updated
    }


# --------------------------------
# DELETE
# --------------------------------

@app.delete("/expenses/{expense_id}")
def delete_expense_route(expense_id: int):

    deleted = delete_expense(expense_id)

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return {
        "message": "Expense deleted successfully",
        "expense": deleted
    }