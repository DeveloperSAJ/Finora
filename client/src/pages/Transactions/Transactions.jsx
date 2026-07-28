import { useState, useEffect } from 'react';
import Card from '../../components/Cards/Card';
import Button from '../../components/Buttons/Button';
import { Plus, Search, List, Trash2, Calendar, Calendar as MonthIcon, Download } from 'lucide-react';
import api from '../../services/api';
import AddTransactionModal from '../../components/Forms/AddTransactionModal';
import BatchTransactionModal from '../../components/Forms/BatchTransactionModal';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [exporting, setExporting] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [selectedDate, selectedMonth]);

  const fetchTransactions = async () => {
    try {
      let url = '/transactions';

      const params = new URLSearchParams();
      if (selectedDate) {
        params.append('startDate', selectedDate);
        params.append('endDate', selectedDate);
      } else if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const start = `${selectedMonth}-01`;
        const end = new Date(year, month, 0).toISOString().split('T')[0];
        params.append('startDate', start);
        params.append('endDate', end);
      }

      const queryString = params.toString();
      const res = await api.get(queryString ? `${url}?${queryString}` : url);
      
      setTransactions(res.data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (tx) => {
    setTransactionToDelete(tx);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    setDeletingId(transactionToDelete.id);
    setShowDeleteConfirm(false);

    try {
      await api.delete(`/transactions/${transactionToDelete.id}`);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete transaction');
    } finally {
      setDeletingId(null);
      setTransactionToDelete(null);
    }
  };

  const clearDateFilters = () => {
    setSelectedDate('');
    setSelectedMonth('');
  };

  const exportToPDF = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      pdf.setFontSize(22);
      pdf.text("Finora Transactions Report", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      pdf.setFontSize(12);
      const reportDate = selectedMonth ? `Month: ${selectedMonth}` : selectedDate ? `Date: ${selectedDate}` : "All Transactions";
      pdf.text(reportDate, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 20;

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      pdf.setFontSize(14);
      pdf.text("Summary", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(`Total Income    : Rs ${totalIncome.toLocaleString()}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total Expense  : Rs ${totalExpense.toLocaleString()}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Net Balance     : Rs ${(totalIncome - totalExpense).toLocaleString()}`, 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(14);
      pdf.text("Transactions List", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.text("Date", 20, yPosition);
      pdf.text("Description", 50, yPosition);
      pdf.text("Category", 120, yPosition);
      pdf.text("Amount", 170, yPosition);
      yPosition += 8;

      filteredTransactions.slice(0, 25).forEach(tx => {
        pdf.text(new Date(tx.transaction_date).toLocaleDateString('en-IN'), 20, yPosition);
        pdf.text((tx.description || '').substring(0, 25), 50, yPosition);
        pdf.text((tx.category_name || '').substring(0, 20), 120, yPosition);
        pdf.text(`${tx.type === 'income' ? '+' : '-'}Rs ${parseFloat(tx.amount).toLocaleString()}`, 170, yPosition);
        yPosition += 7;
      });

      const fileName = `Finora_Transactions_${selectedMonth || selectedDate || Date.now()}.pdf`;
      pdf.save(fileName);

      toast.success('Transactions report exported successfully!');
    } catch (error) {
      console.error("PDF Export Failed:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const filteredTransactions = transactions
    .filter(tx => {
      const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tx.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || tx.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            Manage your income and expenses
          </p>
        </div>
        
        {/* Action Buttons - wrap on mobile */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setShowSingleModal(true)}
            variant="outline"
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Single</span>
          </Button>

          <Button 
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            <List className="w-4 h-4" />
            <span className="text-sm">Multiple</span>
          </Button>

          <Button 
            onClick={exportToPDF}
            disabled={exporting}
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{exporting ? "..." : "Export"}</span>
          </Button>
        </div>
      </div>

      <Card>
        {/* Filters - stack on mobile */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedMonth(''); 
                }}
                className="w-full pl-9 pr-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm"
              />
            </div>

            <div className="relative col-span-2 sm:col-span-1">
              <MonthIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedDate(''); 
                }}
                className="w-full pl-9 pr-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm"
              />
            </div>
          </div>

          {(selectedDate || selectedMonth) && (
            <Button variant="outline" onClick={clearDateFilters} className="w-full sm:w-auto text-sm">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Transactions List */}
        {loading ? (
          <p className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-3 md:p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0
                    ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {tx.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                      {tx.description || tx.category_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tx.transaction_date).toLocaleDateString('en-IN')}
                      {tx.category_name && (
                        <span className="ml-1 capitalize">• {tx.category_name}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className={`font-bold text-sm md:text-base ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}Rs {parseFloat(tx.amount).toLocaleString('en-IN')}
                  </p>

                  <button
                    onClick={() => openDeleteConfirm(tx)}
                    disabled={deletingId === tx.id}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-500 text-lg">No transactions found</p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && transactionToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center mb-2 text-gray-800 dark:text-white">Delete Transaction?</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm">
              This action cannot be undone.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6">
              <p className="font-medium text-gray-800 dark:text-white text-sm">
                {transactionToDelete.description || transactionToDelete.category_name}
              </p>
              <p className={`text-base font-bold mt-1 ${transactionToDelete.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {transactionToDelete.type === 'income' ? '+' : '-'}Rs {parseFloat(transactionToDelete.amount).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={deletingId === transactionToDelete.id}
              >
                {deletingId === transactionToDelete.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AddTransactionModal 
        isOpen={showSingleModal} 
        onClose={() => setShowSingleModal(false)} 
        onTransactionAdded={fetchTransactions}
      />

      <BatchTransactionModal 
        isOpen={showBatchModal} 
        onClose={() => setShowBatchModal(false)} 
        onTransactionAdded={fetchTransactions}
      />
    </div>
  );
};

export default Transactions;