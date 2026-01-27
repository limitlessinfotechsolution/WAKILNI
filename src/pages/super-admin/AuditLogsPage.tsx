import { useState } from 'react';
import { FileText, User, Clock, Filter, Search, RefreshCw } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function AuditLogsPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { logs, isLoading, refetch } = useAuditLogs({
    entityType: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
    limit: 200,
  });

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const action = log.action.toLowerCase();
    const entityType = log.entity_type.toLowerCase();
    return action.includes(searchQuery.toLowerCase()) || 
           entityType.includes(searchQuery.toLowerCase());
  });

  const getActionBadge = (action: string) => {
    if (action.includes('create') || action.includes('add')) {
      return <Badge className="bg-green-500">{action}</Badge>;
    }
    if (action.includes('delete') || action.includes('remove')) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    if (action.includes('update') || action.includes('edit')) {
      return <Badge className="bg-blue-500">{action}</Badge>;
    }
    if (action.includes('suspend') || action.includes('reject')) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    if (action.includes('approve')) {
      return <Badge className="bg-green-500">{action}</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'super_admin': return <Badge className="bg-red-500 text-white">Super Admin</Badge>;
      case 'admin': return <Badge className="bg-purple-500 text-white">Admin</Badge>;
      default: return <Badge variant="outline">{role || 'Unknown'}</Badge>;
    }
  };

  const openDetails = (log: any) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  if (!isSuperAdmin) {
    return (
      <MainLayout>
        <div className="container py-8 px-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{isRTL ? 'غير مصرح' : 'Unauthorized'}</AlertTitle>
            <AlertDescription>
              {isRTL 
                ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة.'
                : 'You do not have permission to access this page.'}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isRTL ? 'font-arabic' : ''}`}>
              <FileText className="h-6 w-6" />
              {isRTL ? 'سجل التدقيق' : 'Audit Logs'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL ? 'تتبع جميع الإجراءات على المنصة' : 'Track all actions on the platform'}
            </p>
          </div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={isRTL ? 'البحث في السجلات...' : 'Search logs...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={isRTL ? 'نوع الكيان' : 'Entity Type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="user">{isRTL ? 'المستخدمين' : 'Users'}</SelectItem>
                  <SelectItem value="provider">{isRTL ? 'مقدمي الخدمات' : 'Providers'}</SelectItem>
                  <SelectItem value="vendor">{isRTL ? 'الوكلاء' : 'Vendors'}</SelectItem>
                  <SelectItem value="booking">{isRTL ? 'الحجوزات' : 'Bookings'}</SelectItem>
                  <SelectItem value="donation">{isRTL ? 'التبرعات' : 'Donations'}</SelectItem>
                  <SelectItem value="system">{isRTL ? 'النظام' : 'System'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'سجلات النشاط' : 'Activity Logs'}</CardTitle>
            <CardDescription>
              {isRTL ? `إجمالي: ${filteredLogs.length} سجل` : `Total: ${filteredLogs.length} logs`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد سجلات' : 'No logs found'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? 'الوقت' : 'Time'}</TableHead>
                    <TableHead>{isRTL ? 'المنفذ' : 'Actor'}</TableHead>
                    <TableHead>{isRTL ? 'الإجراء' : 'Action'}</TableHead>
                    <TableHead>{isRTL ? 'نوع الكيان' : 'Entity'}</TableHead>
                    <TableHead className="text-right">{isRTL ? 'التفاصيل' : 'Details'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(log.actor_role)}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.entity_type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => openDetails(log)}
                        >
                          {isRTL ? 'عرض' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تفاصيل السجل' : 'Log Details'}</DialogTitle>
              <DialogDescription>
                {selectedLog?.created_at && new Date(selectedLog.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {isRTL ? 'الإجراء' : 'Action'}
                    </p>
                    {getActionBadge(selectedLog.action)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {isRTL ? 'نوع الكيان' : 'Entity Type'}
                    </p>
                    <Badge variant="outline">{selectedLog.entity_type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {isRTL ? 'معرف الكيان' : 'Entity ID'}
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {selectedLog.entity_id || 'N/A'}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {isRTL ? 'دور المنفذ' : 'Actor Role'}
                    </p>
                    {getRoleBadge(selectedLog.actor_role)}
                  </div>
                </div>
                
                {selectedLog.old_values && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {isRTL ? 'القيم السابقة' : 'Previous Values'}
                    </p>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.new_values && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {isRTL ? 'القيم الجديدة' : 'New Values'}
                    </p>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {isRTL ? 'بيانات إضافية' : 'Metadata'}
                    </p>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
