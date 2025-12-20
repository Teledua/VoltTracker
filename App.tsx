import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BillForm } from './components/BillForm';
import { BillList } from './components/BillList';
import { AnalysisCard } from './components/AnalysisCard';
import { ElectricBill, ViewState, AnalysisResult } from './types';
import { analyzeElectricityUsage } from './services/geminiService';
import { Plus, Table, LayoutDashboard, Download } from 'lucide-react';

const App: React.FC = () => {
  const [bills, setBills] = useState<ElectricBill[]>([]);
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [analysis, setAnalysis] = useState<AnalysisResult>({
    markdown: '',
    isLoading: false,
    error: null
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedBills = localStorage.getItem('volttracker_bills');
    if (savedBills) {
      try {
        setBills(JSON.parse(savedBills));
      } catch (e) {
        console.error("Failed to parse saved bills", e);
      }
    }
  }, []);

  // Save to local storage whenever bills change
  useEffect(() => {
    localStorage.setItem('volttracker_bills', JSON.stringify(bills));
  }, [bills]);

  const handleSaveBill = (newBill: ElectricBill) => {
    setBills(prev => [newBill, ...prev]);
    setViewState(ViewState.LIST);
  };

  const handleDeleteBill = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setBills(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleExportExcel = () => {
    if (bills.length === 0) {
      alert("No data to export!");
      return;
    }

    const worksheetData = bills.map(bill => ({
      "Date Purchased": bill.datePurchased,
      "Date Inserted": bill.dateInserted,
      "Date Finished": bill.dateFinished || "Ongoing",
      "Amount Purchased": bill.amountPurchased,
      "Notes": bill.notes || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Electricity Bills");
    
    // Auto-width columns
    const wscols = [
        {wch: 15},
        {wch: 15},
        {wch: 15},
        {wch: 20},
        {wch: 30}
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, "Electric_Bills_Export.xlsx");
  };

  const handleRunAnalysis = useCallback(async () => {
    setAnalysis(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await analyzeElectricityUsage(bills);
      setAnalysis(prev => ({ ...prev, markdown: result, isLoading: false }));
    } catch (err: any) {
      setAnalysis(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Failed to generate analysis. Make sure you have a valid API Key in your environment." 
      }));
    }
  }, [bills]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation / Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => setViewState(ViewState.DASHBOARD)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewState === ViewState.DASHBOARD ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setViewState(ViewState.LIST)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewState === ViewState.LIST ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Table className="w-4 h-4" />
              History
            </button>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
             <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={() => setViewState(ViewState.ADD_ENTRY)}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Bill
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-6">
          {viewState === ViewState.ADD_ENTRY && (
            <div className="max-w-3xl mx-auto">
              <BillForm onSave={handleSaveBill} onCancel={() => setViewState(ViewState.DASHBOARD)} />
            </div>
          )}

          {viewState === ViewState.DASHBOARD && (
            <>
              <Dashboard bills={bills} />
              <AnalysisCard analysis={analysis} onAnalyze={handleRunAnalysis} />
            </>
          )}

          {viewState === ViewState.LIST && (
            <BillList bills={bills} onDelete={handleDeleteBill} />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} VoltTracker. Local storage enabled. Data stays on your device.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;