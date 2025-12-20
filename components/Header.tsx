import React from 'react';
import { Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">VoltTracker</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-500">
              Manage your energy, optimize your savings
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};