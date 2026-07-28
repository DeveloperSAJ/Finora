import { useState, useEffect } from 'react';
import Card from '../../components/Cards/Card';
import Button from '../../components/Buttons/Button';
import { Plus, Minus, Download, Trash2, Calendar, Calendar as MonthIcon, Search } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import AddSavingsModal from '../../components/Forms/AddSavingsModal';
import UseSavingsModal from '../../components/Forms/UseSavingsModal';

const Savings = () => {
  const [savings, setSavings] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savingToDelete, setSavingToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSavings();
  }, [selectedDate, selectedMonth]);

  const fetchSavings = async () => {
    try {
      let url = '/savings';

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
      
      setSavings(res.data);
      
      const total = res.data.reduce((sum, s) => {
        return sum + (s.type === 'add' ? parseFloat(s.amount) : -parseFloat(s.amount));
      }, 0);
      setTotalSavings(total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (s) => {
    setSavingToDelete(s);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!savingToDelete) return;

    setDeletingId(savingToDelete.id);
    setShowDeleteConfirm(false);

    try {
      await api.delete(`/savings/${savingToDelete.id}`);
      toast.success('Saving deleted successfully');
      fetchSavings();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete saving');
    } finally {
      setDeletingId(null);
      setSavingToDelete(null);
    }
  };

  const filteredSavings = savings
    .filter(s => s.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.transaction_date);
      const dateB = new Date(b.transaction_date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB - dateA;
      }
      return b.id - a.id;
    });

  const exportSavingsPDF = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      pdf.setFontSize(22);
      pdf.text("Finora Savings Report", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      pdf.setFontSize(12);
      const reportDate = selectedMonth ? `Month: ${selectedMonth}` : selectedDate ? `Date: ${selectedDate}` : "All Savings";
      pdf.text(reportDate, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 20;

      pdf.setFontSize(14);
      pdf.text(`Total Savings : Rs ${totalSavings.toLocaleString()}`, 20, yPosition);
      yPosition += 20;

      pdf.setFontSize(12);
      pdf.text("Date", 20, yPosition);
      pdf.text("Description", 60, yPosition);
      pdf.text("Type", 130, yPosition);
      pdf.text("Amount", 170, yPosition);
      yPosition += 8;

      filteredSavings.slice(0, 30).forEach(s => {
        pdf.text(new Date(s.transaction_date).toLocaleDateString('en-IN'), 20, yPosition);
        pdf.text((s.description || '').substring(0, 30), 60, yPosition);
        pdf.text(s.type.toUpperCase(), 130, yPosition);
        pdf.text(`${s.type === 'add' ? '+' : '-'}Rs ${parseFloat(s.amount).toLocaleString()}`, 170, yPosition);
        yPosition += 8;
      });

      const fileName = `Finora_Savings_${selectedMonth || selectedDate || Date.now()}.pdf`;
      pdf.save(fileName);

      toast.success('Savings report exported successfully!');
    } catch (error) {
      console.error("PDF Export Failed:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const clearDateFilters = () => {
    setSelectedDate('');
    setSelectedMonth('');
  };

  return (
    <div className="space-y-5 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Savings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            Track your savings and withdrawals
          </p>
        </div>
        
        <Button onClick={exportSavingsPDF} disabled={exporting} className="flex items-center gap-2 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          <span className="text-sm">{exporting ? "Exporting..." : "Export"}</span>
        </Button>
      </div>

      {/* Total Savings */}
      <Card>
        <div className="text-center py-8 md:py-12">
          <p className="text-4xl md:text-6xl font-bold text-emerald-600">
            Rs {totalSavings.toLocaleString()}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-lg">Total Savings</p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 py-3">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add</span>
        </Button>
        <Button 
          onClick={() => setShowUseModal(true)} 
          variant="outline" 
          className="flex items-center justify-center gap-2 text-red-600 py-3"
        >
          <Minus className="w-4 h-4" />
          <span className="text-sm">Use</span>
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search savings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 text-gray-800 dark:text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
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

            <div className="relative">
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
            <Button variant="outline" onClick={clearDateFilters} className="w-full text-sm">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Savings List */}
        {loading ? (
          <p className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
        ) : filteredSavings.length > 0 ? (
          <div className="space-y-3">
            {filteredSavings.map((s) => (
              <div 
                key={s.id} 
                className="flex items-center justify-between p-3 md:p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0
                    ${s.type === 'add' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {s.type === 'add' ? '↑' : '↓'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                      {s.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(s.transaction_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className={`font-bold text-sm md:text-base ${s.type === 'add' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {s.type === 'add' ? '+' : '-'}Rs {parseFloat(s.amount).toLocaleString('en-IN')}
                  </p>

                  <button
                    onClick={() => openDeleteConfirm(s)}
                    disabled={deletingId === s.id}
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
            <p className="text-gray-400 dark:text-gray-500 text-lg">No savings recorded yet</p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && savingToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center mb-2 text-gray-800 dark:text-white">Delete Saving?</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm">
              This action cannot be undone.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6">
              <p className="font-medium text-gray-800 dark:text-white text-sm">{savingToDelete.description}</p>
              <p className={`text-base font-bold mt-1 ${savingToDelete.type === 'add' ? 'text-emerald-600' : 'text-red-600'}`}>
                {savingToDelete.type === 'add' ? '+' : '-'}Rs {parseFloat(savingToDelete.amount).toLocaleString('en-IN')}
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
                disabled={deletingId === savingToDelete.id}
              >
                {deletingId === savingToDelete.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AddSavingsModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSavingsAdded={fetchSavings}
      />

      <UseSavingsModal 
        isOpen={showUseModal} 
        onClose={() => setShowUseModal(false)} 
        onSavingsAdded={fetchSavings}
      />
    </div>
  );
};

export default Savings;