import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  fetchAdminUsers, 
  fetchAdminInstitutions, 
  updateUserRole, 
  type AdminUser, 
  type AdminInstitution 
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Shield, Building2, Users, UserCog } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  patient: "Patient",
  clinician: "Clinician",
  institution_admin: "Institution Admin",
  admin: "System Admin",
};

const ROLE_COLORS: Record<string, string> = {
  patient: "bg-blue-100 text-blue-800",
  clinician: "bg-green-100 text-green-800",
  institution_admin: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
};

export function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    refetchInterval: 30000,
  });

  const { data: institutions } = useQuery({
    queryKey: ["admin-institutions"],
    queryFn: fetchAdminInstitutions,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role, institutionId }: { userId: string; role: string; institutionId?: string }) =>
      updateUserRole(userId, role, institutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
      setNewRole("");
      setSelectedInstitution("");
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const handleEditRole = (user: AdminUser) => {
    setEditingUser(user);
    setNewRole(user.role);
    setSelectedInstitution(user.institutionId || "");
  };

  const handleSaveRole = () => {
    if (!editingUser || !newRole) return;

    const needsInstitution = newRole === "institution_admin" || newRole === "clinician";
    if (needsInstitution && !selectedInstitution) {
      toast({
        title: "Error",
        description: "Please select an institution for this role",
        variant: "destructive",
      });
      return;
    }

    updateRoleMutation.mutate({
      userId: editingUser.id,
      role: newRole,
      institutionId: needsInstitution ? selectedInstitution : undefined,
    });
  };

  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const roleCounts = users?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (usersError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500" data-testid="error-message">
              {(usersError as Error).message || "Failed to load users. Make sure you have admin access."}
            </p>
            <div className="text-center mt-4">
              <Button onClick={() => navigate("/")} data-testid="button-back-dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")} 
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="title-admin-panel">
              <Shield className="h-6 w-6" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Manage users and roles across the system</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card data-testid="stat-total-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="stat-patients">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCounts.patient || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="stat-clinicians">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clinicians</CardTitle>
            <UserCog className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCounts.clinician || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="stat-admins">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(roleCounts.institution_admin || 0) + (roleCounts.admin || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-role-filter">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="patient">Patients</SelectItem>
                <SelectItem value="clinician">Clinicians</SelectItem>
                <SelectItem value="institution_admin">Institution Admins</SelectItem>
                <SelectItem value="admin">System Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {usersLoading ? (
            <div className="text-center py-8" data-testid="loading-users">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8" data-testid="no-users">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium" data-testid={`text-name-${user.id}`}>
                            {user.name}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={ROLE_COLORS[user.role]}
                          data-testid={`badge-role-${user.id}`}
                        >
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-institution-${user.id}`}>
                        {user.institutionName || "-"}
                      </TableCell>
                      <TableCell>
                        {user.approvalStatus && (
                          <Badge 
                            variant={user.approvalStatus === "approved" ? "default" : "secondary"}
                            data-testid={`badge-status-${user.id}`}
                          >
                            {user.approvalStatus}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell data-testid={`text-joined-${user.id}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRole(user)}
                          data-testid={`button-edit-role-${user.id}`}
                        >
                          Edit Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent data-testid="dialog-edit-role">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.name} ({editingUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger data-testid="select-new-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="clinician">Clinician</SelectItem>
                  <SelectItem value="institution_admin">Institution Admin</SelectItem>
                  <SelectItem value="admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newRole === "institution_admin" || newRole === "clinician") && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Institution</label>
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger data-testid="select-institution">
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions?.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRole} 
              disabled={updateRoleMutation.isPending}
              data-testid="button-save-role"
            >
              {updateRoleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
