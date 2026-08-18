import { useState } from 'react';
import { Modal } from '../../components/Modal.jsx';
import { Input } from '../../components/Input.jsx';
import { Select } from '../../components/Select.jsx';
import { Button } from '../../components/Button.jsx';
import { studentApi } from '../../services/student.service.js';
import { exportToExcel } from '../../utils/export.js';
import { useToast } from '../../hooks/useToast.js';

const STANDARD_CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export function ExportModal({ open, onClose, studentType, status }) {
  const toast = useToast();
  const [exportType, setExportType] = useState('all'); // 'all' | 'specific' | 'range'
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [startClass, setStartClass] = useState('1');
  const [endClass, setEndClass] = useState('10');
  const [fileName, setFileName] = useState('students_export');
  const [exporting, setExporting] = useState(false);

  const handleCheckboxChange = (cls) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const handleExport = async () => {
    if (!fileName.trim()) {
      toast.error('Please enter a file name.');
      return;
    }
    if (exportType === 'specific' && selectedClasses.length === 0) {
      toast.error('Please select at least one class.');
      return;
    }

    setExporting(true);
    try {
      // Fetch all students matching current filters
      const { data } = await studentApi.list({
        pageSize: 5000,
        studentType: studentType || undefined,
        status: status || undefined,
      });
      const allItems = data.data.items;

      let filteredItems = allItems;

      if (exportType === 'specific') {
        filteredItems = allItems.filter(item => {
          if (!item.class) return false;
          // Normalize and check
          const normClass = String(item.class).replace(/^(class\s+)/i, '').trim().toLowerCase();
          return selectedClasses.map(c => String(c).toLowerCase()).includes(normClass);
        });
      } else if (exportType === 'range') {
        const startIndex = STANDARD_CLASSES.indexOf(startClass);
        const endIndex = STANDARD_CLASSES.indexOf(endClass);
        if (startIndex > endIndex) {
          toast.error('Start class cannot be higher than end class.');
          setExporting(false);
          return;
        }

        filteredItems = allItems.filter(item => {
          if (!item.class) return false;
          const normClass = String(item.class).replace(/^(class\s+)/i, '').trim().toLowerCase();
          const idx = STANDARD_CLASSES.findIndex(c => c.toLowerCase() === normClass);
          return idx >= startIndex && idx <= endIndex;
        });
      }

      if (filteredItems.length === 0) {
        toast.error('No students found matching the selected export options.');
        setExporting(false);
        return;
      }

      const headers = [
        { key: 'student_code', label: 'Student Code' },
        { key: 'student_name', label: 'Student Name' },
        { key: 'parent_name', label: 'Parent Name' },
        { key: 'parent_phone', label: 'Parent Phone' },
        { key: 'class', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'student_type', label: 'Student Type' },
        { key: 'admission_type', label: 'Admission Category' },
        { key: 'total_fee', label: 'Total Fee' },
        { key: 'paid_amount', label: 'Paid Amount' },
        { key: 'due_amount', label: 'Due Amount' },
        { key: 'status', label: 'Status' }
      ];

      exportToExcel(filteredItems, fileName, headers);
      toast.success('Excel file exported successfully.');
      onClose();
    } catch (err) {
      toast.error('Could not export students.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Students to Excel" size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={exporting}>Cancel</Button>
          <Button onClick={handleExport} loading={exporting}>Export</Button>
        </>
      }>
      
      <div className="space-y-4">
        {/* File Name */}
        <Input
          label="File Name"
          placeholder="Enter file name (without extension)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          required
        />

        {/* Export Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Export Scope
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'All Students' },
              { id: 'specific', label: 'Specific Classes' },
              { id: 'range', label: 'Class Range' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setExportType(type.id)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                  exportType === type.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Specific Classes Selection */}
        {exportType === 'specific' && (
          <div className="space-y-2 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Select Classes
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {STANDARD_CLASSES.map(cls => (
                <label key={cls} className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(cls)}
                    onChange={() => handleCheckboxChange(cls)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Class {cls}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Class Range Selection */}
        {exportType === 'range' && (
          <div className="grid grid-cols-2 gap-4 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
            <Select
              label="From Class"
              value={startClass}
              onChange={(e) => setStartClass(e.target.value)}
              options={STANDARD_CLASSES.map(c => ({ value: c, label: `Class ${c}` }))}
            />
            <Select
              label="To Class"
              value={endClass}
              onChange={(e) => setEndClass(e.target.value)}
              options={STANDARD_CLASSES.map(c => ({ value: c, label: `Class ${c}` }))}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
