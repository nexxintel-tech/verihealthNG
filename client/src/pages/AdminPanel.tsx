import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  fetchAdminUsers, 
  fetchAdminInstitutions, 
  updateUserRole,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  toggleUserStatus,
  bulkUpdateUsers,
  fetchActivityLogs,
  fetchUserDetails,
  sendEmailToUser,
  createUserInvite,
  fetchUserInvites,
  deleteUserInvite,
  fetchAdminAnalytics,
  exportUsersCSV,
  type AdminUser, 
  type AdminInstitution,
  type ActivityLog,
  type UserDetails,
  type UserInvite,
  type AdminAnalytics,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Search, Shield, Building2, Users, UserCog, 
  Download, Mail, UserPlus, Activity, Eye, Ban, CheckCircle,
  Trash2, Edit, Plus, Clock, BarChart3, Send
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

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

const PIE_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#ef4444'];

export function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("users");
  
  // User management state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  
  // Institution management state
  const [editingInstitution, setEditingInstitution] = useState<AdminInstitution | null>(null);
  const [showNewInstitution, setShowNewInstitution] = useState(false);
  const [institutionForm, setInstitutionForm] = useState({
    name: "", address: "", contactEmail: "", contactPhone: ""
  });
  
  // Email state
  const [emailTarget, setEmailTarget] = useState<{ id: string; email: string } | null>(null);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  
  // Invite state
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "patient", institutionId: "" });
  
  // Bulk action state
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkRole, setBulkRole] = useState("");
  const [bulkInstitution, setBulkInstitution] = useState("");
  
  // Activity log pagination state
  const [activityPage, setActivityPage] = useState(1);
  const activityLimit = 20;

  // Queries
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    refetchInterval: 30000,
  });

  const { data: institutions } = useQuery({
    queryKey: ["admin-institutions"],
    queryFn: fetchAdminInstitutions,
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["admin-activity-logs", activityPage, activityLimit],
    queryFn: () => fetchActivityLogs(activityPage, activityLimit),
    enabled: activeTab === "activity",
  });

  const { data: invites } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: fetchUserInvites,
    enabled: activeTab === "invites",
  });

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: fetchAdminAnalytics,
    enabled: activeTab === "analytics",
  });

  const { data: userDetails } = useQuery({
    queryKey: ["admin-user-details", viewingUser],
    queryFn: () => fetchUserDetails(viewingUser!),
    enabled: !!viewingUser,
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role, institutionId }: { userId: string; role: string; institutionId?: string }) =>
      updateUserRole(userId, role, institutionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
      toast({ title: "Success", description: "User role updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      toggleUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Success", description: "User status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ userIds, action, role, institutionId }: any) =>
      bulkUpdateUsers(userIds, action, role, institutionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUsers([]);
      setShowBulkAction(false);
      toast({ title: "Success", description: `Updated ${data.count} users` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createInstitutionMutation = useMutation({
    mutationFn: createInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-institutions"] });
      setShowNewInstitution(false);
      setInstitutionForm({ name: "", address: "", contactEmail: "", contactPhone: "" });
      toast({ title: "Success", description: "Institution created" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateInstitutionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateInstitution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-institutions"] });
      setEditingInstitution(null);
      toast({ title: "Success", description: "Institution updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteInstitutionMutation = useMutation({
    mutationFn: deleteInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-institutions"] });
      toast({ title: "Success", description: "Institution deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({ userId, subject, message }: { userId: string; subject: string; message: string }) =>
      sendEmailToUser(userId, subject, message),
    onSuccess: () => {
      setEmailTarget(null);
      setEmailForm({ subject: "", message: "" });
      toast({ title: "Success", description: "Email sent" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createInviteMutation = useMutation({
    mutationFn: createUserInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
      setShowInviteDialog(false);
      setInviteForm({ email: "", role: "patient", institutionId: "" });
      toast({ title: "Success", description: "Invite sent" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: deleteUserInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
      toast({ title: "Success", description: "Invite cancelled" });
    },
  });

  // Handlers
  const handleExportCSV = async () => {
    try {
      const blob = await exportUsersCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Export downloaded" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to export", variant: "destructive" });
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    bulkUpdateMutation.mutate({
      userIds: selectedUsers,
      action: bulkAction,
      role: bulkRole || undefined,
      institutionId: bulkInstitution || undefined,
    });
  };

  // Computed values
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

  const pieData = Object.entries(roleCounts).map(([role, count], index) => ({
    name: ROLE_LABELS[role] || role,
    value: count,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="title-admin-panel">
              <Shield className="h-6 w-6" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Manage users, institutions, and system settings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowInviteDialog(true)} data-testid="button-invite">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="institutions" data-testid="tab-institutions">
            <Building2 className="h-4 w-4 mr-2" />
            Institutions
          </TabsTrigger>
          <TabsTrigger value="invites" data-testid="tab-invites">
            <Mail className="h-4 w-4 mr-2" />
            Invites
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{roleCounts.patient || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Clinicians</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{roleCounts.clinician || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {(roleCounts.institution_admin || 0) + (roleCounts.admin || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all users in the system</CardDescription>
                </div>
                {selectedUsers.length > 0 && (
                  <Button variant="outline" onClick={() => setShowBulkAction(true)} data-testid="button-bulk-action">
                    Bulk Actions ({selectedUsers.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <div className="text-center py-8">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">No users found</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onCheckedChange={handleSelectAll}
                            data-testid="checkbox-select-all"
                          />
                        </TableHead>
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
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={ROLE_COLORS[user.role]}>
                              {ROLE_LABELS[user.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.institutionName || "-"}</TableCell>
                          <TableCell>
                            {user.approvalStatus && (
                              <Badge variant={user.approvalStatus === "approved" ? "default" : "secondary"}>
                                {user.approvalStatus}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setViewingUser(user.id)}
                                data-testid={`button-view-${user.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setEditingUser(user);
                                  setNewRole(user.role);
                                  setSelectedInstitution(user.institutionId || "");
                                }}
                                data-testid={`button-edit-${user.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEmailTarget({ id: user.id, email: user.email })}
                                data-testid={`button-email-${user.id}`}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`${user.approvalStatus === 'approved' ? 'Disable' : 'Enable'} this user?`)) {
                                    toggleStatusMutation.mutate({ 
                                      userId: user.id, 
                                      isActive: user.approvalStatus !== 'approved' 
                                    });
                                  }
                                }}
                                data-testid={`button-toggle-${user.id}`}
                              >
                                {user.approvalStatus === 'approved' ? 
                                  <Ban className="h-4 w-4 text-red-500" /> : 
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                }
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Institutions Tab */}
        <TabsContent value="institutions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Institution Management</CardTitle>
                  <CardDescription>Manage healthcare institutions</CardDescription>
                </div>
                <Button onClick={() => setShowNewInstitution(true)} data-testid="button-new-institution">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Institution
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {institutions?.map((inst) => (
                      <TableRow key={inst.id}>
                        <TableCell className="font-medium">{inst.name}</TableCell>
                        <TableCell>{inst.address || "-"}</TableCell>
                        <TableCell>{inst.contact_email || "-"}</TableCell>
                        <TableCell>
                          {inst.is_default && <Badge>Default</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingInstitution(inst);
                                setInstitutionForm({
                                  name: inst.name,
                                  address: inst.address || "",
                                  contactEmail: inst.contact_email || "",
                                  contactPhone: "",
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Delete this institution?")) {
                                  deleteInstitutionMutation.mutate(inst.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites">
          <Card>
            <CardHeader>
              <CardTitle>User Invitations</CardTitle>
              <CardDescription>Manage pending user invitations</CardDescription>
            </CardHeader>
            <CardContent>
              {invites?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending invitations</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invites?.map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell>{invite.email}</TableCell>
                          <TableCell>
                            <Badge className={ROLE_COLORS[invite.role]}>
                              {ROLE_LABELS[invite.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>{invite.institution?.name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={invite.status === "pending" ? "secondary" : "default"}>
                              {invite.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(invite.expires_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Cancel this invitation?")) {
                                  deleteInviteMutation.mutate(invite.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Track all admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="text-center py-8">Loading activity logs...</div>
              ) : activityData?.logs?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No activity logs</div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityData?.logs?.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm">
                              {new Date(log.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>{log.users?.email || "System"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell>{log.target_type}</TableCell>
                            <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {activityData?.pagination && activityData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {activityData.pagination.page} of {activityData.pagination.totalPages} ({activityData.pagination.total} total)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                          disabled={activityPage === 1}
                          data-testid="button-activity-prev"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActivityPage(p => Math.min(activityData.pagination.totalPages, p + 1))}
                          disabled={activityPage >= activityData.pagination.totalPages}
                          data-testid="button-activity-next"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.usersByMonth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.activityByDay || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change role for {editingUser?.name} ({editingUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
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
                <Label>Institution</Label>
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions?.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={() => {
              if (editingUser) {
                updateRoleMutation.mutate({
                  userId: editingUser.id,
                  role: newRole,
                  institutionId: (newRole === "institution_admin" || newRole === "clinician") ? selectedInstitution : undefined,
                });
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {userDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{userDetails.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <Badge className={ROLE_COLORS[userDetails.role]}>{ROLE_LABELS[userDetails.role]}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Institution</Label>
                  <p>{userDetails.institution?.name || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={userDetails.isBanned ? "destructive" : "default"}>
                    {userDetails.isBanned ? "Disabled" : "Active"}
                  </Badge>
                </div>
                {userDetails.profile && (
                  <>
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p>{userDetails.profile.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Specialty</Label>
                      <p>{userDetails.profile.specialty || "-"}</p>
                    </div>
                  </>
                )}
                <div>
                  <Label className="text-muted-foreground">Last Sign In</Label>
                  <p>{userDetails.lastSignIn ? new Date(userDetails.lastSignIn).toLocaleString() : "Never"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Joined</Label>
                  <p>{new Date(userDetails.createdAt).toLocaleDateString()}</p>
                </div>
                {userDetails.role === 'clinician' && (
                  <div>
                    <Label className="text-muted-foreground">Patients</Label>
                    <p>{userDetails.patientCount}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={!!emailTarget} onOpenChange={(open) => !open && setEmailTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>Send email to {emailTarget?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div className="grid gap-2">
              <Label>Message</Label>
              <Textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                placeholder="Your message..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailTarget(null)}>Cancel</Button>
            <Button onClick={() => {
              if (emailTarget) {
                sendEmailMutation.mutate({
                  userId: emailTarget.id,
                  subject: emailForm.subject,
                  message: emailForm.message,
                });
              }
            }}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an invitation to join VeriHealth</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="clinician">Clinician</SelectItem>
                  <SelectItem value="institution_admin">Institution Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(inviteForm.role === "clinician" || inviteForm.role === "institution_admin") && (
              <div className="grid gap-2">
                <Label>Institution</Label>
                <Select value={inviteForm.institutionId} onValueChange={(v) => setInviteForm({ ...inviteForm, institutionId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions?.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
            <Button onClick={() => createInviteMutation.mutate(inviteForm)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Institution Dialog */}
      <Dialog open={showNewInstitution || !!editingInstitution} onOpenChange={(open) => {
        if (!open) {
          setShowNewInstitution(false);
          setEditingInstitution(null);
          setInstitutionForm({ name: "", address: "", contactEmail: "", contactPhone: "" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInstitution ? "Edit Institution" : "New Institution"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input
                value={institutionForm.name}
                onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                placeholder="Institution name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input
                value={institutionForm.address}
                onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
                placeholder="123 Medical St"
              />
            </div>
            <div className="grid gap-2">
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={institutionForm.contactEmail}
                onChange={(e) => setInstitutionForm({ ...institutionForm, contactEmail: e.target.value })}
                placeholder="contact@institution.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>Contact Phone</Label>
              <Input
                value={institutionForm.contactPhone}
                onChange={(e) => setInstitutionForm({ ...institutionForm, contactPhone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewInstitution(false);
              setEditingInstitution(null);
            }}>Cancel</Button>
            <Button onClick={() => {
              if (editingInstitution) {
                updateInstitutionMutation.mutate({ id: editingInstitution.id, data: institutionForm });
              } else {
                createInstitutionMutation.mutate(institutionForm);
              }
            }}>
              {editingInstitution ? "Save Changes" : "Create Institution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkAction} onOpenChange={setShowBulkAction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Action</DialogTitle>
            <DialogDescription>Apply action to {selectedUsers.length} selected users</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Action</Label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enable">Enable Users</SelectItem>
                  <SelectItem value="disable">Disable Users</SelectItem>
                  <SelectItem value="change_role">Change Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkAction === "change_role" && (
              <>
                <div className="grid gap-2">
                  <Label>New Role</Label>
                  <Select value={bulkRole} onValueChange={setBulkRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="clinician">Clinician</SelectItem>
                      <SelectItem value="institution_admin">Institution Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(bulkRole === "clinician" || bulkRole === "institution_admin") && (
                  <div className="grid gap-2">
                    <Label>Institution</Label>
                    <Select value={bulkInstitution} onValueChange={setBulkInstitution}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select institution" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutions?.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkAction(false)}>Cancel</Button>
            <Button onClick={handleBulkAction} disabled={!bulkAction}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
