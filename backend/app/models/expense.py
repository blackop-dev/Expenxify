from pydantic import BaseModel, Field
from datetime import date


class Expense(BaseModel):
    id: int | None = None
    amount: float = Field(gt=0)
    date: date
    remark: str = ""
    category: str
    payment_mode: str