import { useState } from 'react';
import { 
  CreditCard, Crown, Zap, Star, Calendar, MoreHorizontal, 
  RefreshCcw, Ban, Plus, Building2, TrendingUp, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { format, isAfter } from 'date-fns';

const PLANS = [
  { id: 'basic', name: 'Basic', nameAr: 'أساسي', price: 0, icon: Star },
  { id: 'pro', name: 'Professional', nameAr: 'احترافي', price: 499, icon: Zap },
  { id: 'enterprise', name: 'Enterprise', nameAr: 'مؤسسي', price: 1499, icon: Crown },
];

export function SubscriptionManagement() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const { vendors, stats, isLoading, updateSubscription, extendSubscription, cancelSubscription } = useSubscriptionManagement();
  
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [selectedMonths, setSelectedMonths] = useState('1');

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'enterprise':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"><Crown className="h-3 w-3 mr-1" /> {isRTL ? 'مؤسسي' : 'Enterprise'}</Badge>;
      case 'pro':
        return <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"><Zap className="h-3 w-3 mr-1" /> {isRTL ? 'احترافي' : 'Pro'}</Badge>;
      default:
        return <Badge variant="secondary"><Star className="h-3 w-3 mr-1" /> {isRTL ? 'أساسي' : 'Basic'}</Badge>;
    }
  };

  const getStatusBadge = (expiresAt: string | null) => {
    if (!expiresAt) return <Badge variant="outline">{isRTL ? 'مجاني' : 'Free'}</Badge>;
    const isExpired = !isAfter(new Date(expiresAt), new Date());
    return isExpired 
      ? <Badge variant="destructive">{isRTL ? 'منتهية' : 'Expired'}</Badge>
      : <Badge className="bg-green-500 text-white">{isRTL ? 'نشط' : 'Active'}</Badge>;
  };

  const handleUpdatePlan = async () => {
    if (selectedVendor) {
      await updateSubscription(selectedVendor.id, selectedPlan, parseInt(selectedMonths));
      setUpdateDialogOpen(false);
      setSelectedVendor(null);
    }
  };

  const handleExtend = async () => {
    if (selectedVendor) {
      await extendSubscription(selectedVendor.id, parseInt(selectedMonths));
      setExtendDialogOpen(false);
      setSelectedVendor(null);
    }
  };

  const handleCancel = async () => {
    if (selectedVendor) {
      await cancelSubscription(selectedVendor.id);
      setCancelDialogOpen(false);
      setSelectedVendor(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {isRTL ? 'إجمالي الوكلاء' : 'Total Vendors'}
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalVendors}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {isRTL ? 'اشتراكات نشطة' : 'Active Subscriptions'}
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.activeSubscriptions}</p>
              </div>
              <CreditCard className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  {isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.monthlyRevenue.toLocaleString()} <span className="text-sm">{isRTL ? 'ر.س' : 'SAR'}</span>
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {isRTL ? 'اشتراكات منتهية' : 'Expired'}
                </p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.expiredSubscriptions}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
              <Star className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'أساسي' : 'Basic'}</p>
              <p className="text-2xl font-bold">{stats.basicPlan}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'احترافي' : 'Pro'}</p>
              <p className="text-2xl font-bold">{stats.proPlan}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{isRTL ? 'مؤسسي' : 'Enterprise'}</p>
              <p className="text-2xl font-bold">{stats.enterprisePlan}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {isRTL ? 'إدارة الاشتراكات' : 'Subscription Management'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'عرض وإدارة اشتراكات الوكلاء' : 'View and manage vendor subscriptions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">
                {isRTL ? 'جاري التحميل...' : 'Loading...'}
              </div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{isRTL ? 'لا يوجد وكلاء' : 'No vendors found'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'الشركة' : 'Company'}</TableHead>
                  <TableHead>{isRTL ? 'الباقة' : 'Plan'}</TableHead>
                  <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{isRTL ? 'تاريخ الانتهاء' : 'Expires'}</TableHead>
                  <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      {isRTL ? vendor.company_name_ar || vendor.company_name : vendor.company_name}
                    </TableCell>
                    <TableCell>{getPlanBadge(vendor.subscription_plan)}</TableCell>
                    <TableCell>{getStatusBadge(vendor.subscription_expires_at)}</TableCell>
                    <TableCell>
                      {vendor.subscription_expires_at 
                        ? format(new Date(vendor.subscription_expires_at), 'PP')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedVendor(vendor);
                            setSelectedPlan(vendor.subscription_plan || 'pro');
                            setUpdateDialogOpen(true);
                          }}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            {isRTL ? 'تغيير الباقة' : 'Change Plan'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedVendor(vendor);
                            setExtendDialogOpen(true);
                          }}>
                            <Plus className="h-4 w-4 mr-2" />
                            {isRTL ? 'تمديد الاشتراك' : 'Extend Subscription'}
                          </DropdownMenuItem>
                          {isSuperAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setCancelDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                {isRTL ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Update Plan Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {isRTL ? 'تغيير الباقة' : 'Change Subscription Plan'}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? `تغيير باقة ${selectedVendor?.company_name}`
                : `Change plan for ${selectedVendor?.company_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'الباقة' : 'Plan'}</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {isRTL ? plan.nameAr : plan.name} - {plan.price} {isRTL ? 'ر.س' : 'SAR'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'المدة (بالأشهر)' : 'Duration (months)'}</Label>
              <Select value={selectedMonths} onValueChange={setSelectedMonths}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 {isRTL ? 'شهر' : 'month'}</SelectItem>
                  <SelectItem value="3">3 {isRTL ? 'أشهر' : 'months'}</SelectItem>
                  <SelectItem value="6">6 {isRTL ? 'أشهر' : 'months'}</SelectItem>
                  <SelectItem value="12">12 {isRTL ? 'شهر' : 'months'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleUpdatePlan}>
              {isRTL ? 'تحديث' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {isRTL ? 'تمديد الاشتراك' : 'Extend Subscription'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'المدة (بالأشهر)' : 'Duration (months)'}</Label>
              <Select value={selectedMonths} onValueChange={setSelectedMonths}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 {isRTL ? 'شهر' : 'month'}</SelectItem>
                  <SelectItem value="3">3 {isRTL ? 'أشهر' : 'months'}</SelectItem>
                  <SelectItem value="6">6 {isRTL ? 'أشهر' : 'months'}</SelectItem>
                  <SelectItem value="12">12 {isRTL ? 'شهر' : 'months'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleExtend}>
              {isRTL ? 'تمديد' : 'Extend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">{isRTL ? 'إلغاء الاشتراك' : 'Cancel Subscription'}</DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'هل أنت متأكد من إلغاء هذا الاشتراك؟ سيتم تحويل الوكيل إلى الباقة المجانية.'
                : 'Are you sure you want to cancel this subscription? The vendor will be moved to the free plan.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              {isRTL ? 'تأكيد الإلغاء' : 'Confirm Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
