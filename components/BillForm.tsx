import React, { useState } from 'react';
import { ElectricBill } from '../types';
import { Plus, Save, X } from 'lucide-react';

interface BillFormProps {
  onSave: (bill: ElectricBill) => void;
  onCancel: () => void;
}

export const BillForm: React.FC<BillFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<ElectricBill, 'id'>>({
    datePurchased: new Date().toISOString().split('T')[0],
    dateInserted: new Date().toISOString().split('T')[0],
    dateFinished: '',
    amountPurchased: 0,
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amountPurchased' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: crypto.randomUUID(),
      ...formData
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Add New Bill Entry
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-500 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="amountPurchased" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Purchased (Currency)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="amountPurchased"
                id="amountPurchased"
                min="0"
                step="0.01"
                required
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 py-3 border text-lg"
                placeholder="0.00"
                value={formData.amountPurchased || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <label htmlFor="datePurchased" className="block text-sm font-medium text-gray-700 mb-1">
              Date Purchased
            </label>
            <input
              type="date"
              name="datePurchased"
              id="datePurchased"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.datePurchased}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="dateInserted" className="block text-sm font-medium text-gray-700 mb-1">
              Date Inserted (Meter)
            </label>
            <input
              type="date"
              name="dateInserted"
              id="dateInserted"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.dateInserted}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="dateFinished" className="block text-sm font-medium text-gray-700 mb-1">
              Date Finished <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              name="dateFinished"
              id="dateFinished"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.dateFinished}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-gray-500">Leave blank if still running.</p>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              placeholder="E.g., High usage due to AC..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 gap-2"
          >
            <Save className="w-4 h-4" />
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
};