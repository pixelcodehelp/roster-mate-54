import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, Calendar, CheckCircle } from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => void;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeHeader: boolean;
  includeAudit: boolean;
  dateRange: 'current' | 'all' | 'custom';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onOpenChange,
  onExport,
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeHeader: true,
    includeAudit: false,
    dateRange: 'current',
  });

  const [step, setStep] = useState<'options' | 'success'>('options');

  const handleExport = () => {
    onExport(options);
    setStep('success');
    
    // Simulate export process
    setTimeout(() => {
      onOpenChange(false);
      setStep('options');
    }, 2000);
  };

  const updateOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Schedule
          </DialogTitle>
          <DialogDescription>
            Choose your export options and download your schedule data
          </DialogDescription>
        </DialogHeader>

        {step === 'options' && (
          <div className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Export Format</Label>
              <Select
                value={options.format}
                onValueChange={(value: 'csv' | 'excel' | 'pdf') => updateOption('format', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      CSV File (.csv)
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Excel File (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF Document (.pdf)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Date Range</Label>
              <Select
                value={options.dateRange}
                onValueChange={(value: 'current' | 'all' | 'custom') => updateOption('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Current Week Only
                    </div>
                  </SelectItem>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      All Weeks
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Custom Range
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Export Options</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Include Header Row</Label>
                  <p className="text-xs text-muted-foreground">
                    Add column headers to the exported file
                  </p>
                </div>
                <Switch
                  checked={options.includeHeader}
                  onCheckedChange={(checked) => updateOption('includeHeader', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-normal">Include Audit Trail</Label>
                  <p className="text-xs text-muted-foreground">
                    Add change history and timestamps
                  </p>
                </div>
                <Switch
                  checked={options.includeAudit}
                  onCheckedChange={(checked) => updateOption('includeAudit', checked)}
                />
              </div>
            </div>

            {/* Preview */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Export Preview</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Format: {options.format.toUpperCase()}</p>
                  <p>Range: {options.dateRange === 'current' ? 'Current week' : options.dateRange === 'all' ? 'All weeks' : 'Custom range'}</p>
                  <p>Headers: {options.includeHeader ? 'Included' : 'Not included'}</p>
                  <p>Audit trail: {options.includeAudit ? 'Included' : 'Not included'}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Schedule
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium mb-2">Export Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Your schedule has been exported successfully.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};