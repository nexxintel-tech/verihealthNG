import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { fetchPatients } from "@/lib/api";
import { Search, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { getUser } from "@/lib/auth";

export default function PatientList() {
  const user = getUser();
  const isClinicianOrAdmin = user?.role === 'clinician' || user?.role === 'admin';
  
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.conditions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">
              {isClinicianOrAdmin ? "Patients" : "My Profile"}
            </h1>
            <p className="text-muted-foreground">
              {isClinicianOrAdmin ? "Manage and monitor your patient cohort." : "View your health profile."}
            </p>
          </div>
          {isClinicianOrAdmin && (
            <Button className="bg-primary hover:bg-primary/90">Add New Patient</Button>
          )}
        </div>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, condition..." 
                  className="pl-9" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-patients"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-filter">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead className="w-[250px]">Patient Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Main Condition</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground">
                      <div className="flex items-center gap-1">
                        Risk Score
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No patients match your search" : "No patients found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="group hover:bg-secondary/20" data-testid={`row-patient-${patient.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                              {patient.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <Link href={`/patients/${patient.id}`}>
                                <span className="text-sm font-medium group-hover:text-primary transition-colors" data-testid={`link-patient-${patient.id}`}>
                                  {patient.name}
                                </span>
                              </Link>
                              <span className="text-xs text-muted-foreground">{patient.age} yrs • {patient.gender}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${patient.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-sm text-muted-foreground">{patient.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{patient.conditions[0] || "None"}</TableCell>
                        <TableCell className="font-mono font-medium">{patient.riskScore}/100</TableCell>
                        <TableCell>
                          <RiskBadge level={patient.riskLevel} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(patient.lastSync).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-actions-${patient.id}`}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/patients/${patient.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              {isClinicianOrAdmin && (
                                <>
                                  <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Discharge</DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
