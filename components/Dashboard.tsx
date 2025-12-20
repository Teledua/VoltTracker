import React from 'react';
import { ElectricBill } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Clock } from 'lucide-react';

interface DashboardProps {
  bills: ElectricBill[];
}

// Naira Symbol
const NAIRA = '₦';

export const Dashboard: React.FC<DashboardProps> = ({ bills }) => {
  // Sort bills by date inserted for charts
  const sortedBills = [...bills].sort((a, b) => new Date(a.dateInserted).getTime() - new Date(b.dateInserted).getTime());

  // Calculate stats
  const totalSpent = bills.reduce((acc, curr) => acc + curr.amountPurchased, 0);
  const avgSpent = bills.length > 0 ? totalSpent / bills.length : 0;
  
  // Calculate average duration (for completed bills)
  let totalDays = 0;
  let completedCount = 0;
  
  bills.forEach(bill => {
    if (bill.dateInserted && bill.dateFinished) {
      const start = new Date(bill.dateInserted);
      const end = new Date(bill.dateFinished);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      totalDays += diffDays;
      completedCount++;
    }
  });
  
  const avgDuration = completedCount > 0 ? Math.round(totalDays / completedCount) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{NAIRA}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full text-green-600 font-bold text-xl">
              {NAIRA}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Bill Amount</p>
              <p className="text-2xl font-bold text-gray-900">{NAIRA}{avgSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900">{avgDuration} Days</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Spending Trend</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedBills} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="dateInserted" 
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(val) => `${NAIRA}${val}`}
              />
              <Tooltip 
                formatter={(value: number) => [`${NAIRA}${value.toLocaleString()}`, 'Amount']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="amountPurchased" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};