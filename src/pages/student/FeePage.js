import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

function FeePage() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [feeRecords, setFeeRecords] = useState([]);
  const [totalFee, setTotalFee] = useState(0);
  const [paidFee, setPaidFee] = useState(0);
  const [pendingFee, setPendingFee] = useState(0);

  const fetchFeeDetails = useCallback(async () => {
    try {
      const studentId = localStorage.getItem('studentUSN');
      const token = localStorage.getItem('token');
      
      if (!studentId || !token) {
        navigate('/login');
        return;
      }

      console.log('Fetching for student:', studentId);
      
      const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/fee/records?studentId=${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        setFeeRecords(data.feeRecords);
        setStudentData(data.student);
        
        const total = data.feeRecords.reduce((sum, fee) => sum + Number(fee.amount), 0);
        const paid = data.feeRecords.reduce((sum, fee) => 
          fee.status === 'paid' ? sum + Number(fee.amount) : sum, 0);
        
        setTotalFee(total);
        setPaidFee(paid);
        setPendingFee(total - paid);
      } else {
        setError(data.message || 'Failed to fetch fee details');
      }
    } catch (error) {
      console.error('Error fetching fee details:', error);
      setError('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchFeeDetails();
  }, [fetchFeeDetails]);

  const handleLogout = () => {
    localStorage.removeItem('studentUSN');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'}`}>
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        onLogout={handleLogout}
        theme={theme}
        studentName={studentData?.name}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'bg-[#111111] border-white/20' : 'bg-white border-gray-300'
        }`}>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Fee Details
          </h1>
        </header>

        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${
          theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'
        }`}>
          {/* Fee Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className={`p-6 rounded-lg shadow-lg border ${
              theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <DollarSign className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'} mb-2`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Total Fee</h3>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                ₹{totalFee}
              </p>
            </div>

            <div className={`p-6 rounded-lg shadow-lg border ${
              theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <DollarSign className={`h-8 w-8 ${theme === 'dark' ? 'text-green-500' : 'text-green-600'} mb-2`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Paid Fee</h3>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                ₹{paidFee}
              </p>
            </div>

            <div className={`p-6 rounded-lg shadow-lg border ${
              theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <DollarSign className={`h-8 w-8 ${theme === 'dark' ? 'text-red-500' : 'text-red-600'} mb-2`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Pending Fee</h3>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                ₹{pendingFee}
              </p>
            </div>
          </div>

          {/* Fee Records Table */}
          <div className={`rounded-lg border overflow-hidden ${
            theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className={`w-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <thead>
                  <tr className={theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}>
                    <th className="p-4 text-left">Amount</th>
                    <th className="p-4 text-left">Due Date</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Semester</th>
                    <th className="p-4 text-left">Academic Year</th>
                  </tr>
                </thead>
                <tbody>
                  {feeRecords.map((record) => (
                    <tr key={record._id} className={`border-b ${
                      theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <td className="p-4">₹{record.amount}</td>
                      <td className="p-4">{new Date(record.dueDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.status === 'paid' 
                            ? 'bg-green-500/20 text-green-300'
                            : record.status === 'overdue'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4">{record.semester}</td>
                      <td className="p-4">{record.academicYear}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FeePage;
