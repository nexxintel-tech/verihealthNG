import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { fetchPendingClinicians, approveClinician, rejectClinician, type PendingClinician } from "@/lib/api";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";

export function ClinicianApprovals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: clinicians, isLoading, error } = useQuery({
    queryKey: ["pending-clinicians"],
    queryFn: fetchPendingClinicians,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const approveMutation = useMutation({
    mutationFn: approveClinician,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-clinicians"] });
      toast({
        title: "Success",
        description: "Clinician approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve clinician",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectClinician,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-clinicians"] });
      toast({
        title: "Success",
        description: "Clinician rejected",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject clinician",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (clinicianId: string) => {
    if (confirm("Are you sure you want to approve this clinician?")) {
      approveMutation.mutate(clinicianId);
    }
  };

  const handleReject = (clinicianId: string) => {
    if (confirm("Are you sure you want to reject this clinician?")) {
      rejectMutation.mutate(clinicianId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading pending clinicians...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-500" data-testid="error-message">
              {(error as Error).message || "Failed to load pending clinicians"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle data-testid="title-approvals">Clinician Approvals</CardTitle>
          <CardDescription data-testid="text-approvals-description">
            Review and approve or reject clinician registration requests for your institution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!clinicians || clinicians.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground" data-testid="text-no-pending">
                No pending clinician requests at this time.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-name">Name</TableHead>
                    <TableHead data-testid="header-email">Email</TableHead>
                    <TableHead data-testid="header-specialty">Specialty</TableHead>
                    <TableHead data-testid="header-license">License</TableHead>
                    <TableHead data-testid="header-phone">Phone</TableHead>
                    <TableHead data-testid="header-status">Status</TableHead>
                    <TableHead data-testid="header-registered">Registered</TableHead>
                    <TableHead className="text-right" data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinicians.map((clinician) => (
                    <TableRow key={clinician.id} data-testid={`row-clinician-${clinician.id}`}>
                      <TableCell className="font-medium" data-testid={`text-name-${clinician.id}`}>
                        {clinician.profile?.full_name || "N/A"}
                      </TableCell>
                      <TableCell data-testid={`text-email-${clinician.id}`}>
                        {clinician.email}
                      </TableCell>
                      <TableCell data-testid={`text-specialty-${clinician.id}`}>
                        {clinician.profile?.specialty || "N/A"}
                      </TableCell>
                      <TableCell data-testid={`text-license-${clinician.id}`}>
                        {clinician.profile?.license_number || "N/A"}
                      </TableCell>
                      <TableCell data-testid={`text-phone-${clinician.id}`}>
                        {clinician.profile?.phone || "N/A"}
                      </TableCell>
                      <TableCell data-testid={`badge-status-${clinician.id}`}>
                        {getStatusBadge(clinician.approvalStatus)}
                      </TableCell>
                      <TableCell data-testid={`text-date-${clinician.id}`}>
                        {new Date(clinician.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(clinician.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            data-testid={`button-approve-${clinician.id}`}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(clinician.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            data-testid={`button-reject-${clinician.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
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
    </div>
  );
}
