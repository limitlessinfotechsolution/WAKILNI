import { useState } from 'react';
import { Shield, UserPlus, MoreHorizontal, Trash2, Crown } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function AdminManagementPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin, user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [demoteDialogOpen, setDemoteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch admins and super_admins
  const { users: admins, isLoading: loadingAdmins, updateUserRole, deleteUser } = useAdminUsers('admin');
  const { users: superAdmins, isLoading: loadingSuperAdmins } = useAdminUsers('super_admin');

  const allAdmins = [...superAdmins, ...admins];
  const isLoading = loadingAdmins || loadingSuperAdmins;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': 
        return (
          <Badge className="bg-red-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            {isRTL ? 'مشرف رئيسي' : 'Super Admin'}
          </Badge>
        );
      case 'admin': 
        return (
          <Badge className="bg-purple-500 text-white">
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
    }
  };

  const handleDemote = async () => {
    if (selectedUser) {
      await updateUserRole(selectedUser.user_id, 'admin');
      setDemoteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.user_id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
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
              <Shield className="h-6 w-6 text-destructive" />
              {isRTL ? 'إدارة المشرفين' : 'Admin Management'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL ? 'إدارة حسابات المشرفين والصلاحيات' : 'Manage admin accounts and permissions'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'المشرفون الرئيسيون' : 'Super Admins'}
                  </p>
                  <p className="text-2xl font-bold">{superAdmins.length}</p>
                </div>
                <Crown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'المشرفون' : 'Admins'}
                  </p>
                  <p className="text-2xl font-bold">{admins.length}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'قائمة المشرفين' : 'Admins List'}</CardTitle>
            <CardDescription>
              {isRTL 
                ? `إجمالي: ${allAdmins.length} مشرف`
                : `Total: ${allAdmins.length} admins`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </div>
              </div>
            ) : allAdmins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا يوجد مشرفون' : 'No admins found'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead>{isRTL ? 'الهاتف' : 'Phone'}</TableHead>
                    <TableHead>{isRTL ? 'الدور' : 'Role'}</TableHead>
                    <TableHead>{isRTL ? 'تاريخ الإضافة' : 'Added'}</TableHead>
                    <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.profile?.full_name || admin.profile?.full_name_ar || 'N/A'}
                        {admin.user_id === user?.id && (
                          <Badge variant="outline" className="ml-2">
                            {isRTL ? 'أنت' : 'You'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{admin.profile?.phone || 'N/A'}</TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>
                        {new Date(admin.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {admin.user_id !== user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {admin.role === 'admin' && (
                                <DropdownMenuItem onClick={() => openPromoteDialog(admin)}>
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
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-red-500" />
                {isRTL ? 'ترقية لمشرف رئيسي' : 'Promote to Super Admin'}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'سيحصل هذا المستخدم على صلاحيات كاملة للنظام.'
                  : 'This user will get full system permissions.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPromoteDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handlePromote}>
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
                  ? 'سيفقد هذا المستخدم صلاحيات المشرف الرئيسي.'
                  : 'This user will lose super admin permissions.'}
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
              <DialogTitle>{isRTL ? 'حذف المشرف' : 'Remove Admin'}</DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'هل أنت متأكد من إزالة هذا المشرف؟'
                  : 'Are you sure you want to remove this admin?'}
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
    </MainLayout>
  );
}
