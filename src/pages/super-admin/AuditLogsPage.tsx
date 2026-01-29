import { useState, useMemo } from 'react';
import { 
  FileText, User, Clock, Filter, Search, RefreshCw, Shield, 
  UserPlus, UserMinus, CheckCircle, XCircle, CreditCard,
  Building2, UserCheck, AlertTriangle, Activity, Download,
  List, LayoutList, ChevronDown
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuth } from '@/lib/auth';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format, isToday, isThisWeek, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/cards/StatCard';

type ViewMode = 'table' | 'timeline';

export default function AuditLogsPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [quickFilter, setQuickFilter] = useState<string>('all');

  const { logs, isLoading, refetch } = useAuditLogs({
    entityType: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
    limit: 200,
  });

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Quick filter
    if (quickFilter === 'today') {
      result = result.filter(log => isToday(new Date(log.created_at)));
    } else if (quickFilter === 'week') {
      result = result.filter(log => isThisWeek(new Date(log.created_at)));
    } else if (quickFilter === 'critical') {
      result = result.filter(log => 
        log.action.includes('deleted') || 
        log.action.includes('suspended') || 
        log.action.includes('rejected')
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => {
        const action = log.action.toLowerCase();
        const entityType = log.entity_type.toLowerCase();
        return action.includes(query) || entityType.includes(query);
      });
    }

    return result;
  }, [logs, searchQuery, quickFilter]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = logs.filter(l => new Date(l.created_at) >= today);
    const userActions = logs.filter(l => l.entity_type === 'user').length;
    const subscriptionActions = logs.filter(l => l.entity_type === 'subscription').length;
    const kycActions = logs.filter(l => 
      l.action.includes('kyc') || l.action.includes('approved') || l.action.includes('rejected')
    ).length;

    return { todayLogs: todayLogs.length, userActions, subscriptionActions, kycActions };
  }, [logs]);

  const getActionIcon = (action: string) => {
    if (action.includes('created') || action.includes('add')) return <UserPlus className="h-4 w-4" />;
    if (action.includes('deleted') || action.includes('remove')) return <UserMinus className="h-4 w-4" />;
    if (action.includes('approved')) return <CheckCircle className="h-4 w-4" />;
    if (action.includes('rejected') || action.includes('suspended')) return <XCircle className="h-4 w-4" />;
    if (action.includes('subscription')) return <CreditCard className="h-4 w-4" />;
    if (action.includes('role')) return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes('created') || action.includes('add') || action.includes('approved') || action.includes('activated')) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 gap-1">
          {getActionIcon(action)}
          {action.replace(/_/g, ' ')}
        </Badge>
      );
    }
    if (action.includes('deleted') || action.includes('remove') || action.includes('rejected') || action.includes('suspended')) {
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 gap-1">
          {getActionIcon(action)}
          {action.replace(/_/g, ' ')}
        </Badge>
      );
    }
    if (action.includes('update') || action.includes('change') || action.includes('extended')) {
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 gap-1">
          {getActionIcon(action)}
          {action.replace(/_/g, ' ')}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        {getActionIcon(action)}
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'super_admin': 
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        );
      case 'admin': 
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      default: 
        return <Badge variant="outline">{role || 'Unknown'}</Badge>;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'user': return <User className="h-4 w-4" />;
      case 'provider': return <UserCheck className="h-4 w-4" />;
      case 'vendor': return <Building2 className="h-4 w-4" />;
      case 'subscription': return <CreditCard className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const openDetails = (log: any) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Actor Role', 'Action', 'Entity Type', 'Entity ID'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.actor_role || 'Unknown',
        log.action,
        log.entity_type,
        log.entity_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  // JSON Diff Viewer Component
  const JsonDiffViewer = ({ oldValues, newValues }: { oldValues: any; newValues: any }) => {
    if (!oldValues && !newValues) return null;

    const allKeys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {})
    ]);

    return (
      <div className="space-y-2 text-sm font-mono">
        {Array.from(allKeys).map(key => {
          const oldVal = oldValues?.[key];
          const newVal = newValues?.[key];
          const hasChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

          return (
            <div key={key} className={cn(
              'p-2 rounded',
              hasChanged ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-muted/50'
            )}>
              <span className="font-medium text-muted-foreground">{key}:</span>
              {hasChanged ? (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded text-red-700 dark:text-red-300 text-xs">
                    - {JSON.stringify(oldVal) || 'null'}
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded text-emerald-700 dark:text-emerald-300 text-xs">
                    + {JSON.stringify(newVal) || 'null'}
                  </div>
                </div>
              ) : (
                <span className="ms-2 text-muted-foreground">{JSON.stringify(oldVal)}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Timeline View Component
  const TimelineView = () => (
    <div className="space-y-4">
      {filteredLogs.map((log, index) => {
        const isNew = index < 3;
        return (
          <div key={log.id} className="relative ps-8">
            {/* Timeline Line */}
            {index < filteredLogs.length - 1 && (
              <div className="absolute start-3 top-6 bottom-0 w-0.5 bg-border" />
            )}
            
            {/* Timeline Dot */}
            <div className={cn(
              'absolute start-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center',
              log.action.includes('created') || log.action.includes('approved') 
                ? 'bg-emerald-100 dark:bg-emerald-900/50'
                : log.action.includes('deleted') || log.action.includes('rejected')
                  ? 'bg-red-100 dark:bg-red-900/50'
                  : 'bg-blue-100 dark:bg-blue-900/50',
              isNew && 'animate-[live-pulse_2s_ease-in-out_infinite]'
            )}>
              {getActionIcon(log.action)}
            </div>

            {/* Content */}
            <GlassCard 
              hoverable 
              className="cursor-pointer"
              onClick={() => openDetails(log)}
            >
              <GlassCardContent className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(log.action)}
                      {getRoleBadge(log.actor_role)}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="gap-1 text-xs">
                        {getEntityIcon(log.entity_type)}
                        {log.entity_type}
                      </Badge>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      {format(new Date(log.created_at), 'MMM d, HH:mm', { locale: isRTL ? ar : undefined })}
                    </div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        );
      })}
    </div>
  );

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        {/* Islamic Header */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground font-arabic mb-2">
            إِنَّ اللَّهَ كَانَ عَلَيْكُمْ رَقِيبًا
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={cn('text-2xl font-bold flex items-center gap-2', isRTL && 'font-arabic')}>
              <FileText className="h-6 w-6 text-primary" />
              {isRTL ? 'سجل التدقيق' : 'Audit Logs'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isRTL ? 'تتبع جميع الإجراءات الإدارية على المنصة' : 'Track all administrative actions on the platform'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 me-2" />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 me-2" />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title={isRTL ? 'اليوم' : 'Today'}
            value={stats.todayLogs}
            icon={Activity}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title={isRTL ? 'المستخدمين' : 'User Actions'}
            value={stats.userActions}
            icon={User}
          />
          <StatCard
            title={isRTL ? 'التحقق' : 'KYC Reviews'}
            value={stats.kycActions}
            icon={CheckCircle}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title={isRTL ? 'الاشتراكات' : 'Subscriptions'}
            value={stats.subscriptionActions}
            icon={CreditCard}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: 'all', labelEn: 'All Logs', labelAr: 'جميع السجلات' },
            { value: 'today', labelEn: 'Today', labelAr: 'اليوم' },
            { value: 'week', labelEn: 'This Week', labelAr: 'هذا الأسبوع' },
            { value: 'critical', labelEn: 'Critical', labelAr: 'حرجة' },
          ].map(filter => (
            <Button
              key={filter.value}
              variant={quickFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickFilter(filter.value)}
            >
              {isRTL ? filter.labelAr : filter.labelEn}
            </Button>
          ))}
        </div>

        {/* Filters */}
        <GlassCard className="mb-6">
          <GlassCardContent className="py-4">
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
                  <SelectItem value="subscription">{isRTL ? 'الاشتراكات' : 'Subscriptions'}</SelectItem>
                  <SelectItem value="booking">{isRTL ? 'الحجوزات' : 'Bookings'}</SelectItem>
                  <SelectItem value="system">{isRTL ? 'النظام' : 'System'}</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('timeline')}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Logs Content */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{isRTL ? 'سجلات النشاط' : 'Activity Logs'}</h3>
              </div>
              <Badge variant="secondary">
                {filteredLogs.length} {isRTL ? 'سجل' : 'logs'}
              </Badge>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground animate-pulse">
                    {isRTL ? 'جاري التحميل...' : 'Loading...'}
                  </p>
                </div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">
                  {isRTL ? 'لا توجد سجلات' : 'No logs found'}
                </p>
              </div>
            ) : viewMode === 'timeline' ? (
              <TimelineView />
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">{isRTL ? 'الوقت' : 'Time'}</TableHead>
                      <TableHead>{isRTL ? 'المنفذ' : 'Actor'}</TableHead>
                      <TableHead>{isRTL ? 'الإجراء' : 'Action'}</TableHead>
                      <TableHead>{isRTL ? 'نوع الكيان' : 'Entity'}</TableHead>
                      <TableHead className="text-right">{isRTL ? 'التفاصيل' : 'Details'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="group">
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <div>
                              <p>{format(new Date(log.created_at), 'MMM d, yyyy', { locale: isRTL ? ar : undefined })}</p>
                              <p className="text-xs">{format(new Date(log.created_at), 'HH:mm:ss')}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(log.actor_role)}</TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {getEntityIcon(log.entity_type)}
                            {log.entity_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openDetails(log)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {isRTL ? 'عرض' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {isRTL ? 'تفاصيل السجل' : 'Log Details'}
              </DialogTitle>
              <DialogDescription>
                {selectedLog?.created_at && format(new Date(selectedLog.created_at), 'PPpp', { locale: isRTL ? ar : undefined })}
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase">
                      {isRTL ? 'الإجراء' : 'Action'}
                    </label>
                    {getActionBadge(selectedLog.action)}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase">
                      {isRTL ? 'المنفذ' : 'Actor'}
                    </label>
                    {getRoleBadge(selectedLog.actor_role)}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase">
                      {isRTL ? 'نوع الكيان' : 'Entity Type'}
                    </label>
                    <Badge variant="outline" className="gap-1">
                      {getEntityIcon(selectedLog.entity_type)}
                      {selectedLog.entity_type}
                    </Badge>
                  </div>
                  {selectedLog.entity_id && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase">
                        {isRTL ? 'معرف الكيان' : 'Entity ID'}
                      </label>
                      <p className="text-xs font-mono break-all">{selectedLog.entity_id}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* JSON Diff Viewer */}
                {(selectedLog.old_values || selectedLog.new_values) && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {isRTL ? 'عرض التغييرات' : 'View Changes'}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <JsonDiffViewer 
                        oldValues={selectedLog.old_values} 
                        newValues={selectedLog.new_values} 
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {selectedLog.metadata && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {isRTL ? 'البيانات الوصفية' : 'Metadata'}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <pre className="text-xs p-4 bg-muted rounded-lg overflow-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
