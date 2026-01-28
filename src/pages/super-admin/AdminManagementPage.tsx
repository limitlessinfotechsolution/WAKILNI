import { useState } from 'react';
import { Shield, MoreHorizontal, Trash2, Crown, UserPlus, Users, Lock, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';

export default function AdminManagementPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin, user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [demoteDialogOpen, setDemoteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch admins and super_admins
  const { users: admins, isLoading: loadingAdmins, updateUserRole, deleteUser, refetch: refetchAdmins } = useAdminUsers('admin');
  const { users: superAdmins, isLoading: loadingSuperAdmins, refetch: refetchSuperAdmins } = useAdminUsers('super_admin');

  const allAdmins = [...superAdmins, ...admins];
  const isLoading = loadingAdmins || loadingSuperAdmins;

  const refetchAll = () => {
    refetchAdmins();
    refetchSuperAdmins();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': 
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
            <Crown className="h-3 w-3 mr-1" />
            {isRTL ? 'مشرف رئيسي' : 'Super Admin'}
          </Badge>
        );
      case 'admin': 
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <Shield className="h-3 w-3 mr-1" />
            {isRTL ? 'مشرف' : 'Admin'}
          </Badge>
        );
      default: 
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handlePromote = async () => {
    if (selectedUser) {
      await updateUserRole(selectedUser.user_id, 'super_admin');
      setPromoteDialogOpen(false);
      setSelectedUser(null);
      refetchAll();
    }
  };

  const handleDemote = async () => {
    if (selectedUser) {
      await updateUserRole(selectedUser.user_id, 'admin');
      setDemoteDialogOpen(false);
      setSelectedUser(null);
      refetchAll();
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.user_id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      refetchAll();
    }
  };

  const openPromoteDialog = (admin: any) => {
    setSelectedUser(admin);
    setPromoteDialogOpen(true);
  };

  const openDemoteDialog = (admin: any) => {
    setSelectedUser(admin);
    setDemoteDialogOpen(true);
  };

  const openDeleteDialog = (admin: any) => {
    setSelectedUser(admin);
    setDeleteDialogOpen(true);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{isRTL ? 'غير مصرح' : 'Unauthorized'}</AlertTitle>
            <AlertDescription>
              {isRTL 
                ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة. يتطلب الأمر صلاحيات المشرف الرئيسي.'
                : 'You do not have permission to access this page. Super Admin privileges required.'}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isRTL ? 'font-arabic' : ''}`}>
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
                <Crown className="h-5 w-5" />
              </div>
              {isRTL ? 'إدارة المشرفين' : 'Admin Management'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isRTL 
                ? 'إنشاء وإدارة حسابات المشرفين والصلاحيات'
                : 'Create and manage admin accounts and permissions'}
            </p>
          </div>
          <CreateUserDialog onUserCreated={refetchAll} />
        </div>

        {/* Security Notice */}
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            {isRTL ? 'منطقة آمنة' : 'Secure Zone'}
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            {isRTL 
              ? 'أنت تدير حسابات المشرفين. جميع التغييرات مسجلة في سجل التدقيق.'
              : 'You are managing admin accounts. All changes are logged in the audit trail.'}
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-300 font-medium">
                    {isRTL ? 'المشرفون الرئيسيون' : 'Super Admins'}
                  </p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100">{superAdmins.length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white">
                  <Crown className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">
                    {isRTL ? 'المشرفون' : 'Admins'}
                  </p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{admins.length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                    {isRTL ? 'إجمالي الإداريين' : 'Total Staff'}
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{allAdmins.length}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">
                    {isRTL ? 'الحالة' : 'Status'}
                  </p>
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                    {isRTL ? 'نظام آمن' : 'System Secure'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admins Table */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              {isRTL ? 'قائمة المشرفين' : 'Admins List'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? `إجمالي: ${allAdmins.length} مشرف - إدارة كاملة للنظام`
                : `Total: ${allAdmins.length} admins - Full system management`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </div>
              </div>
            ) : allAdmins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                  <Shield className="h-10 w-10 text-purple-500" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  {isRTL ? 'لا يوجد مشرفون' : 'No admins found'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRTL ? 'قم بإنشاء حساب مشرف جديد' : 'Create a new admin account to get started'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? 'المشرف' : 'Admin'}</TableHead>
                    <TableHead>{isRTL ? 'الهاتف' : 'Phone'}</TableHead>
                    <TableHead>{isRTL ? 'الدور' : 'Role'}</TableHead>
                    <TableHead>{isRTL ? 'تاريخ الإضافة' : 'Added'}</TableHead>
                    <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAdmins.map((admin) => (
                    <TableRow key={admin.id} className="group hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-purple-200">
                            <AvatarImage src={admin.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-sm font-bold">
                              {getInitials(admin.profile?.full_name || admin.profile?.full_name_ar)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {admin.profile?.full_name || admin.profile?.full_name_ar || 'N/A'}
                            </p>
                            {admin.user_id === user?.id && (
                              <Badge variant="outline" className="text-xs mt-1 border-primary text-primary">
                                {isRTL ? 'أنت' : 'You'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{admin.profile?.phone || '-'}</TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {admin.user_id !== user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {admin.role === 'admin' && (
                                <DropdownMenuItem onClick={() => openPromoteDialog(admin)} className="text-red-600">
                                  <Crown className="h-4 w-4 mr-2" />
                                  {isRTL ? 'ترقية لمشرف رئيسي' : 'Promote to Super Admin'}
                                </DropdownMenuItem>
                              )}
                              {admin.role === 'super_admin' && (
                                <DropdownMenuItem onClick={() => openDemoteDialog(admin)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  {isRTL ? 'تخفيض لمشرف' : 'Demote to Admin'}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(admin)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isRTL ? 'حذف' : 'Remove'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Promote Dialog */}
        <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Crown className="h-5 w-5" />
                {isRTL ? 'ترقية لمشرف رئيسي' : 'Promote to Super Admin'}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'سيحصل هذا المستخدم على صلاحيات كاملة للنظام بما في ذلك إدارة المشرفين الآخرين.'
                  : 'This user will get full system permissions including managing other admins.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPromoteDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handlePromote} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                {isRTL ? 'ترقية' : 'Promote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Demote Dialog */}
        <Dialog open={demoteDialogOpen} onOpenChange={setDemoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تخفيض الصلاحيات' : 'Demote Admin'}</DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'سيفقد هذا المستخدم صلاحيات المشرف الرئيسي ولن يتمكن من إدارة المشرفين الآخرين.'
                  : 'This user will lose super admin permissions and cannot manage other admins.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDemoteDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="destructive" onClick={handleDemote}>
                {isRTL ? 'تخفيض' : 'Demote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">{isRTL ? 'حذف المشرف' : 'Remove Admin'}</DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'هل أنت متأكد من إزالة هذا المشرف؟ سيفقد جميع الصلاحيات الإدارية.'
                  : 'Are you sure you want to remove this admin? They will lose all administrative privileges.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {isRTL ? 'حذف' : 'Remove'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
