import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BillForm } from './components/BillForm';
import { BillList } from './components/BillList';
import { AnalysisCard } from './components/AnalysisCard';
import { ElectricBill, ViewState, AnalysisResult } from './types';
import { analyzeElectricityUsage } from './services/geminiService';
import { Plus, Table, LayoutDashboard, Download, RefreshCw, Cloud, AlertTriangle } from 'lucide-react';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [bills, setBills] = useState<ElectricBill[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [editingBill, setEditingBill] = useState<ElectricBill | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult>({
    markdown: '',
    isLoading: false,
    error: null
  });

  // Fetch from Supabase on mount
  const fetchBills = async () => {
    setIsInitialLoading(true);
    setSyncError(null);
    try {
      const { data, error } = await supabase
        .from('electric_bills')
        .select('*')
        .order('dateInserted', { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (e: any) {
      console.error("Failed to fetch bills from Supabase:", e);
      const errorMessage = e.message || "Unknown error connecting to Supabase";
      setSyncError(errorMessage);
      
      // If table doesn't exist (Postgres error code 42P01)
      if (e.code === '42P01') {
        alert("The table 'electric_bills' does not exist in your Supabase database. Please create it in the SQL Editor.");
      } else {
        alert(`Supabase Error: ${errorMessage}`);
      }
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleSaveBill = async (billData: ElectricBill) => {
    try {
      const { error } = await supabase
        .from('electric_bills')
        .upsert(billData);

      if (error) throw error;
      
      // Refresh local state
      await fetchBills();
      setEditingBill(null);
      setViewState(ViewState.LIST);
    } catch (e: any) {
      console.error("Failed to save bill to Supabase:", e);
      alert(`Failed to save to database: ${e.message}`);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record? This cannot be undone.")) {
      try {
        const { error } = await supabase
          .from('electric_bills')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setBills(prev => prev.filter(b => b.id !== id));
      } catch (e: any) {
        console.error("Failed to delete bill from Supabase:", e);
        alert(`Failed to delete record: ${e.message}`);
      }
    }
  };

  const handleEditBill = (bill: ElectricBill) => {
    setEditingBill(bill);
    setViewState(ViewState.EDIT_ENTRY);
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
      "Amount Purchased (NGN)": bill.amountPurchased,
      "Notes": bill.notes || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Electricity Bills");
    
    const wscols = [
        {wch: 15},
        {wch: 15},
        {wch: 15},
        {wch: 25},
        {wch: 30}
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, "VoltTracker_Bills_Export.xlsx");
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
        error: "Failed to generate analysis. Make sure you have a valid Gemini API Key." 
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
              onClick={() => {
                setViewState(ViewState.DASHBOARD);
                setEditingBill(null);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewState === ViewState.DASHBOARD ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setViewState(ViewState.LIST);
                setEditingBill(null);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewState === ViewState.LIST ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Table className="w-4 h-4" />
              History
            </button>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
             <div className="flex items-center text-xs text-gray-400 mr-2 gap-1 px-2 py-1 bg-white rounded border border-gray-100">
               {syncError ? (
                 <>
                   <AlertTriangle className="w-3 h-3 text-red-500" />
                   <span className="text-red-500">Sync Error</span>
                 </>
               ) : (
                 <>
                   <Cloud className="w-3 h-3 text-green-500" />
                   <span className="text-green-600">Supabase Connected</span>
                 </>
               )}
             </div>
             <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={() => {
                setEditingBill(null);
                setViewState(ViewState.ADD_ENTRY);
              }}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Bill
            </button>
          </div>
        </div>

        {/* Sync Error Alert */}
        {syncError && viewState !== ViewState.ADD_ENTRY && viewState !== ViewState.EDIT_ENTRY && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Database Connection Issue</p>
              <p>{syncError}</p>
            </div>
            <button 
              onClick={fetchBills}
              className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic Content */}
        <div className="space-y-6">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <p className="font-medium">Connecting to Supabase...</p>
            </div>
          ) : (
            <>
              {(viewState === ViewState.ADD_ENTRY || viewState === ViewState.EDIT_ENTRY) && (
                <div className="max-w-3xl mx-auto">
                  <BillForm 
                    onSave={handleSaveBill} 
                    onCancel={() => {
                      setViewState(ViewState.DASHBOARD);
                      setEditingBill(null);
                    }} 
                    initialData={editingBill}
                  />
                </div>
              )}

              {viewState === ViewState.DASHBOARD && (
                <>
                  <Dashboard bills={bills} />
                  <AnalysisCard analysis={analysis} onAnalyze={handleRunAnalysis} />
                </>
              )}

              {viewState === ViewState.LIST && (
                <BillList bills={bills} onDelete={handleDeleteBill} onEdit={handleEditBill} />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} VoltTracker. Secured with Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;