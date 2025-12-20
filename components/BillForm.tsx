import React, { useState, useRef } from 'react';
import { ElectricBill } from '../types';
import { Plus, Save, X, Camera, Upload, Sparkles, RefreshCw } from 'lucide-react';
import { extractDataFromReceipt } from '../services/geminiService';

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
    notes: '',
    receiptImage: ''
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amountPurchased' ? parseFloat(value) || 0 : value
    }));
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraActive(false);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, receiptImage: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receiptImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoFill = async () => {
    if (!formData.receiptImage) return;
    setIsExtracting(true);
    try {
      const data = await extractDataFromReceipt(formData.receiptImage);
      setFormData(prev => ({
        ...prev,
        amountPurchased: data.amount || prev.amountPurchased,
        datePurchased: data.date || prev.datePurchased,
        dateInserted: data.date || prev.dateInserted
      }));
    } finally {
      setIsExtracting(false);
    }
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
        {/* Receipt Scanning Area */}
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Receipt Capture (Optional)</label>
          
          <div className="flex flex-col items-center">
            {isCameraActive ? (
              <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-black aspect-[3/4]">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
                  <button type="button" onClick={capturePhoto} className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                    <div className="w-6 h-6 border-2 border-gray-900 rounded-full" />
                  </button>
                  <button type="button" onClick={stopCamera} className="bg-red-500 p-3 rounded-full shadow-lg text-white hover:bg-red-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : formData.receiptImage ? (
              <div className="relative w-full max-w-sm">
                <img src={formData.receiptImage} alt="Receipt preview" className="w-full rounded-lg shadow-sm border border-gray-200 h-64 object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                   <button 
                    type="button" 
                    onClick={handleAutoFill}
                    disabled={isExtracting}
                    className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 px-3 text-xs font-medium"
                  >
                    {isExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isExtracting ? 'Reading...' : 'Auto-Fill'}
                  </button>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, receiptImage: '' }))} className="bg-white text-red-600 p-2 rounded-full shadow-lg hover:bg-red-50 border border-red-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button 
                  type="button" 
                  onClick={startCamera} 
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex-1 font-medium text-gray-700"
                >
                  <Camera className="w-5 h-5 text-blue-600" />
                  Take Photo
                </button>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex-1 font-medium text-gray-700"
                >
                  <Upload className="w-5 h-5 text-blue-600" />
                  Upload Image
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="amountPurchased" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Purchased (₦)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">₦</span>
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