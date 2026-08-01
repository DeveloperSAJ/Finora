import { useState, useEffect } from "react";
import Button from "../Buttons/Button";
import Dropdown from "./Dropdown";
import { X, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

const AddTransactionModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category_id: "",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      type: "expense",
      amount: "",
      category_id: "",
      description: "",
      transaction_date: new Date().toISOString().split("T")[0],
    });

    setShowNewCategory(false);
    setNewCategoryName("");
  };

  const createNewCategory = async () => {
    if (!newCategoryName.trim())
      return toast.error("Category name cannot be empty");

    try {
      const res = await api.post("/categories", {
        name: newCategoryName.trim(),
        color: "#6b7280",
      });
      toast.success("New category created!");
      setCategories((prev) => [...prev, res.data]);
      setFormData({ ...formData, category_id: res.data.id });
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/transactions", formData);
      toast.success("Transaction added successfully!");
      resetForm();
      onTransactionAdded();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
            Add Transaction
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1 text-gray-500 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-6 space-y-5 pb-24 sm:pb-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "income" })}
                className={`py-3 rounded-2xl font-medium text-sm transition-all ${
                  formData.type === "income"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "expense" })}
                className={`py-3 rounded-2xl font-medium text-sm transition-all ${
                  formData.type === "expense"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Amount (Rs)
            </label>
            <input
              type="number"
              name="amount"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-4 py-3 text-2xl md:text-3xl font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="text-emerald-600 text-xs hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            <Dropdown
              value={formData.category_id}
              onChange={handleChange}
              name="category_id"
              placeholder="Select category"
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
            />
          </div>

          {showNewCategory && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm"
              />
              <Button
                type="button"
                onClick={createNewCategory}
                className="text-sm px-4"
              >
                Add
              </Button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What did you buy?"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Date
            </label>
            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3.5 text-base"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
