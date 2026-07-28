import { useState } from 'react';
import Button from '../Buttons/Button';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AddSavingsModal = ({ isOpen, onClose, onSavingsAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/savings', { 
        ...formData, 
        type: 'add' 
      });
      toast.success('Savings added successfully!');
      onSavingsAdded();
      onClose();
      setFormData({
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error('Failed to add savings');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Add Savings</h2>
          <button onClick={onClose} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5 pb-24 sm:pb-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Amount (Rs)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-3 text-2xl md:text-3xl font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Monthly savings / Bonus"
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

          <Button type="submit" className="w-full py-3.5 text-base" disabled={loading}>
            {loading ? 'Adding...' : 'Add Savings'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddSavingsModal;