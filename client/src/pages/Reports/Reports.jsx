import { useState, useEffect, useRef } from "react";
import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import { Calendar, Download, PiggyBank } from "lucide-react";
import api from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";

const Reports = () => {
  const [dailyReport, setDailyReport] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [savingsSummary, setSavingsSummary] = useState(0);
  const [monthlyDailyTrend, setMonthlyDailyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const reportRef = useRef(null);

  useEffect(() => {
    fetchReports();
  }, [selectedDate, selectedMonth]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedMonth) params.append("month", selectedMonth);
      const queryString = params.toString();
      const urlSuffix = queryString ? `?${queryString}` : "";

      const trendParams = selectedMonth ? `?month=${selectedMonth}` : "";

      const [dailyRes, monthlyRes, savingsRes, trendRes] = await Promise.all([
        api.get("/reports/daily" + urlSuffix),
        api.get("/reports/monthly" + urlSuffix),
        api.get("/savings"),
        api.get("/reports/daily-trend" + trendParams),
      ]);

      setDailyReport(dailyRes.data);
      setMonthlyReport(monthlyRes.data);
      setMonthlyDailyTrend(trendRes.data);

      const totalSavings = savingsRes.data.reduce((sum, s) => {
        return (
          sum +
          (s.type === "deposit" ? parseFloat(s.amount) : -parseFloat(s.amount))
        );
      }, 0);

      setSavingsSummary(totalSavings);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome =
    monthlyReport.find((r) => r.type === "income")?.total || 0;
  const totalExpense =
    monthlyReport.find((r) => r.type === "expense")?.total || 0;
  const netBalance = totalIncome - totalExpense;

  const exportToPDF = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      pdf.setFontSize(22);
      pdf.text("Finora Financial Report", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

      pdf.setFontSize(12);
      const reportDate = selectedMonth
        ? `Month: ${selectedMonth}`
        : selectedDate
          ? `Date: ${selectedDate}`
          : "Current Period";
      pdf.text(reportDate, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 20;

      pdf.setFontSize(16);
      pdf.text("Summary", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(
        `Total Income    : Rs ${parseFloat(totalIncome).toLocaleString()}`,
        20,
        yPosition,
      );
      yPosition += 8;
      pdf.text(
        `Total Expense  : Rs ${parseFloat(totalExpense).toLocaleString()}`,
        20,
        yPosition,
      );
      yPosition += 8;
      pdf.text(
        `Net Balance     : Rs ${parseFloat(netBalance).toLocaleString()}`,
        20,
        yPosition,
      );
      yPosition += 8;
      pdf.text(
        `Total Savings   : Rs ${parseFloat(savingsSummary).toLocaleString()}`,
        20,
        yPosition,
      );
      yPosition += 20;

      pdf.setFontSize(14);
      pdf.text("Daily Breakdown", 20, yPosition);
      yPosition += 10;

      dailyReport.forEach((item) => {
        pdf.text(
          `${item.type.toUpperCase()}: Rs ${parseFloat(item.total).toLocaleString()} (${item.count} tx)`,
          20,
          yPosition,
        );
        yPosition += 8;
      });
      yPosition += 12;

      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(15);
      pdf.text("Daily Trend Data", 20, yPosition);

      yPosition += 10;

      pdf.setFontSize(10);

      pdf.text("Day", 20, yPosition);
      pdf.text("Income", 50, yPosition);
      pdf.text("Expense", 90, yPosition);
      pdf.text("Savings", 140, yPosition);

      yPosition += 7;

      const filteredTrend = monthlyDailyTrend.filter(
        (row) =>
          Number(row.income) !== 0 ||
          Number(row.expense) !== 0 ||
          Number(row.savings) !== 0,
      );

      filteredTrend.forEach((row) => {
        if (yPosition > 280) {
          pdf.addPage();

          yPosition = 20;

          pdf.text("Day", 20, yPosition);
          pdf.text("Income", 50, yPosition);
          pdf.text("Expense", 90, yPosition);
          pdf.text("Savings", 140, yPosition);

          yPosition += 7;
        }

        pdf.text(String(row.day), 20, yPosition);
        pdf.text(`Rs ${Number(row.income).toLocaleString()}`, 50, yPosition);
        pdf.text(`Rs ${Number(row.expense).toLocaleString()}`, 90, yPosition);
        pdf.text(`Rs ${Number(row.savings).toLocaleString()}`, 140, yPosition);

        yPosition += 7;
      });

      const fileName = `Finora_Report_${selectedMonth || selectedDate || Date.now()}.pdf`;
      pdf.save(fileName);

      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("PDF Export Failed:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            Track your financial performance
          </p>
        </div>
        <Button
          onClick={exportToPDF}
          disabled={exporting}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">
            {exporting ? "Exporting..." : "Export"}
          </span>
        </Button>
      </div>

      <div ref={reportRef} className="space-y-5 md:space-y-8">
        {/* Filters */}
        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod("daily")}
                className={`flex-1 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  selectedPeriod === "daily"
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setSelectedPeriod("monthly")}
                className={`flex-1 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  selectedPeriod === "monthly"
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                Monthly
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedMonth("");
                  }}
                  className="w-full pl-9 pr-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setSelectedDate("");
                  }}
                  className="w-full pl-9 pr-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm"
                />
              </div>
            </div>

            {(selectedDate || selectedMonth) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate("");
                  setSelectedMonth("");
                }}
                className="w-full text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Summary Cards - stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title={selectedMonth ? "Month Overview" : "This Month"}
            className="p-4 md:p-6"
          >
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">↑</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Income
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-emerald-600">
                    Rs {parseFloat(totalIncome).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">↓</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Expense
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-red-600">
                    Rs {parseFloat(totalExpense).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  Net Balance
                </p>
                <p
                  className={`text-xl font-bold ${netBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  Rs {parseFloat(netBalance).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Savings" className="p-4 md:p-6">
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
                <PiggyBank className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-600">
                Rs {parseFloat(savingsSummary).toLocaleString()}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Total Savings
              </p>
            </div>
          </Card>

          <Card
            title={selectedDate ? "Date Breakdown" : "Today's Breakdown"}
            className="p-4 md:p-6 sm:col-span-2 lg:col-span-1"
          >
            <div className="space-y-3">
              {loading ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  Loading...
                </p>
              ) : dailyReport.length > 0 ? (
                dailyReport.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl"
                  >
                    <div className="capitalize font-medium text-gray-800 dark:text-white text-sm">
                      {item.type}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">
                        Rs {parseFloat(item.total).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.count} tx
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 py-8 text-center text-sm">
                  {selectedDate
                    ? "No transactions on this date"
                    : "No transactions today"}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card
          title={`Daily Trend - ${selectedMonth ? selectedMonth : "This Month"}`}
          className="p-4 md:p-6"
        >
          <div className="h-64 md:h-96 pt-4">
            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-16 text-sm">
                Loading chart...
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyDailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="day"
                    stroke="#9ca3af"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`Rs ${value.toLocaleString()}`, ""]}
                    labelFormatter={(day) => `Day ${day}`}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    name="Income"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    name="Expense"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    name="Savings"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
