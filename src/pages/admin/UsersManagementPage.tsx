import { useState } from 'react';
import { Search, MoreHorizontal, Shield, Trash2, Users, UserCheck, Building2, Plane, Crown, UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type RoleFilter = 'all' | AppRole;

export default function UsersManagementPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<RoleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; userId: string; role: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('traveler');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { users, isLoading, updateUserRole, deleteUser, refetch } = useAdminUsers(activeTab);

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const name = user.profile?.full_name || user.profile?.full_name_ar || '';
    const phone = user.profile?.phone || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           phone.includes(searchQuery);
  });

  // Stats for each role
  const allUsersData = useAdminUsers('all');
  const roleStats = {
    travelers: allUsersData.users.filter(u => u.role === 'traveler').length,
    providers: allUsersData.users.filter(u => u.role === 'provider').length,
    vendors: allUsersData.users.filter(u => u.role === 'vendor').length,
    admins: allUsersData.users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': 
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
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
      case 'vendor':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <Building2 className="h-3 w-3 mr-1" />
            {isRTL ? 'وكيل' : 'Vendor'}
          </Badge>
        );
      case 'provider':
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <UserCheck className="h-3 w-3 mr-1" />
            {isRTL ? 'مقدم خدمة' : 'Provider'}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-slate-500 text-white">
            <Plane className="h-3 w-3 mr-1" />
            {isRTL ? 'مسافر' : 'Traveler'}
          </Badge>
        );
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

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isRTL ? 'font-arabic' : ''}`}>
              <Users className="h-6 w-6 text-primary" />
              {isRTL ? 'إدارة المستخدمين' : 'User Management'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isRTL 
                ? 'إنشاء وإدارة وتعيين أدوار المستخدمين'
                : 'Create, manage and assign user roles'}
            </p>
          </div>
          <CreateUserDialog onUserCreated={refetch} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'المسافرون' : 'Travelers'}
                  </p>
                  <p className="text-2xl font-bold">{roleStats.travelers}</p>
                </div>
                <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                  <Plane className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'مقدمو الخدمات' : 'Providers'}
                  </p>
                  <p className="text-2xl font-bold">{roleStats.providers}</p>
                </div>
                <div className="p-2 rounded-full bg-green-200 dark:bg-green-800">
                  <UserCheck className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'الوكلاء' : 'Vendors'}
                  </p>
                  <p className="text-2xl font-bold">{roleStats.vendors}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-200 dark:bg-blue-800">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'المشرفون' : 'Admins'}
                  </p>
                  <p className="text-2xl font-bold">{roleStats.admins}</p>
                </div>
                <div className="p-2 rounded-full bg-purple-200 dark:bg-purple-800">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
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
            <TabsTrigger value="all" className="gap-2">
              <Users className="h-4 w-4" />
              {isRTL ? 'الكل' : 'All'}
            </TabsTrigger>
            <TabsTrigger value="traveler" className="gap-2">
              <Plane className="h-4 w-4" />
              {isRTL ? 'مسافرون' : 'Travelers'}
            </TabsTrigger>
            <TabsTrigger value="provider" className="gap-2">
              <UserCheck className="h-4 w-4" />
              {isRTL ? 'مقدمون' : 'Providers'}
            </TabsTrigger>
            <TabsTrigger value="vendor" className="gap-2">
              <Building2 className="h-4 w-4" />
              {isRTL ? 'وكلاء' : 'Vendors'}
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="h-4 w-4" />
              {isRTL ? 'مشرفون' : 'Admins'}
            </TabsTrigger>
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
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-medium">
                      {isRTL ? 'لا يوجد مستخدمون' : 'No users found'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRTL ? 'قم بإنشاء مستخدم جديد للبدء' : 'Create a new user to get started'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? 'المستخدم' : 'User'}</TableHead>
                        <TableHead>{isRTL ? 'الهاتف' : 'Phone'}</TableHead>
                        <TableHead>{isRTL ? 'الدور' : 'Role'}</TableHead>
                        <TableHead>{isRTL ? 'تاريخ التسجيل' : 'Joined'}</TableHead>
                        <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="group">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.profile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {getInitials(user.profile?.full_name || user.profile?.full_name_ar)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {user.profile?.full_name || user.profile?.full_name_ar || 'N/A'}
                                </p>
                                {user.profile?.full_name_ar && user.profile?.full_name && (
                                  <p className="text-xs text-muted-foreground font-arabic">
                                    {user.profile.full_name_ar}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{user.profile?.phone || '-'}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(isSuperAdmin || (isAdmin && user.role !== 'admin' && user.role !== 'super_admin')) && (
                                  <>
                                    <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                                      <Shield className="h-4 w-4 mr-2" />
                                      {isRTL ? 'تغيير الدور' : 'Change Role'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {isSuperAdmin && (
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteDialog(user)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {isRTL ? 'حذف' : 'Delete'}
                                  </DropdownMenuItem>
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
          </TabsContent>
        </Tabs>

        {/* Change Role Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {isRTL ? 'تغيير دور المستخدم' : 'Change User Role'}
              </DialogTitle>
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
                    {isSuperAdmin && (
                      <>
                        <SelectItem value="admin">{isRTL ? 'مشرف' : 'Admin'}</SelectItem>
                        <SelectItem value="super_admin">{isRTL ? 'مشرف رئيسي' : 'Super Admin'}</SelectItem>
                      </>
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
              <DialogTitle className="text-destructive">{isRTL ? 'حذف المستخدم' : 'Delete User'}</DialogTitle>
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
    </DashboardLayout>
  );
}
