'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FrontendAuditLog } from './types';
import { 
  Calendar, 
  User, 
  Hash, 
  Clock,
  FileText,
  ChevronRight
} from 'lucide-react';

interface AuditDetailModalProps {
  log: FrontendAuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailModal({ log, open, onOpenChange }: AuditDetailModalProps) {
  if (!log) return null;

  // Fields to exclude from display (technical and audit-specific fields)
  const EXCLUDED_FIELDS = [
    'updatedAt', 
    'isDeleted', 
    '__v', 
    '_id', 
    'id', 
    'createdAt',
    'recordedBy'  // Added this
  ];

  const getActionColor = (action: string) => {
    const upperAction = action.toUpperCase();
    switch (upperAction) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date?: string | Date | number | null) => {
    if (!date || isNaN(new Date(date).getTime())) return 'Invalid Date';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return '{Object}';
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  const parseData = (data: any): Record<string, any> => {
    if (!data) return {};
    
    // If it's a string, try to parse it as JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return { data };
      }
    }
    
    // If it's already an object, return it (filter out excluded fields)
    if (typeof data === 'object') {
      const filteredData: Record<string, any> = {};
      Object.keys(data).forEach(key => {
        if (!EXCLUDED_FIELDS.includes(key)) {
          filteredData[key] = data[key];
        }
      });
      return filteredData;
    }
    
    return { value: data };
  };

  const renderFieldComparison = () => {
    const beforeData = parseData(log.before);
    const afterData = parseData(log.after);
    
    const allFields = new Set([
      ...Object.keys(beforeData),
      ...Object.keys(afterData)
    ]);
    
    if (allFields.size === 0) {
      return (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No business data available</p>
          <p className="text-xs text-gray-400 mt-1">(Only technical/audit fields were recorded)</p>
        </div>
      );
    }
    
    return Array.from(allFields).map((field) => {
      const beforeValue = beforeData[field];
      const afterValue = afterData[field];
      const isChanged = JSON.stringify(beforeValue) !== JSON.stringify(afterValue);
      
      return (
        <div key={field} className="space-y-3">
          {/* Field Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 capitalize">
                {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </h4>
              <p className="text-xs text-gray-500 font-mono">{field}</p>
            </div>
            {isChanged && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                Changed
              </Badge>
            )}
          </div>
          
          {/* Before/After Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Column */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">B</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Before</span>
              </div>
              <div className="min-h-[60px] p-3 bg-white rounded border border-gray-100">
                <p className={`text-sm ${beforeValue === undefined ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                  {beforeValue === undefined ? 'Not set' : formatValue(beforeValue)}
                </p>
              </div>
            </div>
            
            {/* After Column */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <span className="text-sm font-medium text-gray-700">After</span>
              </div>
              <div className="min-h-[60px] p-3 bg-white rounded border border-gray-100">
                <p className={`text-sm ${afterValue === undefined ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                  {afterValue === undefined ? 'Not set' : formatValue(afterValue)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-b border-gray-100 pb-4"></div>
        </div>
      );
    });
  };

  const getVisibleFieldCount = (data: any) => {
    const parsed = parseData(data);
    return Object.keys(parsed).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Audit Log Details</DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {log.performedBy?.name || 'Unknown Admin'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(log.createdAt)}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Action Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge className={getActionColor(log.action)}>
                {log.action.toUpperCase()}
              </Badge>
              <span className="font-medium">{log.entity.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Hash className="h-3 w-3" />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">{log.entityId}</code>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-3 w-3" />
              {formatDate(log.createdAt).split(',')[0]}
            </div>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="space-y-6">
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mb-1">
                  <span className="font-bold text-gray-700">Before</span>
                </div>
                <p className="text-xs text-gray-500">Original State</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
              <div className="text-center">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-1">
                  <span className="font-bold text-white">After</span>
                </div>
                <p className="text-xs text-gray-500">Updated State</p>
              </div>
            </div>
          </div>

          {/* Field Comparisons */}
          <div className="space-y-6">
            {renderFieldComparison()}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-800">
                {getVisibleFieldCount(log.before)}
              </p>
              <p className="text-xs text-gray-500">Business Fields Before</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-800">
                {getVisibleFieldCount(log.after)}
              </p>
              <p className="text-xs text-gray-500">Business Fields After</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-800">
                {log.action.toUpperCase()}
              </p>
              <p className="text-xs text-gray-500">Action</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400 text-center">
            Technical/audit fields (updatedAt, isDeleted, __v, createdAt, _id, id, recordedBy) are hidden
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}