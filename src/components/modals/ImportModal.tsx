import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  open,
  onOpenChange,
  onImport,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(['Please select a CSV file']);
      return;
    }

    setFile(selectedFile);
    setErrors([]);

    // Parse CSV
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const data = lines.map(line => line.split(',').map(cell => cell.trim()));
      
      // Basic validation
      const newErrors: string[] = [];
      if (data.length < 2) {
        newErrors.push('CSV must have at least a header row and one data row');
      }
      
      if (data[0] && data[0].length < 8) {
        newErrors.push('CSV must have at least 8 columns (Name + 7 days)');
      }

      // Check for required employees
      const requiredEmployees = ['Frank Gmelin', 'Patrica Garden', 'Dawn Waddel'];
      const csvEmployees = data.slice(1).map(row => row[0]);
      const missingEmployees = requiredEmployees.filter(emp => !csvEmployees.includes(emp));
      
      if (missingEmployees.length > 0) {
        newErrors.push(`Missing required employees: ${missingEmployees.join(', ')}`);
      }

      setErrors(newErrors);
      setPreview(data);
      setStep(newErrors.length === 0 ? 'preview' : 'upload');
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setStep('success');
      setTimeout(() => {
        onOpenChange(false);
        resetModal();
      }, 2000);
    }
  };

  const resetModal = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setStep('upload');
    setDragActive(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetModal();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Schedule
          </DialogTitle>
          <DialogDescription>
            Import a CSV file to update the current week's schedule
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Drag and drop your CSV file here
              </p>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Label htmlFor="file-input">
                <Button variant="outline" className="cursor-pointer">
                  Choose File
                </Button>
              </Label>
              <Input
                id="file-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {file && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• First column must be "Name"</li>
                <li>• Columns 2-8 should be the days (Saturday through Friday)</li>
                <li>• Must include all required employees</li>
                <li>• Use "OFF" for days off, or shift times like "7AM-3PM"</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                CSV file validated successfully. Preview the data below before importing.
              </AlertDescription>
            </Alert>

            <div className="max-h-96 overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {preview[0]?.map((header, index) => (
                      <th key={index} className="p-2 text-left font-medium border-r">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="p-2 border-r">
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Import Schedule
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium mb-2">Import Successful!</h3>
            <p className="text-muted-foreground">
              Your schedule has been updated with the imported data.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};