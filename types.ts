export interface ElectricBill {
  id: string;
  datePurchased: string; // YYYY-MM-DD
  dateInserted: string;  // YYYY-MM-DD
  dateFinished: string;  // YYYY-MM-DD
  amountPurchased: number;
  notes?: string;
}

export interface AnalysisResult {
  markdown: string;
  isLoading: boolean;
  error: string | null;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ADD_ENTRY = 'ADD_ENTRY',
  LIST = 'LIST'
}