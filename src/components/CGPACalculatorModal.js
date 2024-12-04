import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function CGPACalculatorModal({ isOpen, onClose, theme }) {
  const [subjects, setSubjects] = useState([]);
  const [totalSubjects, setTotalSubjects] = useState('');
  const [showSubjectInputs, setShowSubjectInputs] = useState(false);
  const [result, setResult] = useState(null);

  const calculateGradePoints = (marks) => {
    if (marks >= 90) return 10;
    if (marks >= 80) return 9;
    if (marks >= 70) return 8;
    if (marks >= 60) return 7;
    if (marks >= 50) return 6;
    if (marks >= 40) return 5;
    return 0;
  };

  const handleTotalSubjectsSubmit = (e) => {
    e.preventDefault();
    const subjectsArray = Array(parseInt(totalSubjects)).fill().map(() => ({
      marks: '',
      credits: ''
    }));
    setSubjects(subjectsArray);
    setShowSubjectInputs(true);
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const calculateCGPA = (e) => {
    e.preventDefault();
    let totalCredits = 0;
    let totalGradePoints = 0;

    subjects.forEach(subject => {
      const credits = parseInt(subject.credits);
      const gradePoints = calculateGradePoints(parseInt(subject.marks));
      totalCredits += credits;
      totalGradePoints += gradePoints * credits;
    });

    const cgpa = (totalGradePoints / totalCredits).toFixed(2);
    setResult({
      cgpa,
      totalCredits
    });
  };

  const resetCalculator = () => {
    setSubjects([]);
    setTotalSubjects('');
    setShowSubjectInputs(false);
    setResult(null);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 rounded-xl shadow-xl ${
          theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-900'
        }`}>
          <Dialog.Title className="text-2xl font-bold mb-4">CGPA Calculator</Dialog.Title>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>

          {!showSubjectInputs ? (
            <form onSubmit={handleTotalSubjectsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Subjects
                </label>
                <input
                  type="number"
                  value={totalSubjects}
                  onChange={(e) => setTotalSubjects(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Next
              </button>
            </form>
          ) : (
            <form onSubmit={calculateCGPA} className="space-y-4">
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-4">
                {subjects.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium">Subject {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1">Marks (out of 100)</label>
                        <input
                          type="number"
                          value={subject.marks}
                          onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                          className={`w-full p-2 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-800 border-gray-700' 
                              : 'bg-white border-gray-300'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Credits</label>
                        <input
                          type="number"
                          value={subject.credits}
                          onChange={(e) => handleSubjectChange(index, 'credits', e.target.value)}
                          className={`w-full p-2 rounded-lg border ${
                            theme === 'dark' 
                              ? 'bg-gray-800 border-gray-700' 
                              : 'bg-white border-gray-300'
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {result && (
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <h4 className="font-medium mb-2">Results</h4>
                  <p>CGPA: {result.cgpa}</p>
                  <p>Total Credits: {result.totalCredits}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={resetCalculator}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Calculate
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 