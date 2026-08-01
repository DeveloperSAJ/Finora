import { useEffect, useState } from "react";
import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import api from "../../services/api";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [period, setPeriod] = useState("daily"); // daily | monthly
  const [dashboardData, setDashboardData] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    recentTransactions: [],
  });
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [dashboardRes, savingsRes, reportsRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/savings"),
        api.get(period === "daily" ? "/reports/daily" : "/reports/monthly"),
      ]);

      // Savings total
      const savingsTotal = savingsRes.data.reduce((sum, s) => {
        return (
          sum +
          (s.type === "deposit" ? parseFloat(s.amount) : -parseFloat(s.amount))
        );
      }, 0);
      setTotalSavings(savingsTotal);

      // Income / Expense from reports
      const income =
        reportsRes.data.find((r) => r.type === "income")?.total || 0;
      const expense =
        reportsRes.data.find((r) => r.type === "expense")?.total || 0;

      setDashboardData({
        income: parseFloat(income),
        expense: parseFloat(expense),
        balance: dashboardRes.data.balance || 0,
        recentTransactions: dashboardRes.data.recentTransactions || [],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const balanceColor =
    dashboardData.balance >= 0 ? "text-emerald-600" : "text-red-600";
  const incomeLabel =
    period === "daily" ? "Today's Income" : "This Month Income";
  const expenseLabel =
    period === "daily" ? "Today's Expense" : "This Month Expense";

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            Here's your financial overview
          </p>
        </div>

        {/* Daily / Monthly Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("daily")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              period === "daily"
                ? "bg-emerald-600 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              period === "monthly"
                ? "bg-emerald-600 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Summary Cards - 2 cols on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {incomeLabel}
              </p>
              <p className="text-xl md:text-3xl font-bold text-emerald-600 mt-1">
                Rs {dashboardData.income.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {expenseLabel}
              </p>
              <p className="text-xl md:text-3xl font-bold text-red-600 mt-1">
                Rs {dashboardData.expense.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Total Savings
              </p>
              <p className="text-xl md:text-3xl font-bold text-emerald-600 mt-1">
                Rs {totalSavings.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Current Balance
              </p>
              <p
                className={`text-xl md:text-3xl font-bold mt-1 ${balanceColor}`}
              >
                Rs {dashboardData.balance.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card title="Recent Transactions">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Loading...
          </p>
        ) : dashboardData.recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === "income"
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {tx.type === "income" ? "↑" : "↓"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white truncate">
                      {tx.description || tx.category_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold text-sm md:text-base flex-shrink-0 ${
                    tx.type === "income" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}Rs{" "}
                  {parseFloat(tx.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-8 text-center text-sm">
            No transactions yet. Add your first one!
          </p>
        )}

        <Link to="/transactions">
          <Button className="mt-6 w-full md:w-auto">
            View All Transactions
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default Dashboard;
