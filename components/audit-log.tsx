'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AuditDetailModal } from './audit-detail-modal';
import { FrontendAuditLog } from './types';

interface AuditLogComponentProps {
  audit: FrontendAuditLog[];
  dateRange?: { from: Date; to: Date };
}

export function AuditLogComponent({ audit: initialAudit }: AuditLogComponentProps) {
  const [filterAdmin, setFilterAdmin] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<FrontendAuditLog | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Extract unique values for dropdowns from the loaded data
  const { uniqueAdmins, uniqueActions, uniqueEntities } = useMemo(() => {
    const admins = new Map<string, { _id: string; name: string }>();
    const actions = new Set<string>();
    const entities = new Set<string>();

    initialAudit.forEach(log => {
      // Handle performedBy
      if (log.performedBy) {
        if (typeof log.performedBy === 'object' && log.performedBy.name) {
          const admin = log.performedBy;
          admins.set(admin._id, { _id: admin._id, name: admin.name });
        }
      }
      
      // Handle action
      if (log.action) {
        actions.add(log.action);
      }
      
      // Handle entity
      if (log.entity) {
        entities.add(log.entity);
      }
    });

    return {
      uniqueAdmins: Array.from(admins.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      ),
      uniqueActions: Array.from(actions).sort(),
      uniqueEntities: Array.from(entities).sort(),
    };
  }, [initialAudit]);

  // Client-side filtering
  const filteredLogs = useMemo(() => {
    return initialAudit.filter((log) => {
      // Get admin info
      const adminName = log.performedBy?.name || '';
      const adminId = log.performedBy?._id || '';
      
      // Admin filter
      const adminMatch = filterAdmin === 'all' || 
        adminId === filterAdmin;
      
      // Action filter
      const actionMatch = filterAction === 'all' || 
        log.action === filterAction;
      
      // Entity filter
      const entityMatch = filterEntity === 'all' || 
        log.entity === filterEntity;
      
      // Search filter
      const searchMatch = !searchText || 
        adminName.toLowerCase().includes(searchText.toLowerCase()) ||
        (log.entity?.toLowerCase().includes(searchText.toLowerCase())) ||
        (log.entityId?.toLowerCase().includes(searchText.toLowerCase())) ||
        (log.action?.toLowerCase().includes(searchText.toLowerCase()));

      return adminMatch && actionMatch && entityMatch && searchMatch;
    });
  }, [initialAudit, filterAdmin, filterAction, filterEntity, searchText]);

  const clearFilters = () => {
    setFilterAdmin('all');
    setFilterAction('all');
    setFilterEntity('all');
    setSearchText('');
  };

  const getActionColor = (action: string) => {
    const upperAction = action.toUpperCase();
    switch (upperAction) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format: MM/DD/YYYY, HH:MM:SS AM/PM
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Date error';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <div className="mt-4 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by admin, entity, or action..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={clearFilters}
              variant="outline"
              size="sm"
            >
              Clear All
            </Button>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <label className="text-sm font-medium">Filter by Admin</label>
              <Select value={filterAdmin} onValueChange={setFilterAdmin}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admins</SelectItem>
                  {uniqueAdmins.map((admin) => (
                    <SelectItem key={admin._id} value={admin._id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-48">
              <label className="text-sm font-medium">Filter by Action</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-48">
              <label className="text-sm font-medium">Filter by Entity</label>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {uniqueEntities.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b text-sm text-gray-600">
            Showing {filteredLogs.length} of {initialAudit.length} audit logs
            {searchText && ` • Searching: "${searchText}"`}
            {(filterAdmin !== 'all' || filterAction !== 'all' || filterEntity !== 'all') && 
              ` • Filters applied`}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead>Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow key="no-logs">
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {initialAudit.length === 0 ? (
                      'No audit logs available'
                    ) : (
                      <div>
                        <p>No audit logs match your filters</p>
                        <p className="text-sm mt-1">Try changing your search or filters</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow 
                    key={log._id}
                    onClick={() => {
                      setSelectedLog(log);
                      setModalOpen(true);
                    }}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="text-sm">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.entity || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-xs">
                      {log.entityId || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {log.performedBy?.name || 'Unknown'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AuditDetailModal 
        log={selectedLog} 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </Card>
  );
}