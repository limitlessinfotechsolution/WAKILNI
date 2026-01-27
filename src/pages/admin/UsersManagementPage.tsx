import { useState } from 'react';
import { Search, UserPlus, MoreHorizontal, Shield, Ban, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type RoleFilter = 'all' | AppRole;

export default function UsersManagementPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<RoleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; userId: string; role: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('traveler');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { users, isLoading, updateUserRole, deleteUser } = useAdminUsers(activeTab);

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const name = user.profile?.full_name || user.profile?.full_name_ar || '';
    const phone = user.profile?.phone || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           phone.includes(searchQuery);
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500 text-white';
      case 'admin': return 'bg-purple-500 text-white';
      case 'vendor': return 'bg-blue-500 text-white';
      case 'provider': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleChangeRole = async () => {
    if (selectedUser) {
      await updateUserRole(selectedUser.userId, newRole);
      setDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.userId);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const openRoleDialog = (user: { id: string; user_id: string; role: AppRole }) => {
    setSelectedUser({ id: user.id, userId: user.user_id, role: user.role });
    setNewRole(user.role);
    setDialogOpen(true);
  };

  const openDeleteDialog = (user: { id: string; user_id: string; role: AppRole }) => {
    setSelectedUser({ id: user.id, userId: user.user_id, role: user.role });
    setDeleteDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة المستخدمين' : 'User Management'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL ? 'عرض وإدارة جميع المستخدمين' : 'View and manage all users'}
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={isRTL ? 'البحث بالاسم أو رقم الهاتف...' : 'Search by name or phone...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RoleFilter)}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">{isRTL ? 'الكل' : 'All'}</TabsTrigger>
            <TabsTrigger value="traveler">{isRTL ? 'المسافرون' : 'Travelers'}</TabsTrigger>
            <TabsTrigger value="provider">{isRTL ? 'مقدمو الخدمات' : 'Providers'}</TabsTrigger>
            <TabsTrigger value="vendor">{isRTL ? 'الوكلاء' : 'Vendors'}</TabsTrigger>
            <TabsTrigger value="admin">{isRTL ? 'المشرفون' : 'Admins'}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'قائمة المستخدمين' : 'Users List'}</CardTitle>
                <CardDescription>
                  {isRTL ? `إجمالي: ${filteredUsers.length} مستخدم` : `Total: ${filteredUsers.length} users`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-pulse text-muted-foreground">
                      {isRTL ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground">
                      {isRTL ? 'لا يوجد مستخدمون' : 'No users found'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                        <TableHead>{isRTL ? 'الهاتف' : 'Phone'}</TableHead>
                        <TableHead>{isRTL ? 'الدور' : 'Role'}</TableHead>
                        <TableHead>{isRTL ? 'تاريخ التسجيل' : 'Joined'}</TableHead>
                        <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.profile?.full_name || user.profile?.full_name_ar || 'N/A'}
                          </TableCell>
                          <TableCell>{user.profile?.phone || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {isSuperAdmin && (
                                  <>
                                    <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                                      <Shield className="h-4 w-4 mr-2" />
                                      {isRTL ? 'تغيير الدور' : 'Change Role'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(user)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {isRTL ? 'حذف' : 'Delete'}
                                </DropdownMenuItem>
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
          </TabsContent>
        </Tabs>

        {/* Change Role Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تغيير دور المستخدم' : 'Change User Role'}</DialogTitle>
              <DialogDescription>
                {isRTL ? 'اختر الدور الجديد للمستخدم' : 'Select the new role for this user'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الدور الجديد' : 'New Role'}</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traveler">{isRTL ? 'مسافر' : 'Traveler'}</SelectItem>
                    <SelectItem value="provider">{isRTL ? 'مقدم خدمة' : 'Provider'}</SelectItem>
                    <SelectItem value="vendor">{isRTL ? 'وكيل' : 'Vendor'}</SelectItem>
                    <SelectItem value="admin">{isRTL ? 'مشرف' : 'Admin'}</SelectItem>
                    {isSuperAdmin && (
                      <SelectItem value="super_admin">{isRTL ? 'مشرف رئيسي' : 'Super Admin'}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleChangeRole}>
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'حذف المستخدم' : 'Delete User'}</DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.'
                  : 'Are you sure you want to delete this user? This action cannot be undone.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                {isRTL ? 'حذف' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
