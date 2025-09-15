import React, { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Upload, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScheduleCell } from './ScheduleCell';
import { ScheduleToolbar } from './ScheduleToolbar';
import { ImportModal } from '../modals/ImportModal';
import { ExportModal, ExportOptions } from '../modals/ExportModal';
import { useNavigate } from 'react-router-dom';

// Mock data structure matching the blueprint
interface Employee {
  employee_id: string;
  name: string;
  label?: string;
  order: number;
  static: boolean;
}

interface Shift {
  shift_id: string;
  week_id: string;
  employee_id: string;
  day_index: number; // 0=Saturday, 1=Sunday, ..., 6=Friday
  shift_text: string;
  updated_by?: string;
  updated_at?: Date;
}

interface Week {
  week_id: string;
  week_start: Date; // Saturday date
  title?: string;
  created_by?: string;
  created_at?: Date;
}

// Mock employees from the blueprint
const MOCK_EMPLOYEES: Employee[] = [
  { employee_id: '1', name: 'Frank Gmelin', order: 1, static: true },
  { employee_id: '2', name: 'Patrica Garden', order: 2, static: true },
  { employee_id: '3', name: 'Dawn Mitchell', order: 3, static: true },
  { employee_id: '4', name: 'Sarah Johnson', order: 4, static: true },
  { employee_id: '5', name: 'Mike Rodriguez', order: 5, static: true },
  { employee_id: '6', name: 'Lisa Chen', order: 6, static: true },
];

const DAY_NAMES = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const ScheduleGrid = () => {
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    // Get Saturday of current week
    return startOfWeek(now, { weekStartsOn: 6 });
  });

  const [shifts, setShifts] = useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Generate week dates (Saturday to Friday)
  const weekDates = Array.from({ length: 7 }, (_, i) => 
    addDays(currentWeekStart, i)
  );

  // Generate shift key for consistent lookup
  const getShiftKey = (employeeId: string, dayIndex: number) => 
    `${employeeId}-${dayIndex}`;

  // Handle shift updates with autosave simulation
  const handleShiftUpdate = (employeeId: string, dayIndex: number, value: string) => {
    const key = getShiftKey(employeeId, dayIndex);
    setShifts(prev => ({ ...prev, [key]: value }));
    
    // TODO: Implement actual autosave to backend
    console.log('Autosave:', { employeeId, dayIndex, value });
  };

  // Navigation handlers
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 6 }));
  };

  // Action handlers
  const handleNewWeek = () => {
    const nextWeek = addDays(currentWeekStart, 7);
    setCurrentWeekStart(nextWeek);
    // Optionally clone previous week's data
    console.log('Created new week starting:', format(nextWeek, 'yyyy-MM-dd'));
  };

  const handleExport = () => {
    setExportModalOpen(true);
  };

  const handleImport = () => {
    setImportModalOpen(true);
  };

  const handleImportData = (data: string[][]) => {
    // Process imported CSV data
    const newShifts = { ...shifts };
    
    // Skip header row and process each employee row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const employeeName = row[0];
      
      // Find employee in our roster
      const employee = employees.find(emp => emp.name === employeeName);
      if (employee) {
        // Update shifts for each day (columns 1-7)
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const cellKey = getShiftKey(employee.employee_id, dayIndex);
          newShifts[cellKey] = row[dayIndex + 1] || '';
        }
      }
    }
    
    setShifts(newShifts);
    setImportModalOpen(false);
  };

  const handleExportData = (options: ExportOptions) => {
    // Generate CSV data
    const headers = ['Name', ...DAY_NAMES.map((day, index) => {
      const date = addDays(currentWeekStart, index);
      return `${day} ${format(date, 'MM/dd')}`;
    })];

    const rows = employees.map(employee => {
      const row = [employee.name];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const cellKey = getShiftKey(employee.employee_id, dayIndex);
        row.push(shifts[cellKey] || '');
      }
      return row;
    });

    // Create CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${format(currentWeekStart, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setExportModalOpen(false);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent, employeeId: string, dayIndex: number) => {
    if (editingCell) return; // Don't navigate while editing

    let newEmployeeIndex = employees.findIndex(emp => emp.employee_id === employeeId);
    let newDayIndex = dayIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newEmployeeIndex = Math.max(0, newEmployeeIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newEmployeeIndex = Math.min(employees.length - 1, newEmployeeIndex + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newDayIndex = Math.max(0, dayIndex - 1);
        break;
      case 'ArrowRight':
      case 'Tab':
        e.preventDefault();
        newDayIndex = Math.min(6, dayIndex + 1);
        break;
      case 'Enter':
        e.preventDefault();
        setEditingCell(getShiftKey(employeeId, dayIndex));
        return;
    }

    // Focus the new cell
    const newEmployeeId = employees[newEmployeeIndex].employee_id;
    const newCellId = getShiftKey(newEmployeeId, newDayIndex);
    const element = document.getElementById(`cell-${newCellId}`);
    element?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <ScheduleToolbar
        currentWeekStart={currentWeekStart}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onCurrentWeek={goToCurrentWeek}
        onExport={handleExport}
        onImport={handleImport}
        onNewWeek={handleNewWeek}
        onHistory={() => navigate('/history')}
        onSettings={() => navigate('/settings')}
        onProfile={() => navigate('/profile')}
      />

      {/* Main Schedule Grid */}
      <div className="p-6">
        <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
          {/* Grid Header */}
          <div className="grid grid-cols-8 bg-grid-header border-b border-grid-border sticky top-0 z-10">
            {/* Names column header */}
            <div className="p-4 font-semibold text-grid-header-foreground border-r border-grid-border bg-grid-header">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members
              </div>
            </div>
            
            {/* Day headers */}
            {weekDates.map((date, index) => (
              <div key={index} className="p-4 text-center border-r border-grid-border last:border-r-0">
                <div className="font-semibold text-grid-header-foreground">
                  {DAY_NAMES[index]}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {format(date, 'MM/dd')}
                </div>
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="divide-y divide-grid-border">
            {employees.map((employee, employeeIndex) => (
              <div key={employee.employee_id} className="grid grid-cols-8 hover:bg-grid-cell-hover/50">
                {/* Employee name (static) */}
                <div className="p-4 font-medium bg-secondary/30 border-r border-grid-border sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-foreground">{employee.name}</span>
                  </div>
                </div>

                {/* Shift cells */}
                {weekDates.map((date, dayIndex) => {
                  const shiftKey = getShiftKey(employee.employee_id, dayIndex);
                  const shiftValue = shifts[shiftKey] || '';
                  const isEditing = editingCell === shiftKey;

                  return (
                    <ScheduleCell
                      key={shiftKey}
                      id={`cell-${shiftKey}`}
                      value={shiftValue}
                      isEditing={isEditing}
                      onStartEdit={() => setEditingCell(shiftKey)}
                      onStopEdit={() => setEditingCell(null)}
                      onChange={(value) => handleShiftUpdate(employee.employee_id, dayIndex, value)}
                      onKeyDown={(e) => handleKeyDown(e, employee.employee_id, dayIndex)}
                      employeeName={employee.name}
                      dayName={DAY_NAMES[dayIndex]}
                      date={format(date, 'MM/dd')}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Grid Footer with helpful info */}
        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p>Double-click or press Enter to edit • Use arrow keys to navigate • Tab to move right</p>
          <p className="mt-1">
            <span className="inline-block w-3 h-3 bg-schedule-off rounded mr-1"></span>
            OFF shifts • 
            <span className="inline-block w-3 h-3 bg-schedule-shift rounded mr-1 ml-2"></span>
            Active shifts • 
            <span className="inline-block w-3 h-3 bg-schedule-empty border border-grid-border rounded mr-1 ml-2"></span>
            Empty
          </p>
        </div>
      </div>

      <ImportModal 
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImportData}
      />

      <ExportModal 
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExportData}
      />
    </div>
  );
};