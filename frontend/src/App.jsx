import { useEffect, useMemo, useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Entertainment",
  "Education",
  "Bills",
  "Other",
];

const PAYMENT_MODES = [
  "UPI",
  "Cash",
  "Debit Card",
  "Credit Card",
  "Net Banking",
  "Other",
];

const CATEGORY_COLORS = {
  Food: "#f59e0b",
  Travel: "#3b82f6",
  Shopping: "#8b5cf6",
  Entertainment: "#ec4899",
  Education: "#10b981",
  Bills: "#ef4444",
  Other: "#737373",
};

function App() {
  const [expenses, setExpenses] = useState([]);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [remark, setRemark] = useState("");
  const [category, setCategory] = useState("Food");
  const [paymentMode, setPaymentMode] = useState("UPI");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // -----------------------------
  // Fetch expenses
  // -----------------------------

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/expenses`);

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();

      setExpenses(data.expenses);
    } catch (error) {
      console.error(error);
      alert("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // -----------------------------
  // Clear form
  // -----------------------------

  const clearForm = () => {
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setRemark("");
    setCategory("Food");
    setPaymentMode("UPI");
    setEditingId(null);
  };

  // -----------------------------
  // Add / Update Expense
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    const expense = {
      amount: Number(amount),
      date,
      remark,
      category,
      payment_mode: paymentMode,
    };

    try {
      setSaving(true);

      const url = editingId
        ? `${API_URL}/expenses/${editingId}`
        : `${API_URL}/expenses`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expense),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      await response.json();

      clearForm();
      await fetchExpenses();

    } catch (error) {
      console.error(error);
      alert("Could not save expense.");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Edit
  // -----------------------------

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setAmount(expense.amount);
    setDate(expense.date);
    setRemark(expense.remark);
    setCategory(expense.category);
    setPaymentMode(expense.payment_mode);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // -----------------------------
  // Delete
  // -----------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/expenses/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await fetchExpenses();

    } catch (error) {
      console.error(error);
      alert("Could not delete expense.");
    }
  };

  // -----------------------------
  // Statistics
  // -----------------------------

  const totalSpent = useMemo(() => {
    return expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount),
      0
    );
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const totals = {};

    expenses.forEach((expense) => {
      const category = expense.category;

      totals[category] =
        (totals[category] || 0) +
        Number(expense.amount);
    });

    return totals;
  }, [expenses]);

    // -----------------------------
  // Category Chart Data
  // -----------------------------

  const categoryChartData = useMemo(() => {
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [categoryTotals]);


  // -----------------------------
  // Daily Spending Data
  // -----------------------------

  const dailyChartData = useMemo(() => {
    const totals = {};

    expenses.forEach((expense) => {
      const date = expense.date;

      totals[date] =
        (totals[date] || 0) +
        Number(expense.amount);
    });

    return Object.entries(totals)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );
  }, [expenses]);

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="app">
      <div className="container">

        {/* Header */}

        <header className="header">
          <div>
            <h1>Expenxify</h1>
            <p>
              A simple view of where your money goes.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchExpenses}
          >
            Refresh
          </button>
        </header>


        {/* Summary */}

        <section className="summary-card">

          <div>
            <span>Total spent</span>

            <h2>
              ₹{totalSpent.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="summary-count">
            <strong>{expenses.length}</strong>
            <span>expenses</span>
          </div>

        </section>


        {/* Add / Edit */}

        <section className="card">

          <div className="card-header">

            <div>
              <h2>
                {editingId
                  ? "Edit Expense"
                  : "Add Expense"}
              </h2>

              <p>
                {editingId
                  ? "Update the details below."
                  : "Record a new expense."}
              </p>
            </div>

            {editingId && (
              <button
                className="cancel-button"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="field">
                <label>Amount</label>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="₹ 0"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  required
                />
              </div>


              <div className="field">
                <label>Date</label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  required
                />
              </div>


              <div className="field">
                <label>Category</label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                >
                  {CATEGORIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>


              <div className="field">
                <label>Payment Mode</label>

                <select
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(e.target.value)
                  }
                >
                  {PAYMENT_MODES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>


              <div className="field full-width">
                <label>Remark</label>

                <input
                  type="text"
                  placeholder="What was this expense for?"
                  value={remark}
                  onChange={(e) =>
                    setRemark(e.target.value)
                  }
                />
              </div>

            </div>


            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Expense"
                : "Add Expense"}
            </button>

          </form>

        </section>


        {/* Category Overview */}

        <section className="card">

          <div className="card-header">
            <div>
              <h2>Spending Overview</h2>
              <p>
                Your expenditure by category.
              </p>
            </div>
          </div>


          {Object.keys(categoryTotals).length === 0 ? (

            <p className="empty-state">
              Add an expense to see your spending
              breakdown.
            </p>

          ) : (

            <div className="category-list">

              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([categoryName, total]) => {

                  const percentage =
                    totalSpent > 0
                      ? (total / totalSpent) * 100
                      : 0;

                  return (
                    <div
                      className="category-row"
                      key={categoryName}
                    >

                      <div className="category-info">
                      <div className="category-name">
                        <span
                          className="category-dot"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[categoryName] || "#737373",
                          }}
                        />

                        <span>{categoryName}</span>
                      </div>

                      <strong>
                        ₹{total.toLocaleString("en-IN")}
                      </strong>
                    </div>

                      <div className="progress">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span className="percentage">
                        {percentage.toFixed(1)}%
                      </span>

                    </div>
                  );
                })}

            </div>

          )}

        </section>

              {/* Analytics */}

        <section className="analytics-grid">

          {/* Category Chart */}

          <div className="card chart-card">

            <div className="card-header">
              <div>
                <h2>Spending Structure</h2>
                <p>
                  Where your money is going.
                </p>
              </div>
            </div>

            {categoryChartData.length === 0 ? (

              <p className="empty-state">
                Add expenses to see your
                spending structure.
              </p>

            ) : (

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <PieChart>

                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={2}
                    >

                      {categoryChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || "#737373"}
                      />
                    ))}

                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        `₹${Number(value).toLocaleString(
                          "en-IN"
                        )}`
                      }
                    />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            )}

          </div>


          {/* Spending Over Time */}

          <div className="card chart-card">

            <div className="card-header">
              <div>
                <h2>Spending Over Time</h2>
                <p>
                  Your daily expenditure.
                </p>
              </div>
            </div>

            {dailyChartData.length === 0 ? (

              <p className="empty-state">
                Add expenses to see your
                spending trend.
              </p>

            ) : (

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <LineChart
                    data={dailyChartData}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        date.slice(5)
                      }
                    />

                    <YAxis
                      tickFormatter={(value) =>
                        `₹${value}`
                      }
                    />

                    <Tooltip
                      formatter={(value) =>
                        `₹${Number(value).toLocaleString(
                          "en-IN"
                        )}`
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="amount"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            )}

          </div>

        </section>

        {/* Expense History */}

        <section className="card">

          <div className="card-header">

            <div>
              <h2>Expenses</h2>

              <p>
                Your latest transactions.
              </p>
            </div>

          </div>


          {loading ? (

            <p className="empty-state">
              Loading expenses...
            </p>

          ) : expenses.length === 0 ? (

            <p className="empty-state">
              No expenses yet.
            </p>

          ) : (

            <div className="expense-list">

              {expenses
                .slice()
                .reverse()
                .map((expense) => (

                  <div
                    className="expense-item"
                    key={expense.id}
                  >

                    <div className="expense-main">

                      <h3>
                        {expense.remark ||
                          expense.category}
                      </h3>

                      <p>
                        {expense.category}
                        {" · "}
                        {expense.payment_mode}
                        {" · "}
                        {expense.date}
                      </p>

                    </div>


                    <div className="expense-actions">

                      <strong>
                        ₹{Number(
                          expense.amount
                        ).toLocaleString("en-IN")}
                      </strong>

                      <div>

                        <button
                          className="small-button"
                          onClick={() =>
                            handleEdit(expense)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="small-button delete-button"
                          onClick={() =>
                            handleDelete(
                              expense.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

      </div>
    </div>
  );
}

export default App;