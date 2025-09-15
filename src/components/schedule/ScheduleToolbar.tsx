import React from 'react';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Download, 
  Upload, 
  Plus,
  History,
  Settings,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduleToolbarProps {
  currentWeekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onExport: () => void;
  onImport: () => void;
  onNewWeek: () => void;
  onHistory: () => void;
  onSettings: () => void;
  onProfile: () => void;
}

export const ScheduleToolbar: React.FC<ScheduleToolbarProps> = ({
  currentWeekStart,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  onExport,
  onImport,
  onNewWeek,
  onHistory,
  onSettings,
  onProfile,
}) => {
  // Calculate week end (Friday)
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="bg-card border-b border-border shadow-sm sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section - App branding */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Team Schedule</h1>
            </div>
          </div>

          {/* Center section - Week navigation */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPreviousWeek}
              className="h-9"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2 min-w-[200px] justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCurrentWeek}
                className="text-foreground font-semibold hover:bg-accent"
              >
                {format(currentWeekStart, 'MMM dd')} — {format(weekEnd, 'MMM dd, yyyy')}
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNextWeek}
              className="h-9"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onNewWeek}
              className="h-9"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Week
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onImport}
              className="h-9"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onExport}
              className="h-9"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>

            <div className="w-px h-6 bg-border mx-1" />
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onHistory}
              className="h-9"
            >
              <History className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onSettings}
              className="h-9"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* User menu */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onProfile}
              className="h-9 w-9 p-0 rounded-full"
            >
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};