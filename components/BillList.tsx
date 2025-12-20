import React, { useState } from 'react';
import { ElectricBill } from '../types';
import { Trash2, Eye, X } from 'lucide-react';

interface BillListProps {
  bills: ElectricBill[];
  onDelete: (id: string) => void;
}

export const BillList: React.FC<BillListProps> = ({ bills, onDelete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No bills recorded</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new electric bill entry.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Purchased</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Inserted</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.datePurchased}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.dateInserted}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">${bill.amountPurchased.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {bill.receiptImage ? (
                      <button 
                        onClick={() => setSelectedImage(bill.receiptImage!)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {bill.dateFinished ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Finished
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onDelete(bill.id)} className="text-red-600 hover:text-red-900 transition-colors p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Modal for Image Preview */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Receipt Preview</h3>
              <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-6 flex justify-center bg-white overflow-auto max-h-[80vh]">
              <img src={selectedImage} alt="Receipt" className="max-w-full rounded-lg h-auto" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};