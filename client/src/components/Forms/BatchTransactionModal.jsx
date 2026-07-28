import { useState, useEffect } from 'react';
import Button from '../Buttons/Button';
import Dropdown from './Dropdown';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const BatchTransactionModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const [items, setItems] = useState([
    { description: '', amount: '', category_id: '' }
  ]);
  const [type, setType] = useState('expense');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', amount: '', category_id: '' }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSubmit = async () => {
    if (items.some(item => !item.description || !item.amount || !item.category_id)) {
      return toast.error("Please fill all fields for each item");
    }

    setLoading(true);
    try {
      const promises = items.map(item => 
        api.post('/transactions', {
          type,
          amount: item.amount,
          category_id: item.category_id,
          description: item.description,
          transaction_date: transactionDate
        })
      );

      await Promise.all(promises);
      toast.success(`${items.length} transactions added successfully!`);
      onTransactionAdded();
      onClose();
      setItems([{ description: '', amount: '', category_id: '' }]);
    } catch (error) {
      toast.error('Failed to add transactions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="p-4 md:p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Add Multiple Items</h2>
          <button onClick={onClose} className="p-1 text-gray-500 dark:text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6 flex-1 overflow-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setType('income')} 
                  className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all ${
                    type === 'income' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Income
                </button>
                <button 
                  onClick={() => setType('expense')} 
                  className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all ${
                    type === 'expense' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date</label>
              <input 
                type="date" 
                value={transactionDate} 
                onChange={(e) => setTransactionDate(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-800 dark:text-white text-sm" 
              />
            </div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Item {index + 1}</span>
                {items.length > 1 && (
                  <button 
                    onClick={() => removeItem(index)} 
                    className="text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input 
                type="text" 
                value={item.description} 
                onChange={(e) => updateItem(index, 'description', e.target.value)} 
                placeholder="Item name" 
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-2xl text-gray-800 dark:text-white text-sm" 
              />

              <div className="grid grid-cols-2 gap-3">
                <Dropdown
                  value={item.category_id}
                  onChange={(e) => updateItem(index, 'category_id', e.target.value)}
                  placeholder="Category"
                  options={categories.map(cat => ({
                    value: cat.id,
                    label: cat.name
                  }))}
                />

                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Amount"
                  value={item.amount} 
                  onChange={(e) => updateItem(index, 'amount', e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-2xl text-gray-800 dark:text-white text-sm" 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 md:p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-3xl pb-24 sm:pb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">Total</span>
            <span className="text-2xl md:text-3xl font-bold text-emerald-600">
              Rs {totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full py-3.5 text-base font-semibold">
            {loading ? 'Saving...' : `Save ${items.length} Transactions`}
          </Button>

          <Button type="button" variant="outline" onClick={addItem} className="w-full mt-3 py-3 text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BatchTransactionModal;