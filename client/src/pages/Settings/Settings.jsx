import { useState } from "react";
import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import { toast } from "react-hot-toast";
import { Moon, Bell, Trash2 } from "lucide-react";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("PKR");
  const [deleteDate, setDeleteDate] = useState("");
  const [deleteMonth, setDeleteMonth] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  const handleDeleteTransactions = async () => {
    if (!deleteType) return toast.error("Select what to delete");

    try {
      let url = "/transactions";
      if (deleteType === "date" && deleteDate) {
        url += `?startDate=${deleteDate}&endDate=${deleteDate}`;
      } else if (deleteType === "month" && deleteMonth) {
        const [year, month] = deleteMonth.split("-").map(Number);
        const start = `${deleteMonth}-01`;
        const end = new Date(year, month, 0).toISOString().split("T")[0];
        url += `?startDate=${start}&endDate=${end}`;
      }

      await api.delete(url);
      toast.success("Transactions deleted successfully!");
      setShowDeleteConfirm(false);
      setDeleteDate("");
      setDeleteMonth("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete transactions");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      return toast.error('Please type "DELETE" to confirm');
    }

    setDeletingAccount(true);
    try {
      await api.delete("/auth/account");
      toast.success("Account deleted successfully");
      logout();
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
      setShowDeleteAccount(false);
      setConfirmText("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 md:space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
          Customize your Finora experience
        </p>
      </div>

      {/* Appearance */}
      <Card title="Appearance">
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 dark:text-white text-sm md:text-base">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Light / dark themes
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Notifications">
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 dark:text-white text-sm md:text-base">Push Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Transaction alerts
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => {
                setNotifications(!notifications);
                toast.success(
                  !notifications ? "Notifications enabled" : "Notifications disabled"
                );
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </Card>

      {/* Preferences */}
      <Card title="Preferences">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                toast.success(`Currency changed to ${e.target.value}`);
              }}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm"
            >
              <option value="PKR">Pakistan Rupee (Rs)</option>
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card title="Data Management">
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-800 dark:text-white">
            Delete Transactions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteType("date");
                setShowDeleteConfirm(true);
              }}
              className="text-sm"
            >
              By Date
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteType("month");
                setShowDeleteConfirm(true);
              }}
              className="text-sm"
            >
              By Month
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card title="Danger Zone" className="border-red-200 dark:border-red-900">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
          <div className="flex items-start gap-3 flex-1">
            <Trash2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400 text-sm md:text-base">
                Delete Account
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Permanently delete all your data. Cannot be undone.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowDeleteAccount(true)}
            className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30 w-full sm:w-auto text-sm"
          >
            Delete Account
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="w-full sm:w-auto px-10">
          Save All Changes
        </Button>
      </div>

      {/* Delete Transactions Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
              Delete Transactions
            </h3>
            <p className="text-red-600 mb-5 text-sm">
              This action cannot be undone. Are you sure?
            </p>

            {deleteType === "date" && (
              <input
                type="date"
                value={deleteDate}
                onChange={(e) => setDeleteDate(e.target.value)}
                className="w-full p-3 border rounded-2xl mb-4 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
              />
            )}

            {deleteType === "month" && (
              <input
                type="month"
                value={deleteMonth}
                onChange={(e) => setDeleteMonth(e.target.value)}
                className="w-full p-3 border rounded-2xl mb-4 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
              />
            )}

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTransactions}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center mb-2 text-gray-800 dark:text-white">
              Delete Account?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-5 text-sm">
              This will permanently delete your account. Type <strong>DELETE</strong> to confirm.
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='Type "DELETE"'
              className="w-full p-3 border rounded-2xl mb-5 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-center text-sm"
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteAccount(false);
                  setConfirmText("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={deletingAccount || confirmText !== "DELETE"}
              >
                {deletingAccount ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;