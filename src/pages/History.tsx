import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const navigate = useNavigate();

  const historyEntries = [
    {
      id: 1,
      action: 'Updated shift',
      employee: 'Frank Gmelin',
      day: 'Monday',
      oldValue: '7AM-3PM',
      newValue: '7AM-1:30PM',
      user: 'Manager',
      timestamp: '2024-01-15 14:30:00',
    },
    {
      id: 2,
      action: 'Set OFF',
      employee: 'Patrica Garden',
      day: 'Sunday',
      oldValue: '9AM-5PM',
      newValue: 'OFF',
      user: 'Admin',
      timestamp: '2024-01-15 10:15:00',
    },
    {
      id: 3,
      action: 'Created new week',
      employee: 'All',
      day: 'Week of 01/13',
      oldValue: '',
      newValue: 'New week template',
      user: 'Admin',
      timestamp: '2024-01-13 09:00:00',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schedule
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Schedule History
            </h1>
            <p className="text-muted-foreground">View all changes made to the schedule</p>
          </div>
        </div>

        <div className="space-y-4">
          {historyEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {entry.action}
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {entry.user}
                  </Badge>
                </div>
                <CardDescription>{entry.timestamp}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Employee:</span>
                    <p className="text-muted-foreground">{entry.employee}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Day:</span>
                    <p className="text-muted-foreground">{entry.day}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Change:</span>
                    <div className="flex items-center gap-2 mt-1">
                      {entry.oldValue && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                          {entry.oldValue}
                        </span>
                      )}
                      {entry.oldValue && entry.newValue && (
                        <span className="text-muted-foreground">→</span>
                      )}
                      {entry.newValue && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {entry.newValue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;