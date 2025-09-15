import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ScheduleCellProps {
  id: string;
  value: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  employeeName: string;
  dayName: string;
  date: string;
}

export const ScheduleCell: React.FC<ScheduleCellProps> = ({
  id,
  value,
  isEditing,
  onStartEdit,
  onStopEdit,
  onChange,
  onKeyDown,
  employeeName,
  dayName,
  date,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Determine cell color based on content
  const getCellColor = () => {
    const normalizedValue = localValue.trim().toLowerCase();
    if (normalizedValue === 'off') {
      return 'bg-schedule-off text-schedule-off-foreground';
    } else if (normalizedValue && normalizedValue !== '') {
      return 'bg-schedule-shift text-schedule-shift-foreground';
    }
    return 'bg-schedule-empty text-schedule-empty-foreground';
  };

  // Handle double-click to start editing
  const handleDoubleClick = () => {
    onStartEdit();
  };

  // Handle input changes with autosave debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  // Handle input blur (save changes)
  const handleInputBlur = () => {
    onChange(localValue);
    onStopEdit();
  };

  // Handle input key events
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        onChange(localValue);
        onStopEdit();
        break;
      case 'Escape':
        setLocalValue(value); // Reset to original value
        onStopEdit();
        break;
      case 'Tab':
        onChange(localValue);
        onStopEdit();
        // Let the parent handle navigation
        onKeyDown(e);
        break;
    }
  };

  // Handle cell key events (when not editing)
  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditing) {
      onKeyDown(e);
    }
  };

  // Quick actions for right-click menu (future feature)
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement right-click context menu
    console.log('Right-click on cell:', { employeeName, dayName, date });
  };

  return (
    <div
      id={id}
      ref={cellRef}
      className={cn(
        "relative border-r border-grid-border last:border-r-0 min-h-[60px] transition-colors",
        "hover:bg-grid-cell-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset",
        isEditing && "bg-grid-cell-editing",
        getCellColor()
      )}
      tabIndex={isEditing ? -1 : 0}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleCellKeyDown}
      onContextMenu={handleRightClick}
      title={`${employeeName} - ${dayName} ${date}${value ? `: ${value}` : ''}`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className={cn(
            "w-full h-full px-3 py-4 bg-transparent border-0 outline-none resize-none",
            "text-inherit placeholder:text-muted-foreground"
          )}
          placeholder="Enter shift time or OFF"
          maxLength={50}
        />
      ) : (
        <div className="px-3 py-4 h-full flex items-center">
          <span className="truncate font-medium">
            {localValue || (
              <span className="text-muted-foreground/50 italic">
                Click to edit
              </span>
            )}
          </span>
        </div>
      )}
      
      {/* Subtle save indicator (future feature) */}
      {value !== localValue && isEditing && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full animate-pulse" 
             title="Unsaved changes" />
      )}
    </div>
  );
};